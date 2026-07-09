"use client";

import { useState } from "react";
import {
  Upload,
  Search,
  Grid3X3,
  List,
  Image as ImageIcon,
  Video,
  FileText,
  File,
  Trash2,
  Download,
  MoreHorizontal,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatFileSize, formatRelativeTime } from "@/lib/utils";
import { toast } from "sonner";
import type { MediaFile } from "@/types";
import { cn } from "@/lib/utils";

const mockMedia: MediaFile[] = [
  {
    id: "m1",
    name: "espresso-temelleri-kapak.jpg",
    url: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=600",
    type: "image",
    size: 245000,
    mimeType: "image/jpeg",
    companyId: "company-1",
    createdBy: "user-1",
    createdAt: "2024-01-20T00:00:00Z",
  },
  {
    id: "m2",
    name: "latte-art-tutorial.mp4",
    url: "#",
    type: "video",
    size: 52000000,
    mimeType: "video/mp4",
    companyId: "company-1",
    createdBy: "user-1",
    createdAt: "2024-03-15T00:00:00Z",
  },
  {
    id: "m3",
    name: "acilis-proseduru.pdf",
    url: "#",
    type: "pdf",
    size: 1200000,
    mimeType: "application/pdf",
    companyId: "company-1",
    createdBy: "user-1",
    createdAt: "2024-01-10T00:00:00Z",
  },
  {
    id: "m4",
    name: "cold-brew-tonic.jpg",
    url: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400",
    type: "image",
    size: 189000,
    mimeType: "image/jpeg",
    companyId: "company-1",
    createdBy: "user-1",
    createdAt: "2026-05-01T00:00:00Z",
  },
];

const typeIcons = {
  image: ImageIcon,
  video: Video,
  pdf: FileText,
  document: File,
};

const typeColors = {
  image: "text-blue-500",
  video: "text-purple-500",
  pdf: "text-red-500",
  document: "text-green-500",
};

export default function MediaLibraryPage() {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [filter, setFilter] = useState<"all" | "image" | "video" | "pdf">("all");
  const [media, setMedia] = useState(mockMedia);

  const filtered = media.filter((m) => {
    if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter !== "all" && m.type !== filter) return false;
    return true;
  });

  const handleDelete = (id: string) => {
    setMedia((prev) => prev.filter((m) => m.id !== id));
    toast.success("Dosya silindi");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Medya Kütüphanesi</h1>
          <p className="text-muted-foreground mt-1">{media.length} dosya</p>
        </div>
        <Button>
          <Upload className="w-4 h-4" />
          Dosya Yükle
        </Button>
      </div>

      {/* Upload zone */}
      <div className="border-2 border-dashed border-border rounded-xl p-10 text-center hover:border-primary/50 transition-colors cursor-pointer group">
        <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3 group-hover:text-primary transition-colors" />
        <p className="font-medium">Dosyaları buraya sürükleyin</p>
        <p className="text-sm text-muted-foreground mt-1">
          veya <span className="text-primary cursor-pointer">dosya seçin</span> — JPG, PNG, MP4, PDF, DOCX
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Dosya ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <div className="flex gap-1">
            {(["all", "image", "video", "pdf"] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "Tümü" : f === "image" ? "Görseller" : f === "video" ? "Videolar" : "PDF"}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex gap-1">
          <Button
            variant={view === "grid" ? "default" : "ghost"}
            size="icon"
            className="h-9 w-9"
            onClick={() => setView("grid")}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={view === "list" ? "default" : "ghost"}
            size="icon"
            className="h-9 w-9"
            onClick={() => setView("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Media grid/list */}
      {view === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filtered.map((file) => {
            const Icon = typeIcons[file.type] || File;
            return (
              <Card key={file.id} className="overflow-hidden group cursor-pointer hover:shadow-md transition-all">
                <div className="relative h-28 bg-muted">
                  {file.type === "image" ? (
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icon className={cn("w-10 h-10", typeColors[file.type])} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-7 w-7"
                      onClick={() => handleDelete(file.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-2">
                  <p className="text-xs font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {filtered.map((file) => {
                const Icon = typeIcons[file.type] || File;
                return (
                  <div
                    key={file.id}
                    className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      {file.type === "image" ? (
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Icon className={cn("w-5 h-5", typeColors[file.type])} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatFileSize(file.size)}</span>
                        <span>·</span>
                        <span>{formatRelativeTime(file.createdAt)}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs capitalize shrink-0">
                      {file.type}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          İndir
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(file.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Sil
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>Dosya bulunamadı</p>
        </div>
      )}
    </div>
  );
}
