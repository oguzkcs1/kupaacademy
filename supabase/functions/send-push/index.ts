// Supabase Edge Function: send-push
// Belirtilen kullanıcıların push aboneliklerine web-push gönderir.
// Deploy:  supabase functions deploy send-push --no-verify-jwt
// Secrets: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT
import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-kupa-session",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const sessionToken = req.headers.get("x-kupa-session");
    if (!sessionToken) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const { userIds, title, body, url, tag } = await req.json();
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), { headers: { ...cors, "Content-Type": "application/json" } });
    }

    webpush.setVapidDetails(
      Deno.env.get("VAPID_SUBJECT") || "mailto:info@kupacoffee.com",
      Deno.env.get("VAPID_PUBLIC_KEY")!,
      Deno.env.get("VAPID_PRIVATE_KEY")!,
    );

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: session } = await supabase
      .from("app_sessions")
      .select("user_id,expires_at,users!inner(role)")
      .eq("token", sessionToken)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();
    const role = (session?.users as { role?: string } | null)?.role;
    const onlySelf = userIds.length === 1 && userIds[0] === session?.user_id;
    if (!session || (role !== "admin" && !onlySelf)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const { data: subs, error } = await supabase
      .from("push_subscriptions")
      .select("*")
      .in("user_id", userIds);
    if (error) throw error;

    const payload = JSON.stringify({ title, body, url: url || "/dashboard", tag });
    let sent = 0;

    await Promise.all((subs ?? []).map(async (s: any) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          payload,
        );
        sent++;
      } catch (err: any) {
        // Süresi dolmuş/geçersiz abonelikleri temizle
        if (err?.statusCode === 404 || err?.statusCode === 410) {
          await supabase.from("push_subscriptions").delete().eq("endpoint", s.endpoint);
        }
      }
    }));

    return new Response(JSON.stringify({ sent }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
