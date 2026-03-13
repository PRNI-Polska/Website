"use client";

let cachedToken: string | null = null;

async function fetchCsrfToken(): Promise<string> {
  const res = await fetch("/api/admin/csrf");
  if (!res.ok) throw new Error("Failed to fetch CSRF token");
  const data = await res.json();
  cachedToken = data.csrfToken;
  return cachedToken!;
}

async function ensureCsrfToken(): Promise<string> {
  if (cachedToken) return cachedToken;
  return fetchCsrfToken();
}

export function invalidateCsrfToken() {
  cachedToken = null;
}

export async function adminFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await ensureCsrfToken();
  const headers = new Headers(options.headers);
  headers.set("x-csrf-token", token);

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status === 403) {
    cachedToken = null;
    const freshToken = await fetchCsrfToken();
    headers.set("x-csrf-token", freshToken);
    return fetch(url, { ...options, headers });
  }

  return response;
}
