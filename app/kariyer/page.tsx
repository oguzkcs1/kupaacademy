"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Loader2, CheckCircle2, Upload, FileText, X, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { KupaLogo } from "@/components/kupa-logo";
import { generateId } from "@/lib/utils";
import * as db from "@/lib/db";
import { toast } from "sonner";
import type { JobApplication } from "@/types";

const cities = ["Amasya", "Konya", "Ankara", "Denizli", "Samsun", "Farketmez"];
const positions = ["Barista", "Servis Personeli", "Kasiyer", "Şube Sorumlusu", "Şube Müdürü", "Diğer"];
const experiences = ["Deneyimim yok", "1 yıldan az", "1-3 yıl", "3-5 yıl", "5+ yıl"];

const empty = {
  fullName: "", phone: "", email: "", city: "", position: "", experience: "", message: "",
};

export default function CareerPage() {
  const [form, setForm] = useState(empty);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (k: keyof typeof empty, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      toast.error("Dosya en fazla 5 MB olabilir");
      return;
    }
    setCvFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.phone.trim()) {
      toast.error("Ad soyad ve telefon zorunludur");
      return;
    }
    setSubmitting(true);
    try {
      let cvUrl: string | undefined;
      let cvPath: string | undefined;
      if (cvFile) {
        const up = await db.uploadCV(cvFile);
        cvUrl = up.url;
        cvPath = up.path;
      }
      const application: JobApplication = {
        id: `app-${generateId()}`,
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        city: form.city || undefined,
        position: form.position || undefined,
        experience: form.experience || undefined,
        message: form.message.trim() || undefined,
        cvUrl,
        cvPath,
        status: "new",
        createdAt: new Date().toISOString(),
      };
      await db.insertJobApplication(application);
      setDone(true);
    } catch (err) {
      console.error("[career] submit error", err);
      toast.error("Başvuru gönderilemedi — lütfen tekrar deneyin");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/"><KupaLogo variant="color" width={104} height={52} /></Link>
          <Button asChild variant="ghost" size="sm" className="font-medium">
            <Link href="/"><ArrowLeft className="w-4 h-4 mr-1.5" />Ana Sayfa</Link>
          </Button>
        </div>
      </header>

      {done ? (
        /* Başarı ekranı */
        <div className="max-w-lg mx-auto px-5 py-24 text-center">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 rounded-3xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </motion.div>
          <h1 className="text-2xl font-bold tracking-tight">Başvurunuz alındı 🎉</h1>
          <p className="text-muted-foreground mt-3">
            Kupa Coffee ailesine ilgi gösterdiğiniz için teşekkürler.
            Başvurunuzu değerlendirip sizinle en kısa sürede iletişime geçeceğiz.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link href="/">Ana Sayfaya Dön</Link>
          </Button>
        </div>
      ) : (
        <>
          {/* Hero */}
          <section className="relative">
            <div className="absolute inset-0 -z-10 overflow-hidden">
              <div className="absolute -top-40 left-1/3 w-[500px] h-[500px] rounded-full bg-primary/10 blur-3xl" />
            </div>
            <div className="max-w-2xl mx-auto px-5 pt-16 pb-8 sm:pt-20 text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary mb-5">
                <Sparkles className="w-3.5 h-3.5" />Ekibimize Katıl
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
                Kupa Coffee ailesinin{" "}
                <span className="bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">
                  bir parçası
                </span>{" "}
                ol
              </h1>
              <p className="mt-4 text-muted-foreground">
                Büyüyen ekibimize katılmak için başvuru formunu doldur. Her başvuru bizim için değerli.
              </p>
            </div>
          </section>

          {/* Form */}
          <section className="max-w-2xl mx-auto px-5 pb-20">
            <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Ad Soyad *</Label>
                  <Input value={form.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="Ad Soyad" />
                </div>
                <div className="space-y-1.5">
                  <Label>Telefon *</Label>
                  <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="05xx xxx xx xx" type="tel" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>E-posta</Label>
                <Input value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="ornek@eposta.com" type="email" />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Tercih Edilen Şehir</Label>
                  <Select value={form.city} onValueChange={(v) => set("city", v)}>
                    <SelectTrigger><SelectValue placeholder="Şehir seçin" /></SelectTrigger>
                    <SelectContent>
                      {cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Pozisyon</Label>
                  <Select value={form.position} onValueChange={(v) => set("position", v)}>
                    <SelectTrigger><SelectValue placeholder="Pozisyon seçin" /></SelectTrigger>
                    <SelectContent>
                      {positions.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Deneyim</Label>
                <Select value={form.experience} onValueChange={(v) => set("experience", v)}>
                  <SelectTrigger><SelectValue placeholder="Deneyim seviyeniz" /></SelectTrigger>
                  <SelectContent>
                    {experiences.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Ön Yazı / Not</Label>
                <Textarea
                  value={form.message}
                  onChange={(e) => set("message", e.target.value)}
                  placeholder="Kendinden kısaca bahset..."
                  rows={4}
                />
              </div>

              {/* CV yükleme */}
              <div className="space-y-1.5">
                <Label>CV (opsiyonel · PDF, max 5MB)</Label>
                {cvFile ? (
                  <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3">
                    <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm flex-1 truncate">{cvFile.name}</span>
                    <button type="button" onClick={() => setCvFile(null)} className="text-muted-foreground hover:text-destructive">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-border hover:border-primary/50 px-4 py-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Upload className="w-4 h-4" />CV Yükle
                  </button>
                )}
                <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFile} />
              </div>

              <Button type="submit" size="lg" className="w-full font-medium" disabled={submitting}>
                {submitting ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Gönderiliyor…</>
                ) : (
                  <>Başvuruyu Gönder<ArrowRight className="w-4 h-4 ml-1.5" /></>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Bilgileriniz yalnızca işe alım süreçlerinde kullanılır.
              </p>
            </form>
          </section>
        </>
      )}

      {/* Footer */}
      <footer className="border-t border-border/60">
        <div className="max-w-6xl mx-auto px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <KupaLogo variant="color" width={88} height={44} />
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Kupa Coffee Co. — Tüm hakları saklıdır.
          </p>
        </div>
      </footer>
    </div>
  );
}
