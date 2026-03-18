-- PokeGrade databaseskjema
-- Kjor dette i Supabase SQL Editor

create table if not exists cards (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  set_name text not null,
  set_number text,
  pricecharting_id text,
  created_at timestamptz default now()
);

create table if not exists price_snapshots (
  id uuid primary key default gen_random_uuid(),
  card_id uuid references cards(id) on delete cascade,
  date date not null,
  raw_usd numeric(10,2),
  psa9_usd numeric(10,2),
  psa10_usd numeric(10,2),
  fetched_at timestamptz default now(),
  unique(card_id, date)
);

create table if not exists psa_population (
  id uuid primary key default gen_random_uuid(),
  card_id uuid references cards(id) on delete cascade,
  fetched_at timestamptz default now(),
  grade_1 int default 0,
  grade_2 int default 0,
  grade_3 int default 0,
  grade_4 int default 0,
  grade_5 int default 0,
  grade_6 int default 0,
  grade_7 int default 0,
  grade_8 int default 0,
  grade_9 int default 0,
  grade_10 int default 0,
  total int default 0
);

create table if not exists fx_rates (
  date date primary key,
  usd_nok numeric(8,4) not null
);

create table if not exists finn_listings (
  id uuid primary key default gen_random_uuid(),
  card_id uuid references cards(id) on delete cascade,
  fetched_at timestamptz default now(),
  finn_id text,
  title text,
  price_nok numeric(10,2),
  location text,
  views int,
  listing_type text,
  flag text default 'none' check (flag in ('none', 'bundle', 'irrelevant')),
  url text
);

-- Indekser
create index if not exists idx_price_snapshots_card_date on price_snapshots(card_id, date desc);
create index if not exists idx_psa_population_card on psa_population(card_id, fetched_at desc);
create index if not exists idx_finn_listings_card on finn_listings(card_id, fetched_at desc);
