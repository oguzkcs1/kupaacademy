"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap, Video, ChefHat, ClipboardCheck, Camera, BarChart3,
  ArrowRight, Building2, Sunrise, ShieldCheck, Sparkles, CheckCircle2,
  ListTodo, Users, Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { KupaLogo } from "@/components/kupa-logo";
import { useAuthStore } from "@/lib/store";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.4, 0, 0.2, 1] as const },
  }),
};

const academyFeatures = [
  { icon: GraduationCap, title: "Dijital Eğitimler", desc: "Tüm operasyon eğitimleri, sınavlar ve sertifikalar tek platformda." },
  { icon: Video, title: "Video Kütüphanesi", desc: "Barista teknikleri ve süreç videolarına her an erişim." },
  { icon: ChefHat, title: "Reçete Yönetimi", desc: "Standart reçeteler, maliyetler ve sunum detayları dijital arşivde." },
];

const opsFeatures = [
  { icon: Sunrise, title: "Açılış & Kapanış Kontrolü", desc: "Şubeler her gün fotoğraflı kontrol listesini sistemden doldurur." },
  { icon: Camera, title: "Fotoğraf Denetimi", desc: "WhatsApp'a son. Her kategori fotoğrafı tarih, şube ve personelle kayıt altında." },
  { icon: ClipboardCheck, title: "Merkezî Puanlama", desc: "Genel merkez tüm şubeleri tek panelden değerlendirir ve onaylar." },
  { icon: BarChart3, title: "Raporlar & Analiz", desc: "Şube karşılaştırması, operasyon puanı ve trendler anlık grafiklerle." },
];

const stats = [
  { value: "2", label: "Ana Modül" },
  { value: "7/24", label: "Erişim" },
  { value: "%100", label: "Dijital Kayıt" },
];

export default function LandingPage() {
  const { isAuthenticated, _hasHydrated } = useAuthStore();
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  const ctaHref = ready && _hasHydrated && isAuthenticated ? "/dashboard" : "/login";
  const ctaLabel = ready && _hasHydrated && isAuthenticated ? "Panele Git" : "Giriş Yap";

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ── Nav ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0f1729]/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <KupaLogo variant="dark" width={104} height={52} />
          <div className="flex items-center gap-1.5 sm:gap-3">
            <Button asChild variant="ghost" size="sm" className="font-medium hidden sm:inline-flex text-white/80 hover:text-white hover:bg-white/10">
              <Link href="/biz-kimiz">Biz Kimiz?</Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="font-medium text-white/80 hover:text-white hover:bg-white/10">
              <Link href="/kariyer">Kariyer</Link>
            </Button>
            <Button asChild size="sm" className="font-medium">
              <Link href={ctaHref}>
                {ctaLabel}
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────── */}
      <section className="relative">
        {/* dekoratif arka plan */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute top-20 right-0 w-[400px] h-[400px] rounded-full bg-amber-500/5 blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto px-5 pt-20 pb-16 sm:pt-28 sm:pb-24 text-center">
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Dijital Operasyon & Eğitim Platformu
          </motion.div>

          <motion.h1 variants={fadeUp} initial="hidden" animate="show" custom={1}
            className="text-4xl sm:text-6xl font-bold tracking-tight leading-[1.05] max-w-3xl mx-auto">
            Kahve operasyonunuzu{" "}
            <span className="bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">
              tek merkezden
            </span>{" "}
            yönetin
          </motion.h1>

          <motion.p variants={fadeUp} initial="hidden" animate="show" custom={2}
            className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Kupa Academy; eğitimden günlük şube denetimine, reçetelerden performans
            raporlarına kadar tüm operasyonunuzu dijitalleştiren kurumsal platformdur.
          </motion.p>

          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3}
            className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild size="lg" className="font-medium shadow-lg shadow-primary/25 min-w-44">
              <Link href={ctaHref}>{ctaLabel}<ArrowRight className="w-4 h-4 ml-1.5" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="font-medium">
              <a href="#moduller">Modülleri Keşfet</a>
            </Button>
          </motion.div>

          {/* istatistikler */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={4}
            className="mt-16 flex items-center justify-center gap-10 sm:gap-16">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl sm:text-4xl font-bold tracking-tight">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Biz Kimiz? (kısa tanıtım) ───────────────────── */}
      <section className="bg-muted/30 border-y border-border/60">
        <div className="max-w-4xl mx-auto px-5 py-16 sm:py-20 text-center">
          <p className="text-sm font-medium text-primary uppercase tracking-wider mb-4">
            Biz Kimiz?
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight leading-snug">
            Amasya'da başlayan yolculuk;{" "}
            <span className="text-primary">Konya, Ankara, Denizli ve Samsun</span>'da devam ediyor
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Kupa Coffee olarak her şubemizde aynı kültürü, aynı kaliteyi ve aynı tutkuyu
            yaşatmayı hedefliyoruz. Kupa Academy de tam olarak bunun için var — çünkü
            gerçek gücümüz, şubelerimizde çalışan insanlarımızdır.
          </p>
          <div className="mt-7">
            <Button asChild variant="outline" size="lg" className="font-medium">
              <Link href="/biz-kimiz">Hikâyemizi Keşfet<ArrowRight className="w-4 h-4 ml-1.5" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── İki Ana Modül ───────────────────────────────── */}
      <section id="moduller" className="max-w-6xl mx-auto px-5 py-16 sm:py-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">İki güçlü modül, tek platform</h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Ekibinizi eğitin, operasyonunuzu denetleyin — hepsi aynı sistemde.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Academy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="rounded-2xl border border-border bg-card p-7 hover:shadow-lg transition-shadow"
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
              <GraduationCap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Kupa Academy</h3>
            <p className="text-sm text-muted-foreground mt-1.5 mb-5">
              Ekibinizin bilgi ve gelişim merkezi.
            </p>
            <ul className="space-y-3">
              {academyFeatures.map((f) => (
                <li key={f.title} className="flex gap-3">
                  <f.icon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">{f.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Operasyon Merkezi */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/[0.06] to-transparent p-7 hover:shadow-lg transition-shadow relative overflow-hidden"
          >
            <div className="absolute top-4 right-4">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/10 rounded-full px-2.5 py-1">
                Yeni
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center mb-5">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Operasyon Merkezi</h3>
            <p className="text-sm text-muted-foreground mt-1.5 mb-5">
              Tüm şubeleri tek panelden yönetin ve denetleyin.
            </p>
            <ul className="space-y-3">
              {opsFeatures.map((f) => (
                <li key={f.title} className="flex gap-3">
                  <f.icon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">{f.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* ── Nasıl Çalışır ───────────────────────────────── */}
      <section className="bg-muted/30 border-y border-border/60">
        <div className="max-w-6xl mx-auto px-5 py-16 sm:py-24">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Nasıl çalışır?</h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Şube personeli fotoğraflar, merkez değerlendirir — her şey kayıt altında.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { n: "01", icon: Camera, title: "Personel fotoğraflar", desc: "Şube açılış/kapanışta her kategorinin fotoğrafını sistemden yükler." },
              { n: "02", icon: ClipboardCheck, title: "Merkez puanlar", desc: "Genel merkez fotoğrafları inceleyip her maddeyi puanlar ve onaylar." },
              { n: "03", icon: BarChart3, title: "Rapor oluşur", desc: "Operasyon puanı, şube karşılaştırması ve trendler anlık raporlanır." },
            ].map((step, i) => (
              <motion.div key={step.n}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative rounded-2xl bg-card border border-border p-6"
              >
                <span className="text-5xl font-bold text-primary/10 absolute top-4 right-5">{step.n}</span>
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <step.icon className="w-5 h-5 text-primary" />
                </div>
                <p className="font-semibold">{step.title}</p>
                <p className="text-sm text-muted-foreground mt-1.5">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Firma / Değerler ────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-5 py-16 sm:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}
          >
            <KupaLogo variant="color" width={140} height={70} />
            <h2 className="text-3xl font-bold tracking-tight mt-6">
              Kalite, tutarlılık ve şeffaflık
            </h2>
            <p className="text-muted-foreground mt-4 leading-relaxed">
              Kupa Coffee Co. olarak her şubemizde aynı kaliteyi sunmayı hedefliyoruz.
              Bu platform, operasyon standartlarımızı dijitalleştirerek her şubede
              tutarlı deneyim, eğitimli ekipler ve şeffaf denetim sağlıyor.
            </p>
            <ul className="mt-6 space-y-2.5">
              {[
                "Tüm şubelerde standart operasyon",
                "Eğitimli ve sertifikalı ekipler",
                "Şeffaf, kayıt altında denetim süreci",
              ].map((t) => (
                <li key={t} className="flex items-center gap-2.5 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="grid grid-cols-2 gap-4"
          >
            {[
              { icon: ShieldCheck, title: "Güvenli", desc: "Rol bazlı erişim" },
              { icon: Users, title: "Ekip Odaklı", desc: "Şube & personel yönetimi" },
              { icon: ListTodo, title: "Görev Takibi", desc: "Merkezden görev atama" },
              { icon: Star, title: "Performans", desc: "Puan & rozet sistemi" },
            ].map((c) => (
              <div key={c.title} className="rounded-2xl border border-border bg-card p-5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <c.icon className="w-5 h-5 text-primary" />
                </div>
                <p className="font-semibold text-sm">{c.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{c.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-5 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="relative rounded-3xl overflow-hidden bg-[hsl(222,47%,11%)] px-8 py-14 sm:py-16 text-center"
        >
          <div className="absolute -top-24 left-1/3 w-80 h-80 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Operasyonunuzu dijitalleştirmeye hazır mısınız?
            </h2>
            <p className="text-white/60 mt-3 max-w-lg mx-auto">
              Ekibinizle giriş yapın, açılış kontrolünden raporlara kadar her şey elinizin altında.
            </p>
            <Button asChild size="lg" className="mt-8 font-medium shadow-lg shadow-primary/30 min-w-48">
              <Link href={ctaHref}>{ctaLabel}<ArrowRight className="w-4 h-4 ml-1.5" /></Link>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="border-t border-border/60">
        <div className="max-w-6xl mx-auto px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <KupaLogo variant="color" width={88} height={44} />
          <div className="flex items-center gap-5">
            <Link href="/biz-kimiz" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Biz Kimiz?</Link>
            <Link href="/kariyer" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Kariyer</Link>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Kupa Coffee Co. — Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
