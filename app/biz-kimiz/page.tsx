"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, MapPin, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KupaLogo } from "@/components/kupa-logo";

const cities = ["Amasya", "Konya", "Ankara", "Denizli", "Samsun"];

const paragraphs = [
  "Kupa Coffee'nin yolculuğu da Amasya'da açılan ilk şubemizle başladı. Büyük hayallerimiz, kaliteli hizmet anlayışımız ve misafirlerimize en iyi deneyimi sunma hedefimiz sayesinde bugün Konya, Ankara, Denizli ve Samsun'da faaliyet gösteren, büyümeye devam eden güçlü bir marka haline geldik.",
  "Özellikle Ankara'da gerçekleştirdiğimiz yatırımlarla her geçen gün daha da büyüyor, yeni şubeler açıyor ve daha fazla insana Kupa Coffee deneyimini ulaştırıyoruz. Ancak biliyoruz ki gerçek büyüme, sadece yeni şubeler açmakla değil; aynı kültürü, aynı kaliteyi ve aynı tutkuyu her şubede yaşatabilmekle mümkündür.",
];

const paragraphs2 = [
  "Kupa Academy, yalnızca bir eğitim platformu değildir. Burası Kupa Coffee kültürünü öğrenebileceğiniz, kendinizi geliştirebileceğiniz ve kariyerinizde bir sonraki adıma hazırlanabileceğiniz gelişim merkezidir.",
  "Burada tamamladığınız her eğitim, öğrendiğiniz her bilgi ve kazandığınız her beceri; hem sizin kişisel gelişiminize hem de Kupa Coffee'nin geleceğine katkı sağlar. Çünkü biz, başarının bireysel değil ekip işi olduğuna inanıyoruz.",
  "Bizim için her çalışan yalnızca bir personel değil; markamızı temsil eden en değerli ekip arkadaşımızdır. Misafirlerimizin yaşadığı her güzel deneyimin arkasında sizin emeğiniz, disiplininiz ve güler yüzünüz vardır.",
  "Kupa Coffee ailesinin bir parçası olduğunuz için teşekkür ederiz. Birlikte öğrenmeye, birlikte gelişmeye ve birlikte büyümeye devam edeceğiz.",
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ── Nav ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/">
            <KupaLogo variant="color" width={104} height={52} />
          </Link>
          <Button asChild variant="ghost" size="sm" className="font-medium">
            <Link href="/"><ArrowLeft className="w-4 h-4 mr-1.5" />Ana Sayfa</Link>
          </Button>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────── */}
      <section className="relative">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 left-1/3 w-[500px] h-[500px] rounded-full bg-primary/10 blur-3xl" />
        </div>
        <div className="max-w-3xl mx-auto px-5 pt-20 pb-10 sm:pt-28 text-center">
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-sm font-medium text-primary uppercase tracking-wider mb-4"
          >
            Biz Kimiz?
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1]"
          >
            Her büyük hikâye{" "}
            <span className="bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">
              küçük bir adımla
            </span>{" "}
            başlar
          </motion.h1>

          {/* Şehirler */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-2"
          >
            {cities.map((c) => (
              <span key={c} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium">
                <MapPin className="w-3 h-3 text-primary" />{c}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Hikâye ──────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-5 py-10 space-y-5">
        {paragraphs.map((p, i) => (
          <p key={i} className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            {p}
          </p>
        ))}
      </section>

      {/* ── Kupa Academy vurgusu ────────────────────────── */}
      <section className="max-w-3xl mx-auto px-5 py-6">
        <div className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/[0.07] to-transparent p-7 sm:p-9 text-center">
          <p className="text-lg font-semibold text-primary">
            İşte Kupa Academy tam da bu amaçla kuruldu.
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-5 py-6 space-y-5">
        {paragraphs2.map((p, i) => (
          <p key={i} className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            {p}
          </p>
        ))}
      </section>

      {/* ── Kapanış alıntısı ────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-5 py-12">
        <blockquote
          className="relative rounded-3xl overflow-hidden bg-[hsl(222,47%,11%)] px-8 py-12 sm:py-14 text-center"
        >
          <div className="absolute -top-20 left-1/3 w-72 h-72 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative">
            <Quote className="w-9 h-9 text-primary/60 mx-auto mb-5" />
            <p className="text-2xl sm:text-3xl font-bold text-white leading-snug max-w-2xl mx-auto">
              Çünkü Kupa Coffee'nin gerçek gücü, şubeleri değil; o şubelerde çalışan{" "}
              <span className="text-primary">insanlarıdır.</span>
            </p>
          </div>
        </blockquote>
      </section>

      {/* ── CTA ─────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-5 pb-20 text-center">
        <p className="text-muted-foreground mb-6">
          Kupa Coffee ailesinin bir parçası olmaya hazır mısınız?
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild size="lg" className="font-medium shadow-lg shadow-primary/25 min-w-44">
            <Link href="/kariyer">Bize Katıl<ArrowRight className="w-4 h-4 ml-1.5" /></Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="font-medium">
            <Link href="/login">Giriş Yap</Link>
          </Button>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="border-t border-border/60">
        <div className="max-w-6xl mx-auto px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <KupaLogo variant="color" width={88} height={44} />
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Kupa Coffee Co. — Dijital Operasyon Akademisi. Tüm hakları saklıdır.
          </p>
        </div>
      </footer>
    </div>
  );
}
