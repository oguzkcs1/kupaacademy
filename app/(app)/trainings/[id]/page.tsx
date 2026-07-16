"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Clock, Tag, Edit, CheckCircle2, PlayCircle,
  FileText, ClipboardList, BookOpen, Download, ExternalLink,
  AlertTriangle, Info, Quote, Lock, ScrollText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/lib/store";
import { useDataStore } from "@/lib/data-store";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { motion } from "framer-motion";

function BlockRenderer({ block }: { block: { id: string; type: string; data: Record<string, unknown> } }) {
  const content = block.data?.content as string || "";

  switch (block.type) {
    case "heading1":
      return <h2 className="text-2xl font-bold mt-6 mb-3">{content}</h2>;
    case "heading2":
      return <h3 className="text-xl font-semibold mt-5 mb-2">{content}</h3>;
    case "paragraph":
      return <p className="text-muted-foreground leading-relaxed">{content}</p>;
    case "bullet_list":
      return (
        <ul className="space-y-1.5 list-none">
          {content.split("\n").filter(Boolean).map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      );
    case "alert":
      return (
        <div className="flex gap-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-4">
          <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-400">{content}</p>
        </div>
      );
    case "info":
      return (
        <div className="flex gap-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
          <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-blue-700 dark:text-blue-400">{content}</p>
        </div>
      );
    case "blockquote":
      return (
        <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground text-sm">
          {content}
        </blockquote>
      );
    case "divider":
      return <Separator />;
    case "image":
      return content ? (
        <div className="rounded-xl overflow-hidden">
          <img src={content} alt="" className="w-full object-cover max-h-80" />
        </div>
      ) : null;
    case "video":
      if (!content) return null;
      const youtubeId = content.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
      if (youtubeId) {
        return (
          <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}`}
              className="w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        );
      }
      return (
        <video controls className="w-full rounded-xl bg-black">
          <source src={content} />
        </video>
      );
    case "pdf":
      if (!content) return null;
      return (
        <div className="border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b border-border">
            <div className="flex items-center gap-2 text-sm font-medium">
              <FileText className="w-4 h-4 text-primary" />
              PDF Döküman
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="h-7 text-xs" asChild>
                <a href={content} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-3 h-3" />
                  Yeni Sekmede Aç
                </a>
              </Button>
              <Button size="sm" variant="outline" className="h-7 text-xs" asChild>
                <a href={content} download>
                  <Download className="w-3 h-3" />
                  İndir
                </a>
              </Button>
            </div>
          </div>
          <iframe
            src={`${content}#toolbar=0`}
            className="w-full"
            style={{ height: "600px" }}
            title="PDF Viewer"
          />
        </div>
      );
    default:
      return null;
  }
}

export default function TrainingDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuthStore();
  const { trainings, completeTraining, isTrainingCompleted } = useDataStore();
  const training = trainings.find((t) => t.id === params.id);

  if (!training) return notFound();

  const isAdmin = user?.role === "admin";
  const completed = user ? isTrainingCompleted(user.id, training.id) : false;
  const progress = completed ? 100 : 0;

  const hasContent = training.content && training.content.length > 0 &&
    training.content.some(b => b.data?.content);

  // ── Okuma doğrulama (personel okumadan tamamlayamasın) ──────────────
  // İçerikten tahmini okuma süresi (kelime sayısına göre), 12s–90s arası
  const minSeconds = useMemo(() => {
    const words = (training.content ?? [])
      .map((b) => String((b.data?.content as string) ?? ""))
      .join(" ").trim().split(/\s+/).filter(Boolean).length;
    return Math.min(90, Math.max(12, Math.round(words / 15)));
  }, [training.content]);

  const endRef = useRef<HTMLDivElement>(null);
  const [reachedEnd, setReachedEnd] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(minSeconds);
  const [confirmed, setConfirmed] = useState(false);

  // Admin veya tamamlanmış eğitimde kapıları uygulama
  const gated = !isAdmin && !completed;

  // Geri sayım
  useEffect(() => {
    if (!gated) return;
    setSecondsLeft(minSeconds);
    const t = setInterval(() => {
      setSecondsLeft((s) => (s <= 1 ? (clearInterval(t), 0) : s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [gated, minSeconds]);

  // İçeriğin sonuna gelindi mi (kaydırma)
  useEffect(() => {
    if (!gated) { setReachedEnd(true); return; }
    const el = endRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setReachedEnd(true); },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [gated]);

  const timeDone = secondsLeft <= 0;
  const canComplete = !gated || (reachedEnd && timeDone && confirmed);

  const handleComplete = async () => {
    if (!user) return;
    if (!canComplete) return;
    const newBadges = await completeTraining(user.id, training.id);
    toast.success("Eğitim tamamlandı! 🎉");
    if (newBadges.length > 0) {
      newBadges.forEach((name: string) => {
        setTimeout(() => toast.success(`Rozet kazandın: ${name} 🏆`), 800);
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/trainings">
          <ArrowLeft className="w-4 h-4" />
          Eğitimlere Dön
        </Link>
      </Button>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative h-64 rounded-2xl overflow-hidden bg-muted"
      >
        {training.coverImage ? (
          <img src={training.coverImage} alt={training.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <PlayCircle className="w-20 h-20 text-muted-foreground/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent" />
        <div className="absolute bottom-0 left-0 p-6">
          {training.category && (
            <Badge className="mb-2 bg-primary/90">{training.category.name}</Badge>
          )}
          <h1 className="text-2xl font-bold text-white">{training.title}</h1>
        </div>
        {completed && (
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-green-500/90 text-white text-sm font-medium px-3 py-1.5 rounded-full">
            <CheckCircle2 className="w-4 h-4" />
            Tamamlandı
          </div>
        )}
        {isAdmin && (
          <div className="absolute top-4 right-4">
            <Button size="sm" asChild>
              <Link href={`/admin/trainings/${training.id}/edit`}>
                <Edit className="w-4 h-4" />
                Düzenle
              </Link>
            </Button>
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {training.description && (
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground leading-relaxed">{training.description}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                Eğitim İçeriği
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-2 space-y-4">
              {hasContent ? (
                training.content.map((block) => (
                  <BlockRenderer key={block.id} block={block} />
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">
                  Bu eğitim için henüz içerik eklenmemiş.
                </p>
              )}
              {/* Okuma sonu işareti — kaydırma doğrulaması için */}
              <div ref={endRef} className="h-px" />
              {gated && (
                <div className={`flex items-center gap-2 text-xs rounded-lg px-3 py-2 mt-2 ${
                  reachedEnd ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20" : "text-muted-foreground bg-muted/50"
                }`}>
                  {reachedEnd ? <CheckCircle2 className="w-3.5 h-3.5" /> : <ScrollText className="w-3.5 h-3.5" />}
                  {reachedEnd ? "İçeriğin sonuna ulaştınız" : "Tamamlamak için içeriği sonuna kadar okuyun"}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className={completed ? "border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-900" : ""}>
            <CardHeader>
              <CardTitle className="text-base">İlerlemen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className={`text-4xl font-bold ${completed ? "text-green-600" : "text-primary"}`}>
                  %{progress}
                </div>
                <p className="text-sm text-muted-foreground mt-1">tamamlandı</p>
              </div>
              <Progress value={progress} className={completed ? "[&>div]:bg-green-500" : ""} />
              {completed ? (
                <div className="flex items-center justify-center gap-2 text-green-600 text-sm font-medium py-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Tamamlandı!
                </div>
              ) : (
                <div className="space-y-3">
                  {gated && (
                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={confirmed}
                        onChange={(e) => setConfirmed(e.target.checked)}
                        disabled={!reachedEnd || !timeDone}
                        className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-border accent-[hsl(var(--primary))] cursor-pointer disabled:cursor-not-allowed"
                      />
                      <span className="text-xs text-muted-foreground leading-relaxed">
                        Eğitim içeriğini <b>okudum ve anladım</b>.
                      </span>
                    </label>
                  )}
                  <Button className="w-full" onClick={handleComplete} disabled={!canComplete}>
                    {canComplete ? (
                      <><CheckCircle2 className="w-4 h-4" />Tamamlandı Olarak İşaretle</>
                    ) : !reachedEnd ? (
                      <><ScrollText className="w-4 h-4" />İçeriği okuyun</>
                    ) : !timeDone ? (
                      <><Clock className="w-4 h-4" />Okuma süresi: {secondsLeft}s</>
                    ) : (
                      <><Lock className="w-4 h-4" />Onay kutusunu işaretleyin</>
                    )}
                  </Button>
                  {gated && !canComplete && (
                    <p className="text-[11px] text-muted-foreground/70 text-center leading-relaxed">
                      Eğitimi tamamlamak için içeriği sonuna kadar okuyun, kısa okuma süresini bekleyin ve onaylayın.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-3">
              {training.duration && (
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{training.duration} dakika</span>
                </div>
              )}
              {training.quiz && (
                <div className="flex items-center gap-3 text-sm">
                  <ClipboardList className="w-4 h-4 text-muted-foreground" />
                  <span>Sınav mevcut</span>
                </div>
              )}
              {training.category && (
                <div className="flex items-center gap-3 text-sm">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  <span>{training.category.name}</span>
                </div>
              )}
              <Separator />
              <div className="text-xs text-muted-foreground">
                <p>Oluşturulma: {formatDate(training.createdAt)}</p>
                {training.publishedAt && (
                  <p>Yayın: {formatDate(training.publishedAt)}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {training.tags.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-2">
                  {training.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
