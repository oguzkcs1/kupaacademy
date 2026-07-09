"use client";

import { Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDataStore } from "@/lib/data-store";
import { useAuthStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function BadgesPage() {
  const { user } = useAuthStore();
  const { badges, getUserBadges } = useDataStore();

  const userBadges = user ? getUserBadges(user.id) : [];
  const earnedIds = userBadges.map((ub) => ub.badgeId);

  const earned = badges.filter((b) => earnedIds.includes(b.id));
  const locked = badges.filter((b) => !earnedIds.includes(b.id));

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold tracking-tight">Rozetler</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {earned.length} kazanıldı · {locked.length} kilitli
        </p>
      </motion.div>

      {earned.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-foreground/60 uppercase tracking-wider mb-3">Kazanılan</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {earned.map((badge, i) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06 }}
              >
                <Card className="text-center ring-2 ring-primary/30 bg-primary/5 hover:shadow-md transition-all">
                  <CardContent className="p-5 space-y-2">
                    <div className="text-4xl">{badge.icon}</div>
                    <p className="font-semibold text-sm">{badge.name}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{badge.description}</p>
                    <Badge variant="success" className="text-xs">Kazanıldı</Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {locked.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-foreground/60 uppercase tracking-wider mb-3">Kilitli</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {locked.map((badge, i) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card className={cn("text-center opacity-55 hover:opacity-70 transition-all")}>
                  <CardContent className="p-5 space-y-2">
                    <div className="text-4xl grayscale">{badge.icon}</div>
                    <p className="font-semibold text-sm">{badge.name}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{badge.description}</p>
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <Lock className="w-3 h-3" />
                      <span>Kilitli</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {badges.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <p>Henüz rozet tanımlanmamış.</p>
        </div>
      )}
    </div>
  );
}
