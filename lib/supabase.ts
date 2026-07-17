import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const SESSION_KEY = "kupa-db-session";

export function setDatabaseSession(token?: string) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(SESSION_KEY, token);
  else localStorage.removeItem(SESSION_KEY);
}

export function getDatabaseSession() {
  if (typeof window === "undefined") return undefined;
  return localStorage.getItem(SESSION_KEY) ?? undefined;
}

/** Her Supabase isteğine sunucu tarafından üretilmiş uygulama oturumunu ekler. */
const sessionFetch: typeof fetch = (input, init = {}) => {
  const headers = new Headers(init.headers);
  const token = getDatabaseSession();
  if (token) headers.set("x-kupa-session", token);
  return fetch(input, { ...init, headers });
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: { fetch: sessionFetch },
});
