"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Store, Plus, Pencil, Trash2, MapPin, Users as UsersIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useDataStore } from "@/lib/data-store";
import { generateId } from "@/lib/utils";
import { toast } from "sonner";
import type { Branch } from "@/types";

const emptyForm = { name: "", address: "", status: "active" as Branch["status"] };

export default function AdminBranchesPage() {
  const { branches, users, addBranch, updateBranch, deleteBranch } = useDataStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Branch | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Branch | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const staffCount = (branchId: string) =>
    users.filter((u) => u.branchId === branchId && u.status === "active").length;

  const openNew = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (b: Branch) => {
    setEditTarget(b);
    setForm({ name: b.name, address: b.address ?? "", status: b.status });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Şube adı zorunlu");
      return;
    }
    setSaving(true);
    try {
      if (editTarget) {
        await updateBranch(editTarget.id, {
          name: form.name.trim(),
          address: form.address.trim() || undefined,
          status: form.status,
        });
        toast.success("Şube güncellendi");
      } else {
        await addBranch({
          id: `branch-${generateId()}`,
          name: form.name.trim(),
          companyId: "company-1",
          address: form.address.trim() || undefined,
          status: form.status,
        });
        toast.success("Şube oluşturuldu");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Kaydedilirken hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteBranch(deleteTarget.id);
      toast.success("Şube silindi");
      setDeleteTarget(null);
    } catch {
      toast.error("Silinirken hata oluştu — şubeye bağlı kayıtlar olabilir");
    }
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Store className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Şube Yönetimi</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {branches.filter((b) => b.status === "active").length} aktif ·{" "}
              {branches.filter((b) => b.status === "inactive").length} pasif şube
            </p>
          </div>
        </div>
        <Button size="sm" onClick={openNew}>
          <Plus className="w-4 h-4" />Yeni Şube
        </Button>
      </motion.div>

      <Card>
        <CardContent className="p-0">
          {branches.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Store className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>Henüz şube yok</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {branches.map((b, i) => (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                    <Store className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm">{b.name}</p>
                      {b.status === "inactive" && (
                        <Badge variant="outline" className="text-xs text-muted-foreground">Pasif</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <UsersIcon className="w-3 h-3" />{staffCount(b.id)} personel
                      </span>
                      {b.address && (
                        <span className="flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 flex-shrink-0" />{b.address}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(b)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(b)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ekle / Düzenle */}
      <Dialog open={dialogOpen} onOpenChange={(v) => !v && setDialogOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Şube Düzenle" : "Yeni Şube"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Şube Adı *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Örn: Moda Şubesi"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label>Adres</Label>
              <Input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Mahalle, cadde, no..."
              />
            </div>
            <div className="space-y-1.5">
              <Label>Durum</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm({ ...form, status: v as Branch["status"] })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Pasif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>İptal</Button>
            <Button onClick={handleSave} disabled={!form.name.trim() || saving}>
              {saving ? "Kaydediliyor..." : editTarget ? "Kaydet" : "Oluştur"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Silme onayı */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Şubeyi sil</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deleteTarget?.name}</strong> silinecek.
              {deleteTarget && staffCount(deleteTarget.id) > 0 && (
                <span className="block mt-1 text-orange-600 font-medium">
                  Bu şubede {staffCount(deleteTarget.id)} personel var — şubesiz kalacak.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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
