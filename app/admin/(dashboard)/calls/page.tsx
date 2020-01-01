"use client";

import { useState, useCallback, type FormEvent } from "react";
import { Phone, Copy, Check, ExternalLink, Clock, Shield, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { createMeeting, type CreatedMeeting } from "@/lib/calls/api";

const ADMIN_KEY = process.env.NEXT_PUBLIC_CALLS_ADMIN_KEY ?? "";

export default function AdminCallsPage() {
  const [title, setTitle] = useState("Spotkanie PRNI");
  const [duration, setDuration] = useState(120);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreatedMeeting | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (!ADMIN_KEY) return;
    setLoading(true); setError(null); setResult(null);
    try { setResult(await createMeeting(ADMIN_KEY, title, duration)); }
    catch (err) { setError(err instanceof Error ? err.message : "Error"); }
    finally { setLoading(false); }
  }, [title, duration]);

  const copy = (val: string, field: string) => {
    navigator.clipboard.writeText(val);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const copyAll = () => {
    if (!result) return;
    const text = [
      result.meeting.title,
      "",
      `Kod spotkania: ${result.meeting.roomCode}`,
      `Hasło: ${result.password}`,
      "",
      `PIN mówcy: ${result.speakerPin}`,
      `PIN admina: ${result.adminPin}`,
    ].join("\n");
    navigator.clipboard.writeText(text);
    setCopied("all");
    setTimeout(() => setCopied(null), 2000);
  };

  const credentials = result ? [
    { label: "Kod spotkania", sub: "Dla wszystkich uczestników", value: result.meeting.roomCode, key: "room", icon: Users },
    { label: "Hasło", sub: "Wymagane od każdego", value: result.password, key: "pw", icon: Shield },
    { label: "PIN mówcy", sub: "Tylko mówcy (4 cyfry)", value: result.speakerPin, key: "pin", icon: Phone },
    { label: "PIN admina", sub: "Tylko prowadzący (6 cyfr)", value: result.adminPin, key: "admin", icon: Shield },
  ] : [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Komunikator</h1>
          <p className="text-muted-foreground">
            Create and manage encrypted voice meetings.
          </p>
        </div>
        <Button variant="outline" asChild>
          <a href="/calls" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            Open Join Page
          </a>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Create Meeting
            </CardTitle>
            <CardDescription>
              Generate a new encrypted voice meeting with room code, password, and PINs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="meetingName">Meeting Name</Label>
                  <Input
                    id="meetingName"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (min)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min={5}
                    max={1440}
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 60)}
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={loading || !ADMIN_KEY}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Phone className="mr-2 h-4 w-4" />
                    Create Meeting
                  </>
                )}
              </Button>
              {!ADMIN_KEY && (
                <p className="text-xs text-destructive text-center">
                  NEXT_PUBLIC_CALLS_ADMIN_KEY not set. Add it in Vercel environment variables.
                </p>
              )}
            </form>

            {error && (
              <div className="mt-4 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              How It Works
            </CardTitle>
            <CardDescription>
              Komunikator meeting access levels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-md bg-muted/50">
                <Badge variant="secondary" className="mt-0.5 shrink-0">Listener</Badge>
                <div>
                  <p className="text-sm font-medium">Room Code + Password</p>
                  <p className="text-xs text-muted-foreground">Can listen to the meeting and use chat.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-md bg-muted/50">
                <Badge className="mt-0.5 shrink-0">Speaker</Badge>
                <div>
                  <p className="text-sm font-medium">Room Code + Password + Speaker PIN</p>
                  <p className="text-xs text-muted-foreground">Can speak, listen, and use chat.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-md bg-muted/50">
                <Badge variant="outline" className="mt-0.5 shrink-0 border-foreground text-foreground">Admin</Badge>
                <div>
                  <p className="text-sm font-medium">Room Code + Password + Admin PIN</p>
                  <p className="text-xs text-muted-foreground">Full control: speak, create polls, manage participants, kick users.</p>
                </div>
              </div>
            </div>
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                All meetings are end-to-end encrypted via WebRTC. No data is stored after the meeting ends. The join page is accessible at <code className="text-xs bg-muted px-1 py-0.5 rounded">/calls</code>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {result && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-emerald-500" />
                  {result.meeting.title}
                </CardTitle>
                <CardDescription>
                  Meeting created successfully. Share these credentials with participants.
                </CardDescription>
              </div>
              <Button
                variant={copied === "all" ? "default" : "outline"}
                onClick={copyAll}
                className={copied === "all" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
              >
                {copied === "all" ? (
                  <><Check className="mr-2 h-4 w-4" /> Copied All</>
                ) : (
                  <><Copy className="mr-2 h-4 w-4" /> Copy All</>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {credentials.map((c) => (
                <div
                  key={c.key}
                  className="flex items-center justify-between p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <c.icon className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground font-medium">{c.label}</span>
                    </div>
                    <p className="text-lg font-mono font-bold tracking-widest">{c.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{c.sub}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copy(c.value, c.key)}
                    className="shrink-0 ml-2"
                  >
                    {copied === c.key ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4 text-center">
              These credentials are shown once. Save them now.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
