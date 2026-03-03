"use client";

import { useState, useEffect } from "react";
import { useCallsLang } from "@/lib/calls/LangContext";

export interface PollData {
  pollId: string;
  question: string;
  options: string[];
  results: number[];
  totalVotes: number;
  endsAt: number;
  ended: boolean;
  voted: boolean;
}

interface PollCardProps {
  poll: PollData;
  onVote: (pollId: string, optionIndex: number) => void;
}

export function PollCard({ poll, onVote }: PollCardProps) {
  const { t } = useCallsLang();
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (poll.ended) return;
    const tick = () => setTimeLeft(Math.max(0, Math.ceil((poll.endsAt - Date.now()) / 1000)));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [poll.endsAt, poll.ended]);

  const maxVotes = Math.max(...poll.results, 1);
  const winnerIdx = poll.ended ? poll.results.indexOf(Math.max(...poll.results)) : -1;
  const showResults = poll.voted || poll.ended;

  return (
    <div className={`border p-5 calls-animate-fade-in ${poll.ended ? "border-[#222]" : "border-neutral-600"}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-white" />
          <span className="text-[10px] text-neutral-400 uppercase tracking-[0.2em] font-medium">
            {poll.ended ? t("pollEnded") : t("poll")}
          </span>
        </div>
        {!poll.ended && (
          <span className="text-xs font-mono text-neutral-500">{timeLeft}s</span>
        )}
      </div>

      <p className="text-sm font-medium text-white mb-4 leading-relaxed">{poll.question}</p>

      <div className="space-y-2">
        {poll.options.map((option, i) => {
          const pct = poll.totalVotes > 0 ? Math.round((poll.results[i] / poll.totalVotes) * 100) : 0;
          const canVote = !poll.voted && !poll.ended;
          const isWinner = poll.ended && i === winnerIdx && poll.results[i] > 0;
          const isLoser = poll.ended && i !== winnerIdx;

          let barColor = "bg-white/[0.06]";
          let borderClass = "border-[#222]";
          let textClass = "text-neutral-300";

          if (isWinner) {
            barColor = "bg-emerald-500/20";
            borderClass = "border-emerald-600/50";
            textClass = "text-emerald-300";
          } else if (isLoser && poll.ended) {
            barColor = "bg-red-500/10";
            borderClass = "border-[#222]";
            textClass = "text-neutral-500";
          }

          return (
            <button
              key={i}
              onClick={() => canVote && onVote(poll.pollId, i)}
              disabled={!canVote}
              className={`w-full text-left px-4 py-3 border text-sm transition-all relative overflow-hidden ${borderClass} ${
                canVote ? "hover:border-white cursor-pointer" : "cursor-default"
              }`}
            >
              {showResults && (
                <div
                  className={`absolute inset-y-0 left-0 ${barColor} transition-all duration-700`}
                  style={{ width: `${poll.totalVotes > 0 ? (poll.results[i] / maxVotes) * 100 : 0}%` }}
                />
              )}
              <span className="relative flex justify-between items-center">
                <span className={`${textClass} transition-colors`}>
                  {isWinner && <span className="mr-2">&#10003;</span>}
                  {option}
                </span>
                {showResults && (
                  <span className={`font-mono text-xs ${isWinner ? "text-emerald-400 font-bold" : "text-neutral-600"}`}>
                    {pct}%
                    <span className="text-[10px] ml-1 text-neutral-700">({poll.results[i]})</span>
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {poll.ended && (
        <div className="mt-3 pt-3 border-t border-[#222] flex justify-between">
          <span className="text-[10px] text-neutral-600">{t("totalVotes")}: {poll.totalVotes}</span>
          {winnerIdx >= 0 && poll.results[winnerIdx] > 0 && (
            <span className="text-[10px] text-emerald-500 font-medium uppercase tracking-wider">
              {t("result")}: {poll.options[winnerIdx]}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
