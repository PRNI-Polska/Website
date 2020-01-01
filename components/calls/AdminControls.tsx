"use client";

import { useState, useCallback, type FormEvent } from "react";
import type { Role } from "@/lib/calls/api";
import { useCallsLang } from "@/lib/calls/LangContext";

interface AdminControlsProps {
  speakRequests: Array<{ peerId: string }>;
  peers: Array<{ peerId: string; role: Role }>;
  onCreatePoll: (question: string, options: string[], durationSeconds: number) => void;
  onApproveSpeak: (peerId: string) => void;
  onDenySpeak: (peerId: string) => void;
  onRevokeSpeak: (peerId: string) => void;
  onKick: (peerId: string) => void;
}

export function AdminControls({ speakRequests, peers, onCreatePoll, onApproveSpeak, onDenySpeak, onRevokeSpeak, onKick }: AdminControlsProps) {
  const { t } = useCallsLang();
  const [showPollForm, setShowPollForm] = useState(false);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [duration, setDuration] = useState(30);

  const addOption = () => { if (options.length < 10) setOptions([...options, ""]); };
  const removeOption = (i: number) => { if (options.length > 2) setOptions(options.filter((_, j) => j !== i)); };
  const updateOption = (i: number, val: string) => { const n = [...options]; n[i] = val; setOptions(n); };

  const handleCreatePoll = useCallback((e: FormEvent) => {
    e.preventDefault();
    const q = question.trim();
    const opts = options.map((o) => o.trim()).filter(Boolean);
    if (!q || opts.length < 2) return;
    onCreatePoll(q, opts, duration);
    setShowPollForm(false);
    setQuestion("");
    setOptions(["", ""]);
  }, [question, options, duration, onCreatePoll]);

  const speakers = peers.filter((p) => p.role === "speaker");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-[10px] text-neutral-400 uppercase tracking-[0.2em] font-medium">{t("adminPanel")}</span>
        <span className="flex-1 h-px bg-[#222]" />
      </div>

      {speakRequests.length > 0 && (
        <div className="border border-neutral-600 p-4 space-y-3">
          <span className="text-[10px] text-neutral-400 uppercase tracking-[0.15em]">
            {t("speakRequests")} ({speakRequests.length})
          </span>
          {speakRequests.map((req) => (
            <div key={req.peerId} className="flex items-center justify-between gap-2">
              <span className="text-xs text-neutral-300 font-mono">{req.peerId.slice(0, 8)}</span>
              <div className="flex gap-1">
                <button onClick={() => onApproveSpeak(req.peerId)} className="px-3 py-1.5 text-[9px] uppercase tracking-wider border border-emerald-700/50 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all">
                  {t("approve")}
                </button>
                <button onClick={() => onDenySpeak(req.peerId)} className="px-3 py-1.5 text-[9px] uppercase tracking-wider border border-[#222] text-neutral-600 hover:border-red-800 hover:text-red-400 transition-all">
                  {t("deny")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {speakers.length > 0 && (
        <div className="border border-[#222] p-4 space-y-3">
          <span className="text-[10px] text-neutral-500 uppercase tracking-[0.15em]">{t("activeSpeakers")}</span>
          {speakers.map((s) => (
            <div key={s.peerId} className="flex items-center justify-between">
              <span className="text-xs text-neutral-400 font-mono">{s.peerId.slice(0, 8)}</span>
              <button onClick={() => onRevokeSpeak(s.peerId)} className="px-3 py-1.5 text-[9px] uppercase tracking-wider border border-[#222] text-neutral-600 hover:border-red-800 hover:text-red-400 transition-all">
                {t("revokeMic")}
              </button>
            </div>
          ))}
        </div>
      )}

      {peers.length > 0 && (
        <div className="border border-[#222] p-4 space-y-3">
          <span className="text-[10px] text-neutral-500 uppercase tracking-[0.15em]">{t("participants")} ({peers.length})</span>
          {peers.map((p) => (
            <div key={p.peerId} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400 font-mono">{p.peerId.slice(0, 8)}</span>
                <span className="text-[9px] text-neutral-700 uppercase">{p.role}</span>
              </div>
              {p.role !== "admin" && (
                <button onClick={() => onKick(p.peerId)} className="px-3 py-1.5 text-[9px] uppercase tracking-wider border border-[#222] text-neutral-700 hover:border-red-700 hover:text-red-400 hover:bg-red-950/30 transition-all">
                  {t("kick")}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {!showPollForm ? (
        <button onClick={() => setShowPollForm(true)} className="w-full py-2.5 border border-[#333] text-[10px] uppercase tracking-[0.15em] text-neutral-500 hover:border-white hover:text-white transition-all">
          {t("createPoll")}
        </button>
      ) : (
        <form onSubmit={handleCreatePoll} className="border border-neutral-600 p-4 space-y-3">
          <span className="text-[10px] text-neutral-400 uppercase tracking-[0.15em]">{t("newPoll")}</span>
          <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder={t("question")}
            className="w-full px-3 py-2 bg-transparent border border-[#222] text-white text-sm placeholder-neutral-700 focus:outline-none focus:border-neutral-500" />
          {options.map((opt, i) => (
            <div key={i} className="flex gap-2">
              <input type="text" value={opt} onChange={(e) => updateOption(i, e.target.value)} placeholder={`${t("option")} ${i + 1}`}
                className="flex-1 px-3 py-2 bg-transparent border border-[#222] text-white text-sm placeholder-neutral-700 focus:outline-none focus:border-neutral-500" />
              {options.length > 2 && <button type="button" onClick={() => removeOption(i)} className="px-2 text-neutral-700 hover:text-red-400">&times;</button>}
            </div>
          ))}
          <div className="flex items-center gap-2">
            <button type="button" onClick={addOption} className="text-[10px] text-neutral-600 hover:text-white">{t("addOption")}</button>
            <span className="flex-1" />
            <input type="number" min={5} max={300} value={duration} onChange={(e) => setDuration(parseInt(e.target.value) || 30)}
              className="w-14 px-2 py-1 bg-transparent border border-[#222] text-white text-xs text-center focus:outline-none" />
            <span className="text-[10px] text-neutral-600">{t("sec")}</span>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="flex-1 py-2 border border-white text-[10px] uppercase tracking-wider hover:bg-white hover:text-black transition-all">{t("start")}</button>
            <button type="button" onClick={() => setShowPollForm(false)} className="px-4 py-2 border border-[#222] text-[10px] text-neutral-600 hover:text-white transition-all">{t("cancel")}</button>
          </div>
        </form>
      )}
    </div>
  );
}
