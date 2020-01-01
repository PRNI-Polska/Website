"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Loader2, Send, Hash, MessageSquare } from "lucide-react";
import { useMemberLang } from "@/lib/members/LangContext";

interface Channel {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  messageCount: number;
  lastMessage: {
    content: string;
    senderName: string;
    createdAt: string;
  } | null;
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    displayName: string;
    role: string;
  };
}

export default function ChannelsPage() {
  const { t } = useMemberLang();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [memberId, setMemberId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loadingChannels, setLoadingChannels] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasOlder, setHasOlder] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const shouldAutoScroll = useRef(true);
  const prevMsgCount = useRef(0);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const didAutoSelect = useRef(false);

  const selectedChannel = channels.find((c) => c.id === selectedId);

  const fetchChannels = useCallback(async () => {
    try {
      const res = await fetch("/api/members/channels");
      if (!res.ok) return;
      const data = await res.json();
      setChannels(data.channels);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    async function init() {
      await fetchChannels();
      setLoadingChannels(false);
    }
    init();
  }, [fetchChannels]);

  // Auto-select default channel only on initial load
  useEffect(() => {
    if (!didAutoSelect.current && channels.length > 0) {
      const def = channels.find((c) => c.isDefault);
      setSelectedId(def ? def.id : channels[0].id);
      didAutoSelect.current = true;
    }
  }, [channels]);

  const fetchMessages = useCallback(
    async (channelId: string, opts?: { silent?: boolean }) => {
      if (!opts?.silent) setLoadingMessages(true);
      try {
        const res = await fetch(
          `/api/members/channels/${channelId}/messages`
        );
        if (!res.ok) return;
        const data = await res.json();
        setMessages(data.messages);
        setMemberId(data.memberId);
        setHasOlder(data.messages.length >= 50);
      } catch {
        /* ignore */
      } finally {
        if (!opts?.silent) setLoadingMessages(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!selectedId) return;
    shouldAutoScroll.current = true;
    fetchMessages(selectedId);
  }, [selectedId, fetchMessages]);

  useEffect(() => {
    if (messages.length > prevMsgCount.current && shouldAutoScroll.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevMsgCount.current = messages.length;
  }, [messages]);

  // Poll for new messages every 3 seconds
  useEffect(() => {
    if (!selectedId) return;

    pollingRef.current = setInterval(() => {
      fetchMessages(selectedId, { silent: true });
      fetchChannels();
    }, 3000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [selectedId, fetchMessages, fetchChannels]);

  // Track scroll position to decide auto-scroll
  function handleScroll() {
    const el = scrollContainerRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    shouldAutoScroll.current = atBottom;
  }

  async function loadOlder() {
    if (!selectedId || !messages.length || loadingOlder) return;
    setLoadingOlder(true);
    try {
      const oldest = messages[0].createdAt;
      const res = await fetch(
        `/api/members/channels/${selectedId}/messages?before=${oldest}`
      );
      if (!res.ok) return;
      const data = await res.json();
      if (data.messages.length < 50) setHasOlder(false);
      if (data.messages.length > 0) {
        setMessages((prev) => [...data.messages, ...prev]);
      }
    } catch {
      /* ignore */
    } finally {
      setLoadingOlder(false);
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const content = input.trim();
    if (!content || !selectedId || sending) return;
    setSending(true);
    setInput("");
    shouldAutoScroll.current = true;
    try {
      const res = await fetch(
        `/api/members/channels/${selectedId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
      }
    } catch {
      /* ignore */
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  function formatTime(iso: string) {
    const d = new Date(iso);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = d.toDateString() === yesterday.toDateString();

    const time = d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    if (isToday) return time;
    if (isYesterday) return `Yesterday ${time}`;
    return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })} ${time}`;
  }

  function truncate(s: string, len: number) {
    return s.length > len ? s.slice(0, len) + "…" : s;
  }

  if (loadingChannels) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[#888]" />
      </div>
    );
  }

  if (channels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <MessageSquare className="h-10 w-10 text-[#333] mb-4" />
        <p className="text-[#666] text-sm">{t("channels.noChannels")}</p>
        <p className="text-[#444] text-xs mt-1">
          {t("channels.noChannelsHint")}
        </p>
      </div>
    );
  }

  const showChannelOnMobile = !!selectedId;

  return (
    <div className="flex h-full overflow-hidden bg-[#0a0a0a]">
      {/* Channel Sidebar — full width on mobile when no channel selected */}
      <div className={`${showChannelOnMobile ? "hidden sm:flex" : "flex"} sm:w-64 w-full shrink-0 border-r border-[#1a1a1a] bg-[#090909] flex-col h-full`}>
        <div className="px-4 h-12 flex items-center border-b border-[#1a1a1a] shrink-0">
          <h2 className="text-xs font-semibold text-[#888] uppercase tracking-wider">
            {t("channels.title")}
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto py-1.5">
          {channels.map((ch) => (
            <button
              key={ch.id}
              onClick={() => {
                setSelectedId(ch.id);
              }}
              className={`w-full text-left px-3 py-3 mx-1.5 rounded-lg transition-colors active:bg-[#252525] ${
                ch.id === selectedId
                  ? "bg-[#1a1a1a] text-[#e8e8e8]"
                  : "text-[#999] hover:bg-[#111] hover:text-[#ccc]"
              }`}
              style={{ width: "calc(100% - 12px)" }}
            >
              <div className="flex items-center gap-2">
                <Hash className="h-3.5 w-3.5 shrink-0 text-[#555]" />
                <span className="text-sm font-medium truncate">
                  {ch.name}
                </span>
              </div>
              {ch.lastMessage && (
                <p className="text-xs text-[#555] mt-1 truncate pl-5.5">
                  <span className="text-[#666]">
                    {ch.lastMessage.senderName}:
                  </span>{" "}
                  {truncate(ch.lastMessage.content, 30)}
                </p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Message Area — full screen on mobile when channel selected */}
      <div className={`${showChannelOnMobile ? "flex" : "hidden sm:flex"} flex-1 flex-col min-w-0`}>
        {/* Channel Header with back button on mobile */}
        {selectedChannel && (
          <div className="px-4 h-12 flex items-center gap-2 border-b border-[#1a1a1a] shrink-0 bg-[#090909]/80">
            <button onClick={() => setSelectedId(null)} className="sm:hidden text-[#888] hover:text-[#e8e8e8] transition p-1 -ml-1">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
            </button>
            <Hash className="h-4 w-4 text-[#555]" />
            <span className="font-semibold text-sm text-[#e8e8e8]">
              {selectedChannel.name}
            </span>
            {selectedChannel.description && (
              <>
                <span className="text-[#333] mx-1">|</span>
                <span className="text-xs text-[#555] truncate">
                  {selectedChannel.description}
                </span>
              </>
            )}
          </div>
        )}

        {/* Messages */}
        {loadingMessages ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-[#555]" />
          </div>
        ) : (
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-4 sm:px-5 py-4"
          >
            {/* Load older */}
            {hasOlder && messages.length >= 50 && (
              <div className="text-center mb-4">
                <button
                  onClick={loadOlder}
                  disabled={loadingOlder}
                  className="text-xs text-[#555] hover:text-[#999] transition disabled:opacity-50"
                >
                  {loadingOlder ? (
                    <Loader2 className="h-3 w-3 animate-spin inline mr-1" />
                  ) : null}
                  {t("channels.loadOlder")}
                </button>
              </div>
            )}

            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageSquare className="h-8 w-8 text-[#252525] mb-3" />
                <p className="text-[#555] text-sm">{t("channels.noMessages")}</p>
                <p className="text-[#333] text-xs mt-1">
                  {t("channels.firstMessage")}
                </p>
              </div>
            )}

            {messages.map((msg, i) => {
              const isOwn = msg.sender.id === memberId;
              const isAdmin = msg.sender.role === "ADMIN";
              const showAvatar =
                i === 0 || messages[i - 1].sender.id !== msg.sender.id;
              const timeDiff =
                i > 0
                  ? new Date(msg.createdAt).getTime() -
                    new Date(messages[i - 1].createdAt).getTime()
                  : Infinity;
              const showHeader = showAvatar || timeDiff > 5 * 60 * 1000;

              return (
                <div
                  key={msg.id}
                  className={`group ${showHeader ? "mt-4 first:mt-0" : "mt-0.5"}`}
                >
                  {showHeader && (
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span
                        className={`text-sm font-semibold ${
                          isAdmin
                            ? "text-amber-400/90"
                            : isOwn
                              ? "text-blue-400/80"
                              : "text-[#ccc]"
                        }`}
                      >
                        {msg.sender.displayName}
                      </span>
                      <span className="text-[10px] text-[#444]">
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>
                  )}
                  <div
                    className={`py-0.5 px-2 -mx-2 rounded ${
                      isOwn
                        ? "bg-[#0d1117]/50 hover:bg-[#0d1117]"
                        : "hover:bg-[#111]"
                    } transition-colors`}
                  >
                    <p className="text-sm text-[#d4d4d4] whitespace-pre-wrap break-words leading-relaxed">
                      {msg.content}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input */}
        {selectedId && (
          <form
            onSubmit={sendMessage}
            className="px-3 sm:px-4 py-2 sm:py-3 border-t border-[#1a1a1a] bg-[#090909]/80 shrink-0"
          >
            <div className="flex items-center gap-2 bg-[#111] border border-[#1a1a1a] rounded-xl px-3 py-1 focus-within:border-[#333] transition-colors">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, 2000))}
                placeholder={
                  selectedChannel
                    ? `${t("channels.writeIn")} #${selectedChannel.name}`
                    : t("channels.writeMessage")
                }
                onFocus={() => { setTimeout(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, 300); }}
                className="flex-1 bg-transparent text-sm text-[#e8e8e8] placeholder-[#444] outline-none py-2"
                maxLength={2000}
                disabled={sending}
                autoFocus
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={!input.trim() || sending}
                tabIndex={-1}
                onMouseDown={(e) => e.preventDefault()}
                className="text-[#555] hover:text-[#e8e8e8] disabled:text-[#333] disabled:hover:text-[#333] transition p-1"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
