/**
 * Supabase data access layer — replaces Zustand data store for server data.
 * All functions return typed data or throw on error.
 */
import { getDatabaseSession, setDatabaseSession, supabase } from "./supabase";
import type {
  Training, Video, Recipe, Announcement, User, Badge,
  Category, Document, DocumentFolder, TrainingCompletion,
  Notification, Branch, JobApplication,
} from "@/types";
import type {
  ChecklistTemplate, ChecklistRun, OpsPhoto, OpsTask,
} from "@/types/operations";

// ─── helpers ──────────────────────────────────────────────────────────────────

function snake<T>(row: Record<string, unknown>): T {
  return row as unknown as T;
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("order");
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    icon: r.icon,
    color: r.color,
    type: r.type,
    order: r.order,
  }));
}

export async function upsertCategory(c: Category) {
  const { error } = await supabase.from("categories").upsert({
    id: c.id,
    name: c.name,
    slug: c.slug,
    icon: c.icon,
    color: c.color,
    type: c.type,
    order: c.order,
  });
  if (error) throw error;
}

export async function deleteCategory(id: string) {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}

// ─── Trainings ────────────────────────────────────────────────────────────────

export async function getTrainings(): Promise<Training[]> {
  const { data, error } = await supabase
    .from("trainings")
    .select("*, category:categories(*)")
    .order("order");
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    coverImage: r.cover_image,
    categoryId: r.category_id,
    category: r.category,
    content: r.content ?? [],
    status: r.status,
    duration: r.duration,
    order: r.order,
    requiredForRoles: r.required_for_roles ?? [],
    completions: [],
    tags: r.tags ?? [],
    companyId: r.company_id,
    createdBy: r.created_by,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    publishedAt: r.published_at,
  }));
}

export async function getTraining(id: string): Promise<Training | null> {
  const { data, error } = await supabase
    .from("trainings")
    .select("*, category:categories(*)")
    .eq("id", id)
    .single();
  if (error) return null;
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    coverImage: data.cover_image,
    categoryId: data.category_id,
    category: data.category,
    content: data.content ?? [],
    status: data.status,
    duration: data.duration,
    order: data.order,
    requiredForRoles: data.required_for_roles ?? [],
    completions: [],
    tags: data.tags ?? [],
    companyId: data.company_id,
    createdBy: data.created_by,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    publishedAt: data.published_at,
  };
}

export async function upsertTraining(t: Partial<Training> & { id: string }) {
  const { error } = await supabase.from("trainings").upsert({
    id: t.id,
    title: t.title,
    description: t.description,
    cover_image: t.coverImage,
    category_id: t.categoryId,
    content: t.content ?? [],
    status: t.status ?? "draft",
    duration: t.duration,
    order: t.order ?? 0,
    required_for_roles: t.requiredForRoles ?? [],
    tags: t.tags ?? [],
    company_id: t.companyId ?? "company-1",
    created_by: t.createdBy ?? "user-admin",
    updated_at: new Date().toISOString(),
    published_at: t.publishedAt,
  });
  if (error) throw error;
}

export async function deleteTraining(id: string) {
  const { error } = await supabase.from("trainings").delete().eq("id", id);
  if (error) throw error;
}

// ─── Videos ───────────────────────────────────────────────────────────────────

export async function getVideos(): Promise<Video[]> {
  const { data, error } = await supabase
    .from("videos")
    .select("*, category:categories(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    thumbnail: r.thumbnail,
    url: r.url,
    youtubeId: r.youtube_id,
    vimeoId: r.vimeo_id,
    duration: r.duration,
    categoryId: r.category_id,
    category: r.category,
    tags: r.tags ?? [],
    status: r.status,
    views: r.views,
    companyId: r.company_id,
    createdBy: r.created_by,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

export async function upsertVideo(v: Partial<Video> & { id: string }) {
  const { error } = await supabase.from("videos").upsert({
    id: v.id,
    title: v.title,
    description: v.description,
    thumbnail: v.thumbnail,
    url: v.url,
    youtube_id: v.youtubeId,
    vimeo_id: v.vimeoId,
    duration: v.duration,
    category_id: v.categoryId,
    tags: v.tags ?? [],
    status: v.status ?? "draft",
    views: v.views ?? 0,
    company_id: v.companyId ?? "company-1",
    created_by: v.createdBy ?? "user-admin",
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function deleteVideo(id: string) {
  const { error } = await supabase.from("videos").delete().eq("id", id);
  if (error) throw error;
}

// ─── Recipes ──────────────────────────────────────────────────────────────────

export async function getRecipes(): Promise<Recipe[]> {
  const { data, error } = await supabase
    .from("recipes")
    .select("*, category:categories(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    categoryId: r.category_id,
    category: r.category,
    ingredients: r.ingredients ?? [],
    preparation: r.preparation,
    presentation: r.presentation,
    cupType: r.cup_type,
    photo: r.photo,
    video: r.video,
    allergens: r.allergens ?? [],
    cost: r.cost,
    notes: r.notes,
    status: r.status,
    content: r.content ?? [],
    tags: r.tags ?? [],
    companyId: r.company_id,
    createdBy: r.created_by,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

export async function upsertRecipe(r: Partial<Recipe> & { id: string }) {
  const payload = {
    id: r.id,
    name: r.name,
    description: r.description,
    category_id: r.categoryId,
    ingredients: r.ingredients ?? [],
    preparation: r.preparation ?? "",
    presentation: r.presentation,
    cup_type: r.cupType,
    photo: r.photo,
    video: r.video,
    allergens: r.allergens ?? [],
    cost: r.cost,
    notes: r.notes,
    status: r.status ?? "draft",
    content: r.content ?? [],
    tags: r.tags ?? [],
    company_id: r.companyId ?? "company-1",
    created_by: r.createdBy ?? "user-admin",
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from("recipes").upsert(payload);
  if (error) throw error;
}

export async function deleteRecipe(id: string) {
  const { error } = await supabase.from("recipes").delete().eq("id", id);
  if (error) throw error;
}

// ─── Announcements ────────────────────────────────────────────────────────────

export async function getAnnouncements(): Promise<Announcement[]> {
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    title: r.title,
    content: r.content,
    publishDate: r.publish_date,
    endDate: r.end_date,
    targetRoles: r.target_roles ?? [],
    targetBranches: r.target_branches ?? [],
    sendNotification: r.send_notification,
    status: r.status,
    priority: r.priority,
    companyId: r.company_id,
    createdBy: r.created_by,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

export async function upsertAnnouncement(a: Partial<Announcement> & { id: string }) {
  const { error } = await supabase.from("announcements").upsert({
    id: a.id,
    title: a.title,
    content: a.content,
    publish_date: a.publishDate,
    end_date: a.endDate,
    target_roles: a.targetRoles ?? [],
    target_branches: a.targetBranches ?? [],
    send_notification: a.sendNotification ?? false,
    status: a.status ?? "draft",
    priority: a.priority ?? "medium",
    company_id: a.companyId ?? "company-1",
    created_by: a.createdBy ?? "user-admin",
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function deleteAnnouncement(id: string) {
  const { error } = await supabase.from("announcements").delete().eq("id", id);
  if (error) throw error;
}

// ─── Documents ────────────────────────────────────────────────────────────────

export async function getDocumentFolders(): Promise<DocumentFolder[]> {
  const { data, error } = await supabase
    .from("document_folders")
    .select("*")
    .order("name");
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    parentId: r.parent_id,
    companyId: r.company_id,
  }));
}

export async function upsertDocumentFolder(f: Partial<DocumentFolder> & { id: string }) {
  const { error } = await supabase.from("document_folders").upsert({
    id: f.id,
    name: f.name,
    parent_id: f.parentId,
    company_id: f.companyId ?? "company-1",
  });
  if (error) throw error;
}

export async function deleteDocumentFolder(id: string) {
  const { error } = await supabase.from("document_folders").delete().eq("id", id);
  if (error) throw error;
}

export async function getDocuments(): Promise<Document[]> {
  const { data, error } = await supabase
    .from("documents")
    .select("*, folder:document_folders(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    type: r.type,
    url: r.url,
    size: r.size,
    folderId: r.folder_id,
    folder: r.folder,
    tags: r.tags ?? [],
    status: r.status,
    companyId: r.company_id,
    createdBy: r.created_by,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

export async function upsertDocument(d: Partial<Document> & { id: string }) {
  const { error } = await supabase.from("documents").upsert({
    id: d.id,
    name: d.name,
    type: d.type ?? "other",
    url: d.url,
    size: d.size ?? 0,
    folder_id: d.folderId,
    tags: d.tags ?? [],
    status: d.status ?? "published",
    company_id: d.companyId ?? "company-1",
    created_by: d.createdBy ?? "user-admin",
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function deleteDocument(id: string) {
  const { error } = await supabase.from("documents").delete().eq("id", id);
  if (error) throw error;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function getUsers(): Promise<User[]> {
  // Şifre hash'leri hiçbir zaman tarayıcıya indirilmez.
  const { data, error } = await supabase
    .from("users")
    .select("id,name,username,email,role,avatar,company_id,branch_id,department,position,status,created_at,last_login_at")
    .order("name");
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    username: r.username,
    email: r.email,
    role: r.role,
    avatar: r.avatar,
    companyId: r.company_id,
    branchId: r.branch_id,
    department: r.department,
    position: r.position,
    status: r.status,
    badges: [],
    createdAt: r.created_at,
    lastLoginAt: r.last_login_at,
  }));
}

/**
 * Sunucu taraflı giriş — şifre karşılaştırması Supabase'de (bcrypt) yapılır.
 * Başarılıysa şifresiz User döner, aksi halde null.
 */
export async function login(username: string, password: string): Promise<User | null> {
  const { data, error } = await supabase.rpc("app_login", {
    p_username: username,
    p_password: password,
  });
  if (error || !data) return null;
  const raw = data as Record<string, unknown>;
  // security-v2.sql sonrası cevap { user, sessionToken } biçimindedir.
  // Eski RPC cevabını da geçiş sürecinde destekle.
  const d = (raw.user ?? raw) as Record<string, unknown>;
  const sessionToken = raw.sessionToken as string | undefined;
  if (sessionToken) setDatabaseSession(sessionToken);
  // son giriş zamanını güncelle (hata olsa da girişi engellemesin)
  supabase.rpc("app_touch_last_login", { p_user_id: d.id as string }).then(() => {}, () => {});
  return {
    id: d.id as string,
    name: d.name as string,
    username: d.username as string,
    email: (d.email as string) ?? undefined,
    role: d.role as User["role"],
    avatar: (d.avatar as string) ?? undefined,
    companyId: d.company_id as string,
    branchId: (d.branch_id as string) ?? undefined,
    department: (d.department as string) ?? undefined,
    position: (d.position as string) ?? undefined,
    status: d.status as User["status"],
    badges: [],
    createdAt: d.created_at as string,
    lastLoginAt: (d.last_login_at as string) ?? undefined,
  };
}

export async function logout() {
  const token = typeof window !== "undefined" ? localStorage.getItem("kupa-db-session") : null;
  if (token) {
    try { await supabase.rpc("app_logout", { p_token: token }); } catch { /* yerel çıkışı engelleme */ }
  }
  setDatabaseSession();
}

/** Sadece tanımlı alanları payload'a alır (undefined = değişiklik yok) */
function buildUserPayload(u: Partial<User>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  const set = (k: string, v: unknown) => { if (v !== undefined) payload[k] = v; };
  set("name", u.name);
  set("username", u.username);
  set("email", u.email);
  set("role", u.role);
  set("avatar", u.avatar);
  set("company_id", u.companyId);
  set("branch_id", u.branchId);
  set("department", u.department);
  set("position", u.position);
  set("status", u.status);
  if (u.password?.trim()) payload.password = u.password;
  return payload;
}

/**
 * Yeni kullanıcı ekler VEYA mevcutu tamamen üzerine yazar.
 * upsert = INSERT ... ON CONFLICT (id) DO UPDATE — bu yüzden yeni satır için
 * password gibi NOT NULL alanları verilmelidir. Kısmi güncelleme için updateUser'ı kullanın.
 */
export async function upsertUser(u: Partial<User> & { id: string }) {
  const payload = { id: u.id, ...buildUserPayload(u) };
  const { error } = await supabase.from("users").upsert(payload);
  if (error) throw error;
}

/** Mevcut kullanıcının yalnızca verilen alanlarını günceller (NOT NULL alanlarına dokunmaz). */
export async function updateUser(id: string, u: Partial<User>) {
  const payload = buildUserPayload(u);
  if (Object.keys(payload).length === 0) return;
  const { error } = await supabase.from("users").update(payload).eq("id", id);
  if (error) throw error;
}

/** Kullanıcının mevcut şifresini doğrulayıp yeni şifreyi sunucuda hash'leyerek değiştirir. */
export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const { data, error } = await supabase.rpc("app_change_password", {
    p_user_id: userId,
    p_current_password: currentPassword,
    p_new_password: newPassword,
  });
  if (error) throw error;
  return data === true;
}

export async function deleteUser(id: string) {
  const { error } = await supabase.from("users").delete().eq("id", id);
  if (error) throw error;
}

export type PersonnelRegistrationReason =
  | "invalid_name" | "invalid_username" | "weak_password"
  | "invalid_branch" | "username_taken" | "unknown";

export type PersonnelRegistrationResult =
  | { ok: true }
  | { ok: false; reason: PersonnelRegistrationReason };

/** Giriş yapmadan kayıt ekranında gösterilecek aktif şubeler. */
export async function getPublicBranches(): Promise<Branch[]> {
  const { data, error } = await supabase.rpc("app_public_branches");
  if (error) throw error;
  return ((data ?? []) as Array<Record<string, unknown>>).map((r) => ({
    id: r.id as string,
    name: r.name as string,
    companyId: r.company_id as string,
    address: (r.address as string) ?? undefined,
    status: "active",
  }));
}

/** Personel başvurusunu daima barista ve onay bekliyor durumunda oluşturur. */
export async function registerPersonnel(input: {
  name: string;
  username: string;
  password: string;
  branchId: string;
}): Promise<PersonnelRegistrationResult> {
  const { data, error } = await supabase.rpc("app_register_personnel", {
    p_name: input.name,
    p_username: input.username,
    p_password: input.password,
    p_branch_id: input.branchId,
  });
  if (error) throw error;
  const result = data as { ok?: boolean; reason?: PersonnelRegistrationReason } | null;
  if (result?.ok) return { ok: true };
  return { ok: false, reason: result?.reason ?? "unknown" } as PersonnelRegistrationResult;
}

// ─── Branches ─────────────────────────────────────────────────────────────────

export async function getBranches(): Promise<Branch[]> {
  const { data, error } = await supabase
    .from("branches")
    .select("*")
    .order("name");
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    companyId: r.company_id,
    address: r.address,
    status: r.status,
  }));
}

export async function upsertBranch(b: Branch) {
  const { error } = await supabase.from("branches").upsert({
    id: b.id,
    name: b.name,
    company_id: b.companyId,
    address: b.address ?? null,
    status: b.status,
  });
  if (error) throw error;
}

export async function deleteBranch(id: string) {
  const { error } = await supabase.from("branches").delete().eq("id", id);
  if (error) throw error;
}

// ─── Badges ───────────────────────────────────────────────────────────────────

export async function getBadges(): Promise<Badge[]> {
  const { data, error } = await supabase.from("badges").select("*");
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    icon: r.icon,
    description: r.description,
    condition: r.condition,
    companyId: r.company_id,
  }));
}

// ─── Training Completions ─────────────────────────────────────────────────────

export async function getCompletions(userId: string): Promise<TrainingCompletion[]> {
  const { data, error } = await supabase
    .from("training_completions")
    .select("*")
    .eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    userId: r.user_id,
    trainingId: r.training_id,
    completedAt: r.completed_at,
    score: r.score,
    certificateUrl: r.certificate_url,
  }));
}

export async function getAllCompletions(): Promise<TrainingCompletion[]> {
  const { data, error } = await supabase.from("training_completions").select("*");
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    userId: r.user_id,
    trainingId: r.training_id,
    completedAt: r.completed_at,
    score: r.score,
  }));
}

export async function insertCompletion(c: TrainingCompletion) {
  const { error } = await supabase.from("training_completions").upsert({
    id: c.id,
    user_id: c.userId,
    training_id: c.trainingId,
    completed_at: c.completedAt,
    score: c.score,
  });
  if (error) throw error;
}

// ─── Notifications ────────────────────────────────────────────────────────────

export async function getNotifications(userId: string): Promise<Notification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    userId: r.user_id,
    title: r.title,
    message: r.message,
    type: r.type,
    contentId: r.content_id,
    read: r.read,
    createdAt: r.created_at,
  }));
}

export async function getAllNotifications(): Promise<Notification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    userId: r.user_id,
    title: r.title,
    message: r.message,
    type: r.type,
    contentId: r.content_id,
    read: r.read,
    createdAt: r.created_at,
  }));
}

export async function insertNotification(n: Notification) {
  const { error } = await supabase.from("notifications").insert({
    id: n.id,
    user_id: n.userId,
    title: n.title,
    message: n.message,
    type: n.type,
    content_id: n.contentId,
    read: n.read,
    created_at: n.createdAt,
  });
  if (error) throw error;
}

/** Toplu bildirim ekleme (fanout) */
export async function insertNotifications(list: Notification[]) {
  if (list.length === 0) return;
  const { error } = await supabase.from("notifications").insert(
    list.map((n) => ({
      id: n.id,
      user_id: n.userId,
      title: n.title,
      message: n.message,
      type: n.type,
      content_id: n.contentId,
      read: n.read,
      created_at: n.createdAt,
    }))
  );
  if (error) throw error;
}

export async function markNotificationRead(id: string) {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", id);
  if (error) throw error;
}

export async function markAllNotificationsRead(userId: string) {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", userId);
  if (error) throw error;
}

// ─── Operasyon: Checklist Şablonları ──────────────────────────────────────────

export async function getOpsTemplates(): Promise<ChecklistTemplate[]> {
  const { data, error } = await supabase.from("ops_templates").select("*");
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    type: r.type,
    title: r.title,
    sections: r.sections ?? [],
  }));
}

export async function upsertOpsTemplate(t: ChecklistTemplate) {
  const { error } = await supabase.from("ops_templates").upsert({
    id: t.id,
    type: t.type,
    title: t.title,
    sections: t.sections,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

// ─── Operasyon: Kontrol Kayıtları ─────────────────────────────────────────────

function mapRun(r: Record<string, any>): ChecklistRun {
  return {
    id: r.id,
    type: r.type,
    templateId: r.template_id,
    branchId: r.branch_id,
    userId: r.user_id,
    date: r.date,
    startedAt: r.started_at ?? undefined,
    completedAt: r.completed_at ?? undefined,
    status: r.status,
    sections: r.sections ?? [],
    score: r.score ?? undefined,
    managerComment: r.manager_comment ?? undefined,
    gpsLat: r.gps_lat ?? undefined,
    gpsLng: r.gps_lng ?? undefined,
    aiScore: r.ai_score ?? undefined,
  };
}

export async function getOpsRuns(): Promise<ChecklistRun[]> {
  const { data, error } = await supabase
    .from("ops_runs")
    .select("*")
    .order("date", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapRun);
}

export async function upsertOpsRun(run: ChecklistRun) {
  const { error } = await supabase.from("ops_runs").upsert({
    id: run.id,
    type: run.type,
    template_id: run.templateId,
    branch_id: run.branchId,
    user_id: run.userId,
    date: run.date,
    started_at: run.startedAt ?? null,
    completed_at: run.completedAt ?? null,
    status: run.status,
    sections: run.sections,
    score: run.score ?? null,
    manager_comment: run.managerComment ?? null,
    gps_lat: run.gpsLat ?? null,
    gps_lng: run.gpsLng ?? null,
    ai_score: run.aiScore ?? null,
  });
  if (error) throw error;
}

// ─── Operasyon: Fotoğraflar ───────────────────────────────────────────────────

export async function getOpsPhotos(): Promise<OpsPhoto[]> {
  const { data, error } = await supabase
    .from("ops_photos")
    .select("*")
    .order("taken_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    url: r.url,
    storagePath: r.storage_path ?? undefined,
    branchId: r.branch_id,
    userId: r.user_id,
    runId: r.run_id ?? undefined,
    sectionId: r.section_id ?? undefined,
    itemId: r.item_id ?? undefined,
    categoryLabel: r.category_label ?? "",
    takenAt: r.taken_at,
    aiAnalysis: r.ai_analysis ?? undefined,
  }));
}

export async function insertOpsPhoto(p: OpsPhoto) {
  const { error } = await supabase.from("ops_photos").insert({
    id: p.id,
    url: p.url,
    storage_path: p.storagePath ?? null,
    branch_id: p.branchId,
    user_id: p.userId,
    run_id: p.runId ?? null,
    section_id: p.sectionId ?? null,
    item_id: p.itemId ?? null,
    category_label: p.categoryLabel,
    taken_at: p.takenAt,
  });
  if (error) throw error;
}

/** Fotoğrafı Storage'a yükler, public URL + path döner */
export async function uploadOpsPhoto(
  file: File | Blob,
  branchId: string
): Promise<{ url: string; path: string }> {
  const ext = file instanceof File ? file.name.split(".").pop() || "jpg" : "jpg";
  const path = `${branchId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage
    .from("ops-photos")
    .upload(path, file, { contentType: file.type || "image/jpeg", upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from("ops-photos").getPublicUrl(path);
  return { url: data.publicUrl, path };
}

// ─── Operasyon: Görevler ──────────────────────────────────────────────────────

export async function getOpsTasks(): Promise<OpsTask[]> {
  const { data, error } = await supabase
    .from("ops_tasks")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description ?? undefined,
    branchId: r.branch_id,
    assigneeId: r.assignee_id ?? undefined,
    dueDate: r.due_date ?? undefined,
    status: r.status,
    createdBy: r.created_by,
    createdAt: r.created_at,
    completedAt: r.completed_at ?? undefined,
  }));
}

export async function upsertOpsTask(t: OpsTask) {
  const { error } = await supabase.from("ops_tasks").upsert({
    id: t.id,
    title: t.title,
    description: t.description ?? null,
    branch_id: t.branchId,
    assignee_id: t.assigneeId ?? null,
    due_date: t.dueDate ?? null,
    status: t.status,
    created_by: t.createdBy,
    created_at: t.createdAt,
    completed_at: t.completedAt ?? null,
  });
  if (error) throw error;
}

// ─── Kariyer Başvuruları ──────────────────────────────────────────────────────

export async function getJobApplications(): Promise<JobApplication[]> {
  const { data, error } = await supabase
    .from("job_applications")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    fullName: r.full_name,
    phone: r.phone,
    email: r.email ?? undefined,
    city: r.city ?? undefined,
    position: r.position ?? undefined,
    experience: r.experience ?? undefined,
    message: r.message ?? undefined,
    cvUrl: r.cv_url ?? undefined,
    cvPath: r.cv_path ?? undefined,
    status: r.status,
    createdAt: r.created_at,
  }));
}

export async function insertJobApplication(a: JobApplication) {
  const { error } = await supabase.from("job_applications").insert({
    id: a.id,
    full_name: a.fullName,
    phone: a.phone,
    email: a.email ?? null,
    city: a.city ?? null,
    position: a.position ?? null,
    experience: a.experience ?? null,
    message: a.message ?? null,
    cv_url: a.cvUrl ?? null,
    cv_path: a.cvPath ?? null,
    status: a.status,
    created_at: a.createdAt,
  });
  if (error) throw error;
}

export async function updateJobApplicationStatus(id: string, status: JobApplication["status"]) {
  const { error } = await supabase.from("job_applications").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function deleteJobApplication(id: string) {
  const { error } = await supabase.from("job_applications").delete().eq("id", id);
  if (error) throw error;
}

/** CV dosyasını Storage'a yükler, public URL + path döner */
export async function uploadCV(file: File): Promise<{ url: string; path: string }> {
  const ext = file.name.split(".").pop() || "pdf";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage
    .from("cv-files")
    .upload(path, file, { contentType: file.type || "application/pdf", upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from("cv-files").getPublicUrl(path);
  return { url: data.publicUrl, path };
}

// ─── Push Abonelikleri ────────────────────────────────────────────────────────

export async function savePushSubscription(s: {
  id: string; userId: string; endpoint: string; p256dh: string; auth: string; userAgent?: string;
}) {
  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      id: s.id, user_id: s.userId, endpoint: s.endpoint,
      p256dh: s.p256dh, auth: s.auth, user_agent: s.userAgent ?? null,
    },
    { onConflict: "endpoint" }
  );
  if (error) throw error;
}

export async function deletePushSubscription(endpoint: string) {
  const { error } = await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
  if (error) throw error;
}

/** Edge function'ı tetikleyerek push gönderir (fire-and-forget kullanılır) */
export async function sendPushToUsers(
  userIds: string[],
  payload: { title: string; body: string; url?: string; tag?: string }
) {
  if (!userIds.length) return;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const session = getDatabaseSession();
  if (!base || !key || !session) return;
  await fetch(`${base}/functions/v1/send-push`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: key,
      Authorization: `Bearer ${key}`,
      "x-kupa-session": session,
    },
    body: JSON.stringify({ userIds, ...payload }),
  });
}
