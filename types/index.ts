export type UserRole = "admin" | "barista";

export interface User {
  id: string;
  name: string;
  username: string;
  /** Yalnızca kullanıcı oluşturma/şifre sıfırlama isteklerinde kullanılır. */
  password?: string;
  email?: string;
  role: UserRole;
  avatar?: string;
  companyId: string;
  branchId?: string;
  department?: string;
  position?: string;
  status: "active" | "inactive" | "pending";
  badges: Badge[];
  createdAt: string;
  lastLoginAt?: string;
}

export interface Company {
  id: string;
  name: string;
  logo?: string;
  primaryColor?: string;
  slug: string;
  status: "active" | "inactive";
  createdAt: string;
}

export interface Branch {
  id: string;
  name: string;
  companyId: string;
  address?: string;
  status: "active" | "inactive";
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
  type: ContentType;
  order: number;
}

export type ContentType =
  | "training"
  | "video"
  | "sop"
  | "recipe"
  | "product"
  | "document"
  | "announcement";

export type ContentStatus = "published" | "draft" | "archived";

export interface Training {
  id: string;
  title: string;
  description?: string;
  coverImage?: string;
  categoryId?: string;
  category?: Category;
  content: BlockContent[];
  status: ContentStatus;
  duration?: number;
  order: number;
  requiredForRoles: UserRole[];
  completions: TrainingCompletion[];
  quiz?: Quiz;
  tags: string[];
  companyId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface TrainingCompletion {
  id: string;
  userId: string;
  trainingId: string;
  completedAt: string;
  score?: number;
  certificateUrl?: string;
}

export interface Video {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  url?: string;
  youtubeId?: string;
  vimeoId?: string;
  duration?: number;
  categoryId?: string;
  category?: Category;
  tags: string[];
  status: ContentStatus;
  views: number;
  companyId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SOP {
  id: string;
  title: string;
  description?: string;
  categoryId?: string;
  category?: Category;
  steps: SOPStep[];
  checklist: ChecklistItem[];
  revisionDate?: string;
  version: string;
  status: ContentStatus;
  content: BlockContent[];
  tags: string[];
  companyId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SOPStep {
  id: string;
  order: number;
  title: string;
  description?: string;
  image?: string;
  video?: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  required: boolean;
}

export interface Recipe {
  id: string;
  name: string;
  description?: string;
  categoryId?: string;
  category?: Category;
  ingredients: Ingredient[];
  preparation: string;
  presentation?: string;
  cupType?: string;
  photo?: string;
  video?: string;
  allergens: string[];
  cost?: number;
  notes?: string;
  status: ContentStatus;
  content: BlockContent[];
  tags: string[];
  companyId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  content?: string;
  allergens: string[];
  calories?: number;
  presentation?: string;
  photo?: string;
  video?: string;
  categoryId?: string;
  category?: Category;
  status: ContentStatus;
  companyId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  publishDate?: string;
  endDate?: string;
  targetRoles: UserRole[];
  targetBranches: string[];
  sendNotification: boolean;
  status: ContentStatus;
  priority: "low" | "medium" | "high";
  companyId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  name: string;
  type: "pdf" | "excel" | "word" | "video" | "image" | "other";
  url: string;
  size: number;
  folderId?: string;
  folder?: DocumentFolder;
  tags: string[];
  status: ContentStatus;
  companyId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentFolder {
  id: string;
  name: string;
  parentId?: string;
  companyId: string;
}

export interface Quiz {
  id: string;
  title: string;
  questions: Question[];
  passingScore: number;
  timeLimit?: number;
  certificateOnPass: boolean;
  trainingId?: string;
  companyId: string;
  createdAt: string;
}

export interface Question {
  id: string;
  type: "multiple_choice" | "true_false" | "fill_blank" | "image_choice";
  text: string;
  image?: string;
  options?: QuestionOption[];
  correctAnswer: string;
  points: number;
  explanation?: string;
}

export interface QuestionOption {
  id: string;
  text: string;
  image?: string;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  condition: BadgeCondition;
  companyId: string;
  earnedAt?: string;
}

export interface BadgeCondition {
  type: "training_count" | "quiz_score" | "specific_training" | "login_streak";
  value: number | string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: ContentType | "system";
  contentId?: string;
  read: boolean;
  createdAt: string;
}

export type JobApplicationStatus = "new" | "reviewing" | "accepted" | "rejected";

export interface JobApplication {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  city?: string;
  position?: string;
  experience?: string;
  message?: string;
  cvUrl?: string;
  cvPath?: string;
  status: JobApplicationStatus;
  createdAt: string;
}

export interface MediaFile {
  id: string;
  name: string;
  url: string;
  type: "image" | "video" | "pdf" | "document";
  size: number;
  mimeType: string;
  companyId: string;
  createdBy: string;
  createdAt: string;
}

// Block editor types
export type BlockType =
  | "heading1"
  | "heading2"
  | "heading3"
  | "paragraph"
  | "bullet_list"
  | "ordered_list"
  | "image"
  | "video"
  | "youtube"
  | "pdf"
  | "alert"
  | "info"
  | "blockquote"
  | "table"
  | "code"
  | "button"
  | "divider";

export interface BlockContent {
  id: string;
  type: BlockType;
  data: Record<string, unknown>;
}

// Dashboard stats
export interface DashboardStats {
  completedTrainings: number;
  pendingTrainings: number;
  totalBadges: number;
  upcomingQuizzes: number;
  recentAnnouncements: Announcement[];
  recentVideos: Video[];
  trainingProgress: TrainingProgress[];
}

export interface TrainingProgress {
  trainingId: string;
  title: string;
  progress: number;
  dueDate?: string;
}

// Report types
export interface Report {
  type: "training_completion" | "video_views" | "quiz_results" | "user_activity";
  data: Record<string, unknown>[];
  generatedAt: string;
}
