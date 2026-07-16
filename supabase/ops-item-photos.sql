-- =============================================
-- Ops: madde bazlı fotoğraf desteği
-- (SQL Editor'de çalıştırın)
-- =============================================

-- Her fotoğrafın hangi maddeye ait olduğunu tutar
alter table ops_photos add column if not exists item_id text;

create index if not exists ops_photos_item_idx on ops_photos (item_id);
