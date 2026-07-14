"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Briefcase, Phone, Mail, MapPin, FileText, Trash2, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import * as db from "@/lib/db";
import { formatRelativeTime } from "@/lib/utils";
import { toast } from "sonner";
import type { JobApplication, JobApplicationStatus } from "@/types";

const statusMeta: Record<JobApplicationStatus, { label: string; className: string }> = {
  new: { label: "Yeni", className: "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400 border-transparent" },
  reviewing: { label: "Değerlendiriliyor", className: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-transparent" },
  accepted: { label: "Olumlu", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-transparent" },
  rejected: { label: "Olumsuz", className: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400 border-transparent" },
};

const filters: { key: "all" | JobApplicationStatus; label: string }[] = [
  { key: "all", label: "Tümü" },
  { key: "new", label: "Yeni" },
  { key: "reviewing", label: "Değerlendiriliyor" },
  { key: "accepted", label: "Olumlu" },
  { key: "rejected", label: "Olumsuz" },
];

export default function AdminApplicationsPage() {
  const [apps, setApps] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | JobApplicationStatus>("all");
  const [deleteTarget, setDeleteTarget] = useState<JobApplication | null>(null);

  useEffect(() => {
    db.getJobApplications()
      .then(setApps)
      .catch(() => toast.error("Başvurular yüklenemedi — job_applications tablosu var mı?"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? apps : apps.filter((a) => a.status === filter);
  const countBy = (s: JobApplicationStatus) => apps.filter((a) => a.status === s).length;

  const handleStatus = async (app: JobApplication, status: JobApplicationStatus) => {
    setApps((prev) => prev.map((a) => (a.id === app.id ? { ...a, status } : a)));
    try {
      await db.updateJobApplicationStatus(app.id, status);
      toast.success("Durum güncellendi");
    } catch {
      toast.error("Güncellenemedi");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await db.deleteJobApplication(deleteTarget.id);
      setApps((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      toast.success("Başvuru silindi");
      setDeleteTarget(null);
    } catch {
      toast.error("Silinemedi");
    }
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Briefcase className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Kariyer Başvuruları</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {apps.length} başvuru · {countBy("new")} yeni
          </p>
        </div>
      </motion.div>

      {/* Filtreler */}
      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              filter === f.key
                ? "bg-primary text-white shadow-sm"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
            {f.key !== "all" && ` (${countBy(f.key)})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>Bu kategoride başvuru yok</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((app, i) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold">{app.fullName}</p>
                        <Badge className={statusMeta[app.status].className}>{statusMeta[app.status].label}</Badge>
                        {app.position && <Badge variant="secondary" className="text-xs">{app.position}</Badge>}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                        <a href={`tel:${app.phone}`} className="flex items-center gap-1.5 hover:text-primary">
                          <Phone className="w-3.5 h-3.5" />{app.phone}
                        </a>
                        {app.email && (
                          <a href={`mailto:${app.email}`} className="flex items-center gap-1.5 hover:text-primary">
                            <Mail className="w-3.5 h-3.5" />{app.email}
                          </a>
                        )}
                        {app.city && (
                          <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{app.city}</span>
                        )}
                        {app.experience && <span>· {app.experience}</span>}
                      </div>
                      {app.message && (
                        <p className="text-sm text-muted-foreground mt-2.5 bg-muted/40 rounded-lg px-3 py-2">
                          {app.message}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-3">
                        {app.cvUrl && (
                          <a href={app.cvUrl} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
                            <FileText className="w-3.5 h-3.5" />CV'yi Aç
                          </a>
                        )}
                        <span className="flex items-center gap-1 text-xs text-muted-foreground/70">
                          <Clock className="w-3 h-3" />{formatRelativeTime(app.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Select value={app.status} onValueChange={(v) => handleStatus(app, v as JobApplicationStatus)}>
                        <SelectTrigger className="h-8 w-40 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">Yeni</SelectItem>
                          <SelectItem value="reviewing">Değerlendiriliyor</SelectItem>
                          <SelectItem value="accepted">Olumlu</SelectItem>
                          <SelectItem value="rejected">Olumsuz</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost" size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(app)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Başvuruyu sil</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deleteTarget?.fullName}</strong> adlı kişinin başvurusu kalıcı olarak silinecek.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
