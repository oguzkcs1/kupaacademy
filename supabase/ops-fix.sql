-- =============================================
-- Kupa Academy - Ops Düzeltme
-- (ops-schema.sql'in storage kısmı hata verdiğinde bunu çalıştırın)
-- =============================================

-- 1) RLS kapat + yetkiler (yazma erişimi için şart)
alter table ops_templates disable row level security;
alter table ops_runs      disable row level security;
alter table ops_photos    disable row level security;
alter table ops_tasks     disable row level security;

grant all privileges on table ops_templates, ops_runs, ops_photos, ops_tasks to anon, authenticated;

-- 2) Varsayılan şablonları seed et
insert into ops_templates (id, type, title, sections) values
(
  'tpl-opening', 'opening', 'Açılış Kontrolü',
  '[
    {"id":"sec-open-clean","title":"Temizlik","emoji":"🧹","photoRequired":true,"items":[
      {"id":"op-clean-1","label":"Masalar"},{"id":"op-clean-2","label":"Sandalyeler"},
      {"id":"op-clean-3","label":"Yerler"},{"id":"op-clean-4","label":"WC"}]},
    {"id":"sec-open-bar","title":"Bar","emoji":"☕","photoRequired":true,"items":[
      {"id":"op-bar-1","label":"Espresso Makinesi"},{"id":"op-bar-2","label":"Grinder"},
      {"id":"op-bar-3","label":"Bardaklar"},{"id":"op-bar-4","label":"Şuruplar"}]},
    {"id":"sec-open-cake","title":"Pasta Dolabı","emoji":"🍰","photoRequired":true,"items":[
      {"id":"op-cake-1","label":"Doluluk"},{"id":"op-cake-2","label":"Etiketler"},
      {"id":"op-cake-3","label":"Düzen"}]},
    {"id":"sec-open-front","title":"Dış Cephe","emoji":"🏪","photoRequired":true,"items":[
      {"id":"op-front-1","label":"Tabela"},{"id":"op-front-2","label":"Sandviç Board"},
      {"id":"op-front-3","label":"Bahçe"}]}
  ]'::jsonb
),
(
  'tpl-closing', 'closing', 'Kapanış Kontrolü',
  '[
    {"id":"sec-close-bar","title":"Bar Temizliği","emoji":"🧽","photoRequired":true,"items":[
      {"id":"cl-bar-1","label":"Bar Tezgahı"},{"id":"cl-bar-2","label":"Makine Temizliği"},
      {"id":"cl-bar-3","label":"Grinder Temizliği"}]},
    {"id":"sec-close-pos","title":"POS & Kasa","emoji":"💳","photoRequired":true,"items":[
      {"id":"cl-pos-1","label":"POS Kapanışı"},{"id":"cl-pos-2","label":"Kasa Sayımı"},
      {"id":"cl-pos-3","label":"Z Raporu"}]},
    {"id":"sec-close-store","title":"Depo & Çöp","emoji":"📦","photoRequired":true,"items":[
      {"id":"cl-store-1","label":"Çöplerin Atılması"},{"id":"cl-store-2","label":"Depo Düzeni"},
      {"id":"cl-store-3","label":"Soğuk Hava Kontrolü"}]},
    {"id":"sec-close-power","title":"Elektrik & Güvenlik","emoji":"🔌","photoRequired":true,"items":[
      {"id":"cl-pow-1","label":"Elektrikler"},{"id":"cl-pow-2","label":"Klima"},
      {"id":"cl-pow-3","label":"Kapılar & Kilitler"}]}
  ]'::jsonb
)
on conflict (id) do nothing;

-- 3) Storage bucket + politikalar
insert into storage.buckets (id, name, public)
values ('ops-photos', 'ops-photos', true)
on conflict (id) do nothing;

drop policy if exists "ops_photos_read"   on storage.objects;
drop policy if exists "ops_photos_insert" on storage.objects;
drop policy if exists "ops_photos_delete" on storage.objects;

create policy "ops_photos_read"   on storage.objects for select using (bucket_id = 'ops-photos');
create policy "ops_photos_insert" on storage.objects for insert with check (bucket_id = 'ops-photos');
create policy "ops_photos_delete" on storage.objects for delete using (bucket_id = 'ops-photos');
