-- =============================================
-- Kupa Academy - Kariyer Başvuruları Şeması
-- (SQL Editor'de çalıştırın)
-- =============================================

create table if not exists job_applications (
  id text primary key,
  full_name text not null,
  phone text not null,
  email text,
  city text,               -- tercih edilen şehir/şube
  position text,           -- başvurulan pozisyon
  experience text,         -- deneyim seviyesi
  message text,            -- ön yazı / not
  cv_url text,             -- opsiyonel CV (storage public url)
  cv_path text,
  status text not null default 'new',  -- new | reviewing | accepted | rejected
  company_id text not null default 'company-1',
  created_at timestamptz not null default now()
);
create index if not exists job_applications_status_idx on job_applications (status);
create index if not exists job_applications_created_idx on job_applications (created_at desc);

-- RLS kapalı + yetkiler (public form yazabilsin, admin okuyabilsin)
alter table job_applications disable row level security;
grant all privileges on table job_applications to anon, authenticated;

-- CV dosyaları için storage bucket
insert into storage.buckets (id, name, public)
values ('cv-files', 'cv-files', true)
on conflict (id) do nothing;

drop policy if exists "cv_read"   on storage.objects;
drop policy if exists "cv_insert" on storage.objects;
drop policy if exists "cv_delete" on storage.objects;

create policy "cv_read"   on storage.objects for select using (bucket_id = 'cv-files');
create policy "cv_insert" on storage.objects for insert with check (bucket_id = 'cv-files');
create policy "cv_delete" on storage.objects for delete using (bucket_id = 'cv-files');
