"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Eye,
  Upload,
  Plus,
  Trash2,
  GripVertical,
  Image as ImageIcon,
  Video,
  FileText,
  Type,
  List,
  AlertTriangle,
  Info,
  Quote,
  Table,
  Code,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useDataStore } from "@/lib/data-store";
import { useAuthStore } from "@/lib/store";
import { generateId } from "@/lib/utils";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Training } from "@/types";

type BlockType =
  | "heading1"
  | "heading2"
  | "paragraph"
  | "bullet_list"
  | "image"
  | "video"
  | "pdf"
  | "alert"
  | "info"
  | "blockquote"
  | "divider";

interface Block {
  id: string;
  type: BlockType;
  content: string;
}

const blockTypes = [
  { type: "heading1" as BlockType, label: "Başlık 1", icon: Type },
  { type: "heading2" as BlockType, label: "Başlık 2", icon: Type },
  { type: "paragraph" as BlockType, label: "Paragraf", icon: FileText },
  { type: "bullet_list" as BlockType, label: "Madde Listesi", icon: List },
  { type: "image" as BlockType, label: "Görsel", icon: ImageIcon },
  { type: "video" as BlockType, label: "Video", icon: Video },
  { type: "pdf" as BlockType, label: "PDF", icon: FileText },
  { type: "alert" as BlockType, label: "Uyarı Kutusu", icon: AlertTriangle },
  { type: "info" as BlockType, label: "Bilgi Kutusu", icon: Info },
  { type: "blockquote" as BlockType, label: "Alıntı", icon: Quote },
  { type: "divider" as BlockType, label: "Ayraç", icon: Minus },
];

function BlockEditor({
  block,
  onUpdate,
  onDelete,
}: {
  block: Block;
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
}) {
  const renderBlock = () => {
    switch (block.type) {
      case "heading1":
        return (
          <input
            value={block.content}
            onChange={(e) => onUpdate(block.id, e.target.value)}
            placeholder="Başlık 1..."
            className="w-full text-2xl font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground/40"
          />
        );
      case "heading2":
        return (
          <input
            value={block.content}
            onChange={(e) => onUpdate(block.id, e.target.value)}
            placeholder="Başlık 2..."
            className="w-full text-xl font-semibold bg-transparent border-none outline-none placeholder:text-muted-foreground/40"
          />
        );
      case "paragraph":
        return (
          <textarea
            value={block.content}
            onChange={(e) => onUpdate(block.id, e.target.value)}
            placeholder="Metin yazın..."
            rows={3}
            className="w-full bg-transparent border-none outline-none resize-none placeholder:text-muted-foreground/40 text-sm leading-relaxed"
          />
        );
      case "bullet_list":
        return (
          <textarea
            value={block.content}
            onChange={(e) => onUpdate(block.id, e.target.value)}
            placeholder="Her satır bir madde olacak..."
            rows={4}
            className="w-full bg-transparent border-none outline-none resize-none placeholder:text-muted-foreground/40 text-sm leading-relaxed"
          />
        );
      case "alert":
        return (
          <div className="flex gap-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-3">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <textarea
              value={block.content}
              onChange={(e) => onUpdate(block.id, e.target.value)}
              placeholder="Uyarı mesajı..."
              rows={2}
              className="w-full bg-transparent border-none outline-none resize-none placeholder:text-red-300 text-sm text-red-700 dark:text-red-400"
            />
          </div>
        );
      case "info":
        return (
          <div className="flex gap-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-3">
            <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <textarea
              value={block.content}
              onChange={(e) => onUpdate(block.id, e.target.value)}
              placeholder="Bilgi mesajı..."
              rows={2}
              className="w-full bg-transparent border-none outline-none resize-none placeholder:text-blue-300 text-sm text-blue-700 dark:text-blue-400"
            />
          </div>
        );
      case "blockquote":
        return (
          <div className="border-l-4 border-primary pl-4">
            <textarea
              value={block.content}
              onChange={(e) => onUpdate(block.id, e.target.value)}
              placeholder="Alıntı metni..."
              rows={2}
              className="w-full bg-transparent border-none outline-none resize-none placeholder:text-muted-foreground/40 text-sm italic text-muted-foreground"
            />
          </div>
        );
      case "divider":
        return <Separator />;
      case "image":
        return (
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Görsel URL veya yükle</p>
            <Input
              value={block.content}
              onChange={(e) => onUpdate(block.id, e.target.value)}
              placeholder="https://..."
              className="mt-3"
            />
          </div>
        );
      case "video":
        return (
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <Video className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">YouTube, Vimeo veya video URL</p>
            <Input
              value={block.content}
              onChange={(e) => onUpdate(block.id, e.target.value)}
              placeholder="https://youtube.com/..."
              className="mt-3"
            />
          </div>
        );
      case "pdf":
        return (
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">PDF dosyası yükle veya URL gir</p>
            <Input
              value={block.content}
              onChange={(e) => onUpdate(block.id, e.target.value)}
              placeholder="https://..."
              className="mt-3"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="group relative flex gap-2 items-start">
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1">
        <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
      </div>
      <div className="flex-1 min-w-0">{renderBlock()}</div>
      <Button
        variant="ghost"
        size="icon"
        className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 flex-shrink-0 text-muted-foreground hover:text-destructive"
        onClick={() => onDelete(block.id)}
      >
        <Trash2 className="w-3 h-3" />
      </Button>
    </div>
  );
}

export default function NewTrainingPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { categories, addTraining } = useDataStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [duration, setDuration] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [tags, setTags] = useState("");
  const [blocks, setBlocks] = useState<Block[]>([
    { id: "1", type: "paragraph", content: "" },
  ]);
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [saving, setSaving] = useState(false);

  const trainingCategories = categories.filter((c) => c.type === "training");

  const addBlock = (type: BlockType) => {
    const newBlock: Block = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content: "",
    };
    setBlocks((prev) => [...prev, newBlock]);
    setShowBlockMenu(false);
  };

  const updateBlock = (id: string, content: string) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, content } : b)));
  };

  const deleteBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const handleSave = async (status: "draft" | "published") => {
    if (!title.trim()) {
      toast.error("Başlık zorunludur");
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    const selectedCategory = categories.find((c) => c.id === categoryId);
    const now = new Date().toISOString();
    const training: Training = {
      id: `training-${generateId()}`,
      title,
      description: description || undefined,
      coverImage: coverImage || undefined,
      categoryId: categoryId || undefined,
      category: selectedCategory,
      content: blocks.map((b) => ({ id: b.id, type: b.type as any, data: { content: b.content } })),
      status,
      duration: duration ? parseInt(duration) : undefined,
      order: 99,
      requiredForRoles: ["barista"],
      completions: [],
      tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      companyId: "company-1",
      createdBy: user?.id || "user-1",
      createdAt: now,
      updatedAt: now,
      publishedAt: status === "published" ? now : undefined,
    };
    await addTraining(training);
    setSaving(false);
    toast.success(status === "published" ? "Eğitim yayınlandı!" : "Taslak kaydedildi");
    router.push("/admin/trainings");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/trainings">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold">Yeni Eğitim</h1>
            <p className="text-sm text-muted-foreground">Eğitim içeriği oluştur</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSave("draft")} disabled={saving}>
            <Save className="w-4 h-4" />
            Taslak Kaydet
          </Button>
          <Button onClick={() => handleSave("published")} disabled={saving}>
            <Eye className="w-4 h-4" />
            Yayınla
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main editor */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Eğitim başlığı..."
                  className="w-full text-3xl font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground/30"
                />
              </div>
              <div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Kısa açıklama (opsiyonel)..."
                  rows={2}
                  className="w-full bg-transparent border-none outline-none resize-none placeholder:text-muted-foreground/40 text-muted-foreground leading-relaxed"
                />
              </div>
            </CardContent>
          </Card>

          {/* Block editor */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground font-normal">İçerik</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-2 space-y-4">
              {blocks.map((block) => (
                <BlockEditor
                  key={block.id}
                  block={block}
                  onUpdate={updateBlock}
                  onDelete={deleteBlock}
                />
              ))}

              {/* Add block */}
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-dashed text-muted-foreground hover:text-foreground"
                  onClick={() => setShowBlockMenu(!showBlockMenu)}
                >
                  <Plus className="w-4 h-4" />
                  Blok Ekle
                </Button>

                {showBlockMenu && (
                  <Card className="absolute top-10 left-0 right-0 z-50 shadow-lg">
                    <CardContent className="p-2">
                      <div className="grid grid-cols-3 gap-1">
                        {blockTypes.map((bt) => {
                          const Icon = bt.icon;
                          return (
                            <button
                              key={bt.type}
                              onClick={() => addBlock(bt.type)}
                              className="flex items-center gap-2 p-2 rounded-md hover:bg-muted text-sm text-left transition-colors"
                            >
                              <Icon className="w-4 h-4 text-muted-foreground" />
                              <span className="text-xs">{bt.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ayarlar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Kategori</Label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Kategori seç...</option>
                  {trainingCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Süre (dakika)</Label>
                <Input
                  type="number"
                  placeholder="45"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Etiketler</Label>
                <Input
                  placeholder="espresso, barista, temel"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Virgülle ayırın</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Kapak Görseli</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {coverImage ? (
                <div className="relative rounded-lg overflow-hidden h-32">
                  <img
                    src={coverImage}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 h-7"
                    onClick={() => setCoverImage("")}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Görsel yükle veya URL gir</p>
                </div>
              )}
              <Input
                placeholder="https://..."
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
