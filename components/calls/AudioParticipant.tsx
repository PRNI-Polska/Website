"use client";

import { useEffect, useRef, useMemo } from "react";
import { SpeakingIndicator } from "./SpeakingIndicator";
import { useCallsLang } from "@/lib/calls/LangContext";
import type { Role } from "@/lib/calls/api";

interface AudioParticipantProps {
  peerId: string;
  role: Role;
  isSpeaking: boolean;
  audioStream: MediaStream | null;
  isLocal?: boolean;
  isMuted?: boolean;
  compact?: boolean;
  displayName?: string;
}

function AudioBars({ active }: { active: boolean }) {
  const bars = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        h: 6 + Math.random() * 14,
        s: 0.35 + Math.random() * 0.35,
        d: i * 0.07,
      })),
    []
  );

  return (
    <div className="flex items-end justify-center gap-[2px] h-5">
      {bars.map((b, i) => (
        <div
          key={i}
          className={`w-[2px] rounded-full transition-all duration-200 ${
            active ? "bg-white" : "bg-neutral-800"
          }`}
          style={
            active
              ? {
                  height: `${b.h}px`,
                  animation: `calls-audio-bar ${b.s}s ease-in-out infinite`,
                  animationDelay: `${b.d}s`,
                  ["--bar-h" as string]: `${b.h}px`,
                  ["--bar-s" as string]: `${b.s}s`,
                  ["--bar-d" as string]: `${b.d}s`,
                }
              : { height: "3px" }
          }
        />
      ))}
    </div>
  );
}

export function AudioParticipant({
  peerId,
  role,
  isSpeaking,
  audioStream,
  isLocal = false,
  isMuted = false,
  compact = false,
  displayName,
}: AudioParticipantProps) {
  const { t } = useCallsLang();
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const el = audioRef.current;
    if (!el || !audioStream || isLocal) return;

    el.srcObject = audioStream;
    el.muted = false;
    el.volume = 1;

    const tryPlay = () => {
      el.play().catch(() => {
        // Autoplay blocked — retry on next user interaction
        const resume = () => {
          el.play().catch(() => {});
          document.removeEventListener("click", resume);
          document.removeEventListener("touchstart", resume);
        };
        document.addEventListener("click", resume, { once: true });
        document.addEventListener("touchstart", resume, { once: true });
      });
    };

    tryPlay();

    // Recover from track ending (happens on ICE restart / stream replacement)
    const tracks = audioStream.getAudioTracks();
    const onEnded = () => {
      if (el.srcObject !== audioStream) return;
      tryPlay();
    };
    for (const t of tracks) t.addEventListener("ended", onEnded);

    return () => {
      for (const t of tracks) t.removeEventListener("ended", onEnded);
    };
  }, [audioStream, isLocal]);

  const label = displayName || (isLocal ? t("you") : peerId.slice(0, 6));
  const active = isSpeaking && (!isLocal || !isMuted);

  if (compact) {
    return (
      <div className="flex flex-col items-center gap-2 p-3 bg-[#0e0e0e] border border-[#1a1a1a] rounded calls-animate-fade-up">
        <div className="w-10 h-10 rounded-full bg-[#151515] flex items-center justify-center">
          <svg className="w-4 h-4 text-neutral-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </div>
        <p className="text-xs text-neutral-500">{label}</p>
        {!isLocal && audioStream && <audio ref={audioRef} autoPlay playsInline />}
      </div>
    );
  }

  return (
    <div
      className={`
        flex flex-col items-center gap-3 p-5 rounded-lg
        border transition-all duration-300 calls-animate-fade-up
        ${active ? "border-[#333] bg-[#0f0f0f]" : "border-[#1a1a1a] bg-[#0c0c0c]"}
      `}
    >
      <div className="relative">
        <div
          className={`
            w-16 h-16 rounded-full flex items-center justify-center
            transition-all duration-300
            ${active ? "bg-[#1a1a1a] ring-2 ring-emerald-500/30" : "bg-[#151515]"}
          `}
        >
          <svg
            className={`w-6 h-6 transition-colors duration-300 ${
              active ? "text-white" : "text-neutral-600"
            }`}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
            />
          </svg>

          {isLocal && isMuted && (
            <div className="absolute inset-0 bg-black/70 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
              </svg>
            </div>
          )}
        </div>

        <div className="absolute -bottom-1 -right-1">
          <SpeakingIndicator isSpeaking={active} />
        </div>
      </div>

      <AudioBars active={active} />

      <div className="text-center">
        <p className="text-sm font-medium text-neutral-200">{label}</p>
        <p className={`text-xs mt-0.5 ${role === "admin" ? "text-white font-medium" : "text-neutral-600"}`}>
          {role === "admin" ? t("admin") : t("speaker")}{isLocal && isMuted ? ` · ${t("muted")}` : ""}
        </p>
      </div>

      {!isLocal && audioStream && (
        <audio ref={audioRef} autoPlay playsInline />
      )}
    </div>
  );
}
