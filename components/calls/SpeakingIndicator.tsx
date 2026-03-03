"use client";

interface SpeakingIndicatorProps {
  isSpeaking: boolean;
}

export function SpeakingIndicator({ isSpeaking }: SpeakingIndicatorProps) {
  return (
    <div className="relative inline-flex items-center justify-center">
      {isSpeaking && (
        <>
          <span className="absolute w-5 h-5 rounded-full bg-white/20 calls-speaking-ring" />
          <span
            className="absolute w-5 h-5 rounded-full bg-white/10 calls-speaking-ring"
            style={{ animationDelay: "0.4s" }}
          />
        </>
      )}
      <span
        className={`relative w-2.5 h-2.5 rounded-full transition-all duration-300 ${
          isSpeaking ? "bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]" : "bg-neutral-700"
        }`}
      />
    </div>
  );
}
