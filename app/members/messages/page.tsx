"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Loader2,
  Send,
  MessageSquare,
  Plus,
  Search,
  X,
  ChevronLeft,
} from "lucide-react";

interface MemberInfo {
  id: string;
  displayName: string;
  role: string;
}

interface Conversation {
  member: MemberInfo;
  lastMessage: {
    content: string;
    createdAt: string;
    isOwn: boolean;
  } | null;
  unreadCount: number;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  read: boolean;
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMemberId, setCurrentMemberId] = useState<string | null>(null);
  const [input, setInput] = useState("");

  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasOlder, setHasOlder] = useState(true);

  const [showPicker, setShowPicker] = useState(false);
  const [allMembers, setAllMembers] = useState<MemberInfo[]>([]);
  const [memberSearch, setMemberSearch] = useState("");
  const [loadingMembers, setLoadingMembers] = useState(false);

  const [sidebarVisible, setSidebarVisible] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const shouldAutoScroll = useRef(true);
  const msgPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const convoPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const selectedConvo = conversations.find(
    (c) => c.member.id === selectedMemberId
  );

  const fetchConversations = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!opts?.silent) setLoadingConversations(true);
      try {
        const res = await fetch("/api/members/conversations");
        if (!res.ok) return;
        const data = await res.json();
        setConversations(data.conversations);
      } catch {
        /* ignore */
      } finally {
        if (!opts?.silent) setLoadingConversations(false);
      }
    },
    []
  );

  const fetchMessages = useCallback(
    async (memberId: string, opts?: { silent?: boolean }) => {
      if (!opts?.silent) setLoadingMessages(true);
      try {
        const res = await fetch(`/api/members/conversations/${memberId}`);
        if (!res.ok) return;
        const data = await res.json();
        setMessages(data.messages);
        setCurrentMemberId(data.memberId);
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
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (!selectedMemberId) return;
    shouldAutoScroll.current = true;
    fetchMessages(selectedMemberId);
  }, [selectedMemberId, fetchMessages]);

  useEffect(() => {
    if (shouldAutoScroll.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (!selectedMemberId) return;
    msgPollRef.current = setInterval(() => {
      fetchMessages(selectedMemberId, { silent: true });
    }, 3000);
    return () => {
      if (msgPollRef.current) clearInterval(msgPollRef.current);
    };
  }, [selectedMemberId, fetchMessages]);

  useEffect(() => {
    convoPollRef.current = setInterval(() => {
      fetchConversations({ silent: true });
    }, 10000);
    return () => {
      if (convoPollRef.current) clearInterval(convoPollRef.current);
    };
  }, [fetchConversations]);

  function handleScroll() {
    const el = scrollContainerRef.current;
    if (!el) return;
    shouldAutoScroll.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  }

  async function loadOlder() {
    if (!selectedMemberId || !messages.length || loadingOlder) return;
    setLoadingOlder(true);
    try {
      const oldest = messages[0].createdAt;
      const res = await fetch(
        `/api/members/conversations/${selectedMemberId}?before=${oldest}`
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
    if (!content || !selectedMemberId || sending) return;
    setSending(true);
    setInput("");
    shouldAutoScroll.current = true;
    try {
      const res = await fetch(
        `/api/members/conversations/${selectedMemberId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
        fetchConversations({ silent: true });
      }
    } catch {
      /* ignore */
    } finally {
      setSending(false);
    }
  }

  async function openPicker() {
    setShowPicker(true);
    setMemberSearch("");
    setLoadingMembers(true);
    try {
      const res = await fetch("/api/members/members");
      if (!res.ok) return;
      const data = await res.json();
      setAllMembers(data.members);
    } catch {
      /* ignore */
    } finally {
      setLoadingMembers(false);
    }
  }

  function selectMember(memberId: string) {
    setSelectedMemberId(memberId);
    setShowPicker(false);
    setSidebarVisible(false);
  }

  function formatConvoTime(iso: string) {
    const d = new Date(iso);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  function formatMsgTime(iso: string) {
    return new Date(iso).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  function formatDaySeparator(iso: string) {
    const d = new Date(iso);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return "Today";
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  }

  function truncate(s: string, len: number) {
    return s.length > len ? s.slice(0, len) + "\u2026" : s;
  }

  const filteredMembers = allMembers.filter((m) =>
    m.displayName.toLowerCase().includes(memberSearch.toLowerCase())
  );

  const activeMember =
    selectedConvo?.member || allMembers.find((m) => m.id === selectedMemberId);

  if (loadingConversations) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[#888]" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-120px)] -mx-6 -my-8 border border-[#1a1a1a] rounded-none sm:rounded-xl sm:mx-0 sm:my-0 overflow-hidden bg-[#0a0a0a]">
      {/* Mobile back button */}
      {selectedMemberId && !sidebarVisible && (
        <button
          onClick={() => setSidebarVisible(true)}
          className="sm:hidden fixed top-[60px] left-2 z-50 bg-[#1a1a1a] border border-[#252525] rounded-full p-2 text-[#888] hover:text-[#e8e8e8] transition"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`${
          sidebarVisible ? "translate-x-0" : "-translate-x-full"
        } sm:translate-x-0 fixed sm:relative z-40 sm:z-auto w-72 shrink-0 border-r border-[#1a1a1a] bg-[#090909] flex flex-col h-full transition-transform duration-200`}
      >
        <div className="px-4 h-12 flex items-center justify-between border-b border-[#1a1a1a] shrink-0">
          <h2 className="text-sm font-semibold text-[#e8e8e8]">Messages</h2>
          <button
            onClick={openPicker}
            className="text-[#666] hover:text-[#e8e8e8] transition p-1.5 rounded-md hover:bg-[#1a1a1a]"
            title="New message"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {showPicker && (
          <div className="border-b border-[#1a1a1a] bg-[#0c0c0c]">
            <div className="px-3 py-2 flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-[#555] shrink-0" />
              <input
                type="text"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="Search members\u2026"
                className="flex-1 bg-transparent text-sm text-[#e8e8e8] placeholder-[#444] outline-none"
                autoFocus
              />
              <button
                onClick={() => setShowPicker(false)}
                className="text-[#555] hover:text-[#e8e8e8] transition"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {loadingMembers ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-[#555]" />
                </div>
              ) : filteredMembers.length === 0 ? (
                <p className="text-xs text-[#444] text-center py-4">
                  No members found
                </p>
              ) : (
                filteredMembers.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => selectMember(m.id)}
                    className="w-full text-left px-4 py-2.5 hover:bg-[#1a1a1a] transition-colors flex items-center gap-3"
                  >
                    <div className="h-8 w-8 rounded-full bg-[#1a1a1a] flex items-center justify-center text-xs font-medium text-[#888] shrink-0 border border-[#252525]">
                      {m.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <span className="text-sm text-[#e8e8e8] block truncate">
                        {m.displayName}
                      </span>
                      {m.role === "ADMIN" && (
                        <span className="text-[10px] text-amber-400/70">
                          Admin
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 && !showPicker ? (
            <div className="flex flex-col items-center justify-center h-full px-4 text-center">
              <MessageSquare className="h-8 w-8 text-[#252525] mb-3" />
              <p className="text-[#555] text-sm">No conversations yet</p>
              <button
                onClick={openPicker}
                className="text-xs text-[#666] hover:text-[#e8e8e8] mt-2 transition"
              >
                Start one &rarr;
              </button>
            </div>
          ) : (
            conversations.map((convo) => (
              <button
                key={convo.member.id}
                onClick={() => selectMember(convo.member.id)}
                className={`w-full text-left px-4 py-3 transition-colors border-b border-[#111] ${
                  convo.member.id === selectedMemberId
                    ? "bg-[#1a1a1a]"
                    : "hover:bg-[#0f0f0f]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-medium shrink-0 mt-0.5 border ${
                      convo.unreadCount > 0
                        ? "bg-[#1a1a1a] border-blue-500/30 text-blue-400/80"
                        : "bg-[#1a1a1a] border-[#252525] text-[#888]"
                    }`}
                  >
                    {convo.member.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-sm font-medium truncate ${
                          convo.unreadCount > 0
                            ? "text-[#e8e8e8]"
                            : "text-[#ccc]"
                        }`}
                      >
                        {convo.member.displayName}
                      </span>
                      {convo.lastMessage && (
                        <span className="text-[10px] text-[#555] shrink-0">
                          {formatConvoTime(convo.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    {convo.lastMessage && (
                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <p
                          className={`text-xs truncate ${
                            convo.unreadCount > 0
                              ? "text-[#999]"
                              : "text-[#555]"
                          }`}
                        >
                          {convo.lastMessage.isOwn && (
                            <span className="text-[#444]">You: </span>
                          )}
                          {truncate(convo.lastMessage.content, 40)}
                        </p>
                        {convo.unreadCount > 0 && (
                          <span className="shrink-0 bg-blue-500 text-white text-[10px] font-medium rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                            {convo.unreadCount}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarVisible && (
        <div
          className="fixed inset-0 bg-black/50 z-30 sm:hidden"
          onClick={() => setSidebarVisible(false)}
        />
      )}

      {/* Message area */}
      <div className="flex-1 flex flex-col min-w-0">
        {!selectedMemberId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <MessageSquare className="h-12 w-12 text-[#1a1a1a] mb-4" />
            <p className="text-[#555] text-sm">
              {conversations.length === 0
                ? "No conversations yet \u2014 start one"
                : "Select a conversation"}
            </p>
            {conversations.length === 0 && (
              <button
                onClick={openPicker}
                className="mt-3 text-xs bg-[#1a1a1a] hover:bg-[#252525] text-[#e8e8e8] px-4 py-2 rounded-lg transition"
              >
                New message
              </button>
            )}
          </div>
        ) : (
          <>
            {activeMember && (
              <div className="px-4 sm:px-5 h-12 flex items-center gap-3 border-b border-[#1a1a1a] shrink-0 bg-[#090909]/80">
                <div className="h-7 w-7 rounded-full bg-[#1a1a1a] border border-[#252525] flex items-center justify-center text-xs font-medium text-[#888]">
                  {activeMember.displayName.charAt(0).toUpperCase()}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-[#e8e8e8]">
                    {activeMember.displayName}
                  </span>
                  {activeMember.role === "ADMIN" && (
                    <span className="text-[10px] text-amber-400/70 bg-amber-400/10 px-1.5 py-0.5 rounded">
                      Admin
                    </span>
                  )}
                </div>
              </div>
            )}

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
                {hasOlder && messages.length >= 50 && (
                  <div className="text-center mb-4">
                    <button
                      onClick={loadOlder}
                      disabled={loadingOlder}
                      className="text-xs text-[#555] hover:text-[#999] transition disabled:opacity-50"
                    >
                      {loadingOlder && (
                        <Loader2 className="h-3 w-3 animate-spin inline mr-1" />
                      )}
                      Load older messages
                    </button>
                  </div>
                )}

                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <p className="text-[#555] text-sm">No messages yet</p>
                    <p className="text-[#333] text-xs mt-1">Say hello!</p>
                  </div>
                )}

                {messages.map((msg, i) => {
                  const isOwn = msg.senderId === currentMemberId;
                  const prevMsg = messages[i - 1];
                  const prevDate = prevMsg
                    ? new Date(prevMsg.createdAt).toDateString()
                    : null;
                  const curDate = new Date(msg.createdAt).toDateString();
                  const showDay = i === 0 || prevDate !== curDate;
                  const sameSender =
                    prevMsg?.senderId === msg.senderId && !showDay;
                  const timeDiff = prevMsg
                    ? new Date(msg.createdAt).getTime() -
                      new Date(prevMsg.createdAt).getTime()
                    : Infinity;
                  const gapBreak = timeDiff > 5 * 60 * 1000;
                  const grouped = sameSender && !gapBreak;

                  return (
                    <div key={msg.id}>
                      {showDay && (
                        <div className="flex items-center justify-center my-5 first:mt-0">
                          <span className="text-[10px] text-[#555] bg-[#111] px-3 py-1 rounded-full">
                            {formatDaySeparator(msg.createdAt)}
                          </span>
                        </div>
                      )}

                      <div
                        className={`flex ${isOwn ? "justify-end" : "justify-start"} ${
                          grouped ? "mt-0.5" : "mt-3 first:mt-0"
                        }`}
                      >
                        <div
                          className={`max-w-[75%] sm:max-w-[65%] px-3.5 py-2 ${
                            isOwn
                              ? grouped
                                ? "rounded-2xl rounded-br-md bg-[#0a1628]"
                                : "rounded-2xl bg-[#0a1628]"
                              : grouped
                                ? "rounded-2xl rounded-bl-md bg-[#1a1a1a]"
                                : "rounded-2xl bg-[#1a1a1a]"
                          }`}
                        >
                          <p className="text-[13px] text-[#e8e8e8] whitespace-pre-wrap break-words leading-relaxed">
                            {msg.content}
                          </p>
                          <p
                            className={`text-[10px] mt-0.5 text-right leading-none ${
                              isOwn ? "text-[#4a6a9a]" : "text-[#555]"
                            }`}
                          >
                            {formatMsgTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}

            <form
              onSubmit={sendMessage}
              className="px-4 sm:px-5 py-3 border-t border-[#1a1a1a] bg-[#090909]/80 shrink-0"
            >
              <div className="flex items-center gap-2 bg-[#111] border border-[#1a1a1a] rounded-xl px-4 py-1 focus-within:border-[#333] transition-colors">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value.slice(0, 2000))}
                  placeholder="Type a message\u2026"
                  className="flex-1 bg-transparent text-sm text-[#e8e8e8] placeholder-[#444] outline-none py-2"
                  maxLength={2000}
                  disabled={sending}
                  autoComplete="off"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || sending}
                  className="text-[#555] hover:text-blue-400 disabled:text-[#333] disabled:hover:text-[#333] transition p-1.5 rounded-lg"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
