"use client";

import { useState } from "react";
import {
  Search, FolderOpen, FileText, Download, ExternalLink,
  Eye, ChevronRight, Folder,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDataStore } from "@/lib/data-store";
import { formatFileSize, formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import type { Document } from "@/types";

const typeConfig = {
  pdf: { color: "text-red-500 bg-red-50 dark:bg-red-950/30", label: "PDF" },
  excel: { color: "text-green-500 bg-green-50 dark:bg-green-950/30", label: "Excel" },
  word: { color: "text-blue-500 bg-blue-50 dark:bg-blue-950/30", label: "Word" },
  video: { color: "text-purple-500 bg-purple-50 dark:bg-purple-950/30", label: "Video" },
  image: { color: "text-orange-500 bg-orange-50 dark:bg-orange-950/30", label: "Görsel" },
  other: { color: "text-gray-500 bg-gray-50 dark:bg-gray-950/30", label: "Dosya" },
};

function PDFViewerDialog({ doc, onClose }: { doc: Document; onClose: () => void }) {
  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="flex flex-row items-center justify-between px-5 py-3 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base">
            <FileText className="w-4 h-4 text-primary" />
            {doc.name}
          </DialogTitle>
          <div className="flex gap-2 mr-6">
            <Button size="sm" variant="outline" className="h-8 text-xs" asChild>
              <a href={doc.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-3 h-3" />
                Yeni Sekmede Aç
              </a>
            </Button>
            <Button size="sm" variant="outline" className="h-8 text-xs" asChild>
              <a href={doc.url} download>
                <Download className="w-3 h-3" />
                İndir
              </a>
            </Button>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          {doc.type === "pdf" ? (
            <iframe
              src={doc.url}
              className="w-full h-full border-0"
              title={doc.name}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
              <FileText className="w-16 h-16 opacity-20" />
              <p className="text-sm">Bu dosya türü önizlenemiyor.</p>
              <Button asChild>
                <a href={doc.url} download>
                  <Download className="w-4 h-4" />
                  İndir
                </a>
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function DocumentsPage() {
  const { documents, documentFolders } = useDataStore();
  const [search, setSearch] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [viewingDoc, setViewingDoc] = useState<Document | null>(null);

  const publishedDocs = documents.filter((d) => d.status === "published");

  const filtered = publishedDocs.filter((d) => {
    if (search && !d.name.toLowerCase().includes(search.toLowerCase()) &&
        !d.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))) return false;
    if (selectedFolder && d.folderId !== selectedFolder) return false;
    return true;
  });

  // Count per folder
  const folderCounts = documentFolders.reduce<Record<string, number>>((acc, f) => {
    acc[f.id] = publishedDocs.filter((d) => d.folderId === f.id).length;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold tracking-tight">Dokümanlar</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Şirket kuralları, prosedürler ve paylaşılan belgeler
        </p>
      </motion.div>

      {/* Kategori kartları */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3"
      >
        <button
          onClick={() => setSelectedFolder(null)}
          className={cn(
            "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center",
            selectedFolder === null
              ? "border-primary bg-primary/5 text-primary"
              : "border-border hover:border-primary/40 hover:bg-muted/50 text-muted-foreground"
          )}
        >
          <FolderOpen className="w-6 h-6" />
          <span className="text-xs font-medium">Tümü</span>
          <span className="text-lg font-bold">{publishedDocs.length}</span>
        </button>
        {documentFolders.map((folder) => (
          <button
            key={folder.id}
            onClick={() => setSelectedFolder(folder.id === selectedFolder ? null : folder.id)}
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center",
              selectedFolder === folder.id
                ? "border-primary bg-primary/5 text-primary"
                : "border-border hover:border-primary/40 hover:bg-muted/50 text-muted-foreground"
            )}
          >
            <Folder className="w-6 h-6" />
            <span className="text-xs font-medium line-clamp-2">{folder.name}</span>
            <span className="text-lg font-bold">{folderCounts[folder.id] || 0}</span>
          </button>
        ))}
      </motion.div>

      {/* Arama */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Doküman veya etiket ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9 text-sm"
        />
      </div>

      {/* Doküman listesi */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="space-y-2"
      >
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <FolderOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>Doküman bulunamadı</p>
          </div>
        ) : (
          filtered.map((doc, i) => {
            const config = typeConfig[doc.type];
            return (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-muted/30 transition-all group"
              >
                <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0", config.color)}>
                  <FileText className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm group-hover:text-primary transition-colors truncate">
                    {doc.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {doc.folder && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Folder className="w-3 h-3" />
                        {doc.folder.name}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">{formatFileSize(doc.size)}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">{formatRelativeTime(doc.createdAt)}</span>
                    {doc.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[10px] h-4 px-1.5">{tag}</Badge>
                    ))}
                  </div>
                </div>

                <Badge variant="outline" className="text-xs shrink-0">{config.label}</Badge>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {doc.type === "pdf" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setViewingDoc(doc)}
                      title="Görüntüle"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    asChild
                    title="İndir"
                  >
                    <a href={doc.url} download={doc.name}>
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    asChild
                    title="Yeni Sekmede Aç"
                  >
                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </motion.div>
            );
          })
        )}
      </motion.div>

      {viewingDoc && (
        <PDFViewerDialog doc={viewingDoc} onClose={() => setViewingDoc(null)} />
      )}
    </div>
  );
}
