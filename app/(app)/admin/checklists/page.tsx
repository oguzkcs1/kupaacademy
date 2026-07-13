"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ListChecks, Plus, Pencil, Trash2, Check, X, Sunrise, Sunset, Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useOpsStore } from "@/lib/ops-store";
import type { ChecklistSection, ChecklistType } from "@/types/operations";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const typeTabs: { key: ChecklistType; label: string; icon: React.ElementType }[] = [
  { key: "opening", label: "Açılış", icon: Sunrise },
  { key: "closing", label: "Kapanış", icon: Sunset },
];

const emptySectionForm = { title: "", emoji: "📋", photoRequired: true };

export default function AdminChecklistsPage() {
  const {
    templates, addSection, updateSection, deleteSection,
    addTemplateItem, updateTemplateItem, deleteTemplateItem,
  } = useOpsStore();

  const [activeType, setActiveType] = useState<ChecklistType>("opening");
  const template = templates.find((t) => t.type === activeType);

  // Kategori dialog
  const [sectionDialog, setSectionDialog] = useState(false);
  const [editSection, setEditSection] = useState<ChecklistSection | null>(null);
  const [sectionForm, setSectionForm] = useState(emptySectionForm);
  const [deleteTarget, setDeleteTarget] = useState<ChecklistSection | null>(null);

  // Madde inline edit
  const [addingItemTo, setAddingItemTo] = useState<string | null>(null);
  const [newItemLabel, setNewItemLabel] = useState("");
  const [editingItem, setEditingItem] = useState<{ sectionId: string; itemId: string } | null>(null);
  const [editItemLabel, setEditItemLabel] = useState("");

  const openNewSection = () => {
    setEditSection(null);
    setSectionForm(emptySectionForm);
    setSectionDialog(true);
  };

  const openEditSection = (sec: ChecklistSection) => {
    setEditSection(sec);
    setSectionForm({ title: sec.title, emoji: sec.emoji, photoRequired: sec.photoRequired });
    setSectionDialog(true);
  };

  const handleSaveSection = () => {
    if (!sectionForm.title.trim()) {
      toast.error("Kategori adı zorunlu");
      return;
    }
    if (editSection) {
      updateSection(activeType, editSection.id, {
        title: sectionForm.title.trim(),
        emoji: sectionForm.emoji.trim() || "📋",
        photoRequired: sectionForm.photoRequired,
      });
      toast.success("Kategori güncellendi");
    } else {
      addSection(activeType, {
        title: sectionForm.title.trim(),
        emoji: sectionForm.emoji.trim() || "📋",
        photoRequired: sectionForm.photoRequired,
      });
      toast.success("Kategori eklendi");
    }
    setSectionDialog(false);
  };

  const handleDeleteSection = () => {
    if (!deleteTarget) return;
    deleteSection(activeType, deleteTarget.id);
    toast.success("Kategori silindi");
    setDeleteTarget(null);
  };

  const handleAddItem = (sectionId: string) => {
    if (!newItemLabel.trim()) return;
    addTemplateItem(activeType, sectionId, newItemLabel.trim());
    toast.success("Madde eklendi");
    setNewItemLabel("");
    setAddingItemTo(null);
  };

  const handleSaveItem = () => {
    if (!editingItem || !editItemLabel.trim()) return;
    updateTemplateItem(activeType, editingItem.sectionId, editingItem.itemId, editItemLabel.trim());
    toast.success("Madde güncellendi");
    setEditingItem(null);
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-3 flex-wrap"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
            <ListChecks className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Checklist Yönetimi</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Açılış ve kapanış kontrol şablonlarını düzenleyin
            </p>
          </div>
        </div>
        <Button size="sm" onClick={openNewSection}>
          <Plus className="w-4 h-4" />Yeni Kategori
        </Button>
      </motion.div>

      {/* Açılış / Kapanış sekmeleri */}
      <div className="flex gap-2">
        {typeTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveType(tab.key)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150",
              activeType === tab.key
                ? "bg-primary text-white shadow-sm"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Kategoriler */}
      <div className="space-y-3">
        {!template && (
          <div className="text-center py-16 text-muted-foreground text-sm">Yükleniyor…</div>
        )}
        {template && template.sections.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <ListChecks className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>Bu şablonda henüz kategori yok</p>
          </div>
        )}

        {template?.sections.map((sec) => (
          <Card key={sec.id}>
            <CardHeader className="py-4 flex flex-row items-center gap-3 space-y-0">
              <span className="text-2xl">{sec.emoji}</span>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base flex items-center gap-2 flex-wrap">
                  {sec.title}
                  <Badge variant="secondary" className="text-xs">{sec.items.length} madde</Badge>
                  {sec.photoRequired && (
                    <Badge variant="outline" className="text-xs gap-1">
                      <Camera className="w-3 h-3" />Fotoğraf zorunlu
                    </Badge>
                  )}
                </CardTitle>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditSection(sec)}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => setDeleteTarget(sec)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-4 space-y-1">
              {sec.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-muted/40 transition-colors group"
                >
                  {editingItem?.itemId === item.id ? (
                    <>
                      <Input
                        value={editItemLabel}
                        onChange={(e) => setEditItemLabel(e.target.value)}
                        className="h-8 text-sm"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveItem();
                          if (e.key === "Escape") setEditingItem(null);
                        }}
                      />
                      <Button size="icon" className="h-8 w-8 flex-shrink-0" onClick={handleSaveItem}>
                        <Check className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 flex-shrink-0" onClick={() => setEditingItem(null)}>
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 flex-shrink-0" />
                      <span className="text-sm flex-1">{item.label}</span>
                      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => {
                            setEditingItem({ sectionId: sec.id, itemId: item.id });
                            setEditItemLabel(item.label);
                          }}
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => {
                            deleteTemplateItem(activeType, sec.id, item.id);
                            toast.success("Madde silindi");
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}

              {/* Madde ekleme */}
              {addingItemTo === sec.id ? (
                <div className="flex gap-2 pt-1">
                  <Input
                    value={newItemLabel}
                    onChange={(e) => setNewItemLabel(e.target.value)}
                    placeholder="Madde adı..."
                    className="h-8 text-sm"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddItem(sec.id);
                      if (e.key === "Escape") setAddingItemTo(null);
                    }}
                  />
                  <Button size="icon" className="h-8 w-8 flex-shrink-0" onClick={() => handleAddItem(sec.id)} disabled={!newItemLabel.trim()}>
                    <Check className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 flex-shrink-0" onClick={() => setAddingItemTo(null)}>
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => { setAddingItemTo(sec.id); setNewItemLabel(""); }}
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors pt-1.5 px-2"
                >
                  <Plus className="w-3.5 h-3.5" />Madde ekle
                </button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Kategori dialog */}
      <Dialog open={sectionDialog} onOpenChange={(v) => !v && setSectionDialog(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editSection ? "Kategori Düzenle" : `Yeni Kategori (${activeType === "opening" ? "Açılış" : "Kapanış"})`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-[80px_1fr] gap-3">
              <div className="space-y-1.5">
                <Label>Emoji</Label>
                <Input
                  value={sectionForm.emoji}
                  onChange={(e) => setSectionForm({ ...sectionForm, emoji: e.target.value })}
                  className="text-center text-lg"
                  maxLength={4}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Kategori Adı *</Label>
                <Input
                  value={sectionForm.title}
                  onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })}
                  placeholder="Örn: Vitrin Düzeni"
                  autoFocus
                />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border p-3">
              <div>
                <p className="text-sm font-medium">Fotoğraf zorunlu</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Personel fotoğraf çekmeden bu kategoriyi tamamlayamaz
                </p>
              </div>
              <Switch
                checked={sectionForm.photoRequired}
                onCheckedChange={(v) => setSectionForm({ ...sectionForm, photoRequired: v })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSectionDialog(false)}>İptal</Button>
            <Button onClick={handleSaveSection} disabled={!sectionForm.title.trim()}>
              {editSection ? "Kaydet" : "Ekle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Kategori silme onayı */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kategoriyi sil</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deleteTarget?.emoji} {deleteTarget?.title}</strong> kategorisi ve{" "}
              {deleteTarget?.items.length} maddesi şablondan silinecek. Yeni kontroller bu
              kategori olmadan oluşturulur; geçmiş kayıtlar etkilenmez.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSection}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
