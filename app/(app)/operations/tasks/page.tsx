"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ListTodo, Plus, CalendarDays, MapPin, User as UserIcon, CheckCircle2, Circle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useOpsStore } from "@/lib/ops-store";
import { useDataStore } from "@/lib/data-store";
import { useAuthStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function OpsTasksPage() {
  const { user } = useAuthStore();
  const { tasks, addTask, toggleTask } = useOpsStore();
  const { branches: dataBranches, users } = useDataStore();
  const branches = dataBranches;
  const activeBranches = branches.filter((b) => b.status === "active");
  const isAdmin = user?.role === "admin";

  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [form, setForm] = useState({
    title: "",
    description: "",
    branchId: "",
    assigneeId: "",
    dueDate: "",
  });

  const branchName = (id: string) => branches.find((b) => b.id === id)?.name ?? "Şube";
  const userName = (id?: string) => users.find((u) => u.id === id)?.name ?? "Atanmadı";

  const filtered = [...tasks]
    .filter((t) => statusFilter === "all" || t.status === statusFilter)
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === "pending" ? -1 : 1;
      return (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999");
    });

  const pendingCount = tasks.filter((t) => t.status === "pending").length;

  const handleCreate = () => {
    if (!form.title.trim() || !form.branchId || !user) return;
    addTask({
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      branchId: form.branchId,
      assigneeId: form.assigneeId || undefined,
      dueDate: form.dueDate || undefined,
      createdBy: user.id,
    });
    toast.success("Görev oluşturuldu");
    setForm({ title: "", description: "", branchId: "", assigneeId: "", dueDate: "" });
    setDialogOpen(false);
  };

  const isOverdue = (due?: string, status?: string) =>
    due && status === "pending" && due < new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-100 dark:bg-indigo-950/50 flex items-center justify-center">
            <ListTodo className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Görevler</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{pendingCount} bekleyen görev</p>
          </div>
        </div>
        {isAdmin && (
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />Yeni Görev
          </Button>
        )}
      </div>

      {/* Filtre */}
      <div className="flex gap-2">
        {[
          { key: "all", label: "Tümü" },
          { key: "pending", label: "Bekliyor" },
          { key: "completed", label: "Tamamlandı" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-150",
              statusFilter === f.key
                ? "bg-primary text-white shadow-sm"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <ListTodo className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm">Görev bulunamadı</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((task, i) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.3) }}
            >
              <Card
                className={cn(
                  "transition-all duration-200 hover:shadow-md",
                  task.status === "completed" && "opacity-60"
                )}
              >
                <CardContent className="p-4 flex items-start gap-3">
                  <button
                    onClick={() => {
                      toggleTask(task.id);
                      toast.success(
                        task.status === "pending" ? "Görev tamamlandı 🎉" : "Görev tekrar açıldı"
                      );
                    }}
                    className="mt-0.5 flex-shrink-0 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {task.status === "completed" ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "font-medium text-sm",
                        task.status === "completed" && "line-through text-muted-foreground"
                      )}
                    >
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 flex-wrap text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />{branchName(task.branchId)}
                      </span>
                      <span className="flex items-center gap-1">
                        <UserIcon className="w-3 h-3" />{userName(task.assigneeId)}
                      </span>
                      {task.dueDate && (
                        <span
                          className={cn(
                            "flex items-center gap-1",
                            isOverdue(task.dueDate, task.status) && "text-red-600 font-semibold"
                          )}
                        >
                          <CalendarDays className="w-3 h-3" />
                          {new Date(task.dueDate).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
                          {isOverdue(task.dueDate, task.status) && " · gecikti"}
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant={task.status === "completed" ? "secondary" : "default"}
                    className="flex-shrink-0 text-xs"
                  >
                    {task.status === "completed" ? "Tamamlandı" : "Bekliyor"}
                  </Badge>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Yeni görev dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Yeni Görev</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="task-title">Görev başlığı *</Label>
              <Input
                id="task-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Örn: Pasta dolabı düzenlenecek"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-desc">Açıklama</Label>
              <Textarea
                id="task-desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Şube *</Label>
                <Select value={form.branchId} onValueChange={(v) => setForm({ ...form, branchId: v })}>
                  <SelectTrigger><SelectValue placeholder="Seçin" /></SelectTrigger>
                  <SelectContent>
                    {activeBranches.map((b) => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Sorumlu</Label>
                <Select value={form.assigneeId} onValueChange={(v) => setForm({ ...form, assigneeId: v })}>
                  <SelectTrigger><SelectValue placeholder="Seçin" /></SelectTrigger>
                  <SelectContent>
                    {users.filter((u) => u.status === "active").map((u) => (
                      <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-due">Termin</Label>
              <Input
                id="task-due"
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>İptal</Button>
            <Button onClick={handleCreate} disabled={!form.title.trim() || !form.branchId}>
              Oluştur
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
