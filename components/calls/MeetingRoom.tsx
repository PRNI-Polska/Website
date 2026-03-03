"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { SessionData, Role } from "@/lib/calls/api";
import { WebRTCManager } from "@/lib/calls/webrtc";
import { AudioParticipant } from "./AudioParticipant";
import { PollCard, type PollData } from "./PollCard";
import { AdminControls } from "./AdminControls";
import { ChatPanel, type ChatMessage } from "./ChatPanel";
import { useCallsLang } from "@/lib/calls/LangContext";

interface MeetingRoomProps { session: SessionData; onLeave: () => void; }
interface PeerState { peerId: string; role: Role; isSpeaking: boolean; audioStream: MediaStream | null; }
function canSpeak(r: Role) { return r === "admin" || r === "speaker"; }

export function MeetingRoom({ session, onLeave }: MeetingRoomProps) {
  const { t } = useCallsLang();
  const managerRef = useRef<WebRTCManager | null>(null);
  const [peers, setPeers] = useState<Map<string, PeerState>>(new Map());
  const [myRole, setMyRole] = useState<Role>(session.role);
  const [isMuted, setIsMuted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [localSpeaking, setLocalSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [polls, setPolls] = useState<Map<string, PollData>>(new Map());
  const [speakRequests, setSpeakRequests] = useState<Array<{ peerId: string }>>([]);
  const [speakRequestPending, setSpeakRequestPending] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatCooldown, setChatCooldown] = useState(0);
  const [notification, setNotification] = useState<string | null>(null);
  const localAnalyserRef = useRef<{interval:ReturnType<typeof setInterval>;ctx:AudioContext}|null>(null);

  const notify = (msg: string) => { setNotification(msg); setTimeout(() => setNotification(null), 3000); };
  useEffect(() => { const i = setInterval(() => setElapsed(e => e + 1), 1000); return () => clearInterval(i); }, []);
  const fmt = (s: number) => `${Math.floor(s/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}`;

  useEffect(() => {
    const mgr = new WebRTCManager(session); managerRef.current = mgr;
    const unsub = mgr.onEvent((ev) => {
      switch (ev.type) {
        case "connected": setIsConnected(true); setError(null);
          if(ev.activePolls){const m=new Map<string,PollData>();for(const p of ev.activePolls as Array<{pollId:string;question:string;options:string[];endsAt:number;currentResults:number[]}>){m.set(p.pollId,{pollId:p.pollId,question:p.question,options:p.options,results:p.currentResults,totalVotes:p.currentResults.reduce((a:number,b:number)=>a+b,0),endsAt:p.endsAt,ended:false,voted:false});}setPolls(m);}
          if(ev.pendingSpeakRequests)setSpeakRequests(ev.pendingSpeakRequests as Array<{peerId:string}>); break;
        case "peer-added": setPeers(p=>{const n=new Map(p);n.set(ev.peerId,{peerId:ev.peerId,role:ev.role as Role,isSpeaking:false,audioStream:null});return n;}); break;
        case "peer-removed": setPeers(p=>{const n=new Map(p);n.delete(ev.peerId);return n;}); break;
        case "remote-stream": setPeers(p=>{const n=new Map(p);const x=n.get(ev.peerId);if(x)n.set(ev.peerId,{...x,audioStream:ev.stream});return n;}); break;
        case "speaking-change": setPeers(p=>{const n=new Map(p);const x=n.get(ev.peerId);if(x)n.set(ev.peerId,{...x,isSpeaking:ev.isSpeaking});return n;}); break;
        case "role-changed": setPeers(p=>{const n=new Map(p);const x=n.get(ev.peerId);if(x)n.set(ev.peerId,{...x,role:ev.newRole});return n;}); break;
        case "promoted": setMyRole(ev.newRole); notify(t("promotedToSpeaker")); break;
        case "demoted": setMyRole(ev.newRole); setIsMuted(false); notify(t("demotedToListener")); break;
        case "poll-started": setPolls(p=>{const n=new Map(p);n.set(ev.pollId,{pollId:ev.pollId,question:ev.question,options:ev.options,results:new Array(ev.options.length).fill(0),totalVotes:0,endsAt:ev.endsAt,ended:false,voted:false});return n;}); break;
        case "poll-update": setPolls(p=>{const n=new Map(p);const x=n.get(ev.pollId);if(x)n.set(ev.pollId,{...x,results:ev.results,totalVotes:ev.totalVotes});return n;}); break;
        case "poll-ended": setPolls(p=>{const n=new Map(p);n.set(ev.pollId,{pollId:ev.pollId,question:ev.question,options:ev.options,results:ev.results,totalVotes:ev.totalVotes,endsAt:0,ended:true,voted:true});return n;}); break;
        case "speak-request": setSpeakRequests(p=>[...p.filter(r=>r.peerId!==ev.peerId),{peerId:ev.peerId}]); break;
        case "speak-request-sent": setSpeakRequestPending(true); notify(t("requestSent")); break;
        case "speak-request-denied": setSpeakRequestPending(false); notify(t("requestDenied")); break;
        case "speak-request-resolved": setSpeakRequests(p=>p.filter(r=>r.peerId!==ev.peerId)); break;
        case "chat-message": setChatMessages(prev=>[...prev.slice(-200),{id:`${ev.timestamp}-${ev.fromPeerId}`,fromPeerId:ev.fromPeerId,fromRole:ev.fromRole,text:ev.text,timestamp:ev.timestamp}]); break;
        case "chat-cooldown": setChatCooldown(ev.remainingSeconds); break;
        case "kicked": managerRef.current?.destroy(); onLeave(); break;
        case "reconnecting": setIsConnected(false); setError(null); notify(t("reconnecting")); break;
        case "error": setError(ev.message); break;
      }
    });
    mgr.start();
    let lci:ReturnType<typeof setInterval>|null=null;
    if(canSpeak(session.role)){lci=setInterval(()=>{const s=mgr.getLocalStream();if(!s)return;try{const ac=new AudioContext();const src=ac.createMediaStreamSource(s);const an=ac.createAnalyser();an.fftSize=512;src.connect(an);const d=new Uint8Array(an.frequencyBinCount);const pi=setInterval(()=>{an.getByteFrequencyData(d);let sum=0;for(let i=0;i<d.length;i++)sum+=d[i];setLocalSpeaking(sum/d.length>15);},100);localAnalyserRef.current={interval:pi,ctx:ac};if(lci)clearInterval(lci);}catch{}},500);}
    return()=>{if(lci)clearInterval(lci);if(localAnalyserRef.current){clearInterval(localAnalyserRef.current.interval);localAnalyserRef.current.ctx.close();}unsub();mgr.destroy();};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const toggleMute=useCallback(()=>{if(managerRef.current)setIsMuted(managerRef.current.toggleMute());},[]);
  const leave=useCallback(()=>{managerRef.current?.destroy();onLeave();},[onLeave]);
  const vote=useCallback((id:string,i:number)=>{managerRef.current?.getSignaling().vote(id,i);setPolls(p=>{const n=new Map(p);const x=n.get(id);if(x)n.set(id,{...x,voted:true});return n;});},[]);
  const createPoll=useCallback((q:string,o:string[],d:number)=>{managerRef.current?.getSignaling().createPoll(q,o,d);},[]);
  const reqSpeak=useCallback(()=>{managerRef.current?.getSignaling().requestSpeak();},[]);
  const appSpeak=useCallback((id:string)=>{managerRef.current?.getSignaling().approveSpeak(id);},[]);
  const denSpeak=useCallback((id:string)=>{managerRef.current?.getSignaling().denySpeak(id);},[]);
  const revSpeak=useCallback((id:string)=>{managerRef.current?.getSignaling().revokeSpeak(id);},[]);
  const kickPeer=useCallback((id:string)=>{managerRef.current?.getSignaling().kick(id);},[]);
  const sendChat=useCallback((text:string)=>{managerRef.current?.getSignaling().sendChat(text);},[]);

  const count = peers.size + 1;
  const all = [{peerId:"local",role:myRole,isSpeaking:localSpeaking&&!isMuted,audioStream:null as MediaStream|null,isLocal:true},...Array.from(peers.values()).map(p=>({...p,isLocal:false}))];
  const spk = all.filter(p => canSpeak(p.role));
  const lis = all.filter(p => !canSpeak(p.role));
  const roleMap: Record<string, string> = {admin:t("admin"),speaker:t("speaker"),listener:t("listener")};

  return (
    <div className="w-full max-w-6xl mx-auto calls-animate-fade-up">
      <div className="flex items-center justify-between mb-6 pb-5 border-b border-[#1a1a1a]">
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="PRNI" className="w-10 h-10" />
          <div>
            <h2 className="text-lg font-semibold tracking-wide font-[var(--font-heading)]">PRNI Komunikator</h2>
            <p className="text-xs text-neutral-600 font-[var(--font-mono)] mt-0.5">{session.meetingId.slice(0,8)}</p>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <span className="text-base font-[var(--font-mono)] text-neutral-500">{fmt(elapsed)}</span>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`} />
            <span className="text-sm text-neutral-500">{isConnected ? t("connected") : t("connecting")}</span>
          </div>
          <span className="text-sm text-neutral-600">{count} {t("persons")}</span>
          <span className={`text-xs font-semibold px-3 py-1 rounded ${
            myRole === "admin" ? "bg-white text-black" : myRole === "speaker" ? "bg-[#1a1a1a] text-neutral-300 border border-[#333]" : "bg-[#111] text-neutral-600"
          }`}>{roleMap[myRole]}</span>
        </div>
      </div>

      {notification && <div className="mb-4 py-3 px-5 bg-[#111] border border-[#252525] rounded text-sm text-center text-white calls-animate-fade-in">{notification}</div>}
      {error && <div className="mb-4 py-3 px-5 bg-red-950/20 border border-red-900/30 rounded text-sm text-red-400 text-center calls-animate-fade-in">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div>
          {spk.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-base font-semibold tracking-wide">{t("speakers")}</h3>
                <span className="text-xs text-neutral-600 bg-[#151515] px-2 py-0.5 rounded">{spk.length}</span>
                <span className="flex-1 h-px bg-[#1a1a1a]" />
              </div>
              <div className={`grid gap-3 ${spk.length <= 2 ? "grid-cols-1 sm:grid-cols-2 max-w-xl" : "grid-cols-2 md:grid-cols-3"}`}>
                {spk.map(p => <AudioParticipant key={p.peerId} peerId={p.peerId} role={p.role} isSpeaking={p.isSpeaking} audioStream={p.audioStream} isLocal={p.isLocal} isMuted={p.isLocal ? isMuted : false} />)}
              </div>
            </div>
          )}

          {lis.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-base font-medium text-neutral-500">{t("listeners")}</h3>
                <span className="text-xs text-neutral-700 bg-[#111] px-2 py-0.5 rounded">{lis.length}</span>
                <span className="flex-1 h-px bg-[#141414]" />
              </div>
              <div className="grid gap-2 grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                {lis.map(p => <AudioParticipant key={p.peerId} peerId={p.peerId} role={p.role} isSpeaking={false} audioStream={p.audioStream} isLocal={p.isLocal} isMuted={false} compact />)}
              </div>
            </div>
          )}

          <div className="flex items-center justify-center gap-3 mt-10">
            {canSpeak(myRole) ? (
              <button onClick={toggleMute} className={`flex items-center gap-2.5 px-7 py-3.5 rounded font-medium text-sm transition-all duration-200 ${
                isMuted
                  ? "bg-red-950/40 border border-red-800/40 text-red-400 hover:bg-red-900/50"
                  : "bg-[#151515] border border-[#252525] text-white hover:bg-[#1a1a1a] hover:border-[#333]"
              }`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"/>{isMuted&&<path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" strokeWidth={2}/>}</svg>
                {isMuted ? t("unmute") : t("mute")}
              </button>
            ) : (
              <>
                <span className="px-5 py-3.5 bg-[#0e0e0e] border border-[#1a1a1a] rounded text-sm text-neutral-600">{t("listenOnly")}</span>
                {!speakRequestPending ? (
                  <button onClick={reqSpeak} className="px-5 py-3.5 bg-[#151515] border border-[#252525] rounded text-sm text-neutral-300 hover:bg-white hover:text-black transition-all">{t("requestSpeak")}</button>
                ) : (
                  <span className="px-5 py-3.5 bg-[#0e0e0e] border border-[#1a1a1a] rounded text-sm text-neutral-600">{t("waiting")}</span>
                )}
              </>
            )}
            <button onClick={leave} className="px-7 py-3.5 bg-red-950/30 border border-red-900/30 rounded text-red-500 font-medium text-sm hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-200">
              {t("leaveMeeting")}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <ChatPanel messages={chatMessages} onSend={sendChat} cooldownRemaining={chatCooldown} />
          {Array.from(polls.values()).map(p => <PollCard key={p.pollId} poll={p} onVote={vote} />)}
          {myRole === "admin" && (
            <AdminControls speakRequests={speakRequests} peers={Array.from(peers.values()).map(p => ({peerId:p.peerId,role:p.role}))} onCreatePoll={createPoll} onApproveSpeak={appSpeak} onDenySpeak={denSpeak} onRevokeSpeak={revSpeak} onKick={kickPeer} />
          )}
          <div className="pt-4 text-center">
            <p className="text-xs text-neutral-800 italic font-[var(--font-heading)]">&ldquo;Narod Ponad Wszystkim&rdquo;</p>
          </div>
        </div>
      </div>
    </div>
  );
}
