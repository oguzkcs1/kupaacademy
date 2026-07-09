"use client";

import { useState } from "react";
import { Tag, Pencil, Trash2, ChefHat, Plus, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDataStore } from "@/lib/data-store";
import { generateId } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import type { Category } from "@/types";

export default function AdminCategoriesPage() {
  const { categories, recipes, trainings, videos, addCategory, updateCategory, deleteCategory } = useDataStore();

  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [newName, setNewName] = useState("");
  const [addingType, setAddingType] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const typeLabels: Record<string, string> = {
    recipe: "Reçete",
    training: "Eğitim",
    video: "Video",
  };

  const grouped = ["recipe", "training", "video"].map((type) => ({
    type,
    label: typeLabels[type],
    items: categories.filter((c) => c.type === type),
  }));

  const getItemsInCategory = (catId: string, type: string) => {
    if (type === "recipe") return recipes.filter((r) => r.categoryId === catId);
    if (type === "training") return trainings.filter((t) => t.categoryId === catId);
    if (type === "video") return videos.filter((v) => v.categoryId === catId);
    return [];
  };

  const handleEdit = (cat: Category) => {
    setEditTarget(cat);
    setEditName(cat.name);
  };

  const handleSaveEdit = async () => {
    if (!editTarget || !editName.trim()) return;
    setSaving(true);
    try {
      await updateCategory(editTarget.id, {
        name: editName.trim(),
        slug: editName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      });
      toast.success("Kategori güncellendi");
      setEditTarget(null);
    } catch {
      toast.error("Güncellenirken hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const count = getItemsInCategory(deleteTarget.id, deleteTarget.type).length;
    try {
      await deleteCategory(deleteTarget.id);
      toast.success(`Kategori silindi${count > 0 ? ` (${count} ürün kategorisiz kaldı)` : ""}`);
      setDeleteTarget(null);
    } catch {
      toast.error("Silinirken hata oluştu");
    }
  };

  const handleAdd = async (type: string) => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const cat: Category = {
        id: `cat-${generateId()}`,
        name: newName.trim(),
        slug: newName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        type: type as Category["type"],
        order: categories.filter((c) => c.type === type).length + 1,
      };
      await addCategory(cat);
      toast.success("Kategori eklendi");
      setNewName("");
      setAddingType(null);
    } catch {
      toast.error("Eklenirken hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Kategori Yönetimi</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{categories.length} kategori</p>
      </div>

      {grouped.map(({ type, label, items }) => (
        <Card key={type}>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Tag className="w-4 h-4 text-muted-foreground" />
              {label} Kategorileri
              <Badge variant="secondary" className="text-xs">{items.length}</Badge>
            </CardTitle>
            <Button size="sm" variant="outline" onClick={() => { setAddingType(type); setNewName(""); }}>
              <Plus className="w-3.5 h-3.5" />Ekle
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {addingType === type && (
              <div className="flex gap-2 mb-3">
                <Input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Kategori adı..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAdd(type);
                    if (e.key === "Escape") setAddingType(null);
                  }}
                />
                <Button size="icon" onClick={() => handleAdd(type)} disabled={!newName.trim() || saving}>
                  <Check className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => setAddingType(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

            {items.length === 0 && addingType !== type && (
              <p className="text-sm text-muted-foreground py-2">Henüz kategori yok</p>
            )}

            {items.map((cat) => {
              const contentItems = getItemsInCategory(cat.id, type);
              return (
                <div key={cat.id} className="border border-border rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 bg-muted/30">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{cat.name}</span>
                      <Badge variant="secondary" className="text-xs">{contentItems.length} ürün</Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(cat)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(cat)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  {contentItems.length > 0 && (
                    <div className="divide-y divide-border">
                      {contentItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-muted/20">
                          <ChefHat className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                          <Link
                            href={type === "recipe" ? `/recipes/${item.id}` : type === "training" ? `/trainings/${item.id}` : `/videos/${item.id}`}
                            className="flex-1 hover:text-primary transition-colors"
                          >
                            {"name" in item ? item.name : ("title" in item ? (item as { title: string }).title : item.id)}
                          </Link>
                          {"status" in item && (
                            <Badge variant={(item as { status: string }).status === "published" ? "default" : "secondary"} className="text-xs">
                              {(item as { status: string }).status === "published" ? "Yayında" : "Taslak"}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}

      {/* Edit Dialog */}
      <Dialog open={!!editTarget} onOpenChange={(v) => !v && setEditTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Kategori Düzenle</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditTarget(null)}>İptal</Button>
            <Button onClick={handleSaveEdit} disabled={!editName.trim() || saving}>
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kategoriyi sil</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deleteTarget?.name}</strong> kategorisi silinecek.
              {deleteTarget && getItemsInCategory(deleteTarget.id, deleteTarget.type).length > 0 && (
                <span className="block mt-1 text-orange-600 font-medium">
                  Bu kategoride {getItemsInCategory(deleteTarget.id, deleteTarget.type).length} ürün var — kategorisiz kalacak.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
