"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Shield,
  UserPlus,
  Loader2,
  RefreshCw,
  Copy,
  Check,
  Trash2,
  Ban,
  CheckCircle,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Member {
  id: string;
  email: string;
  displayName: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

interface Invite {
  id: string;
  code: string;
  email: string | null;
  used: boolean;
  usedAt: string | null;
  usedBy: string | null;
  expiresAt: string;
  createdAt: string;
}

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [loadingInvites, setLoadingInvites] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [expiryHours, setExpiryHours] = useState(168);
  const [inviteRole, setInviteRole] = useState("MEMBER");
  const [generatingInvite, setGeneratingInvite] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [generatedExpiry, setGeneratedExpiry] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [channels, setChannels] = useState<Array<{id:string;name:string;description:string|null;messageCount:number;createdAt:string}>>([]);
  const [loadingChannels, setLoadingChannels] = useState(true);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelDesc, setNewChannelDesc] = useState("");
  const [newChannelRoles, setNewChannelRoles] = useState("");
  const [creatingChannel, setCreatingChannel] = useState(false);

  const MEMBER_ROLES = [
    { value: "ADMIN", label: "Admin (Zarząd)" },
    { value: "LEADERSHIP", label: "Kadra" },
    { value: "MAIN_WING", label: "Skrzydło Główne" },
    { value: "INTERNATIONAL", label: "Skrzydło Międzynarodowe" },
    { value: "FEMALE_WING", label: "Skrzydło Kobiece" },
    { value: "MEMBER", label: "Członek" },
  ];

  const fetchMembers = useCallback(async () => {
    setLoadingMembers(true);
    try {
      const res = await fetch("/api/admin/members");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setMembers(data.members);
    } catch {
      console.error("Failed to load members");
    } finally {
      setLoadingMembers(false);
    }
  }, []);

  const fetchInvites = useCallback(async () => {
    setLoadingInvites(true);
    try {
      const res = await fetch("/api/admin/members/invites");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setInvites(data.invites);
    } catch {
      console.error("Failed to load invites");
    } finally {
      setLoadingInvites(false);
    }
  }, []);

  const fetchChannels = useCallback(async () => {
    setLoadingChannels(true);
    try {
      const res = await fetch("/api/admin/members/channels");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setChannels(data.channels);
    } catch { /* ignore */ }
    finally { setLoadingChannels(false); }
  }, []);

  useEffect(() => {
    fetchMembers();
    fetchInvites();
    fetchChannels();
  }, [fetchMembers, fetchInvites, fetchChannels]);

  async function createChannel() {
    if (!newChannelName.trim()) return;
    setCreatingChannel(true);
    try {
      const res = await fetch("/api/admin/members/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newChannelName.trim(), description: newChannelDesc.trim() || null, allowedRoles: newChannelRoles || null }),
      });
      if (!res.ok) throw new Error("Failed");
      setNewChannelName(""); setNewChannelDesc(""); setNewChannelRoles("");
      fetchChannels();
    } catch { /* ignore */ }
    finally { setCreatingChannel(false); }
  }

  async function deleteChannel(id: string) {
    if (!confirm("Delete this channel and all its messages?")) return;
    setActionLoading(id);
    try {
      await fetch(`/api/admin/members/channels?id=${id}`, { method: "DELETE" });
      fetchChannels();
    } catch { /* ignore */ }
    finally { setActionLoading(null); }
  }

  async function generateInvite() {
    setGeneratingInvite(true);
    setGeneratedCode(null);
    setGeneratedExpiry(null);
    try {
      const res = await fetch("/api/admin/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail.trim() || undefined,
          code: customCode.trim() || undefined,
          expiryHours,
          role: inviteRole,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to generate invite");
        return;
      }
      const data = await res.json();
      setGeneratedCode(data.invite.code);
      setGeneratedExpiry(data.invite.expiresAt);
      setInviteEmail("");
      setCustomCode("");
      fetchInvites();
    } catch {
      console.error("Failed to generate invite");
    } finally {
      setGeneratingInvite(false);
    }
  }

  async function copyCode(code: string) {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function changeMemberRole(id: string, role: string) {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/members/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        const data = await res.json();
        setMembers((prev) =>
          prev.map((m) => m.id === id ? { ...m, role: data.member.role } : m)
        );
      }
    } catch { /* ignore */ }
    finally { setActionLoading(null); }
  }

  async function toggleMember(id: string) {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/members/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !members.find((m) => m.id === id)?.isActive }),
      });
      if (res.ok) {
        const data = await res.json();
        setMembers((prev) =>
          prev.map((m) =>
            m.id === id ? { ...m, isActive: data.member.isActive } : m
          )
        );
      }
    } catch {
      console.error("Failed to toggle member");
    } finally {
      setActionLoading(null);
    }
  }

  async function deleteMember(id: string) {
    if (!confirm("Are you sure you want to delete this member?")) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/members/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMembers((prev) => prev.filter((m) => m.id !== id));
      }
    } catch {
      console.error("Failed to delete member");
    } finally {
      setActionLoading(null);
    }
  }

  function getInviteStatus(invite: Invite) {
    if (invite.used)
      return (
        <Badge variant="secondary" className="text-xs">
          Used
        </Badge>
      );
    if (new Date(invite.expiresAt) < new Date())
      return (
        <Badge variant="destructive" className="text-xs">
          Expired
        </Badge>
      );
    return (
      <Badge className="text-xs bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30">
        Active
      </Badge>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Members</h1>
          <p className="text-muted-foreground">
            Manage members and invite codes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a href="/admin/members/oversight" className="text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded hover:bg-muted">
            <Eye className="h-4 w-4 inline mr-1" />Oversight
          </a>
          <Button
          variant="outline"
          onClick={() => {
            fetchMembers();
            fetchInvites();
            fetchChannels();
          }}
          disabled={loadingMembers || loadingInvites}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${
              loadingMembers || loadingInvites ? "animate-spin" : ""
            }`}
          />
          Refresh
        </Button>
        </div>
      </div>

      <Tabs defaultValue="members">
        <TabsList>
          <TabsTrigger value="members">
            Members ({members.length})
          </TabsTrigger>
          <TabsTrigger value="invites">
            Invites ({invites.length})
          </TabsTrigger>
          <TabsTrigger value="channels">
            Channels ({channels.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Registered Members
              </CardTitle>
              <CardDescription>
                {members.length} total member
                {members.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingMembers ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : members.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-sm">
                          Name
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-sm">
                          Email
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-sm">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-sm">
                          Last Login
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-sm">
                          Joined
                        </th>
                        <th className="text-right py-3 px-4 font-medium text-sm">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((member) => (
                        <tr
                          key={member.id}
                          className="border-b last:border-0"
                        >
                          <td className="py-3 px-4 text-sm font-medium">
                            <input
                              type="text"
                              defaultValue={member.displayName}
                              onBlur={async (e) => {
                                const newName = e.target.value.trim();
                                if (newName && newName !== member.displayName && newName.length >= 2) {
                                  const res = await fetch(`/api/admin/members/${member.id}`, {
                                    method: "PATCH",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ displayName: newName }),
                                  });
                                  if (res.ok) {
                                    setMembers((prev) => prev.map((m) => m.id === member.id ? { ...m, displayName: newName } : m));
                                  }
                                }
                              }}
                              className="bg-transparent border-b border-transparent hover:border-border focus:border-foreground outline-none w-full py-0.5 transition-colors"
                            />
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {member.email}
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={member.role}
                              onChange={(e) => changeMemberRole(member.id, e.target.value)}
                              disabled={actionLoading === member.id}
                              className="text-xs bg-background border border-border rounded px-2 py-1"
                            >
                              {MEMBER_ROLES.map((r) => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {member.isActive ? (
                              <Badge className="text-xs bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30">
                                Active
                              </Badge>
                            ) : (
                              <Badge
                                variant="destructive"
                                className="text-xs"
                              >
                                Disabled
                              </Badge>
                            )}
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {member.lastLoginAt
                              ? new Date(
                                  member.lastLoginAt
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "Never"}
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {new Date(
                              member.createdAt
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </td>
                          <td className="py-3 px-4 text-sm text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleMember(member.id)}
                                disabled={
                                  actionLoading === member.id
                                }
                                title={
                                  member.isActive
                                    ? "Deactivate"
                                    : "Activate"
                                }
                              >
                                {actionLoading === member.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : member.isActive ? (
                                  <Ban className="h-4 w-4" />
                                ) : (
                                  <CheckCircle className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  deleteMember(member.id)
                                }
                                disabled={
                                  actionLoading === member.id
                                }
                                className="text-destructive hover:text-destructive"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No members registered yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invites" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Generate Invite Code
              </CardTitle>
              <CardDescription>
                Create a one-time invite code for a new member
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="inviteRoleSelect">Assign role</Label>
                  <select
                    id="inviteRoleSelect"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {MEMBER_ROLES.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customCode">Custom code (optional)</Label>
                  <Input
                    id="customCode"
                    placeholder="e.g. PRNI-INT"
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                    maxLength={20}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inviteEmail">Email (optional)</Label>
                  <Input
                    id="inviteEmail"
                    type="email"
                    placeholder="member@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-3 items-end">
                <div className="space-y-2">
                  <Label htmlFor="expiryHours">Expires in</Label>
                  <select
                    id="expiryHours"
                    value={expiryHours}
                    onChange={(e) => setExpiryHours(parseInt(e.target.value))}
                    className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value={1}>1 hour</option>
                    <option value={6}>6 hours</option>
                    <option value={24}>24 hours</option>
                    <option value={72}>3 days</option>
                    <option value={168}>7 days</option>
                    <option value={720}>30 days</option>
                  </select>
                </div>
                <Button
                  onClick={generateInvite}
                  disabled={generatingInvite}
                >
                  {generatingInvite ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="mr-2 h-4 w-4" />
                  )}
                  Generate
                </Button>
              </div>

              {generatedCode && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-400 mb-1">
                      Invite code generated:
                    </p>
                    <p className="text-2xl font-mono font-bold tracking-widest text-green-300">
                      {generatedCode}
                    </p>
                    <p className="text-xs text-green-400/60 mt-1">
                      Role: {MEMBER_ROLES.find((r) => r.value === inviteRole)?.label || inviteRole} &middot; Expires {generatedExpiry ? new Date(generatedExpiry).toLocaleString() : "—"}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyCode(generatedCode)}
                    className="shrink-0"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 mr-1" />
                    ) : (
                      <Copy className="h-4 w-4 mr-1" />
                    )}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>All Invites</CardTitle>
              <CardDescription>
                {invites.length} invite code
                {invites.length !== 1 ? "s" : ""} created
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingInvites ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : invites.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-sm">
                          Code
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-sm">
                          Email
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-sm">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-sm">
                          Used By
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-sm">
                          Expires
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-sm">
                          Created
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {invites.map((invite) => (
                        <tr
                          key={invite.id}
                          className="border-b last:border-0"
                        >
                          <td className="py-3 px-4 text-sm font-mono font-medium tracking-wider">
                            {invite.code}
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {invite.email || "—"}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {getInviteStatus(invite)}
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {invite.usedBy || "—"}
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {new Date(
                              invite.expiresAt
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {new Date(
                              invite.createdAt
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No invite codes created yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channels" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Channel</CardTitle>
              <CardDescription>Add a new group chat channel for members.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-3">
                <Input placeholder="Channel name" value={newChannelName} onChange={(e) => setNewChannelName(e.target.value)} className="max-w-[200px]" />
                <Input placeholder="Description (optional)" value={newChannelDesc} onChange={(e) => setNewChannelDesc(e.target.value)} className="flex-1" />
                <Button onClick={createChannel} disabled={creatingChannel || !newChannelName.trim()}>
                  {creatingChannel ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
                </Button>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">Access (leave empty = everyone):</p>
                <div className="flex flex-wrap gap-2">
                  {MEMBER_ROLES.map((r) => {
                    const selected = newChannelRoles.split(",").filter(Boolean).includes(r.value);
                    return (
                      <button key={r.value} type="button" onClick={() => {
                        const current = newChannelRoles.split(",").filter(Boolean);
                        const updated = selected ? current.filter((x) => x !== r.value) : [...current, r.value];
                        setNewChannelRoles(updated.join(","));
                      }}
                        className={`text-xs px-2.5 py-1.5 rounded border transition-colors ${selected ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-foreground"}`}
                      >
                        {r.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Channels</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingChannels ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
              ) : channels.length > 0 ? (
                <div className="space-y-3">
                  {channels.map((ch: {id:string;name:string;description:string|null;allowedRoles?:string|null;messageCount:number;createdAt:string}) => (
                    <div key={ch.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                      <div>
                        <p className="font-medium">#{ch.name}</p>
                        {ch.description && <p className="text-sm text-muted-foreground">{ch.description}</p>}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">{ch.messageCount} messages</span>
                          {ch.allowedRoles ? (
                            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                              {ch.allowedRoles.split(",").map((r: string) => MEMBER_ROLES.find((mr) => mr.value === r.trim())?.label || r.trim()).join(", ")}
                            </span>
                          ) : (
                            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Everyone</span>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => deleteChannel(ch.id)} disabled={actionLoading === ch.id}>
                        {actionLoading === ch.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No channels yet.</p>
                  <Button variant="outline" onClick={async () => {
                    setCreatingChannel(true);
                    try { await fetch("/api/admin/members/channels/setup", { method: "POST" }); fetchChannels(); }
                    catch {} finally { setCreatingChannel(false); }
                  }} disabled={creatingChannel}>
                    {creatingChannel ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Create default channels (Ogólne, Zarząd, Międzynarodowe, etc.)
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
