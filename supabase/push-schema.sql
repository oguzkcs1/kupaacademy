-- =============================================
-- Kupa Academy - Push Bildirim Abonelikleri
-- (SQL Editor'de çalıştırın)
-- =============================================

create table if not exists push_subscriptions (
  id text primary key,
  user_id text not null,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now()
);
create index if not exists push_subs_user_idx on push_subscriptions (user_id);

alter table push_subscriptions disable row level security;
grant all privileges on table push_subscriptions to anon, authenticated;
