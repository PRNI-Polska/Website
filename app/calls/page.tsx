"use client";

import { useState, useCallback, useRef, type FormEvent } from "react";
import { JoinForm } from "@/components/calls/JoinForm";
import { MeetingRoom } from "@/components/calls/MeetingRoom";
import { LangSwitcher } from "@/components/calls/LangSwitcher";
import { useCallsLang } from "@/lib/calls/LangContext";
import type { SessionData } from "@/lib/calls/api";

interface TranscriptEntry {
  peerId: string;
  role: string;
  text: string;
  timestamp: number;
}

type AppState =
  | { phase: "join" }
  | { phase: "in-meeting"; session: SessionData }
  | { phase: "ended"; transcript: TranscriptEntry[] }
  | { phase: "error"; message: string };

export default function CallsPage() {
  const { t } = useCallsLang();
  const [state, setState] = useState<AppState>({ phase: "join" });
  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<"idle"|"sending"|"sent"|"error">("idle");
  const transcriptRef = useRef<TranscriptEntry[]>([]);

  const handleJoined = useCallback((s: SessionData) => {
    transcriptRef.current = [];
    setState({ phase: "in-meeting", session: s });
  }, []);
  const handleError = useCallback((_m: string) => {}, []);
  const handleLeave = useCallback(() => {
    setState({ phase: "ended", transcript: transcriptRef.current });
  }, []);
  const handleRetry = useCallback(() => setState({ phase: "join" }), []);
  const handleTranscriptUpdate = useCallback((entries: TranscriptEntry[]) => {
    transcriptRef.current = entries;
  }, []);

  const handleEmailTranscript = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || state.phase !== "ended" || state.transcript.length === 0) return;
    setEmailStatus("sending");
    try {
      const res = await fetch("/api/calls/transcript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), transcript: state.transcript }),
      });
      if (!res.ok) throw new Error();
      setEmailStatus("sent");
    } catch {
      setEmailStatus("error");
      setTimeout(() => setEmailStatus("idle"), 3000);
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center p-6 min-h-screen">
      {state.phase === "join" && (
        <div className="w-full max-w-lg calls-animate-fade-up">
          <div className="flex justify-end mb-6"><LangSwitcher /></div>
          <div className="text-center mb-12">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="PRNI" className="w-28 h-28 mx-auto mb-6" />
            <h1 className="text-4xl font-semibold tracking-wide mb-2 font-[var(--font-heading)]">Komunikator</h1>
            <p className="text-base text-neutral-500 tracking-wide">{t("subtitle")}</p>
            <div className="calls-divider mt-6"><span className="calls-divider-dot" /></div>
          </div>
          <p className="text-center text-lg italic text-neutral-500 mb-10 font-[var(--font-heading)]">&ldquo;{t("slogan")}&rdquo;</p>
          <div className="bg-[#0e0e0e] border border-[#1c1c1c] rounded-lg p-7">
            <JoinForm onJoined={handleJoined} onError={handleError} />
          </div>
          <div className="flex items-center justify-center gap-8 mt-10 text-sm text-neutral-600">
            <span>{t("encrypted")}</span><span className="text-neutral-800">|</span>
            <span>{t("anonymous")}</span><span className="text-neutral-800">|</span>
            <span>{t("secure")}</span>
          </div>
          <div className="text-center mt-6">
            <a href="/" className="text-sm text-neutral-700 hover:text-white transition-colors">prni.org.pl</a>
          </div>
        </div>
      )}
      {state.phase === "in-meeting" && <MeetingRoom session={state.session} onLeave={handleLeave} onTranscriptUpdate={handleTranscriptUpdate} />}
      {state.phase === "ended" && (
        <div className="w-full max-w-lg text-center calls-animate-fade-up">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="PRNI" className="w-20 h-20 mx-auto mb-6 opacity-60" />
          <h2 className="text-2xl mb-3 font-[var(--font-heading)]">{t("meetingEnded")}</h2>
          <p className="text-neutral-500 mb-8">{t("sessionTerminated")}</p>

          {state.transcript.length > 0 && (
            <div className="mb-8 text-left">
              <div className="bg-[#0e0e0e] border border-[#1c1c1c] rounded-lg p-5 mb-4">
                <h3 className="text-sm font-semibold text-neutral-400 mb-3">{t("transcript")} ({state.transcript.length})</h3>
                <div className="max-h-48 overflow-y-auto space-y-2 text-sm">
                  {state.transcript.map((entry, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-[10px] font-mono text-neutral-600 shrink-0 mt-0.5">
                        {new Date(entry.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <span className="text-neutral-300">{entry.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleEmailTranscript} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("emailPlaceholder")}
                  className="flex-1 px-4 py-3 bg-[#090909] border border-[#252525] rounded text-white text-sm focus:outline-none focus:border-neutral-500 transition-colors"
                  disabled={emailStatus === "sending" || emailStatus === "sent"}
                />
                <button
                  type="submit"
                  disabled={!email.trim() || emailStatus === "sending" || emailStatus === "sent"}
                  className={`px-5 py-3 rounded font-medium text-sm transition-all ${
                    emailStatus === "sent"
                      ? "bg-emerald-600 text-white"
                      : emailStatus === "error"
                      ? "bg-red-600 text-white"
                      : "bg-white text-black hover:bg-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed"
                  }`}
                >
                  {emailStatus === "sending" ? t("sending") : emailStatus === "sent" ? t("sent") : emailStatus === "error" ? t("sendFailed") : t("emailTranscript")}
                </button>
              </form>
            </div>
          )}

          <button onClick={handleRetry} className="px-10 py-3 bg-white text-black font-semibold text-sm rounded hover:bg-neutral-200 transition-colors">{t("rejoin")}</button>
        </div>
      )}
      {state.phase === "error" && (
        <div className="w-full max-w-md text-center calls-animate-fade-up">
          <h2 className="text-2xl mb-3 font-[var(--font-heading)]">{t("connectionError")}</h2>
          <p className="text-red-400 mb-8">{state.message}</p>
          <button onClick={handleRetry} className="px-10 py-3 border border-neutral-600 text-sm rounded hover:border-white transition-colors">{t("tryAgain")}</button>
        </div>
      )}
    </main>
  );
}
