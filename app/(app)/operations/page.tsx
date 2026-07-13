"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sunrise, Sunset, Clock, AlertTriangle, Gauge, Trophy, TrendingDown,
  ChevronRight, Camera, Building2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RunStatusBadge } from "@/components/operations/run-status-badge";
import { ScoreBadge, scoreColor } from "@/components/operations/score-badge";
import { useOpsStore } from "@/lib/ops-store";
import { useDataStore } from "@/lib/data-store";
import { useAuthStore } from "@/lib/store";
import { mockBranches } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
};

function OpsStat({
  title, value, icon: Icon, description, color, accent,
}: {
  title: string; value: string | number; icon: React.ElementType;
  description?: string; color: string; accent: string;
}) {
  return (
    <motion.div variants={item}>
      <Card className={cn("hover:shadow-md hover:-translate-y-0.5 transition-all duration-300", accent)}>
        <CardContent className="p-5 flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
            <p className="text-3xl font-bold tracking-tight leading-none">{value}</p>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
          <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm", color)}>
            <Icon className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function OperationsDashboardPage() {
  const { user } = useAuthStore();
  const { runs, photos } = useOpsStore();
  const { branches: dataBranches, users } = useDataStore();
  const branches = dataBranches.length > 0 ? dataBranches : mockBranches;
  const activeBranches = branches.filter((b) => b.status === "active");

  const today = new Date().toISOString().slice(0, 10);
  const todayRuns = runs.filter((r) => r.date === today);

  const openedToday = todayRuns.filter(
    (r) => r.type === "opening" && (r.status === "completed" || r.status === "approved")
  ).length;
  const closedToday = todayRuns.filter(
    (r) => r.type === "closing" && (r.status === "completed" || r.status === "approved")
  ).length;
  const pendingCount = activeBranches.length * 2 - todayRuns.filter(
    (r) => r.status === "completed" || r.status === "approved"
  ).length;
  const revisionCount = runs.filter((r) => r.status === "revision").length;

  const scoredRuns = runs.filter((r) => r.score != null);
  const avgScore = scoredRuns.length
    ? Math.round(scoredRuns.reduce((a, r) => a + (r.score ?? 0), 0) / scoredRuns.length)
    : 0;

  // Şube ortalamaları
  const branchScores = activeBranches.map((b) => {
    const bRuns = scoredRuns.filter((r) => r.branchId === b.id);
    const avg = bRuns.length
      ? Math.round(bRuns.reduce((a, r) => a + (r.score ?? 0), 0) / bRuns.length)
      : null;
    return { branch: b, avg, count: bRuns.length };
  }).filter((s) => s.avg !== null);

  const best = branchScores.length ? branchScores.reduce((a, b) => (b.avg! > a.avg! ? b : a)) : null;
  const worst = branchScores.length ? branchScores.reduce((a, b) => (b.avg! < a.avg! ? b : a)) : null;

  const todayPhotos = [...photos]
    .filter((p) => p.takenAt.startsWith(today))
    .sort((a, b) => b.takenAt.localeCompare(a.takenAt))
    .slice(0, 6);

  const userName = (id: string) => users.find((u) => u.id === id)?.name ?? "Personel";
  const branchName = (id: string) => branches.find((b) => b.id === id)?.name ?? "Şube";
  const isAdmin = user?.role === "admin";

  return (
    <div className="space-y-7">
      {/* Başlık */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-start justify-between gap-3 flex-wrap"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Operasyon Merkezi</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {activeBranches.length} aktif şube · canlı operasyon durumu
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/operations/opening"><Sunrise className="w-4 h-4 mr-1.5" />Açılış</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/operations/closing"><Sunset className="w-4 h-4 mr-1.5" />Kapanış</Link>
          </Button>
        </div>
      </motion.div>

      {/* İstatistikler */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4"
      >
        <OpsStat
          title="Bugün Açılan"
          value={`${openedToday}/${activeBranches.length}`}
          icon={Sunrise}
          description="şube açılışını yaptı"
          color="bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
          accent="stat-accent-amber"
        />
        <OpsStat
          title="Bugün Kapanan"
          value={`${closedToday}/${activeBranches.length}`}
          icon={Sunset}
          description="şube kapanışını yaptı"
          color="bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-400"
          accent="stat-accent-violet"
        />
        <OpsStat
          title="Bekleyen Kontrol"
          value={Math.max(pendingCount, 0)}
          icon={Clock}
          description="bugün için bekliyor"
          color="bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400"
          accent="stat-accent-sky"
        />
        <OpsStat
          title="Revize İstendi"
          value={revisionCount}
          icon={AlertTriangle}
          description="düzeltme bekleniyor"
          color="bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400"
          accent="border-t-2 border-t-red-500"
        />
        <div className="col-span-2 lg:col-span-4 xl:col-span-1">
          <OpsStat
            title="Operasyon Puanı"
            value={avgScore}
            icon={Gauge}
            description="tüm şubeler ortalaması"
            color="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
            accent="stat-accent-emerald"
          />
        </div>
      </motion.div>

      {/* Orta blok: şube durumu + en iyi/en düşük */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-5"
      >
        {/* Bugünkü şube durumu */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3 pt-5 px-5">
            <div>
              <CardTitle className="text-base font-semibold">Bugünkü Şube Durumu</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Açılış &amp; kapanış canlı takip</p>
            </div>
            {isAdmin && (
              <Button variant="ghost" size="sm" asChild className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground">
                <Link href="/operations/audits">Denetimler <ChevronRight className="ml-0.5 h-3 w-3" /></Link>
              </Button>
            )}
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-2">
            {activeBranches.map((b) => {
              const opening = todayRuns.find((r) => r.branchId === b.id && r.type === "opening");
              const closing = todayRuns.find((r) => r.branchId === b.id && r.type === "closing");
              return (
                <div
                  key={b.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border/60 hover:bg-muted/40 transition-colors"
                >
                  <span className="font-medium text-sm flex-1 min-w-0 truncate">{b.name}</span>
                  <div className="flex items-center gap-1.5">
                    <Sunrise className="w-3.5 h-3.5 text-muted-foreground" />
                    <RunStatusBadge status={opening?.status ?? "pending"} className="text-[11px]" />
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5">
                    <Sunset className="w-3.5 h-3.5 text-muted-foreground" />
                    <RunStatusBadge status={closing?.status ?? "pending"} className="text-[11px]" />
                  </div>
                  <ScoreBadge score={opening?.score} />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* En iyi / en düşük */}
        <div className="space-y-5">
          <Card className="stat-accent-emerald">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center flex-shrink-0">
                <Trophy className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">En Başarılı Şube</p>
                <p className="font-bold truncate">{best?.branch.name ?? "—"}</p>
                {best && (
                  <p className={cn("text-sm font-bold tabular-nums", scoreColor(best.avg!))}>
                    {best.avg}/100
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          <Card className="border-t-2 border-t-red-500">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/50 flex items-center justify-center flex-shrink-0">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">En Düşük Puanlı Şube</p>
                <p className="font-bold truncate">{worst?.branch.name ?? "—"}</p>
                {worst && (
                  <p className={cn("text-sm font-bold tabular-nums", scoreColor(worst.avg!))}>
                    {worst.avg}/100
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Bugünün fotoğrafları */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3 pt-5 px-5">
            <div>
              <CardTitle className="text-base font-semibold">Bugünün Son Fotoğrafları</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Şubelerden gelen görseller</p>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground">
              <Link href="/operations/gallery">Galeri <ChevronRight className="ml-0.5 h-3 w-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {todayPhotos.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <Camera className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm">Bugün henüz fotoğraf yüklenmedi</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                {todayPhotos.map((p) => (
                  <Link
                    key={p.id}
                    href="/operations/gallery"
                    className="group relative aspect-square rounded-xl overflow-hidden bg-muted"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.url} alt={p.categoryLabel} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-1.5 left-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Badge className="bg-black/55 backdrop-blur-sm text-white border-0 text-[10px] max-w-full truncate block">
                        {p.categoryLabel} · {branchName(p.branchId).split(" ")[0]}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
