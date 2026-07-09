"use client";

import { useState } from "react";
import {
  Plus, Pencil, Trash2, FolderPlus, Folder, FileText,
  Search, X, Check, Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDataStore } from "@/lib/data-store";
import { useAuthStore } from "@/lib/store";
import { generateId, formatFileSize } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion } from "framer-motion";
import type { Document, DocumentFolder } from "@/types";

// ─── Folder Dialog ────────────────────────────────────────────────────────────
function FolderDialog({
  folder,
  onClose,
}: {
  folder?: DocumentFolder | null;
  onClose: () => void;
}) {
  const { addDocumentFolder, updateDocumentFolder } = useDataStore();
  const { user } = useAuthStore();
  const [name, setName] = useState(folder?.name ?? "");

  const isEdit = !!folder;

  const handleSave = () => {
    if (!name.trim()) return;
    if (isEdit) {
      updateDocumentFolder(folder.id, { name: name.trim() });
      toast.success("Kategori güncellendi");
    } else {
      addDocumentFolder({
        id: `folder-${generateId()}`,
        name: name.trim(),
        companyId: user?.companyId ?? "company-1",
      });
      toast.success("Kategori eklendi");
    }
    onClose();
  };

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Kategoriyi Düzenle" : "Yeni Kategori"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Kategori Adı</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="örn: Prosedürler"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>İptal</Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            <Check className="w-4 h-4" />
            Kaydet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Document Dialog ──────────────────────────────────────────────────────────
function DocumentDialog({
  doc,
  onClose,
}: {
  doc?: Document | null;
  onClose: () => void;
}) {
  const { addDocument, updateDocument, documentFolders } = useDataStore();
  const { user } = useAuthStore();
  const isEdit = !!doc;

  const [form, setForm] = useState({
    name: doc?.name ?? "",
    url: doc?.url ?? "",
    type: doc?.type ?? "pdf",
    folderId: doc?.folderId ?? "",
    status: doc?.status ?? "published",
    tagsRaw: doc?.tags.join(", ") ?? "",
  });

  const handleSave = () => {
    if (!form.name.trim() || !form.url.trim()) return;
    const tags = form.tagsRaw.split(",").map((t) => t.trim()).filter(Boolean);
    const base = {
      name: form.name.trim(),
      url: form.url.trim(),
      type: form.type as Document["type"],
      folderId: form.folderId || undefined,
      status: form.status as "published" | "draft",
      tags,
      companyId: user?.companyId ?? "company-1",
    };

    if (isEdit) {
      updateDocument(doc.id, base);
      toast.success("Doküman güncellendi");
    } else {
      addDocument({
        ...base,
        id: `doc-${generateId()}`,
        size: 0,
        createdBy: user?.id ?? "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      toast.success("Doküman eklendi");
    }
    onClose();
  };

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Dokümanı Düzenle" : "Yeni Doküman"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Doküman Adı *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="örn: Hijyen Prosedürleri 2024"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label>Dosya URL *</Label>
            <Input
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Dosya Türü</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as Document["type"] })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="word">Word</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="image">Görsel</SelectItem>
                  <SelectItem value="other">Diğer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Durum</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as "published" | "draft" })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">Yayında</SelectItem>
                  <SelectItem value="draft">Taslak</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Kategori</Label>
            <Select value={form.folderId || "none"} onValueChange={(v) => setForm({ ...form, folderId: v === "none" ? "" : v })}>
              <SelectTrigger>
                <SelectValue placeholder="Kategori seç..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— Kategorisiz —</SelectItem>
                {documentFolders.map((f) => (
                  <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" /> Etiketler
            </Label>
            <Input
              value={form.tagsRaw}
              onChange={(e) => setForm({ ...form, tagsRaw: e.target.value })}
              placeholder="etiket1, etiket2, etiket3"
            />
            <p className="text-xs text-muted-foreground">Virgülle ayırın</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>İptal</Button>
          <Button onClick={handleSave} disabled={!form.name.trim() || !form.url.trim()}>
            <Check className="w-4 h-4" />
            Kaydet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminDocumentsPage() {
  const { documents, documentFolders, deleteDocument, deleteDocumentFolder } = useDataStore();
  const [search, setSearch] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [tab, setTab] = useState<"documents" | "folders">("documents");

  const [folderDialog, setFolderDialog] = useState<{ open: boolean; folder?: DocumentFolder | null }>({ open: false });
  const [docDialog, setDocDialog] = useState<{ open: boolean; doc?: Document | null }>({ open: false });
  const [deleteTarget, setDeleteTarget] = useState<{ type: "doc" | "folder"; id: string } | null>(null);

  const filteredDocs = documents.filter((d) => {
    if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (selectedFolder && d.folderId !== selectedFolder) return false;
    return true;
  });

  const handleDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "doc") {
      deleteDocument(deleteTarget.id);
      toast.success("Doküman silindi");
    } else {
      deleteDocumentFolder(deleteTarget.id);
      toast.success("Kategori silindi");
    }
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-xl font-bold tracking-tight">Doküman Yönetimi</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Dokümanları ve kategorileri yönetin</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setFolderDialog({ open: true })}>
            <FolderPlus className="w-4 h-4" />
            Yeni Kategori
          </Button>
          <Button size="sm" onClick={() => setDocDialog({ open: true })}>
            <Plus className="w-4 h-4" />
            Doküman Ekle
          </Button>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {(["documents", "folders"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "pb-2 px-4 text-sm font-medium border-b-2 transition-colors",
              tab === t
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {t === "documents" ? `Dokümanlar (${documents.length})` : `Kategoriler (${documentFolders.length})`}
          </button>
        ))}
      </div>

      {tab === "documents" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Doküman ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <Select value={selectedFolder ?? "all"} onValueChange={(v) => setSelectedFolder(v === "all" ? null : v)}>
              <SelectTrigger className="w-48 h-9 text-sm">
                <SelectValue placeholder="Tüm kategoriler" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Kategoriler</SelectItem>
                {documentFolders.map((f) => (
                  <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Document list */}
          <div className="space-y-2">
            {filteredDocs.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <FileText className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="text-sm">Doküman bulunamadı</p>
              </div>
            ) : (
              filteredDocs.map((doc) => {
                const folder = documentFolders.find((f) => f.id === doc.folderId);
                return (
                  <div
                    key={doc.id}
                    className="flex items-center gap-4 p-4 rounded-xl border border-border hover:bg-muted/30 transition-colors group"
                  >
                    <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.name}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {folder && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Folder className="w-3 h-3" />
                            {folder.name}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground uppercase">{doc.type}</span>
                        {doc.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-[10px] h-4 px-1.5">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                    <Badge variant={doc.status === "published" ? "default" : "secondary"} className="text-xs">
                      {doc.status === "published" ? "Yayında" : "Taslak"}
                    </Badge>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setDocDialog({ open: true, doc })}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget({ type: "doc", id: doc.id })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {tab === "folders" && (
        <div className="space-y-2">
          {documentFolders.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Folder className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm">Henüz kategori yok</p>
            </div>
          ) : (
            documentFolders.map((folder) => {
              const count = documents.filter((d) => d.folderId === folder.id).length;
              return (
                <div
                  key={folder.id}
                  className="flex items-center gap-4 p-4 rounded-xl border border-border hover:bg-muted/30 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Folder className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{folder.name}</p>
                    <p className="text-xs text-muted-foreground">{count} doküman</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setFolderDialog({ open: true, folder })}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget({ type: "folder", id: folder.id })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Dialogs */}
      {folderDialog.open && (
        <FolderDialog
          folder={folderDialog.folder}
          onClose={() => setFolderDialog({ open: false })}
        />
      )}
      {docDialog.open && (
        <DocumentDialog
          doc={docDialog.doc}
          onClose={() => setDocDialog({ open: false })}
        />
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Silmek istediğinize emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
