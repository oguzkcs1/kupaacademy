-- =============================================
-- Kupa Academy - Operasyon Merkezi Şeması
-- (schema.sql çalıştırıldıktan sonra bunu çalıştırın)
-- =============================================

-- ── Checklist Şablonları ──────────────────────
-- Her tip (opening/closing) için tek satır; sections nested JSONB
create table if not exists ops_templates (
  id text primary key,
  type text not null,               -- 'opening' | 'closing'
  title text not null,
  sections jsonb not null default '[]',
  company_id text not null default 'company-1',
  updated_at timestamptz not null default now()
);

-- ── Kontrol Kayıtları (Runs) ──────────────────
create table if not exists ops_runs (
  id text primary key,
  type text not null,               -- 'opening' | 'closing'
  template_id text not null,
  branch_id text not null references branches(id) on delete cascade,
  user_id text not null,
  date text not null,               -- YYYY-MM-DD
  started_at timestamptz,
  completed_at timestamptz,
  status text not null default 'in_progress',
  sections jsonb not null default '[]',
  score integer,
  manager_comment text,
  gps_lat numeric,
  gps_lng numeric,
  ai_score integer,
  company_id text not null default 'company-1',
  created_at timestamptz not null default now()
);
create index if not exists ops_runs_branch_date_idx on ops_runs (branch_id, date);
create index if not exists ops_runs_status_idx on ops_runs (status);

-- ── Fotoğraflar ───────────────────────────────
create table if not exists ops_photos (
  id text primary key,
  url text not null,
  storage_path text,
  branch_id text not null references branches(id) on delete cascade,
  user_id text not null,
  run_id text references ops_runs(id) on delete cascade,
  section_id text,
  category_label text not null default '',
  taken_at timestamptz not null default now(),
  ai_analysis text,
  company_id text not null default 'company-1'
);
create index if not exists ops_photos_run_idx on ops_photos (run_id);
create index if not exists ops_photos_branch_idx on ops_photos (branch_id);

-- ── Görevler ──────────────────────────────────
create table if not exists ops_tasks (
  id text primary key,
  title text not null,
  description text,
  branch_id text not null references branches(id) on delete cascade,
  assignee_id text,
  due_date text,
  status text not null default 'pending',
  created_by text not null,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  company_id text not null default 'company-1'
);
create index if not exists ops_tasks_branch_idx on ops_tasks (branch_id);

-- ── İzinler (RLS off, anon + authenticated full) ───
do $$
declare t text;
begin
  for t in select unnest(array['ops_templates','ops_runs','ops_photos','ops_tasks'])
  loop
    execute format('alter table public.%I disable row level security', t);
    execute format('grant all privileges on table public.%I to anon', t);
    execute format('grant all privileges on table public.%I to authenticated', t);
  end loop;
end;
$$;

-- ── Storage Bucket (fotoğraflar için) ─────────
insert into storage.buckets (id, name, public)
values ('ops-photos', 'ops-photos', true)
on conflict (id) do nothing;

-- Bucket erişim politikaları (public read + anon/authenticated write)
do $$
begin
  -- Herkes okuyabilsin
  if not exists (select 1 from pg_policies where policyname = 'ops_photos_read') then
    create policy "ops_photos_read" on storage.objects
      for select using (bucket_id = 'ops-photos');
  end if;
  -- Yükleme
  if not exists (select 1 from pg_policies where policyname = 'ops_photos_insert') then
    create policy "ops_photos_insert" on storage.objects
      for insert with check (bucket_id = 'ops-photos');
  end if;
  -- Silme
  if not exists (select 1 from pg_policies where policyname = 'ops_photos_delete') then
    create policy "ops_photos_delete" on storage.objects
      for delete using (bucket_id = 'ops-photos');
  end if;
end;
$$;

-- =============================================
-- SEED: Varsayılan Açılış & Kapanış Şablonları
-- =============================================

insert into ops_templates (id, type, title, sections) values
(
  'tpl-opening', 'opening', 'Açılış Kontrolü',
  '[
    {"id":"sec-open-clean","title":"Temizlik","emoji":"🧹","photoRequired":true,"items":[
      {"id":"op-clean-1","label":"Masalar"},
      {"id":"op-clean-2","label":"Sandalyeler"},
      {"id":"op-clean-3","label":"Yerler"},
      {"id":"op-clean-4","label":"WC"}
    ]},
    {"id":"sec-open-bar","title":"Bar","emoji":"☕","photoRequired":true,"items":[
      {"id":"op-bar-1","label":"Espresso Makinesi"},
      {"id":"op-bar-2","label":"Grinder"},
      {"id":"op-bar-3","label":"Bardaklar"},
      {"id":"op-bar-4","label":"Şuruplar"}
    ]},
    {"id":"sec-open-cake","title":"Pasta Dolabı","emoji":"🍰","photoRequired":true,"items":[
      {"id":"op-cake-1","label":"Doluluk"},
      {"id":"op-cake-2","label":"Etiketler"},
      {"id":"op-cake-3","label":"Düzen"}
    ]},
    {"id":"sec-open-front","title":"Dış Cephe","emoji":"🏪","photoRequired":true,"items":[
      {"id":"op-front-1","label":"Tabela"},
      {"id":"op-front-2","label":"Sandviç Board"},
      {"id":"op-front-3","label":"Bahçe"}
    ]}
  ]'::jsonb
),
(
  'tpl-closing', 'closing', 'Kapanış Kontrolü',
  '[
    {"id":"sec-close-bar","title":"Bar Temizliği","emoji":"🧽","photoRequired":true,"items":[
      {"id":"cl-bar-1","label":"Bar Tezgahı"},
      {"id":"cl-bar-2","label":"Makine Temizliği"},
      {"id":"cl-bar-3","label":"Grinder Temizliği"}
    ]},
    {"id":"sec-close-pos","title":"POS & Kasa","emoji":"💳","photoRequired":true,"items":[
      {"id":"cl-pos-1","label":"POS Kapanışı"},
      {"id":"cl-pos-2","label":"Kasa Sayımı"},
      {"id":"cl-pos-3","label":"Z Raporu"}
    ]},
    {"id":"sec-close-store","title":"Depo & Çöp","emoji":"📦","photoRequired":true,"items":[
      {"id":"cl-store-1","label":"Çöplerin Atılması"},
      {"id":"cl-store-2","label":"Depo Düzeni"},
      {"id":"cl-store-3","label":"Soğuk Hava Kontrolü"}
    ]},
    {"id":"sec-close-power","title":"Elektrik & Güvenlik","emoji":"🔌","photoRequired":true,"items":[
      {"id":"cl-pow-1","label":"Elektrikler"},
      {"id":"cl-pow-2","label":"Klima"},
      {"id":"cl-pow-3","label":"Kapılar & Kilitler"}
    ]}
  ]'::jsonb
)
on conflict (id) do nothing;
