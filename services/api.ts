export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function getAppToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("APP_TOKEN");
}

export async function fetchWithErrorHandling(url: string, options: RequestInit = {}) {
  const token = getAppToken();

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  };

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const txt = await res.text();
    let msg = `Error ${res.status}`;
    try {
      const j = JSON.parse(txt);
      msg = j.message || j.error || j.Mensaje || msg;
    } catch {}
    throw new Error(msg);
  }

  if (res.status === 204) return;
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}