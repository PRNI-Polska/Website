const API_BASE = process.env.NEXT_PUBLIC_CALLS_API_URL ?? "/api";

export type Role = "admin" | "speaker" | "listener";

export interface SessionData {
  session: string;
  meetingId: string;
  role: Role;
  displayName?: string;
  turn: {
    username: string;
    credential: string;
    urls: string[];
  };
}

export interface CreatedMeeting {
  meeting: {
    id: string;
    title: string;
    roomCode: string;
    startTime: string;
    endTime: string;
  };
  password: string;
  speakerPin: string;
  adminPin: string;
}

export async function joinMeeting(
  roomCode: string,
  password: string,
  speakerPin?: string,
  adminPin?: string
): Promise<SessionData> {
  const body: Record<string, string> = {
    roomCode: roomCode.trim().toUpperCase(),
    password: password.trim(),
  };
  if (adminPin?.trim()) body.adminPin = adminPin.trim();
  else if (speakerPin?.trim()) body.speakerPin = speakerPin.trim();

  const res = await fetch(`${API_BASE}/auth/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? `Join failed (${res.status})`);
  }

  return res.json();
}

export async function createMeeting(
  adminSecret: string,
  title: string,
  durationMinutes: number
): Promise<CreatedMeeting> {
  const res = await fetch(`${API_BASE}/meetings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminSecret}`,
    },
    body: JSON.stringify({ title, durationMinutes }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? `Failed to create meeting (${res.status})`);
  }

  return res.json();
}
