"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDataStore } from "@/lib/data-store";
import { generateId } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { Announcement, UserRole } from "@/types";
import { useAuthStore } from "@/lib/store";

export default function NewAnnouncementPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { addAnnouncement } = useDataStore();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    content: "",
    priority: "medium" as "low" | "medium" | "high",
    targetRoles: "all",
    status: "published" as "published" | "draft",
  });

  const handleSave = async (status: "published" | "draft") => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Başlık ve içerik zorunlu");
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));

    const targetRoles: UserRole[] =
      form.targetRoles === "all"
        ? ["barista", "admin"]
        : [form.targetRoles as UserRole];

    const ann: Announcement = {
      id: `ann-${generateId()}`,
      title: form.title,
      content: form.content,
      priority: form.priority,
      targetRoles,
      targetBranches: [],
      sendNotification: status === "published",
      status,
      companyId: "company-1",
      createdBy: user?.id || "user-1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishDate: status === "published" ? new Date().toISOString() : undefined,
    };
    await addAnnouncement(ann);
    setSaving(false);
    toast.success(status === "published" ? "Duyuru yayınlandı" : "Taslak kaydedildi");
    router.push("/admin/announcements");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/admin/announcements"><ArrowLeft className="w-4 h-4" />Geri</Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSave("draft")} disabled={saving}>
            <Save className="w-4 h-4" />Taslak
          </Button>
          <Button onClick={() => handleSave("published")} disabled={saving}>
            <Send className="w-4 h-4" />{saving ? "Yayınlanıyor..." : "Yayınla"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Yeni Duyuru</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Başlık *</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Duyuru başlığı"
            />
          </div>
          <div className="space-y-2">
            <Label>İçerik *</Label>
            <Textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={6}
              placeholder="Duyuru içeriği..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Öncelik</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as any })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">🔴 Önemli</SelectItem>
                  <SelectItem value="medium">🟡 Normal</SelectItem>
                  <SelectItem value="low">🟢 Bilgi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Hedef Kitle</Label>
              <Select value={form.targetRoles} onValueChange={(v) => setForm({ ...form, targetRoles: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="barista">Sadece Baristalar</SelectItem>
                  <SelectItem value="admin">Sadece Yönetici</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
