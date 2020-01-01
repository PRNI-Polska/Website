"use client";

import { useState, useCallback, useRef, useEffect } from "react";
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
  const [transcriptLang, setTranscriptLang] = useState("pl-PL");
  const [emailStatus, setEmailStatus] = useState<"idle"|"sending"|"sent"|"error">("idle");
  const transcriptRef = useRef<TranscriptEntry[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const lang = params.get("lang");
    if (lang && ["pl-PL", "de-DE", "en-US"].includes(lang)) {
      setTranscriptLang(lang);
    }
  }, []);

  const handleJoined = useCallback((s: SessionData) => {
    transcriptRef.current = [];
    setState({ phase: "in-meeting", session: s });
  }, []);
  const handleError = useCallback((_m: string) => {}, []);
  const handleLeave = useCallback(() => {
    const transcript = transcriptRef.current;
    setState({ phase: "ended", transcript });

    // Auto-send transcript to admin email
    if (transcript.length > 0) {
      fetch("/api/calls/transcript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      }).catch(() => {});
    }
  }, []);
  const handleRetry = useCallback(() => setState({ phase: "join" }), []);
  const handleTranscriptUpdate = useCallback((entries: TranscriptEntry[]) => {
    transcriptRef.current = entries;
  }, []);

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
      {state.phase === "in-meeting" && <MeetingRoom session={state.session} onLeave={handleLeave} onTranscriptUpdate={handleTranscriptUpdate} transcriptLang={transcriptLang} />}
      {state.phase === "ended" && (
        <div className="w-full max-w-md text-center calls-animate-fade-up">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="PRNI" className="w-20 h-20 mx-auto mb-6 opacity-60" />
          <h2 className="text-2xl mb-3 font-[var(--font-heading)]">{t("meetingEnded")}</h2>
          <p className="text-neutral-500 mb-8">{t("sessionTerminated")}</p>
          {state.transcript.length > 0 && (
            <p className="text-xs text-neutral-600 mb-6">
              {emailStatus === "sent" ? "Transkrypcja została wysłana." : emailStatus === "sending" ? "Wysyłanie transkrypcji..." : emailStatus === "error" ? "Błąd wysyłania transkrypcji." : "Transkrypcja zostanie wysłana automatycznie."}
            </p>
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
