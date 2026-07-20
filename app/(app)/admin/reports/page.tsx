"use client";

import { Users, GraduationCap, Trophy, TrendingUp, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { useDataStore } from "@/lib/data-store";
import { ROLE_LABELS, getInitials, formatRelativeTime } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const COLORS = ["#dc8f27", "#3b82f6", "#22c55e", "#8b5cf6"];

export default function ReportsPage() {
  const { users, trainings, completions, videos, documents, recipes } = useDataStore();

  const baristaUsers = users.filter((u) => u.role === "barista");
  const publishedTrainings = trainings.filter((t) => t.status === "published");
  const totalCompletions = completions.length;
  const activeUsers = users.filter((u) => u.status === "active").length;

  // Per-training completion stats
  const trainingStats = publishedTrainings.map((t) => {
    const count = completions.filter((c) => c.trainingId === t.id).length;
    const pct = baristaUsers.length > 0 ? Math.round((count / baristaUsers.length) * 100) : 0;
    return { title: t.title, completions: count, total: baristaUsers.length, pct };
  }).sort((a, b) => b.completions - a.completions).slice(0, 5);

  // Per-user completion stats
  const userStats = baristaUsers.map((u) => ({
    ...u,
    completionCount: completions.filter((c) => c.userId === u.id).length,
  })).sort((a, b) => b.completionCount - a.completionCount);

  // Content distribution
  const contentData = [
    { name: "Eğitimler", value: trainings.length, color: COLORS[0] },
    { name: "Videolar", value: videos.length, color: COLORS[1] },
    { name: "Dokümanlar", value: documents.length, color: COLORS[2] },
    { name: "Reçeteler", value: recipes.length, color: COLORS[3] },
  ];

  // Bar chart data — completions per training (top 5)
  const barData = trainingStats.map((t) => ({
    name: t.title.length > 18 ? t.title.slice(0, 18) + "…" : t.title,
    tamamlanan: t.completions,
  }));

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold tracking-tight">Raporlar</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Platform kullanım istatistikleri</p>
      </motion.div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Toplam Kullanıcı", value: users.length, icon: Users, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/40" },
          { label: "Yayındaki Eğitim", value: publishedTrainings.length, icon: GraduationCap, color: "text-primary", bg: "bg-amber-50 dark:bg-amber-950/40" },
          { label: "Toplam Tamamlama", value: totalCompletions, icon: Trophy, color: "text-green-600", bg: "bg-green-50 dark:bg-green-950/40" },
          { label: "Aktif Kullanıcı", value: activeUsers, icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950/40" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Eğitim Tamamlanma Sayıları</CardTitle>
            <CardDescription>Eğitime göre toplam tamamlama</CardDescription>
          </CardHeader>
          <CardContent>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData} margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="tamamlanan" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
                Henüz tamamlama verisi yok
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pie chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">İçerik Dağılımı</CardTitle>
            <CardDescription>Kategoriye göre toplam içerik sayısı</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={contentData} cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={3} dataKey="value">
                    {contentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 flex-1">
                {contentData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span>{item.name}</span>
                    </div>
                    <span className="font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top trainings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Eğitim Tamamlanma Oranları</CardTitle>
            <CardDescription>Barista başına tamamlanma yüzdesi</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {trainingStats.length > 0 ? trainingStats.map((t, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium truncate max-w-[60%]">{t.title}</span>
                  <span className="text-muted-foreground text-xs">{t.completions}/{t.total} (%{t.pct})</span>
                </div>
                <Progress value={t.pct} className="h-2" />
              </div>
            )) : (
              <p className="text-sm text-muted-foreground py-4 text-center">Henüz tamamlama verisi yok</p>
            )}
          </CardContent>
        </Card>

        {/* User activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Barista Aktivitesi</CardTitle>
            <CardDescription>Kullanıcı başına tamamlanan eğitim sayısı</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {userStats.map((u) => (
              <div key={u.id} className="flex items-center gap-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                    {getInitials(u.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{u.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">@{u.username}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {u.completionCount}
                  </div>
                  <Badge variant={u.status === "active" ? "success" : "secondary"} className="text-xs">
                    {u.status === "active" ? "Aktif" : u.status === "pending" ? "Onay Bekliyor" : "Pasif"}
                  </Badge>
                </div>
              </div>
            ))}
            {userStats.length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center">Barista bulunamadı</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
