"use client";

import { useEffect, useState } from "react";
import { Send, Users, Loader2, RefreshCw } from "lucide-react";
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

interface Subscriber {
  id: string;
  email: string;
  createdAt: string;
}

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  async function fetchSubscribers() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/newsletter");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setSubscribers(data.subscribers);
      setCount(data.count);
    } catch {
      console.error("Failed to load subscribers");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSubscribers();
  }, []);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !content.trim()) return;

    setSending(true);
    setSendResult(null);

    try {
      const res = await fetch("/api/admin/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, content }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSendResult({ type: "error", message: data.error });
        return;
      }

      setSendResult({
        type: "success",
        message: `Newsletter sent to ${data.sent} subscriber${data.sent !== 1 ? "s" : ""}${data.failed ? ` (${data.failed} failed)` : ""}.`,
      });
      setSubject("");
      setContent("");
    } catch {
      setSendResult({
        type: "error",
        message: "Failed to send newsletter.",
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Newsletter</h1>
          <p className="text-muted-foreground">
            Manage subscribers and send newsletters
          </p>
        </div>
        <Button variant="outline" onClick={fetchSubscribers} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Compose Newsletter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Compose Newsletter
            </CardTitle>
            <CardDescription>
              Send an email to all {count} subscriber{count !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSend} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Newsletter subject..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content (HTML)</Label>
                <textarea
                  id="content"
                  className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="<h1>Hello!</h1><p>Newsletter content here...</p>"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
              </div>

              {sendResult && (
                <div
                  className={`rounded-md p-3 text-sm ${
                    sendResult.type === "success"
                      ? "bg-green-500/10 text-green-500 border border-green-500/20"
                      : "bg-destructive/10 text-destructive border border-destructive/20"
                  }`}
                >
                  {sendResult.message}
                </div>
              )}

              <Button type="submit" disabled={sending || count === 0}>
                {sending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                {sending ? "Sending..." : "Send Newsletter"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Subscribers List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Subscribers
            </CardTitle>
            <CardDescription>
              {count} confirmed subscriber{count !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : subscribers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 font-medium">
                        Subscribed
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.map((sub) => (
                      <tr key={sub.id} className="border-b last:border-0">
                        <td className="py-3 px-4 text-sm">{sub.email}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {new Date(sub.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No subscribers yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
