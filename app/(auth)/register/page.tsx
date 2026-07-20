"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, Loader2, MapPin, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import { KupaLogo } from "@/components/kupa-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getPublicBranches, registerPersonnel, type PersonnelRegistrationReason } from "@/lib/db";
import type { Branch } from "@/types";
import { toast } from "sonner";

const reasonMessages: Record<PersonnelRegistrationReason, string> = {
  invalid_name: "Ad soyad en az 3 karakter olmalı.",
  invalid_username: "Kullanıcı adı 3-30 karakter olmalı; yalnızca küçük harf, rakam, nokta ve alt çizgi kullanılabilir.",
  weak_password: "Şifre en az 6 karakter olmalı.",
  invalid_branch: "Geçerli ve aktif bir şube seçin.",
  username_taken: "Bu kullanıcı adı daha önce alınmış.",
  unknown: "Kayıt oluşturulamadı. Lütfen daha sonra tekrar deneyin.",
};

export default function RegisterPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(true);
  const [branchError, setBranchError] = useState(false);
  const [form, setForm] = useState({ name: "", username: "", branchId: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState(false);

  const loadBranches = useCallback(() => {
    setBranchesLoading(true);
    setBranchError(false);
    getPublicBranches()
      .then(setBranches)
      .catch(() => {
        setBranchError(true);
        toast.error("Şubeler yüklenemedi.");
      })
      .finally(() => setBranchesLoading(false));
  }, []);

  useEffect(() => {
    loadBranches();
  }, [loadBranches]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    const username = form.username.trim().toLowerCase();
    if (!name || !username || !form.branchId || !form.password) {
      toast.error("Tüm alanları doldurun.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Şifreler eşleşmiyor.");
      return;
    }
    setSaving(true);
    try {
      const result = await registerPersonnel({ name, username, password: form.password, branchId: form.branchId });
      if (!result.ok) {
        toast.error(reasonMessages[result.reason]);
        return;
      }
      setCompleted(true);
    } catch {
      toast.error("Kayıt oluşturulamadı. Bağlantınızı kontrol edip tekrar deneyin.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-[420px_1fr] bg-background">
      <aside className="hidden lg:flex flex-col bg-[hsl(222,47%,11%)] p-10 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-28 -right-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative">
          <KupaLogo variant="dark" width={140} height={100} />
        </div>
        <div className="relative mt-auto mb-8">
          <div className="h-11 w-11 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center mb-5">
            <UserPlus className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-white leading-tight">Kupa Coffee ekibine katılın.</h1>
          <p className="mt-3 text-sm leading-relaxed text-white/50">
            Şubenizi seçerek kayıt başvurunuzu oluşturun. Hesabınız yönetici onayından sonra kullanıma açılır.
          </p>
        </div>
        <p className="relative text-xs text-white/25">© 2026 Kupa Academy</p>
      </aside>

      <main className="flex items-center justify-center px-5 py-10 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[460px]"
        >
          <div className="lg:hidden mb-7 flex items-center justify-between">
            <KupaLogo variant="color" width={105} height={54} />
            <Button asChild variant="ghost" size="sm"><Link href="/login"><ArrowLeft className="h-4 w-4" /> Giriş</Link></Button>
          </div>

          {completed ? (
            <div className="text-center rounded-2xl border bg-card p-8 sm:p-10 shadow-sm">
              <div className="mx-auto h-14 w-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center dark:bg-emerald-950/50">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h2 className="mt-5 text-2xl font-bold">Başvurunuz alındı</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Hesabınız seçtiğiniz şube bilgisiyle oluşturuldu. Yönetici onayından sonra kullanıcı adınız ve şifrenizle giriş yapabilirsiniz.
              </p>
              <Button asChild className="mt-6 w-full"><Link href="/login">Giriş ekranına dön <ArrowRight className="h-4 w-4" /></Link></Button>
            </div>
          ) : (
            <>
              <div className="mb-7">
                <Button asChild variant="ghost" size="sm" className="hidden lg:inline-flex -ml-3 mb-4 text-muted-foreground">
                  <Link href="/login"><ArrowLeft className="h-4 w-4" /> Giriş ekranına dön</Link>
                </Button>
                <h2 className="text-2xl font-bold tracking-tight">Personel kayıt başvurusu</h2>
                <p className="mt-1.5 text-sm text-muted-foreground">Bilgilerinizi eksiksiz doldurun; hesabınız yönetici onayına gönderilsin.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Ad Soyad</Label>
                  <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ad Soyad" autoComplete="name" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="username">Kullanıcı Adı</Label>
                  <Input id="username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase() })} placeholder="ad.soyad" autoComplete="username" required />
                  <p className="text-[11px] text-muted-foreground">Küçük harf, rakam, nokta ve alt çizgi kullanabilirsiniz.</p>
                </div>
                <div className="space-y-1.5">
                  <Label>Şube</Label>
                  <Select value={form.branchId} onValueChange={(branchId) => setForm({ ...form, branchId })} disabled={branchesLoading}>
                    <SelectTrigger><SelectValue placeholder={branchesLoading ? "Şubeler yükleniyor..." : branchError ? "Şubeler yüklenemedi" : "Çalıştığınız şubeyi seçin"} /></SelectTrigger>
                    <SelectContent>
                      {branches.map((branch) => <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {branchError && (
                    <button type="button" onClick={loadBranches} className="text-xs font-semibold text-primary hover:underline">Şubeleri tekrar yükle</button>
                  )}
                  <p className="flex items-center gap-1 text-[11px] text-muted-foreground"><MapPin className="h-3 w-3" /> Operasyon kayıtlarınız bu şubeyle eşleşir.</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="password">Şifre</Label>
                    <div className="relative">
                      <Input id="password" type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="En az 6 karakter" autoComplete="new-password" className="pr-10" required />
                      <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword">Şifre Tekrar</Label>
                    <Input id="confirmPassword" type={showPassword ? "text" : "password"} value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} placeholder="Şifrenizi tekrar yazın" autoComplete="new-password" required />
                  </div>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                  Kayıt sonrasında hemen giriş yapılamaz. Hesabınız Kupa Academy yöneticisi tarafından onaylandığında aktif olur.
                </div>
                <Button type="submit" className="w-full" disabled={saving || branchesLoading || branches.length === 0}>
                  {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Başvuru gönderiliyor...</> : <>Kayıt Başvurusu Oluştur <ArrowRight className="h-4 w-4" /></>}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Zaten hesabınız var mı? <Link href="/login" className="font-semibold text-primary hover:underline">Giriş yapın</Link>
              </p>
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
}
