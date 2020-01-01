import { SignalingClient } from "./signaling";
import type { SessionData, Role } from "./api";

export interface PeerConnection {
  peerId: string;
  role: Role;
  pc: RTCPeerConnection;
  audioStream: MediaStream | null;
  isSpeaking: boolean;
}

export type WebRTCEvent =
  | { type: "peer-added"; peerId: string; role: string }
  | { type: "peer-removed"; peerId: string }
  | { type: "remote-stream"; peerId: string; stream: MediaStream }
  | { type: "speaking-change"; peerId: string; isSpeaking: boolean }
  | { type: "error"; message: string }
  | { type: "connected"; activePolls: unknown[]; pendingSpeakRequests: unknown[] }
  | { type: "role-changed"; peerId: string; newRole: Role }
  | { type: "promoted"; newRole: Role }
  | { type: "demoted"; newRole: Role }
  | { type: "poll-started"; pollId: string; question: string; options: string[]; durationSeconds: number; endsAt: number }
  | { type: "poll-update"; pollId: string; results: number[]; totalVotes: number }
  | { type: "poll-ended"; pollId: string; question: string; options: string[]; results: number[]; totalVotes: number }
  | { type: "speak-request"; peerId: string }
  | { type: "speak-request-sent" }
  | { type: "speak-request-denied" }
  | { type: "speak-request-resolved"; peerId: string }
  | { type: "kicked" }
  | { type: "reconnecting" }
  | { type: "reconnected" }
  | { type: "chat-message"; fromPeerId: string; fromRole: Role; text: string; timestamp: number }
  | { type: "chat-cooldown"; remainingSeconds: number }
  | { type: "transcription"; fromPeerId: string; fromRole: Role; text: string; isFinal: boolean; timestamp: number };

function canSpeak(role: Role): boolean {
  return role === "admin" || role === "speaker";
}

export class WebRTCManager {
  private signaling: SignalingClient;
  private session: SessionData;
  private peers = new Map<string, PeerConnection>();
  private localStream: MediaStream | null = null;
  private myPeerId: string | null = null;
  private myRole: Role;
  private eventHandlers = new Set<(event: WebRTCEvent) => void>();
  private cleanupFns: Array<() => void> = [];
  private audioAnalysers = new Map<string, { analyser: AnalyserNode; ctx: AudioContext; interval: ReturnType<typeof setInterval> }>();
  private iceRestartTimers = new Map<string, ReturnType<typeof setTimeout>>();

  constructor(session: SessionData) {
    this.session = session;
    this.myRole = session.role;
    this.signaling = new SignalingClient();
  }

  onEvent(handler: (event: WebRTCEvent) => void): () => void {
    this.eventHandlers.add(handler);
    return () => this.eventHandlers.delete(handler);
  }

  private emit(event: WebRTCEvent): void {
    for (const handler of this.eventHandlers) handler(event);
  }

  getSignaling(): SignalingClient { return this.signaling; }

  async start(): Promise<void> {
    if (canSpeak(this.session.role)) {
      try {
        this.localStream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
          video: false,
        });
      } catch {
        this.emit({ type: "error", message: "Microphone access denied" });
        return;
      }
    }

    this.cleanupFns.push(
      this.signaling.on("joined", (data) => {
        const isReconnect = this.myPeerId !== null && this.myPeerId !== data.peerId;
        this.myPeerId = data.peerId;

        if (isReconnect) {
          // Clean up stale peer connections from the old session
          for (const [peerId] of this.peers) this.removePeer(peerId);
        }

        this.emit({
          type: "connected",
          activePolls: data.activePolls,
          pendingSpeakRequests: data.pendingSpeakRequests,
        });

        const iAmSpeaker = canSpeak(this.myRole);
        for (const peer of data.peers) {
          if (!this.peers.has(peer.peerId)) {
            this.createPeerConnection(peer.peerId, peer.role, iAmSpeaker);
            this.emit({ type: "peer-added", peerId: peer.peerId, role: peer.role });
          }
        }
      })
    );

    this.cleanupFns.push(
      this.signaling.on("peer-joined", (data) => {
        const shouldInitiate = canSpeak(this.myRole) && !canSpeak(data.role);
        this.createPeerConnection(data.peerId, data.role, shouldInitiate);
        this.emit({ type: "peer-added", peerId: data.peerId, role: data.role });
      })
    );

    this.cleanupFns.push(this.signaling.on("peer-left", (data) => {
      this.removePeer(data.peerId);
      this.emit({ type: "peer-removed", peerId: data.peerId });
    }));

    this.cleanupFns.push(this.signaling.on("offer", async (data) => {
      const peerConn = this.peers.get(data.fromPeerId);
      if (!peerConn) return;
      await peerConn.pc.setRemoteDescription(data.sdp);
      const answer = await peerConn.pc.createAnswer();
      await peerConn.pc.setLocalDescription(answer);
      this.signaling.sendAnswer(data.fromPeerId, answer);
    }));

    this.cleanupFns.push(this.signaling.on("answer", async (data) => {
      const peerConn = this.peers.get(data.fromPeerId);
      if (!peerConn) return;
      await peerConn.pc.setRemoteDescription(data.sdp);
    }));

    this.cleanupFns.push(this.signaling.on("ice-candidate", (data) => {
      const peerConn = this.peers.get(data.fromPeerId);
      if (!peerConn) return;
      peerConn.pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    }));

    this.cleanupFns.push(this.signaling.on("error", (data) => {
      this.emit({ type: "error", message: data.message });
    }));

    this.cleanupFns.push(this.signaling.on("role-changed", (data) => {
      const peerConn = this.peers.get(data.peerId);
      if (peerConn) peerConn.role = data.newRole;
      this.emit({ type: "role-changed", peerId: data.peerId, newRole: data.newRole });
    }));

    this.cleanupFns.push(this.signaling.on("you-were-promoted", async (data) => {
      this.myRole = data.newRole;
      this.emit({ type: "promoted", newRole: data.newRole });

      if (canSpeak(data.newRole) && !this.localStream) {
        try {
          this.localStream = await navigator.mediaDevices.getUserMedia({
            audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
            video: false,
          });
          for (const [peerId, peerConn] of this.peers) {
            for (const track of this.localStream.getTracks()) {
              peerConn.pc.addTrack(track, this.localStream);
            }
            const offer = await peerConn.pc.createOffer();
            await peerConn.pc.setLocalDescription(offer);
            this.signaling.sendOffer(peerId, offer);
          }
        } catch {
          this.emit({ type: "error", message: "Microphone access denied" });
        }
      }
    }));

    this.cleanupFns.push(this.signaling.on("you-were-demoted", (data) => {
      this.myRole = data.newRole;
      this.emit({ type: "demoted", newRole: data.newRole });

      if (this.localStream) {
        for (const track of this.localStream.getTracks()) track.stop();
        this.localStream = null;
      }
    }));

    this.cleanupFns.push(this.signaling.on("poll-started", (data) => this.emit({ type: "poll-started", ...data })));
    this.cleanupFns.push(this.signaling.on("poll-update", (data) => this.emit({ type: "poll-update", ...data })));
    this.cleanupFns.push(this.signaling.on("poll-ended", (data) => this.emit({ type: "poll-ended", ...data })));

    this.cleanupFns.push(this.signaling.on("speak-request", (data) => this.emit({ type: "speak-request", peerId: data.peerId })));
    this.cleanupFns.push(this.signaling.on("speak-request-sent", () => this.emit({ type: "speak-request-sent" })));
    this.cleanupFns.push(this.signaling.on("speak-request-denied", () => this.emit({ type: "speak-request-denied" })));
    this.cleanupFns.push(this.signaling.on("speak-request-resolved", (data) => this.emit({ type: "speak-request-resolved", peerId: data.peerId })));
    this.cleanupFns.push(this.signaling.on("you-were-kicked", () => this.emit({ type: "kicked" })));
    this.cleanupFns.push(this.signaling.on("reconnecting", () => this.emit({ type: "reconnecting" })));

    this.cleanupFns.push(this.signaling.on("reconnected", () => {
      this.emit({ type: "reconnected" });
    }));

    this.cleanupFns.push(this.signaling.on("chat-message", (data) => this.emit({ type: "chat-message", ...data })));
    this.cleanupFns.push(this.signaling.on("chat-cooldown", (data) => this.emit({ type: "chat-cooldown", ...data })));
    this.cleanupFns.push(this.signaling.on("transcription", (data) => this.emit({ type: "transcription", ...data })));

    this.signaling.connect(this.session.session);
  }

  private createPeerConnection(remotePeerId: string, remoteRole: Role, isInitiator: boolean): void {
    // Clean up any existing connection for this peer first
    if (this.peers.has(remotePeerId)) this.removePeer(remotePeerId);

    const iceServers: RTCIceServer[] = [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: this.session.turn.urls, username: this.session.turn.username, credential: this.session.turn.credential },
    ];

    const pc = new RTCPeerConnection({ iceServers });
    const peerConn: PeerConnection = { peerId: remotePeerId, role: remoteRole, pc, audioStream: null, isSpeaking: false };
    this.peers.set(remotePeerId, peerConn);

    if (canSpeak(this.myRole) && this.localStream) {
      for (const track of this.localStream.getTracks()) pc.addTrack(track, this.localStream);
    }

    pc.ontrack = (event) => {
      let stream = event.streams[0];
      if (!stream) stream = new MediaStream([event.track]);
      peerConn.audioStream = stream;
      this.emit({ type: "remote-stream", peerId: remotePeerId, stream });
      this.stopSpeakingDetection(remotePeerId);
      this.startSpeakingDetection(remotePeerId, stream);
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) this.signaling.sendIceCandidate(remotePeerId, event.candidate.toJSON());
    };

    pc.oniceconnectionstatechange = () => {
      const state = pc.iceConnectionState;
      if (state === "disconnected") {
        // Wait briefly then attempt ICE restart — disconnected can be transient
        const timer = setTimeout(() => {
          if (pc.iceConnectionState === "disconnected" || pc.iceConnectionState === "failed") {
            this.attemptIceRestart(remotePeerId);
          }
        }, 3000);
        this.iceRestartTimers.set(remotePeerId, timer);
      } else if (state === "failed") {
        this.attemptIceRestart(remotePeerId);
      } else if (state === "connected" || state === "completed") {
        const timer = this.iceRestartTimers.get(remotePeerId);
        if (timer) { clearTimeout(timer); this.iceRestartTimers.delete(remotePeerId); }
      }
    };

    if (isInitiator && canSpeak(this.myRole)) {
      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .then(() => { if (pc.localDescription) this.signaling.sendOffer(remotePeerId, pc.localDescription); })
        .catch((err) => console.error("[webrtc] offer error:", err));
    }
  }

  private attemptIceRestart(peerId: string): void {
    const peerConn = this.peers.get(peerId);
    if (!peerConn || !canSpeak(this.myRole)) return;

    peerConn.pc.createOffer({ iceRestart: true })
      .then((offer) => peerConn.pc.setLocalDescription(offer))
      .then(() => { if (peerConn.pc.localDescription) this.signaling.sendOffer(peerId, peerConn.pc.localDescription); })
      .catch((err) => console.error("[webrtc] ICE restart failed:", err));
  }

  private startSpeakingDetection(peerId: string, stream: MediaStream): void {
    try {
      const ctx = new AudioContext();
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.4;
      source.connect(analyser);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const interval = setInterval(() => {
        if (ctx.state === "suspended") { ctx.resume().catch(() => {}); return; }
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
        const isSpeaking = sum / dataArray.length > 15;
        const peer = this.peers.get(peerId);
        if (peer && peer.isSpeaking !== isSpeaking) {
          peer.isSpeaking = isSpeaking;
          this.emit({ type: "speaking-change", peerId, isSpeaking });
        }
      }, 100);

      this.audioAnalysers.set(peerId, { analyser, ctx, interval });
    } catch { /* non-critical */ }
  }

  private stopSpeakingDetection(peerId: string): void {
    const a = this.audioAnalysers.get(peerId);
    if (a) {
      clearInterval(a.interval);
      a.ctx.close().catch(() => {});
      this.audioAnalysers.delete(peerId);
    }
  }

  private removePeer(peerId: string): void {
    const peerConn = this.peers.get(peerId);
    if (peerConn) { peerConn.pc.close(); this.peers.delete(peerId); }
    this.stopSpeakingDetection(peerId);
    const timer = this.iceRestartTimers.get(peerId);
    if (timer) { clearTimeout(timer); this.iceRestartTimers.delete(peerId); }
  }

  getLocalStream(): MediaStream | null { return this.localStream; }
  getMyRole(): Role { return this.myRole; }
  getPeers(): Map<string, PeerConnection> { return this.peers; }

  toggleMute(): boolean {
    if (!this.localStream) return true;
    const track = this.localStream.getAudioTracks()[0];
    if (track) { track.enabled = !track.enabled; return !track.enabled; }
    return true;
  }

  destroy(): void {
    for (const [peerId] of this.peers) this.removePeer(peerId);
    for (const [, timer] of this.iceRestartTimers) clearTimeout(timer);
    this.iceRestartTimers.clear();
    if (this.localStream) { for (const track of this.localStream.getTracks()) track.stop(); this.localStream = null; }
    for (const fn of this.cleanupFns) fn();
    this.cleanupFns = [];
    this.signaling.leave();
    this.eventHandlers.clear();
  }
}
