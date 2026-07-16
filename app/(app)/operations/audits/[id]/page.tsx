"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Camera, CheckCircle2, Clock, MessageSquare,
  RotateCcw, ThumbsUp, User as UserIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { RunStatusBadge } from "@/components/operations/run-status-badge";
import { scoreColor } from "@/components/operations/score-badge";
import { useOpsStore } from "@/lib/ops-store";
import { useDataStore } from "@/lib/data-store";
import { useAuthStore } from "@/lib/store";
import { mockBranches } from "@/lib/mock-data";
import {
  MAX_ITEM_SCORE, SCORE_OPTIONS, calculateRunScore, isRunFullyScored,
} from "@/types/operations";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const scoreButtonStyle: Record<number, string> = {
  0: "data-[active=true]:bg-red-500 data-[active=true]:text-white data-[active=true]:border-red-500",
  1: "data-[active=true]:bg-orange-500 data-[active=true]:text-white data-[active=true]:border-orange-500",
  2: "data-[active=true]:bg-amber-500 data-[active=true]:text-white data-[active=true]:border-amber-500",
  3: "data-[active=true]:bg-lime-600 data-[active=true]:text-white data-[active=true]:border-lime-600",
  5: "data-[active=true]:bg-emerald-500 data-[active=true]:text-white data-[active=true]:border-emerald-500",
};

export default function AuditDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const { runs, photos, templates, approveRun, requestRevision, setItemScore } = useOpsStore();
  const { branches: dataBranches, users } = useDataStore();
  const branches = dataBranches.length > 0 ? dataBranches : mockBranches;

  const run = runs.find((r) => r.id === params.id);
  const [comment, setComment] = useState("");
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);

  if (!run) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p>Denetim kaydı bulunamadı</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => router.push("/operations/audits")}>
          <ArrowLeft className="w-4 h-4 mr-1.5" />Denetimlere Dön
        </Button>
      </div>
    );
  }

  const template = templates.find((t) => t.id === run.templateId);
  const branch = branches.find((b) => b.id === run.branchId);
  const staff = users.find((u) => u.id === run.userId);
  const runPhotos = photos.filter((p) => p.runId === run.id);
  const isAdmin = user?.role === "admin";
  const canReview = isAdmin && run.status === "completed";
  const fullyScored = isRunFullyScored(run);
  const liveScore = calculateRunScore(run);

  const handleApprove = () => {
    if (!fullyScored) {
      toast.error("Onaylamadan önce tüm maddeleri puanlayın");
      return;
    }
    approveRun(run.id, comment.trim() || undefined);
    toast.success("Denetim puanlandı ve onaylandı ✅");
  };

  const handleRevision = () => {
    if (!comment.trim()) {
      toast.error("Revize için yorum yazmalısınız");
      return;
    }
    requestRevision(run.id, comment.trim());
    setRevisionOpen(false);
    toast.success("Revize talebi gönderildi");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Başlık */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="h-9 w-9">
            <Link href="/operations/audits"><ArrowLeft className="w-4 h-4" /></Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              {branch?.name} — {run.type === "opening" ? "Açılış" : "Kapanış"}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{run.date}</span>
              <span className="flex items-center gap-1"><UserIcon className="w-3.5 h-3.5" />{staff?.name ?? "Personel"}</span>
              {run.completedAt && (
                <span>{new Date(run.completedAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</span>
              )}
            </p>
          </div>
        </div>
        <RunStatusBadge status={run.status} />
      </div>

      {/* Puan kartı */}
      <Card>
        <CardContent className="p-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Operasyon Puanı
              {canReview && !fullyScored && (
                <span className="ml-2 normal-case font-medium text-amber-600">— puanlama devam ediyor</span>
              )}
            </p>
            <p className="text-5xl font-bold tabular-nums mt-1">
              <span className={scoreColor(canReview ? liveScore : run.score ?? 0)}>
                {canReview ? liveScore : run.score ?? "—"}
              </span>
              <span className="text-muted-foreground text-2xl font-medium"> / 100</span>
            </p>
          </div>
          {canReview && (
            <div className="flex gap-2">
              <Button
                onClick={handleApprove}
                disabled={!fullyScored}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <ThumbsUp className="w-4 h-4 mr-1.5" />
                {fullyScored ? "Puanla ve Onayla" : "Tüm maddeleri puanlayın"}
              </Button>
              <Button variant="outline" onClick={() => setRevisionOpen(true)}>
                <RotateCcw className="w-4 h-4 mr-1.5" />Revize İste
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Yönetici yorumu */}
      {run.managerComment && (
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4 flex gap-3">
            <MessageSquare className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Yönetici Yorumu</p>
              <p className="text-sm">{run.managerComment}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Onay yorumu alanı */}
      {canReview && (
        <Card>
          <CardContent className="p-4 space-y-2">
            <p className="text-sm font-medium">Yorum (opsiyonel — revize için zorunlu)</p>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Şubeye iletilecek notunuz..."
              rows={2}
            />
          </CardContent>
        </Card>
      )}

      {/* Fotoğraflar */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Camera className="w-4 h-4 text-muted-foreground" />
            Fotoğraflar
            <Badge variant="secondary" className="text-xs">{runPhotos.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {runPhotos.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Fotoğraf yok</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {runPhotos.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setLightbox(p.url)}
                  className="group relative aspect-square rounded-xl overflow-hidden bg-muted"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt={p.categoryLabel} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  <div className="absolute bottom-1.5 left-1.5">
                    <Badge className="bg-black/55 backdrop-blur-sm text-white border-0 text-[10px]">
                      {p.categoryLabel}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Checklist detayı */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
            Checklist Detayı
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {run.sections.map((section, si) => {
            const tpl = template?.sections.find((t) => t.id === section.sectionId);
            if (!tpl) return null;
            const sectionEarned = section.items.reduce((a, i) => a + (i.score ?? 0), 0);
            const sectionMax = section.items.length * MAX_ITEM_SCORE;
            return (
              <div key={section.sectionId}>
                {si > 0 && <Separator className="mb-5" />}
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-sm flex items-center gap-2">
                    <span>{tpl.emoji}</span>{tpl.title}
                  </p>
                  <span className="text-xs font-bold tabular-nums text-muted-foreground">
                    {sectionEarned}/{sectionMax}
                  </span>
                </div>
                <div className="space-y-2.5">
                  {section.items.map((item) => {
                    const itemTpl = tpl.items.find((t) => t.id === item.itemId);
                    const itemPhotos = photos.filter((p) => item.photoIds?.includes(p.id));
                    return (
                      <div key={item.itemId} className="rounded-xl border border-border p-3">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-sm font-medium flex-1">{itemTpl?.label}</span>
                          {!canReview && (
                            <span className={cn(
                              "font-bold tabular-nums w-8 text-right text-sm",
                              item.score === null ? "text-muted-foreground/40"
                                : item.score >= 5 ? "text-emerald-600"
                                : item.score >= 3 ? "text-amber-600" : "text-red-600"
                            )}>
                              {item.score ?? "—"}
                            </span>
                          )}
                        </div>

                        {/* Bu maddenin fotoğrafları */}
                        {itemPhotos.length > 0 ? (
                          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-2.5">
                            {itemPhotos.map((p) => (
                              <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer"
                                className="aspect-square rounded-lg overflow-hidden bg-muted block">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={p.url} alt={itemTpl?.label} className="w-full h-full object-cover" />
                              </a>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground/60 mt-1.5">Fotoğraf yok</p>
                        )}

                        {/* Merkez puanlama */}
                        {canReview && (
                          <div className="flex gap-1.5 mt-3">
                            {SCORE_OPTIONS.map((score) => (
                              <button
                                key={score}
                                data-active={item.score === score}
                                onClick={() => setItemScore(run.id, section.sectionId, item.itemId, score)}
                                className={cn(
                                  "w-9 h-9 rounded-lg border border-border text-sm font-bold tabular-nums transition-all",
                                  "hover:border-primary/50 active:scale-95",
                                  scoreButtonStyle[score]
                                )}
                              >
                                {score}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Revize dialog */}
      <Dialog open={revisionOpen} onOpenChange={setRevisionOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Revize İste</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-2">
            <p className="text-sm text-muted-foreground">
              Şubeye iletilecek düzeltme talebinizi yazın.
            </p>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Örn: Pasta dolabı fotoğrafı yetersiz, tekrar çekilmeli..."
              rows={3}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRevisionOpen(false)}>İptal</Button>
            <Button variant="destructive" onClick={handleRevision} disabled={!comment.trim()}>
              Revize Gönder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lightbox */}
      <Dialog open={!!lightbox} onOpenChange={(v) => !v && setLightbox(null)}>
        <DialogContent className="sm:max-w-3xl p-2">
          {lightbox && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={lightbox} alt="Denetim fotoğrafı" className="w-full h-auto rounded-lg" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
