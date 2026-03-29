"use client";

import { useState, useRef, useEffect, useCallback, type FormEvent } from "react";
import type { Role } from "@/lib/calls/api";
import { useCallsLang } from "@/lib/calls/LangContext";

export interface ChatMessage {
  id: string;
  fromPeerId: string;
  fromRole: Role;
  text: string;
  timestamp: number;
}

interface ChatPanelProps {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  cooldownRemaining: number;
  getName?: (peerId: string) => string;
}

const COOLDOWN_SECONDS = 5;

export function ChatPanel({ messages, onSend, cooldownRemaining, getName }: ChatPanelProps) {
  const { t } = useCallsLang();
  const [text, setText] = useState("");
  const [localCooldown, setLocalCooldown] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const cooldown = Math.max(cooldownRemaining, localCooldown);

  useEffect(() => {
    if (localCooldown <= 0) return;
    const timer = setInterval(() => setLocalCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [localCooldown]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const handleSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || cooldown > 0) return;
    onSend(trimmed);
    setText("");
    setLocalCooldown(COOLDOWN_SECONDS);
  }, [text, cooldown, onSend]);

  const roleLabel = (role: Role) => {
    if (role === "admin") return t("admin");
    if (role === "speaker") return t("speaker");
    return "";
  };

  const roleColor = (role: Role) => {
    if (role === "admin") return "text-white";
    if (role === "speaker") return "text-neutral-400";
    return "text-neutral-600";
  };

  return (
    <div className="flex flex-col bg-[#0c0c0c] border border-[#1a1a1a] rounded-lg h-[340px]">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#1a1a1a]">
        <h3 className="text-sm font-semibold text-neutral-400 font-[var(--font-heading)]">{t("chat")}</h3>
        <span className="flex-1" />
        <span className="text-xs text-neutral-700">{messages.length}</span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-2 scrollbar-thin">
        {messages.length === 0 && (
          <p className="text-[10px] text-neutral-800 text-center mt-8 italic">{t("noMessages")}</p>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className="calls-animate-fade-in">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[10px] font-mono text-neutral-500">{getName ? getName(msg.fromPeerId) : msg.fromPeerId.slice(0, 6)}</span>
              {roleLabel(msg.fromRole) && (
                <span className={`text-[8px] uppercase tracking-wider font-medium ${roleColor(msg.fromRole)}`}>
                  {roleLabel(msg.fromRole)}
                </span>
              )}
              <span className="text-[9px] text-neutral-700">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            <p className="text-[13px] text-neutral-300 leading-relaxed mt-0.5 break-words">{msg.text}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-[#1a1a1a] p-2.5 flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 300))}
          placeholder={cooldown > 0 ? `${t("waitCooldown")} ${cooldown}s...` : t("typeMessage")}
          disabled={cooldown > 0}
          maxLength={300}
          className="flex-1 px-3 py-2 bg-[#090909] border border-[#1a1a1a] rounded text-white text-sm placeholder-neutral-700 focus:outline-none focus:border-neutral-500 transition-colors disabled:opacity-40"
        />
        <button
          type="submit"
          disabled={!text.trim() || cooldown > 0}
          className={`px-4 py-2 rounded text-sm font-medium transition-all ${
            !text.trim() || cooldown > 0
              ? "bg-[#111] text-neutral-700 cursor-not-allowed"
              : "bg-white text-black hover:bg-neutral-200"
          }`}
        >
          {cooldown > 0 ? `${cooldown}s` : t("send")}
        </button>
      </form>
    </div>
  );
}
