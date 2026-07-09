"use client";

import { useState } from "react";
import { Save, Building2, Bell, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useDataStore } from "@/lib/data-store";

const SETTINGS_KEY = "kupa-settings";

function loadSettings() {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem(SETTINGS_KEY) || "null"); } catch { return null; }
}

const defaults = {
  companyName: "Kupa Coffee",
  slug: "kupa-coffee",
  notifNewTraining: true,
  notifNewAnnouncement: true,
  notifNewVideo: true,
  allowSelfPasswordChange: true,
};

export default function SettingsPage() {
  const saved = typeof window !== "undefined" ? loadSettings() : null;
  const init = { ...defaults, ...saved };

  const [companyName, setCompanyName] = useState(init.companyName);
  const [slug, setSlug] = useState(init.slug);
  const [notifNewTraining, setNotifNewTraining] = useState(init.notifNewTraining);
  const [notifNewAnnouncement, setNotifNewAnnouncement] = useState(init.notifNewAnnouncement);
  const [notifNewVideo, setNotifNewVideo] = useState(init.notifNewVideo);
  const [allowSelfPasswordChange, setAllowSelfPasswordChange] = useState(init.allowSelfPasswordChange);
  const [saving, setSaving] = useState(false);

  const { users } = useDataStore();
  const baristaCount = users.filter((u) => u.role === "barista").length;

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    const settings = { companyName, slug, notifNewTraining, notifNewAnnouncement, notifNewVideo, allowSelfPasswordChange };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    setSaving(false);
    toast.success("Ayarlar kaydedildi");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold tracking-tight">Ayarlar</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Sistem ve firma ayarlarını yönet</p>
      </motion.div>

      {/* Platform summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Toplam Kullanıcı", value: users.length },
          { label: "Barista", value: baristaCount },
          { label: "Yönetici", value: users.filter((u) => u.role === "admin").length },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Company */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            <CardTitle className="text-base">Firma Bilgileri</CardTitle>
          </div>
          <CardDescription>İşletmenize ait temel bilgiler</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Firma Adı</Label>
            <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>URL Slug</Label>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
            <p className="text-xs text-muted-foreground">
              academy.kupa.com/<strong>{slug}</strong>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            <CardTitle className="text-base">Bildirimler</CardTitle>
          </div>
          <CardDescription>Otomatik bildirim gönderim ayarları</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "Yeni eğitim eklendiğinde bildir", value: notifNewTraining, set: setNotifNewTraining },
            { label: "Yeni duyuru yayınlandığında bildir", value: notifNewAnnouncement, set: setNotifNewAnnouncement },
            { label: "Yeni video eklendiğinde bildir", value: notifNewVideo, set: setNotifNewVideo },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <Label className="font-normal">{item.label}</Label>
              <Switch checked={item.value} onCheckedChange={item.set} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <CardTitle className="text-base">Güvenlik</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-normal">Baristalar kendi şifrelerini değiştirebilir</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Profil sayfasından şifre değiştirme yetkisi</p>
            </div>
            <Switch checked={allowSelfPasswordChange} onCheckedChange={setAllowSelfPasswordChange} />
          </div>
          <Separator />
          <div className="text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Sadece yönetici yeni kullanıcı oluşturabilir. Dışarıdan kayıt kapalı.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4" />
          {saving ? "Kaydediliyor..." : "Kaydet"}
        </Button>
      </div>
    </div>
  );
}
