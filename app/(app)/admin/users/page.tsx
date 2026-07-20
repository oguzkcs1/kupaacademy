"use client";

import { useState } from "react";
import {
  Plus, Search, MoreHorizontal, Edit, Trash2, KeyRound, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDataStore } from "@/lib/data-store";
import { ROLE_LABELS, getInitials, formatRelativeTime, generateId } from "@/lib/utils";
import { toast } from "sonner";
import type { User, UserRole } from "@/types";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const roleColors: Record<string, string> = {
  admin: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  barista: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
};

export default function AdminUsersPage() {
  const { users, branches, updateUser, deleteUser } = useDataStore();
  const [search, setSearch] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [resetUser, setResetUser] = useState<User | null>(null);

  const filtered = users.filter(
    (u) =>
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase())
  );

  const getBranchName = (branchId?: string) =>
    branches.find((b) => b.id === branchId)?.name || "-";

  const handleToggleStatus = (id: string, current: string) => {
    updateUser(id, { status: current === "active" ? "inactive" : "active" });
    toast.success("Durum güncellendi");
  };

  const handleDelete = (u: User) => {
    if (u.role === "admin") { toast.error("Yönetici silinemez"); return; }
    deleteUser(u.id);
    toast.success("Kullanıcı silindi");
  };

  const activeCount = users.filter((u) => u.status === "active").length;

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Kullanıcı Yönetimi</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {activeCount} aktif · {users.length - activeCount} pasif kullanıcı
          </p>
        </div>
        <Button size="sm" onClick={() => setShowNewModal(true)}>
          <Plus className="w-4 h-4" />
          Yeni Kullanıcı
        </Button>
      </motion.div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="İsim veya kullanıcı adı ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9 text-sm"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {filtered.map((user, i) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
              >
                <Avatar className="h-9 w-9 flex-shrink-0">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm">{user.name}</p>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", roleColors[user.role])}>
                      {ROLE_LABELS[user.role]}
                    </span>
                    {user.status === "inactive" && (
                      <Badge variant="outline" className="text-xs text-muted-foreground">Pasif</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                    <span className="font-mono">@{user.username}</span>
                    {user.branchId && (
                      <>
                        <span>·</span>
                        <span>{getBranchName(user.branchId)}</span>
                      </>
                    )}
                    {user.lastLoginAt && (
                      <>
                        <span>·</span>
                        <span>Son giriş: {formatRelativeTime(user.lastLoginAt)}</span>
                      </>
                    )}
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setEditUser(user)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Düzenle
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setResetUser(user)}>
                      <KeyRound className="mr-2 h-4 w-4" />
                      Şifre Sıfırla
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleToggleStatus(user.id, user.status)}>
                      {user.status === "active" ? "Pasife Al" : "Aktif Et"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDelete(user)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Sil
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            ))}

            {filtered.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>Kullanıcı bulunamadı</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <NewUserDialog open={showNewModal} onClose={() => setShowNewModal(false)} />
      {editUser && (
        <EditUserDialog user={editUser} onClose={() => setEditUser(null)} />
      )}
      {resetUser && (
        <ResetPasswordDialog user={resetUser} onClose={() => setResetUser(null)} />
      )}
    </div>
  );
}

function NewUserDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addUser, branches, users } = useDataStore();
  const emptyForm = { name: "", username: "", password: "", role: "barista" as UserRole, branchId: "", department: "", position: "" };
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const name = form.name.trim();
    const username = form.username.trim();
    const password = form.password.trim();
    if (!name || !username || !password) {
      toast.error("Ad, kullanıcı adı ve şifre zorunlu");
      return;
    }
    if (password.length < 6) {
      toast.error("Şifre en az 6 karakter olmalı");
      return;
    }
    if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
      toast.error("Bu kullanıcı adı zaten kullanılıyor");
      return;
    }
    setSaving(true);
    try {
      const newUser: User = {
        id: `user-${generateId()}`,
        name,
        username,
        password,
        role: form.role,
        companyId: "company-1",
        branchId: form.branchId || undefined,
        department: form.department.trim() || undefined,
        position: form.position.trim() || undefined,
        status: "active",
        badges: [],
        createdAt: new Date().toISOString(),
      };
      await addUser(newUser);
      toast.success(form.role === "admin" ? "Yönetici hesabı oluşturuldu" : "Barista hesabı oluşturuldu");
      setForm(emptyForm);
      onClose();
    } catch (err) {
      console.error("[user create]", err);
      const msg = err instanceof Error ? err.message : "Kayıt oluşturulamadı";
      toast.error(msg.includes("duplicate") || msg.includes("unique")
        ? "Bu kullanıcı adı zaten var"
        : `Hata: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && !saving && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Yeni Kullanıcı Ekle</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Ad Soyad *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ad Soyad" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Kullanıcı Adı *</Label>
              <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="ad.soyad" autoComplete="off" />
            </div>
            <div className="space-y-1.5">
              <Label>Şifre *</Label>
              <Input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} type="password" placeholder="En az 6 karakter" autoComplete="new-password" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Rol *</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as UserRole })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="barista">Barista</SelectItem>
                  <SelectItem value="admin">Yönetici (Admin)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Şube</Label>
              <Select value={form.branchId} onValueChange={(v) => setForm({ ...form, branchId: v })}>
                <SelectTrigger><SelectValue placeholder="Şube seçin" /></SelectTrigger>
                <SelectContent>
                  {branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Departman</Label>
              <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="Barista, Yönetim..." />
            </div>
            <div className="space-y-1.5">
              <Label>Pozisyon</Label>
              <Input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} placeholder="Kıdemli Barista..." />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>İptal</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? "Ekleniyor..." : "Kullanıcı Ekle"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditUserDialog({ user, onClose }: { user: User; onClose: () => void }) {
  const { updateUser, branches } = useDataStore();
  const [form, setForm] = useState({
    name: user.name,
    branchId: user.branchId ?? "",
    department: user.department ?? "",
    position: user.position ?? "",
    status: user.status,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Ad soyad zorunlu"); return; }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    updateUser(user.id, {
      name: form.name,
      branchId: form.branchId || undefined,
      department: form.department || undefined,
      position: form.position || undefined,
      status: form.status,
    });
    setSaving(false);
    toast.success("Kullanıcı güncellendi");
    onClose();
  };

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Kullanıcı Düzenle</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Ad Soyad</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Kullanıcı Adı</Label>
            <Input value={user.username} disabled className="opacity-60 font-mono" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Şube</Label>
              <Select value={form.branchId} onValueChange={(v) => setForm({ ...form, branchId: v })}>
                <SelectTrigger><SelectValue placeholder="Şube seçin" /></SelectTrigger>
                <SelectContent>
                  {branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Durum</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as "active" | "inactive" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Pasif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Departman</Label>
              <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="Barista, Servis..." />
            </div>
            <div className="space-y-1.5">
              <Label>Pozisyon</Label>
              <Input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} placeholder="Kıdemli Barista..." />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>İptal</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? "Kaydediliyor..." : "Kaydet"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ResetPasswordDialog({ user, onClose }: { user: User; onClose: () => void }) {
  const { updateUser } = useDataStore();
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleReset = async () => {
    if (newPassword.length < 6) { toast.error("Şifre en az 6 karakter olmalı"); return; }
    setSaving(true);
    try {
      await updateUser(user.id, { password: newPassword });
      toast.success(`${user.name} için şifre sıfırlandı`);
      onClose();
    } catch {
      toast.error("Şifre sıfırlanamadı. Lütfen tekrar deneyin.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Şifre Sıfırla</DialogTitle></DialogHeader>
        <div className="space-y-3 py-2">
          <p className="text-sm text-muted-foreground">
            <strong>{user.name}</strong> (@{user.username}) için yeni şifre belirle.
          </p>
          <div className="space-y-1.5">
            <Label>Yeni Şifre</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="En az 6 karakter"
              autoComplete="new-password"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>İptal</Button>
          <Button onClick={handleReset} disabled={saving}>{saving ? "Sıfırlanıyor..." : "Sıfırla"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
