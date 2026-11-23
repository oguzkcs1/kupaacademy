import { getDatabaseSession, setDatabaseSession, supabase } from "./supabase";

export class SessionExpiredError extends Error {
  constructor() { super("Oturumunuz sona erdi. Lütfen tekrar giriş yapın."); }
}

export async function requireValidSession(): Promise<void> {
  const token = getDatabaseSession();
  let valid = false;
  if (token) {
    const { data, error } = await supabase.rpc("app_session_user_id");
    // Ağ/sunucu hatası oturumun sona erdiğini kanıtlamaz.
    if (error) throw new Error("Oturum kontrol edilemedi. Bağlantınızı kontrol edip tekrar deneyin.");
    if (getDatabaseSession() !== token) throw new Error("Oturum değişti. Lütfen tekrar deneyin.");
    valid = typeof data === "string" && data.length > 0;
  }
  if (!valid) {
    setDatabaseSession();
    if (typeof window !== "undefined") window.dispatchEvent(new Event("kupa-session-expired"));
    throw new SessionExpiredError();
  }
}
