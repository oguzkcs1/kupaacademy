"use client";

import Link from "next/link";
import {
  GraduationCap, CheckCircle2, Clock, Award, ClipboardList,
  ArrowRight, PlayCircle, Bell, TrendingUp, Users, BarChart3,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/lib/store";
import { useDataStore } from "@/lib/data-store";
import { formatRelativeTime, formatDuration } from "@/lib/utils";
import { motion } from "framer-motion";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } },
};

function StatCard({
  title, value, icon: Icon, description, color, trend, accent,
}: {
  title: string; value: number | string; icon: React.ElementType;
  description?: string; color: string; trend?: string; accent?: string;
}) {
  return (
    <motion.div variants={item}>
      <Card className={`group relative overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 ${accent ?? ""}`}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
              <p className="text-3xl font-bold tracking-tight leading-none">{value}</p>
              {description && <p className="text-xs text-muted-foreground">{description}</p>}
              {trend && (
                <div className="flex items-center gap-1 pt-0.5">
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                  <span className="text-xs text-emerald-600 font-medium">{trend}</span>
                </div>
              )}
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { announcements, videos, trainings, getUserCompletions, getUserBadges, badges } = useDataStore();

  const completions = user ? getUserCompletions(user.id) : [];
  const userBadgeCount = user ? getUserBadges(user.id).length : 0;
  const publishedTrainings = trainings.filter((t) => t.status === "published");
  const pendingTrainings = publishedTrainings.filter(
    (t) => !completions.some((c) => c.trainingId === t.id)
  );

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Günaydın";
    if (h < 17) return "İyi günler";
    return "İyi akşamlar";
  };

  return (
    <div className="space-y-7">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {greeting()}, <span className="text-primary">{user?.name?.split(" ")[0]}</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Bugün öğrenmeye devam etmeye hazır mısın?
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-xl px-4 py-2 border border-amber-200/50 dark:border-amber-800/30">
          <span className="text-base">🔥</span>
          <span className="text-sm font-semibold">5 günlük seri</span>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          title="Tamamlanan Eğitimler"
          value={completions.length}
          icon={CheckCircle2}
          description={`${publishedTrainings.length} eğitimden`}
          color="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
          accent="stat-accent-emerald"
        />
        <StatCard
          title="Bekleyen Eğitimler"
          value={pendingTrainings.length}
          icon={Clock}
          description="Tamamlaman gerekiyor"
          color="bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
          accent="stat-accent-amber"
        />
        <StatCard
          title="Kazanılan Rozetler"
          value={userBadgeCount}
          icon={Award}
          description={`${badges.length} rozetten`}
          color="bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-400"
          accent="stat-accent-violet"
        />
        <StatCard
          title="Toplam İçerik"
          value={trainings.length + videos.length}
          icon={ClipboardList}
          description="Eğitim ve video"
          color="bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400"
          accent="stat-accent-sky"
        />
      </motion.div>

      {/* Main content grid */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-5"
      >
        {/* Training progress */}
        <Card className="lg:col-span-2 border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-3 pt-5 px-5">
            <div>
              <CardTitle className="text-base font-semibold">Eğitim İlerlemen</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Atanmış eğitimlerin durumu</p>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground">
              <Link href="/trainings">Tümü <ChevronRight className="ml-0.5 h-3 w-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-4">
            {publishedTrainings.slice(0, 5).map((t, i) => {
              const done = completions.some((c) => c.trainingId === t.id);
              const progress = done ? 100 : 0;
              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between text-sm">
                    <Link href={`/trainings/${t.id}`} className="font-medium text-sm hover:text-primary transition-colors truncate max-w-[70%]">
                      {t.title}
                    </Link>
                    <span className={`text-xs font-semibold tabular-nums ${
                      progress === 100 ? "text-emerald-600" : "text-muted-foreground"
                    }`}>
                      {progress === 100 ? "✓ Tamamlandı" : "Bekliyor"}
                    </span>
                  </div>
                  <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.7, delay: 0.4 + i * 0.08, ease: "easeOut" }}
                      className={`absolute inset-y-0 left-0 rounded-full ${
                        progress === 100 ? "bg-emerald-500" : "bg-primary"
                      }`}
                    />
                  </div>
                </motion.div>
              );
            })}
            {publishedTrainings.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Henüz eğitim yok</p>
            )}
          </CardContent>
        </Card>

        {/* Announcements */}
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-3 pt-5 px-5">
            <div>
              <CardTitle className="text-base font-semibold">Duyurular</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Güncel haberler</p>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground">
              <Link href="/announcements">Tümü <ChevronRight className="ml-0.5 h-3 w-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-3">
            {announcements.slice(0, 4).map((ann, i) => (
              <motion.div
                key={ann.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 + i * 0.06 }}
                className="flex gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
              >
                <div className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                  ann.priority === "high" ? "bg-red-500" : ann.priority === "medium" ? "bg-amber-500" : "bg-emerald-500"
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-tight group-hover:text-primary transition-colors line-clamp-1">
                    {ann.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{ann.content}</p>
                  <p className="text-[11px] text-muted-foreground/60 mt-1">{formatRelativeTime(ann.createdAt)}</p>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Videos & New Trainings */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-5"
      >
        {/* Recent Videos */}
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-3 pt-5 px-5">
            <div>
              <CardTitle className="text-base font-semibold">Son Videolar</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Yeni eklenen içerikler</p>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground">
              <Link href="/videos">Tümü <ChevronRight className="ml-0.5 h-3 w-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-1">
            {videos.slice(0, 4).map((video) => (
              <Link
                key={video.id}
                href={`/videos/${video.id}`}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div className="relative w-14 h-10 rounded-md overflow-hidden bg-muted flex-shrink-0">
                  {video.thumbnail ? (
                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <PlayCircle className="w-5 h-5 text-muted-foreground/50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlayCircle className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{video.title}</p>
                  <p className="text-xs text-muted-foreground">{video.duration ? formatDuration(video.duration) : ""} · {video.views} izlenme</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* New Trainings */}
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-3 pt-5 px-5">
            <div>
              <CardTitle className="text-base font-semibold">Yeni Eğitimler</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Henüz başlamadıkların</p>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground">
              <Link href="/trainings">Tümü <ChevronRight className="ml-0.5 h-3 w-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-1">
            {trainings.filter((t) => t.status === "published").slice(0, 4).map((training) => (
              <Link
                key={training.id}
                href={`/trainings/${training.id}`}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  {training.coverImage ? (
                    <img src={training.coverImage} alt={training.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-muted-foreground/40" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{training.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {training.category && (
                      <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{training.category.name}</span>
                    )}
                    {training.duration && (
                      <span className="text-xs text-muted-foreground">{training.duration} dk</span>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
