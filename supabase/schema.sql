-- =============================================
-- Kupa Academy - Supabase Schema
-- =============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── Companies ─────────────────────────────────
create table if not exists companies (
  id text primary key,
  name text not null,
  logo text,
  primary_color text,
  slug text unique not null,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

-- ── Branches ──────────────────────────────────
create table if not exists branches (
  id text primary key,
  name text not null,
  company_id text not null references companies(id) on delete cascade,
  address text,
  status text not null default 'active'
);

-- ── Users ─────────────────────────────────────
create table if not exists users (
  id text primary key,
  name text not null,
  username text unique not null,
  password text not null,
  email text,
  role text not null default 'barista',
  avatar text,
  company_id text not null references companies(id) on delete cascade,
  branch_id text references branches(id),
  department text,
  position text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  last_login_at timestamptz
);

-- ── Categories ────────────────────────────────
create table if not exists categories (
  id text primary key,
  name text not null,
  slug text not null,
  icon text,
  color text,
  type text not null,
  "order" integer not null default 0
);

-- ── Trainings ─────────────────────────────────
create table if not exists trainings (
  id text primary key,
  title text not null,
  description text,
  cover_image text,
  category_id text references categories(id),
  content jsonb not null default '[]',
  status text not null default 'draft',
  duration integer,
  "order" integer not null default 0,
  required_for_roles text[] not null default '{}',
  tags text[] not null default '{}',
  company_id text not null references companies(id) on delete cascade,
  created_by text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

-- ── Training Completions ───────────────────────
create table if not exists training_completions (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  training_id text not null references trainings(id) on delete cascade,
  completed_at timestamptz not null default now(),
  score integer,
  certificate_url text,
  unique(user_id, training_id)
);

-- ── Videos ────────────────────────────────────
create table if not exists videos (
  id text primary key,
  title text not null,
  description text,
  thumbnail text,
  url text,
  youtube_id text,
  vimeo_id text,
  duration integer,
  category_id text references categories(id),
  tags text[] not null default '{}',
  status text not null default 'draft',
  views integer not null default 0,
  company_id text not null references companies(id) on delete cascade,
  created_by text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Recipes ───────────────────────────────────
create table if not exists recipes (
  id text primary key,
  name text not null,
  description text,
  category_id text references categories(id),
  ingredients jsonb not null default '[]',
  preparation text not null default '',
  presentation text,
  cup_type text,
  photo text,
  video text,
  allergens text[] not null default '{}',
  cost numeric,
  notes text,
  status text not null default 'draft',
  content jsonb not null default '[]',
  tags text[] not null default '{}',
  company_id text not null references companies(id) on delete cascade,
  created_by text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Announcements ─────────────────────────────
create table if not exists announcements (
  id text primary key,
  title text not null,
  content text not null,
  publish_date timestamptz,
  end_date timestamptz,
  target_roles text[] not null default '{}',
  target_branches text[] not null default '{}',
  send_notification boolean not null default false,
  status text not null default 'draft',
  priority text not null default 'medium',
  company_id text not null references companies(id) on delete cascade,
  created_by text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Document Folders ──────────────────────────
create table if not exists document_folders (
  id text primary key,
  name text not null,
  parent_id text references document_folders(id),
  company_id text not null references companies(id) on delete cascade
);

-- ── Documents ─────────────────────────────────
create table if not exists documents (
  id text primary key,
  name text not null,
  type text not null default 'other',
  url text not null,
  size integer not null default 0,
  folder_id text references document_folders(id),
  tags text[] not null default '{}',
  status text not null default 'published',
  company_id text not null references companies(id) on delete cascade,
  created_by text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Badges ────────────────────────────────────
create table if not exists badges (
  id text primary key,
  name text not null,
  icon text not null,
  description text not null,
  condition jsonb not null,
  company_id text not null references companies(id) on delete cascade
);

-- ── User Badges ───────────────────────────────
create table if not exists user_badges (
  user_id text not null references users(id) on delete cascade,
  badge_id text not null references badges(id) on delete cascade,
  earned_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);

-- ── Notifications ─────────────────────────────
create table if not exists notifications (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null,
  content_id text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ── Permissions (anon + authenticated full access, RLS off) ───
do $$
declare t text;
begin
  for t in select tablename from pg_tables where schemaname = 'public'
  loop
    execute format('alter table public.%I disable row level security', t);
    execute format('grant all privileges on table public.%I to anon', t);
    execute format('grant all privileges on table public.%I to authenticated', t);
  end loop;
end;
$$;
grant usage on schema public to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;

-- =============================================
-- SEED DATA
-- =============================================

-- Company
insert into companies (id, name, slug, status) values
  ('company-1', 'Kupa Coffee', 'kupa-coffee', 'active')
on conflict (id) do nothing;

-- Branches
insert into branches (id, name, company_id, status) values
  ('branch-1', 'Merkez Şube', 'company-1', 'active'),
  ('branch-2', 'Kadıköy Şube', 'company-1', 'active'),
  ('branch-3', 'Beşiktaş Şube', 'company-1', 'active')
on conflict (id) do nothing;

-- Users
insert into users (id, name, username, password, role, company_id, branch_id, position, status) values
  ('user-admin', 'Admin Kullanıcı', 'admin', 'admin123', 'admin', 'company-1', 'branch-1', 'Yönetici', 'active'),
  ('user-1', 'Mehmet Demir', 'mehmet.demir', 'barista123', 'barista', 'company-1', 'branch-1', 'Baş Barista', 'active'),
  ('user-2', 'Ayşe Kaya', 'ayse.kaya', 'barista123', 'barista', 'company-1', 'branch-2', 'Barista', 'active'),
  ('user-3', 'Ali Çelik', 'ali.celik', 'barista123', 'barista', 'company-1', 'branch-1', 'Barista', 'active')
on conflict (id) do nothing;

-- Categories
insert into categories (id, name, slug, icon, color, type, "order") values
  ('cat-1', 'Kahve Teknikleri', 'kahve-teknikleri', '☕', '#d97706', 'training', 1),
  ('cat-2', 'Ekipman', 'ekipman', '⚙️', '#6366f1', 'training', 2),
  ('cat-3', 'Müşteri Hizmetleri', 'musteri-hizmetleri', '🤝', '#10b981', 'training', 3),
  ('cat-4', 'Hijyen & Güvenlik', 'hijyen-guvenlik', '🧼', '#ef4444', 'training', 4),
  ('cat-recipe-1', 'Espresso Bazlı', 'espresso-bazli', '☕', '#d97706', 'recipe', 1),
  ('cat-recipe-2', 'Soğuk İçecekler', 'soguk-iceçekler', '🧊', '#3b82f6', 'recipe', 2),
  ('cat-recipe-3', 'Sıcak İçecekler', 'sicak-iceçekler', '🍵', '#f59e0b', 'recipe', 3)
on conflict (id) do nothing;

-- Document Folders
insert into document_folders (id, name, company_id) values
  ('folder-1', 'Prosedürler', 'company-1'),
  ('folder-2', 'İnsan Kaynakları', 'company-1'),
  ('folder-3', 'Ürün & Menü', 'company-1'),
  ('folder-4', 'Hijyen & Güvenlik', 'company-1'),
  ('folder-5', 'Eğitim Materyalleri', 'company-1')
on conflict (id) do nothing;

-- Badges
insert into badges (id, name, icon, description, condition, company_id) values
  ('badge-1', 'İlk Adım', '🎯', 'İlk eğitimini tamamla', '{"type": "training_count", "value": 1}', 'company-1'),
  ('badge-2', 'Espresso Ustası', '☕', 'Espresso eğitimini tamamla', '{"type": "specific_training", "value": "training-1"}', 'company-1'),
  ('badge-3', 'Üçlü Başarı', '🏆', '3 eğitimi tamamla', '{"type": "training_count", "value": 3}', 'company-1')
on conflict (id) do nothing;

-- Trainings (with content blocks)
insert into trainings (id, title, description, category_id, content, status, duration, "order", required_for_roles, tags, company_id, created_by, published_at) values
  (
    'training-1',
    'Espresso Temelleri',
    'Mükemmel espresso çekmenin temel prensipleri ve teknikleri.',
    'cat-1',
    '[
      {"id":"b1","type":"heading1","data":{"content":"Espresso Nedir?"}},
      {"id":"b2","type":"paragraph","data":{"content":"Espresso, yüksek basınç altında sıcak suyun ince öğütülmüş kahve tozu üzerinden geçirilmesiyle elde edilen yoğun ve aromalı bir kahve içeceğidir."}},
      {"id":"b3","type":"heading2","data":{"content":"İdeal Çekim Parametreleri"}},
      {"id":"b4","type":"bullet_list","data":{"content":"Su sıcaklığı: 88-93°C\n25-30 saniye çekim süresi\n18-21 gram kahve\n36-42 gram çıktı (double shot)\n9 bar basınç"}},
      {"id":"b5","type":"info","data":{"content":"Öğütme kalınlığı espresso kalitesini doğrudan etkiler. Çok ince öğütme acı, çok kaba öğütme ekşi tat verir."}},
      {"id":"b6","type":"alert","data":{"content":"Su sıcaklığı 95°C üzerine çıkmamalıdır — kahveyi yakar ve tat profilini bozar."}},
      {"id":"b7","type":"heading2","data":{"content":"Adım Adım Espresso Çekimi"}},
      {"id":"b8","type":"bullet_list","data":{"content":"Portafiltreyi temizle ve kurula\nKahveyi tart ve portafiltreye doldur\nEşit dağıt ve düzgün bastır (30 lb)\nMakineye tak ve hemen başlat\nZamanlayıcıyı başlat ve akışı izle"}}
    ]'::jsonb,
    'published',
    45,
    1,
    ARRAY['barista'],
    ARRAY['espresso', 'temel', 'kahve'],
    'company-1',
    'user-admin',
    now()
  ),
  (
    'training-2',
    'Milk Art (Latte Art)',
    'Süt köpürtme teknikleri ve latte art tasarımları.',
    'cat-1',
    '[
      {"id":"b1","type":"heading1","data":{"content":"Süt Köpürtme Temelleri"}},
      {"id":"b2","type":"paragraph","data":{"content":"Doğru süt köpürtme, latte art''ın temelidir. Mikro köpük elde etmek için süt sıcaklığını ve buharlama açısını doğru ayarlamak kritik önem taşır."}},
      {"id":"b3","type":"heading2","data":{"content":"İdeal Süt Sıcaklığı"}},
      {"id":"b4","type":"info","data":{"content":"Süt 60-65°C arasında olmalıdır. Bu sıcaklık hem tat hem de doku için idealdir."}},
      {"id":"b5","type":"bullet_list","data":{"content":"Süt kabını soğuk tutun\nBuhar çubuğunu süte 45° açıyla tutun\nSüreci 20-25 saniyede tamamlayın\nSüt yüzeyini parlak ve pürüzsüz tutun"}}
    ]'::jsonb,
    'published',
    60,
    2,
    ARRAY['barista'],
    ARRAY['latte art', 'süt', 'teknik'],
    'company-1',
    'user-admin',
    now()
  ),
  (
    'training-3',
    'Müşteri Memnuniyeti',
    'Müşterilerle etkili iletişim ve hizmet kalitesi.',
    'cat-3',
    '[
      {"id":"b1","type":"heading1","data":{"content":"Mükemmel Müşteri Deneyimi"}},
      {"id":"b2","type":"paragraph","data":{"content":"Her müşteri etkileşimi bir fırsat. Samimi, hızlı ve dikkatli hizmet müşteri sadakatinin temelidir."}},
      {"id":"b3","type":"bullet_list","data":{"content":"Göz teması kurun ve gülümseyin\nSiparişi tekrar onaylayın\nMüşteriyi ismiyle hitap edin\nBekleme süresi uzarsa bilgilendirin\nHataları proaktif çözün"}}
    ]'::jsonb,
    'published',
    30,
    3,
    ARRAY['barista'],
    ARRAY['müşteri', 'iletişim', 'hizmet'],
    'company-1',
    'user-admin',
    now()
  )
on conflict (id) do nothing;

-- Announcements
insert into announcements (id, title, content, target_roles, status, priority, company_id, created_by) values
  (
    'ann-1',
    'Yeni Menü Lansmanı',
    'Sonbahar menümüz 1 Ekim''den itibaren aktif olacak. Yeni reçeteler için eğitimleri tamamlamayı unutmayın.',
    ARRAY['admin', 'barista'],
    'published',
    'high',
    'company-1',
    'user-admin'
  ),
  (
    'ann-2',
    'Hijyen Denetimi',
    'Bu ay içinde şube bazlı hijyen denetimleri yapılacaktır. Tüm ekipmanların temizlik protokollerine uyulmasını rica ederiz.',
    ARRAY['barista'],
    'published',
    'high',
    'company-1',
    'user-admin'
  )
on conflict (id) do nothing;

-- Videos
insert into videos (id, title, description, youtube_id, category_id, tags, status, views, company_id, created_by) values
  ('video-1', 'Espresso Çekimi - Masterclass', 'Profesyonel baristalardan espresso teknikleri', 'dQw4w9WgXcQ', 'cat-1', ARRAY['espresso', 'teknik'], 'published', 0, 'company-1', 'user-admin'),
  ('video-2', 'Latte Art Temelleri', 'Adım adım latte art öğrenin', 'dQw4w9WgXcQ', 'cat-1', ARRAY['latte', 'süt sanatı'], 'published', 0, 'company-1', 'user-admin')
on conflict (id) do nothing;
