import type { Role } from "./api";

export type SignalingEventMap = {
  joined: {
    peerId: string;
    role: Role;
    peers: Array<{ peerId: string; role: Role }>;
    activePolls: Array<{ pollId: string; question: string; options: string[]; endsAt: number; currentResults: number[] }>;
    pendingSpeakRequests: Array<{ peerId: string; timestamp: number }>;
  };
  "peer-joined": { peerId: string; role: Role };
  "peer-left": { peerId: string };
  offer: { fromPeerId: string; fromRole: Role; sdp: RTCSessionDescriptionInit };
  answer: { fromPeerId: string; sdp: RTCSessionDescriptionInit };
  "ice-candidate": { fromPeerId: string; candidate: RTCIceCandidateInit };
  error: { message: string };
  pong: Record<string, never>;
  "chat-message": { fromPeerId: string; fromRole: Role; text: string; timestamp: number };
  "chat-cooldown": { remainingSeconds: number };
  "poll-started": { pollId: string; question: string; options: string[]; durationSeconds: number; endsAt: number };
  "poll-update": { pollId: string; results: number[]; totalVotes: number };
  "poll-ended": { pollId: string; question: string; options: string[]; results: number[]; totalVotes: number };
  "speak-request": { peerId: string; timestamp: number };
  "speak-request-sent": Record<string, never>;
  "speak-request-denied": Record<string, never>;
  "speak-request-resolved": { peerId: string };
  "role-changed": { peerId: string; newRole: Role };
  "you-were-promoted": { newRole: Role };
  "you-were-demoted": { newRole: Role };
  "you-were-kicked": Record<string, never>;
  reconnecting: Record<string, never>;
  reconnected: Record<string, never>;
};

type EventHandler<K extends keyof SignalingEventMap> = (data: SignalingEventMap[K]) => void;

export class SignalingClient {
  private ws: WebSocket | null = null;
  private handlers = new Map<string, Set<Function>>();
  private session: string | null = null;
  private intentionalClose = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pingInterval: ReturnType<typeof setInterval> | null = null;

  connect(session: string): void {
    this.session = session;
    this.intentionalClose = false;
    this.reconnectAttempts = 0;
    this.doConnect();
  }

  private doConnect(): void {
    if (!this.session) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = process.env.NEXT_PUBLIC_CALLS_WS_URL ?? `${protocol}//${window.location.host}/ws`;
    const fullUrl = wsUrl.startsWith("/") ? `${protocol}//${window.location.host}${wsUrl}` : wsUrl;

    this.ws = new WebSocket(fullUrl);

    this.ws.onopen = () => {
      this.send({ type: "join", session: this.session });
      this.reconnectAttempts = 0;
      this.startPing();
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "pong") return;
        this.emit(data.type, data);
      } catch { /* ignore */ }
    };

    this.ws.onclose = (event) => {
      this.stopPing();

      if (event.code === 4002) {
        this.emit("you-were-kicked", {});
        return;
      }

      if (this.intentionalClose) return;

      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), 15000);
        this.reconnectAttempts++;
        this.emit("reconnecting", {});
        this.reconnectTimer = setTimeout(() => this.doConnect(), delay);
      } else {
        this.emit("error", { message: "Utracono połączenie" });
      }
    };

    this.ws.onerror = () => {};
  }

  private startPing(): void {
    this.stopPing();
    this.pingInterval = setInterval(() => {
      this.send({ type: "ping" });
    }, 20_000);
  }

  private stopPing(): void {
    if (this.pingInterval) { clearInterval(this.pingInterval); this.pingInterval = null; }
  }

  on<K extends keyof SignalingEventMap>(event: K, handler: EventHandler<K>): () => void {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set());
    this.handlers.get(event)!.add(handler);
    return () => { this.handlers.get(event)?.delete(handler); };
  }

  send(message: object): void {
    if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(message));
  }

  sendOffer(targetPeerId: string, sdp: RTCSessionDescriptionInit): void { this.send({ type: "offer", targetPeerId, sdp }); }
  sendAnswer(targetPeerId: string, sdp: RTCSessionDescriptionInit): void { this.send({ type: "answer", targetPeerId, sdp }); }
  sendIceCandidate(targetPeerId: string, candidate: RTCIceCandidateInit): void { this.send({ type: "ice-candidate", targetPeerId, candidate }); }

  createPoll(question: string, options: string[], durationSeconds: number): void { this.send({ type: "create-poll", question, options, durationSeconds }); }
  vote(pollId: string, optionIndex: number): void { this.send({ type: "vote", pollId, optionIndex }); }

  sendChat(text: string): void { this.send({ type: "chat", text }); }
  requestSpeak(): void { this.send({ type: "request-speak" }); }
  approveSpeak(targetPeerId: string): void { this.send({ type: "approve-speak", targetPeerId }); }
  denySpeak(targetPeerId: string): void { this.send({ type: "deny-speak", targetPeerId }); }
  revokeSpeak(targetPeerId: string): void { this.send({ type: "revoke-speak", targetPeerId }); }
  kick(targetPeerId: string): void { this.send({ type: "kick", targetPeerId }); }

  leave(): void {
    this.intentionalClose = true;
    this.stopPing();
    this.send({ type: "leave" });
    this.ws?.close();
    this.ws = null;
    this.handlers.clear();
    if (this.reconnectTimer) { clearTimeout(this.reconnectTimer); this.reconnectTimer = null; }
  }

  disconnect(): void {
    this.intentionalClose = true;
    this.stopPing();
    this.ws?.close();
    this.ws = null;
    this.handlers.clear();
    if (this.reconnectTimer) { clearTimeout(this.reconnectTimer); this.reconnectTimer = null; }
  }

  private emit(event: string, data: unknown): void {
    const eventHandlers = this.handlers.get(event);
    if (eventHandlers) for (const h of eventHandlers) h(data);
  }
}
