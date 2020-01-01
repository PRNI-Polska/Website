"use client";

import { useState, useCallback, type FormEvent } from "react";
import { joinMeeting, type SessionData } from "@/lib/calls/api";
import { useCallsLang } from "@/lib/calls/LangContext";

interface JoinFormProps { onJoined: (s: SessionData) => void; onError: (m: string) => void; }

export function JoinForm({ onJoined, onError }: JoinFormProps) {
  const { t } = useCallsLang();
  const [roomCode, setRoomCode] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [pinType, setPinType] = useState<"none" | "speaker" | "admin">("none");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim() || !password.trim()) return;
    setLoading(true); setError(null);
    try {
      const session = await joinMeeting(roomCode, password, pinType === "speaker" ? pin : undefined, pinType === "admin" ? pin : undefined);
      onJoined(session);
    } catch (err) { const msg = err instanceof Error ? err.message : "Error"; setError(msg); onError(msg); }
    finally { setLoading(false); }
  }, [roomCode, password, pin, pinType, onJoined, onError]);

  const roles = { none: t("listener"), speaker: t("speaker"), admin: t("admin") };
  const canSubmit = roomCode.trim() && password.trim() && (pinType === "none" || pin.trim());

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="calls-roomCode" className="block text-sm font-medium text-neutral-400 mb-2">{t("roomCode")}</label>
        <input id="calls-roomCode" type="text" value={roomCode}
          onChange={(e) => { setRoomCode(e.target.value.toUpperCase()); setError(null); }}
          placeholder="VAULT-XXXX-XXXX" autoComplete="off" autoFocus spellCheck={false}
          className={`w-full px-5 py-4 bg-[#090909] text-center border rounded text-white font-[var(--font-mono)] text-lg tracking-widest focus:outline-none transition-colors ${error?"border-red-800":"border-[#252525] focus:border-neutral-500"}`} />
      </div>
      <div>
        <label htmlFor="calls-password" className="block text-sm font-medium text-neutral-400 mb-2">{t("meetingPassword")}</label>
        <input id="calls-password" type="text" value={password}
          onChange={(e) => { setPassword(e.target.value); setError(null); }}
          placeholder={t("passwordRequired")} autoComplete="off" spellCheck={false}
          className="w-full px-5 py-3 bg-[#090909] text-center border border-[#252525] rounded text-white font-[var(--font-mono)] text-base tracking-widest focus:outline-none focus:border-neutral-500 transition-colors" />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-400 mb-2">{t("role")}</label>
        <div className="grid grid-cols-3 gap-0 border border-[#252525] rounded overflow-hidden">
          {(["none","speaker","admin"] as const).map(r=>(
            <button key={r} type="button" onClick={()=>{setPinType(r);setPin("");setError(null);}}
              className={`py-3 text-sm font-medium transition-all duration-200 ${pinType===r?"bg-white text-black":"bg-transparent text-neutral-500 hover:text-white hover:bg-[#151515]"}`}>
              {roles[r]}
            </button>
          ))}
        </div>
      </div>
      {pinType!=="none"&&(
        <div className="calls-animate-fade-in">
          <label htmlFor="calls-pin" className="block text-sm font-medium text-neutral-400 mb-2">{pinType==="admin"?t("adminPin"):t("speakerPin")}</label>
          <input id="calls-pin" type="text" value={pin} onChange={(e)=>{setPin(e.target.value);setError(null);}}
            placeholder={pinType==="admin"?t("digits6"):t("digits4")} autoComplete="off"
            className="w-full px-5 py-3 bg-[#090909] border border-[#252525] rounded text-white font-[var(--font-mono)] text-center text-base tracking-[0.3em] focus:outline-none focus:border-neutral-500 transition-colors" />
        </div>
      )}
      {error&&<p className="text-sm text-red-400 text-center calls-animate-fade-in">{error}</p>}
      <button type="submit" disabled={loading||!canSubmit}
        className={`w-full py-4 rounded font-semibold text-sm transition-all duration-200 ${loading||!canSubmit?"bg-[#1a1a1a] text-neutral-700 cursor-not-allowed":"bg-white text-black hover:bg-neutral-200 active:bg-neutral-300"}`}>
        {loading?t("joining"):`${t("joinAs")} ${roles[pinType]}`}
      </button>
    </form>
  );
}
