"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Eye } from "lucide-react";
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
import { useAuthStore } from "@/lib/store";
import { generateId } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { Video } from "@/types";

export default function NewVideoPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { categories, addVideo } = useDataStore();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    youtubeId: "",
    categoryId: "",
    tags: "",
    duration: "",
  });

  const videoCategories = categories;

  const handleSave = async (status: "published" | "draft") => {
    if (!form.title.trim()) {
      toast.error("Başlık zorunlu");
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    const selectedCategory = categories.find((c) => c.id === form.categoryId);
    const now = new Date().toISOString();
    const video: Video = {
      id: `video-${generateId()}`,
      title: form.title,
      description: form.description || undefined,
      youtubeId: form.youtubeId || undefined,
      thumbnail: form.youtubeId ? `https://img.youtube.com/vi/${form.youtubeId}/hqdefault.jpg` : undefined,
      duration: form.duration ? parseInt(form.duration) * 60 : undefined,
      categoryId: form.categoryId || undefined,
      category: selectedCategory,
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      status,
      views: 0,
      companyId: "company-1",
      createdBy: user?.id || "user-1",
      createdAt: now,
      updatedAt: now,
    };
    await addVideo(video);
    setSaving(false);
    toast.success(status === "published" ? "Video yayınlandı" : "Taslak kaydedildi");
    router.push("/admin/videos");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/admin/videos"><ArrowLeft className="w-4 h-4" />Geri</Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSave("draft")} disabled={saving}>
            <Save className="w-4 h-4" />Taslak
          </Button>
          <Button onClick={() => handleSave("published")} disabled={saving}>
            <Eye className="w-4 h-4" />{saving ? "Kaydediliyor..." : "Yayınla"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Yeni Video</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Başlık *</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Video başlığı"
            />
          </div>
          <div className="space-y-2">
            <Label>Açıklama</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="Kısa açıklama"
            />
          </div>
          <div className="space-y-2">
            <Label>YouTube Video ID</Label>
            <Input
              value={form.youtubeId}
              onChange={(e) => setForm({ ...form, youtubeId: e.target.value })}
              placeholder="örn. dQw4w9WgXcQ"
            />
            <p className="text-xs text-muted-foreground">youtube.com/watch?v=<strong>ID</strong> kısmını girin</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
                <SelectTrigger><SelectValue placeholder="Kategori seçin" /></SelectTrigger>
                <SelectContent>
                  {videoCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Süre (dakika)</Label>
              <Input
                type="number"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                placeholder="14"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Etiketler</Label>
            <Input
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="barista, kahve, latte — virgülle ayırın"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
