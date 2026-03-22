-- Run this in your Supabase SQL Editor

create table leads (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  name text not null,
  email text,
  phone text,
  nische text,
  call_datum date,
  status text default 'Ausstehend',
  notizen text,
  calendly_event_id text
);

create table clients (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  name text not null,
  email text,
  phone text,
  nische text,
  coaching_modell text,
  retainer numeric default 0,
  startdatum date,
  aktueller_monat integer default 1,
  status text default 'Aktiv',
  ziel_1 text,
  ziel_2 text,
  ziel_3 text,
  bottleneck text,
  quick_win text,
  notizen text
);

create table kpis (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  client_id uuid references clients(id) on delete cascade,
  monat integer,
  follower_instagram integer default 0,
  follower_tiktok integer default 0,
  umsatz numeric default 0,
  neue_kunden integer default 0,
  email_subscriber integer default 0,
  email_oeffnungsrate numeric default 0,
  conversion_rate numeric default 0,
  engagement_rate numeric default 0
);

create table weekly_updates (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  client_id uuid references clients(id) on delete cascade,
  woche integer,
  erledigt text,
  nicht_funktioniert text,
  plan_naechste_woche text,
  zahlen text
);

alter table leads enable row level security;
alter table clients enable row level security;
alter table kpis enable row level security;
alter table weekly_updates enable row level security;

create policy "Full access leads" on leads for all using (true);
create policy "Full access clients" on clients for all using (true);
create policy "Full access kpis" on kpis for all using (true);
create policy "Full access weekly_updates" on weekly_updates for all using (true);
