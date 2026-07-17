"use client";

import { useEffect, useState } from "react";
import { BellRing, BellOff, Loader2 } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { pushSupported, getPushEnabled, enablePush, disablePush } from "@/lib/push";
import { toast } from "sonner";

export function PushToggle() {
  const { user } = useAuthStore();
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setSupported(pushSupported());
    getPushEnabled().then(setEnabled);
  }, []);

  if (!supported || !user) return null;

  const toggle = async () => {
    setBusy(true);
    try {
      if (enabled) {
        await disablePush();
        setEnabled(false);
        toast.success("Telefon bildirimleri kapatıldı");
      } else {
        const res = await enablePush(user.id);
        if (res.ok) {
          setEnabled(true);
          toast.success("Telefon bildirimleri açıldı 🔔");
        } else if (res.reason === "denied") {
          toast.error("Bildirim izni reddedildi. Tarayıcı ayarlarından açabilirsiniz.");
        } else {
          toast.error("Bildirim açılamadı");
        }
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs border-b border-border/50 hover:bg-muted/50 transition-colors text-left"
    >
      <span className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${enabled ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50" : "bg-primary/10 text-primary"}`}>
        {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : enabled ? <BellRing className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
      </span>
      <span className="flex-1 min-w-0">
        <span className="font-medium block">{enabled ? "Telefon bildirimleri açık" : "Telefon bildirimlerini aç"}</span>
        <span className="text-muted-foreground">{enabled ? "Kapatmak için dokun" : "Uygulama kapalıyken de haber al"}</span>
      </span>
    </button>
  );
}
