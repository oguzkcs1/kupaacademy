"use client";

import { useState } from "react";
import { Save, Award, Lock, KeyRound, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/lib/store";
import { useDataStore } from "@/lib/data-store";
import { ROLE_LABELS, getInitials, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { changePassword } from "@/lib/db";

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const { branches, badges: allBadges, updateUser, getUserBadges, getUserCompletions } = useDataStore();

  const [name, setName] = useState(user?.name ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  if (!user) return null;

  const branch = branches.find((b) => b.id === user.branchId);
  const userBadgeIds = getUserBadges(user.id).map((ub) => ub.badgeId);
  const earnedBadges = allBadges.filter((b) => userBadgeIds.includes(b.id));
  const lockedBadges = allBadges.filter((b) => !userBadgeIds.includes(b.id));
  const completionCount = getUserCompletions(user.id).length;

  const handleSaveProfile = async () => {
    if (!name.trim()) { toast.error("Ad soyad boş olamaz"); return; }
    setSaving(true);
    try {
      await updateUser(user.id, { name });
      setUser({ ...user, name });
      toast.success("Profil güncellendi");
    } catch {
      toast.error("Profil güncellenemedi. Lütfen tekrar deneyin.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) { toast.error("Mevcut ve yeni şifre zorunlu"); return; }
    if (newPassword.length < 6) { toast.error("Yeni şifre en az 6 karakter olmalı"); return; }
    setSavingPw(true);
    try {
      const changed = await changePassword(user.id, currentPassword, newPassword);
      if (!changed) {
        toast.error("Mevcut şifre hatalı");
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      toast.success("Şifre güncellendi");
    } catch {
      toast.error("Şifre güncellenemedi. Lütfen tekrar deneyin.");
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold tracking-tight">Profilim</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Hesap bilgilerini görüntüle ve düzenle</p>
      </motion.div>

      {/* Avatar + info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-5">
            <Avatar className="w-16 h-16 ring-2 ring-primary/20">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="text-xl bg-primary/10 text-primary font-bold">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-lg font-bold">{user.name}</h2>
              <p className="text-sm text-muted-foreground font-mono">@{user.username}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                  {ROLE_LABELS[user.role]}
                </Badge>
                {branch && <Badge variant="outline">{branch.name}</Badge>}
                {user.position && <Badge variant="outline">{user.position}</Badge>}
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-3xl font-bold text-primary">{completionCount}</p>
              <p className="text-xs text-muted-foreground">eğitim tamamlandı</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit name */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-primary" />
            Kişisel Bilgiler
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Ad Soyad</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Kullanıcı Adı</Label>
              <Input value={user.username} disabled className="opacity-60 font-mono" />
            </div>
            {user.department && (
              <div className="space-y-1.5">
                <Label>Departman</Label>
                <Input value={user.department} disabled className="opacity-60" />
              </div>
            )}
            {user.position && (
              <div className="space-y-1.5">
                <Label>Pozisyon</Label>
                <Input value={user.position} disabled className="opacity-60" />
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSaveProfile} disabled={saving} size="sm">
              <Save className="w-4 h-4" />
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-primary" />
            Şifre Değiştir
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Mevcut Şifre</Label>
              <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <div className="space-y-1.5">
              <Label>Yeni Şifre</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="En az 6 karakter" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleChangePassword} disabled={savingPw} variant="outline" size="sm">
              <KeyRound className="w-4 h-4" />
              {savingPw ? "Güncelleniyor..." : "Şifreyi Güncelle"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="w-4 h-4 text-primary" />
            Rozetler
            <span className="text-xs text-muted-foreground font-normal ml-1">
              {earnedBadges.length}/{allBadges.length} kazanıldı
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {earnedBadges.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {earnedBadges.map((badge) => (
                <div key={badge.id} className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-xl p-3">
                  <span className="text-2xl">{badge.icon}</span>
                  <div>
                    <p className="font-medium text-sm">{badge.name}</p>
                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {lockedBadges.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 opacity-50">
              {lockedBadges.map((badge) => (
                <div key={badge.id} className="flex items-center gap-3 bg-muted/40 rounded-xl p-3">
                  <span className="text-2xl grayscale">{badge.icon}</span>
                  <div>
                    <div className="flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <p className="font-medium text-sm">{badge.name}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {allBadges.length === 0 && (
            <p className="text-sm text-muted-foreground">Henüz rozet tanımlanmamış.</p>
          )}
        </CardContent>
      </Card>

      {user.createdAt && (
        <p className="text-xs text-muted-foreground text-center">
          Hesap oluşturulma tarihi: {formatDate(user.createdAt)}
        </p>
      )}
    </div>
  );
}
