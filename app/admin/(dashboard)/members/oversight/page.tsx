"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Eye,
  MessageCircle,
  Hash,
  Users,
  ChevronLeft,
  ChevronRight,
  Search,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MemberInfo {
  id: string;
  displayName: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
}

interface DMMessage {
  id: string;
  content: string;
  createdAt: string;
  sender: { id: string; displayName: string; role: string };
  receiver: { id: string; displayName: string; role: string };
}

interface ChannelMsg {
  id: string;
  content: string;
  createdAt: string;
  sender: { id: string; displayName: string; role: string };
  channel: { id: string; name: string };
}

interface Stats {
  totalDMs: number;
  totalChannelMsgs: number;
  totalMembers: number;
}

interface ChannelInfo {
  id: string;
  name: string;
  messageCount: number;
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (isToday) return time;
  if (isYesterday) return `Yesterday ${time}`;
  return `${d.toLocaleDateString("pl-PL", { day: "numeric", month: "short" })} ${time}`;
}

export default function OversightPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [channels, setChannels] = useState<ChannelInfo[]>([]);
  const [members, setMembers] = useState<MemberInfo[]>([]);
  const [dms, setDMs] = useState<DMMessage[]>([]);
  const [channelMsgs, setChannelMsgs] = useState<ChannelMsg[]>([]);
  const [loading, setLoading] = useState(true);
  const [dmPage, setDmPage] = useState(1);
  const [dmPages, setDmPages] = useState(1);
  const [chPage, setChPage] = useState(1);
  const [chPages, setChPages] = useState(1);
  const [filterMember, setFilterMember] = useState<string | null>(null);
  const [filterChannel, setFilterChannel] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchStats = useCallback(async () => {
    const res = await fetch("/api/admin/members/oversight?type=stats");
    if (res.ok) {
      const data = await res.json();
      setStats(data.stats);
      setChannels(data.channels);
    }
  }, []);

  const fetchMembers = useCallback(async () => {
    const res = await fetch("/api/admin/members/oversight?type=members");
    if (res.ok) {
      const data = await res.json();
      setMembers(data.members);
    }
  }, []);

  const fetchDMs = useCallback(async (page: number, memberId?: string | null) => {
    const params = new URLSearchParams({ type: "dms", page: String(page) });
    if (memberId) params.set("member", memberId);
    const res = await fetch(`/api/admin/members/oversight?${params}`);
    if (res.ok) {
      const data = await res.json();
      setDMs(data.messages);
      setDmPages(data.pages);
    }
  }, []);

  const fetchChannelMsgs = useCallback(async (page: number, channelId?: string | null, memberId?: string | null) => {
    const params = new URLSearchParams({ type: "channels", page: String(page) });
    if (channelId) params.set("channel", channelId);
    if (memberId) params.set("member", memberId);
    const res = await fetch(`/api/admin/members/oversight?${params}`);
    if (res.ok) {
      const data = await res.json();
      setChannelMsgs(data.messages);
      setChPages(data.pages);
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchStats(), fetchMembers()]).then(() => setLoading(false));
  }, [fetchStats, fetchMembers]);

  useEffect(() => {
    fetchDMs(dmPage, filterMember);
  }, [dmPage, filterMember, fetchDMs]);

  useEffect(() => {
    fetchChannelMsgs(chPage, filterChannel, filterMember);
  }, [chPage, filterChannel, filterMember, fetchChannelMsgs]);

  const filteredMembers = searchTerm
    ? members.filter((m) => m.displayName.toLowerCase().includes(searchTerm.toLowerCase()) || m.email.toLowerCase().includes(searchTerm.toLowerCase()))
    : members;

  const selectedMember = filterMember ? members.find((m) => m.id === filterMember) : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/members">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" /> Members
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
              <Eye className="h-6 w-6" /> Oversight
            </h1>
            <p className="text-sm text-muted-foreground">Monitor member communications for security compliance.</p>
          </div>
        </div>
        {selectedMember && (
          <Button variant="outline" size="sm" onClick={() => { setFilterMember(null); setDmPage(1); setChPage(1); }}>
            Clear filter: {selectedMember.displayName} &times;
          </Button>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted"><Users className="h-5 w-5" /></div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalMembers}</p>
                  <p className="text-xs text-muted-foreground">Active members</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted"><MessageCircle className="h-5 w-5" /></div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalDMs}</p>
                  <p className="text-xs text-muted-foreground">Direct messages</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted"><Hash className="h-5 w-5" /></div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalChannelMsgs}</p>
                  <p className="text-xs text-muted-foreground">Channel messages</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-[240px_1fr] gap-6">
        {/* Member filter sidebar */}
        <Card className="h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Filter by Member</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 h-9 text-sm" />
            </div>
            <div className="max-h-[400px] overflow-y-auto space-y-0.5">
              <button
                onClick={() => { setFilterMember(null); setDmPage(1); setChPage(1); }}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${!filterMember ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
              >
                All members
              </button>
              {filteredMembers.map((m) => (
                <button
                  key={m.id}
                  onClick={() => { setFilterMember(m.id); setDmPage(1); setChPage(1); }}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors flex items-center justify-between ${filterMember === m.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
                >
                  <span className="truncate">{m.displayName}</span>
                  {!m.isActive && <Badge variant="destructive" className="text-[9px] px-1.5 py-0">inactive</Badge>}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Messages area */}
        <Tabs defaultValue="dms">
          <TabsList>
            <TabsTrigger value="dms" className="gap-1.5">
              <MessageCircle className="h-4 w-4" /> Direct Messages
            </TabsTrigger>
            <TabsTrigger value="channels" className="gap-1.5">
              <Hash className="h-4 w-4" /> Channel Messages
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dms" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {selectedMember ? `${selectedMember.displayName}'s Direct Messages` : "All Direct Messages"}
                </CardTitle>
                <CardDescription>
                  {dms.length > 0 ? `Page ${dmPage} of ${dmPages}` : "No messages found"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dms.length > 0 ? (
                  <div className="space-y-1">
                    {dms.map((msg) => (
                      <div key={msg.id} className="flex items-start gap-3 py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0">
                        <div className="shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                          {msg.sender.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <button onClick={() => { setFilterMember(msg.sender.id); setDmPage(1); }} className="font-semibold text-sm hover:underline">
                              {msg.sender.displayName}
                            </button>
                            <span className="text-muted-foreground text-xs">→</span>
                            <button onClick={() => { setFilterMember(msg.receiver.id); setDmPage(1); }} className="font-semibold text-sm hover:underline">
                              {msg.receiver.displayName}
                            </button>
                            {msg.sender.role === "ADMIN" && <Badge variant="outline" className="text-[9px] px-1.5 py-0">admin</Badge>}
                            <span className="text-xs text-muted-foreground ml-auto shrink-0">{formatTime(msg.createdAt)}</span>
                          </div>
                          <p className="text-sm text-foreground/90 break-words">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No direct messages found.</p>
                )}

                {dmPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t">
                    <Button variant="ghost" size="sm" disabled={dmPage <= 1} onClick={() => setDmPage((p) => p - 1)}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">{dmPage} / {dmPages}</span>
                    <Button variant="ghost" size="sm" disabled={dmPage >= dmPages} onClick={() => setDmPage((p) => p + 1)}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="channels" className="mt-4 space-y-4">
            {/* Channel filter */}
            <div className="flex gap-2 flex-wrap">
              <Button variant={!filterChannel ? "default" : "outline"} size="sm" onClick={() => { setFilterChannel(null); setChPage(1); }}>
                All channels
              </Button>
              {channels.map((ch) => (
                <Button key={ch.id} variant={filterChannel === ch.id ? "default" : "outline"} size="sm" onClick={() => { setFilterChannel(ch.id); setChPage(1); }}>
                  #{ch.name} <span className="ml-1 text-xs opacity-60">({ch.messageCount})</span>
                </Button>
              ))}
            </div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {filterChannel ? `#${channels.find((c) => c.id === filterChannel)?.name}` : "All Channels"}
                  {selectedMember ? ` — ${selectedMember.displayName}` : ""}
                </CardTitle>
                <CardDescription>
                  {channelMsgs.length > 0 ? `Page ${chPage} of ${chPages}` : "No messages found"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {channelMsgs.length > 0 ? (
                  <div className="space-y-1">
                    {channelMsgs.map((msg) => (
                      <div key={msg.id} className="flex items-start gap-3 py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0">
                        <div className="shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                          {msg.sender.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <button onClick={() => { setFilterMember(msg.sender.id); setDmPage(1); setChPage(1); }} className="font-semibold text-sm hover:underline">
                              {msg.sender.displayName}
                            </button>
                            <Badge variant="secondary" className="text-[9px] px-1.5 py-0">#{msg.channel.name}</Badge>
                            {msg.sender.role === "ADMIN" && <Badge variant="outline" className="text-[9px] px-1.5 py-0">admin</Badge>}
                            <span className="text-xs text-muted-foreground ml-auto shrink-0">{formatTime(msg.createdAt)}</span>
                          </div>
                          <p className="text-sm text-foreground/90 break-words">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No channel messages found.</p>
                )}

                {chPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t">
                    <Button variant="ghost" size="sm" disabled={chPage <= 1} onClick={() => setChPage((p) => p - 1)}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">{chPage} / {chPages}</span>
                    <Button variant="ghost" size="sm" disabled={chPage >= chPages} onClick={() => setChPage((p) => p + 1)}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
