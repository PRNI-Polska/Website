"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Loader2,
  Send,
  MessageSquare,
  Plus,
  Search,
  X,
  ArrowLeft,
} from "lucide-react";
import { useMemberLang } from "@/lib/members/LangContext";

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
  const { t } = useMemberLang();

  const ROLE_LABELS: Record<string, string> = {
    ADMIN: t("role.ADMIN"),
    LEADERSHIP: t("role.LEADERSHIP"),
    MAIN_WING: t("role.MAIN_WING"),
    INTERNATIONAL: t("role.INTERNATIONAL"),

    MEMBER: t("role.MEMBER"),
  };

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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const shouldAutoScroll = useRef(true);
  const prevMsgCount = useRef(0);
  const msgPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const convoPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const selectedConvo = conversations.find((c) => c.member.id === selectedMemberId);

  const fetchConversations = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoadingConversations(true);
    try {
      const res = await fetch("/api/members/conversations");
      if (!res.ok) return;
      const data = await res.json();
      setConversations(data.conversations);
    } catch { /* ignore */ }
    finally { if (!opts?.silent) setLoadingConversations(false); }
  }, []);

  const fetchMessages = useCallback(async (memberId: string, opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoadingMessages(true);
    try {
      const res = await fetch(`/api/members/conversations/${memberId}`);
      if (!res.ok) return;
      const data = await res.json();
      setMessages(data.messages);
      setCurrentMemberId(data.memberId);
      setHasOlder(data.messages.length >= 50);
    } catch { /* ignore */ }
    finally { if (!opts?.silent) setLoadingMessages(false); }
  }, []);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  useEffect(() => {
    if (!selectedMemberId) return;
    shouldAutoScroll.current = true;
    prevMsgCount.current = 0;
    fetchMessages(selectedMemberId);
  }, [selectedMemberId, fetchMessages]);

  useEffect(() => {
    if (messages.length > prevMsgCount.current && shouldAutoScroll.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevMsgCount.current = messages.length;
  }, [messages]);

  useEffect(() => {
    if (!selectedMemberId) return;
    msgPollRef.current = setInterval(() => {
      fetchMessages(selectedMemberId, { silent: true });
    }, 3000);
    return () => { if (msgPollRef.current) clearInterval(msgPollRef.current); };
  }, [selectedMemberId, fetchMessages]);

  useEffect(() => {
    convoPollRef.current = setInterval(() => {
      fetchConversations({ silent: true });
    }, 10000);
    return () => { if (convoPollRef.current) clearInterval(convoPollRef.current); };
  }, [fetchConversations]);

  function handleScroll() {
    const el = scrollContainerRef.current;
    if (!el) return;
    shouldAutoScroll.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  }

  async function loadOlder() {
    if (!selectedMemberId || !messages.length || loadingOlder) return;
    setLoadingOlder(true);
    try {
      const oldest = messages[0].createdAt;
      const res = await fetch(`/api/members/conversations/${selectedMemberId}?before=${oldest}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.messages.length < 50) setHasOlder(false);
      if (data.messages.length > 0) setMessages((prev) => [...data.messages, ...prev]);
    } catch { /* ignore */ }
    finally { setLoadingOlder(false); }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const content = input.trim();
    if (!content || !selectedMemberId || sending) return;
    setSending(true);
    setInput("");
    shouldAutoScroll.current = true;
    try {
      const res = await fetch(`/api/members/conversations/${selectedMemberId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
        fetchConversations({ silent: true });
      }
    } catch { /* ignore */ }
    finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 50);
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
    } catch { /* ignore */ }
    finally { setLoadingMembers(false); }
  }

  function selectMember(memberId: string) {
    setSelectedMemberId(memberId);
    setShowPicker(false);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function goBack() {
    setSelectedMemberId(null);
  }

  function formatConvoTime(iso: string) {
    const d = new Date(iso);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return t("messages.yesterday");
    return d.toLocaleDateString("pl-PL", { day: "numeric", month: "short" });
  }

  function formatMsgTime(iso: string) {
    return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  function formatDaySeparator(iso: string) {
    const d = new Date(iso);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return t("messages.today");
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return t("messages.yesterday");
    return d.toLocaleDateString("pl-PL", { weekday: "long", day: "numeric", month: "long" });
  }

  function truncate(s: string, len: number) {
    return s.length > len ? s.slice(0, len) + "\u2026" : s;
  }

  const filteredMembers = allMembers.filter((m) =>
    m.displayName.toLowerCase().includes(memberSearch.toLowerCase())
  );

  const activeMember = selectedConvo?.member || allMembers.find((m) => m.id === selectedMemberId);
  const showConversationOnMobile = !!selectedMemberId;

  if (loadingConversations) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-[#555]" />
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden bg-[#060606]">
      {/* Sidebar */}
      <div className={`${showConversationOnMobile ? "hidden sm:flex" : "flex"} sm:w-80 w-full shrink-0 border-r border-[#151515] bg-[#080808] flex-col h-full`}>
        <div className="px-5 h-14 flex items-center justify-between border-b border-[#151515] shrink-0">
          <h2 className="text-base font-semibold text-[#e8e8e8]">{t("messages.title")}</h2>
          <button onClick={openPicker} className="text-[#888] hover:text-white transition p-2.5 rounded-xl hover:bg-[#1a1a1a] active:bg-[#222]">
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {/* Member picker */}
        {showPicker && (
          <div className="border-b border-[#151515] bg-[#0a0a0a]">
            <div className="px-4 py-3 flex items-center gap-3">
              <Search className="h-4 w-4 text-[#444] shrink-0" />
              <input
                type="text"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder={t("messages.search")}
                className="flex-1 bg-transparent text-sm text-[#e8e8e8] placeholder-[#444] outline-none"
                autoFocus
              />
              <button onClick={() => setShowPicker(false)} className="text-[#444] hover:text-[#e8e8e8] transition p-1">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-72 overflow-y-auto pb-2">
              {loadingMembers ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-[#444]" />
                </div>
              ) : filteredMembers.length === 0 ? (
                <p className="text-sm text-[#444] text-center py-8">{t("messages.notFound")}</p>
              ) : (
                filteredMembers.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => selectMember(m.id)}
                    className="w-full text-left px-5 py-3 hover:bg-[#151515] active:bg-[#1a1a1a] transition-colors flex items-center gap-3"
                  >
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#1a1a1a] to-[#252525] flex items-center justify-center text-sm font-semibold text-[#888] shrink-0">
                      {m.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-sm text-[#e8e8e8] block truncate font-medium">{m.displayName}</span>
                      <span className="text-[10px] text-[#555]">{ROLE_LABELS[m.role] || m.role}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 && !showPicker ? (
            <div className="flex flex-col items-center justify-center h-full px-6 text-center">
              <div className="w-16 h-16 rounded-full bg-[#111] flex items-center justify-center mb-4">
                <MessageSquare className="h-7 w-7 text-[#333]" />
              </div>
              <p className="text-[#555] text-sm font-medium">{t("messages.noConversations")}</p>
              <p className="text-[#333] text-xs mt-1">{t("messages.startNew")}</p>
              <button onClick={openPicker} className="mt-4 text-sm text-[#888] hover:text-white bg-[#151515] hover:bg-[#1a1a1a] px-5 py-2.5 rounded-xl transition active:bg-[#222]">
                {t("messages.newMessage")}
              </button>
            </div>
          ) : (
            conversations.map((convo) => (
              <button
                key={convo.member.id}
                onClick={() => selectMember(convo.member.id)}
                className={`w-full text-left px-5 py-3.5 transition-colors active:bg-[#1a1a1a] ${
                  convo.member.id === selectedMemberId ? "bg-[#141414]" : "hover:bg-[#0d0d0d]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`h-11 w-11 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
                    convo.unreadCount > 0 ? "bg-gradient-to-br from-blue-900/40 to-blue-800/20 text-blue-400 ring-1 ring-blue-500/20" : "bg-gradient-to-br from-[#1a1a1a] to-[#222] text-[#777]"
                  }`}>
                    {convo.member.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-sm truncate ${convo.unreadCount > 0 ? "font-semibold text-[#e8e8e8]" : "font-medium text-[#bbb]"}`}>
                        {convo.member.displayName}
                      </span>
                      {convo.lastMessage && (
                        <span className="text-[10px] text-[#444] shrink-0">{formatConvoTime(convo.lastMessage.createdAt)}</span>
                      )}
                    </div>
                    {convo.lastMessage && (
                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <p className={`text-xs truncate ${convo.unreadCount > 0 ? "text-[#999]" : "text-[#555]"}`}>
                          {convo.lastMessage.isOwn && <span className="text-[#444]">{t("messages.you")}: </span>}
                          {truncate(convo.lastMessage.content, 35)}
                        </p>
                        {convo.unreadCount > 0 && (
                          <span className="shrink-0 bg-blue-500 text-white text-[10px] font-bold rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-1.5">
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

      {/* Message area */}
      <div className={`${showConversationOnMobile ? "flex" : "hidden sm:flex"} flex-1 flex-col min-w-0 bg-[#0a0a0a]`}>
        {!selectedMemberId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <div className="w-20 h-20 rounded-full bg-[#111] flex items-center justify-center mb-4">
              <MessageSquare className="h-8 w-8 text-[#222]" />
            </div>
            <p className="text-[#444] text-sm">{t("messages.selectConversation")}</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-4 h-14 flex items-center gap-3 border-b border-[#151515] shrink-0 bg-[#080808]">
              <button onClick={goBack} className="sm:hidden text-[#888] hover:text-white transition p-1.5 -ml-1 rounded-lg active:bg-[#1a1a1a]">
                <ArrowLeft className="h-5 w-5" />
              </button>
              {activeMember && (
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#1a1a1a] to-[#222] flex items-center justify-center text-xs font-semibold text-[#888]">
                    {activeMember.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-semibold text-sm text-[#e8e8e8]">{activeMember.displayName}</span>
                    <span className="text-[10px] text-[#555] ml-2">{ROLE_LABELS[activeMember.role] || activeMember.role}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Messages */}
            {loadingMessages ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-[#444]" />
              </div>
            ) : (
              <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
                {hasOlder && messages.length >= 50 && (
                  <div className="text-center mb-4">
                    <button onClick={loadOlder} disabled={loadingOlder} className="text-xs text-[#444] hover:text-[#888] transition disabled:opacity-50">
                      {loadingOlder && <Loader2 className="h-3 w-3 animate-spin inline mr-1" />}
                      {t("messages.loadOlder")}
                    </button>
                  </div>
                )}

                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <p className="text-[#444] text-sm">{t("messages.noMessages")}</p>
                    <p className="text-[#2a2a2a] text-xs mt-1">{t("messages.sayHello")}</p>
                  </div>
                )}

                {messages.map((msg, i) => {
                  const isOwn = msg.senderId === currentMemberId;
                  const prevMsg = messages[i - 1];
                  const prevDate = prevMsg ? new Date(prevMsg.createdAt).toDateString() : null;
                  const curDate = new Date(msg.createdAt).toDateString();
                  const showDay = i === 0 || prevDate !== curDate;
                  const sameSender = prevMsg?.senderId === msg.senderId && !showDay;
                  const timeDiff = prevMsg ? new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime() : Infinity;
                  const grouped = sameSender && timeDiff < 5 * 60 * 1000;

                  return (
                    <div key={msg.id}>
                      {showDay && (
                        <div className="flex items-center justify-center my-6 first:mt-0">
                          <span className="text-[10px] text-[#444] bg-[#0e0e0e] border border-[#1a1a1a] px-3 py-1 rounded-full">{formatDaySeparator(msg.createdAt)}</span>
                        </div>
                      )}
                      <div className={`flex ${isOwn ? "justify-end" : "justify-start"} ${grouped ? "mt-[3px]" : "mt-3 first:mt-0"}`}>
                        <div className={`max-w-[80%] sm:max-w-[60%] px-4 py-2.5 ${
                          isOwn
                            ? grouped ? "rounded-2xl rounded-br-lg bg-blue-600/20 border border-blue-500/10" : "rounded-2xl bg-blue-600/20 border border-blue-500/10"
                            : grouped ? "rounded-2xl rounded-bl-lg bg-[#151515] border border-[#1a1a1a]" : "rounded-2xl bg-[#151515] border border-[#1a1a1a]"
                        }`}>
                          <p className="text-[13.5px] text-[#e4e4e4] whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>
                          <div className={`flex items-center gap-1.5 mt-1 justify-end leading-none ${isOwn ? "text-blue-400/40" : "text-[#3a3a3a]"}`}>
                            <span className="text-[10px]">{formatMsgTime(msg.createdAt)}</span>
                            {isOwn && (
                              <span className={`text-[10px] font-medium ${msg.read ? "text-blue-400/50" : "text-[#333]"}`} title={msg.read ? t("messages.seen") : t("messages.delivered")}>
                                {msg.read ? "✓✓" : "✓"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Input */}
            <form onSubmit={sendMessage} className="px-3 sm:px-5 py-2.5 border-t border-[#151515] bg-[#080808] shrink-0">
              <div className="flex items-center gap-2 bg-[#111] border border-[#1a1a1a] rounded-2xl px-4 py-0.5 focus-within:border-[#333] focus-within:bg-[#131313] transition-all">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value.slice(0, 2000))}
                  onFocus={() => { setTimeout(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, 300); }}
                  placeholder={t("messages.writeMessage")}
                  className="flex-1 bg-transparent text-[14px] text-[#e8e8e8] placeholder-[#3a3a3a] outline-none py-2.5"
                  maxLength={2000}
                  disabled={sending}
                  autoComplete="off"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!input.trim() || sending}
                  tabIndex={-1}
                  onMouseDown={(e) => e.preventDefault()}
                  className="text-[#333] hover:text-blue-400 disabled:text-[#222] transition p-2 rounded-xl active:bg-[#1a1a1a]"
                >
                  {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
