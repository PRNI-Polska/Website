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
  const [generatingInvite, setGeneratingInvite] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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

  useEffect(() => {
    fetchMembers();
    fetchInvites();
  }, [fetchMembers, fetchInvites]);

  async function generateInvite() {
    setGeneratingInvite(true);
    setGeneratedCode(null);
    try {
      const res = await fetch("/api/admin/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setGeneratedCode(data.invite.code);
      setInviteEmail("");
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

  async function toggleMember(id: string) {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/members/${id}`, {
        method: "PATCH",
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
        <Button
          variant="outline"
          onClick={() => {
            fetchMembers();
            fetchInvites();
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

      <Tabs defaultValue="members">
        <TabsList>
          <TabsTrigger value="members">
            Members ({members.length})
          </TabsTrigger>
          <TabsTrigger value="invites">
            Invites ({invites.length})
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
                            {member.displayName}
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {member.email}
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
              <div className="flex gap-3 items-end">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="inviteEmail">
                    Email (optional — restrict to specific email)
                  </Label>
                  <Input
                    id="inviteEmail"
                    type="email"
                    placeholder="member@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
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
                      Expires in 7 days
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
      </Tabs>
    </div>
  );
}
