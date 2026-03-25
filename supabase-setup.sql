-- Profiles table for role-based access
create table if not exists profiles (
  id uuid references auth.users(id) primary key,
  role text default 'client',
  client_id uuid,
  full_name text,
  created_at timestamp with time zone default now()
);

-- Leads
drop table if exists leads cascade;
create table leads (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  name text not null,
  email text,
  phone text,
  nische text,
  quelle text default 'Organisch',
  status text default 'Neu',
  wert numeric default 0,
  tags text,
  notizen text,
  calendly_event_id text
);

-- Clients
drop table if exists clients cascade;
create table clients (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  name text not null,
  email text,
  phone text,
  nische text,
  modell text default '1 zu 1',
  retainer numeric default 0,
  startdatum date,
  monat integer default 1,
  status text default 'Aktiv',
  ziel_1 text, ziel_2 text, ziel_3 text,
  bottleneck text, quick_win text, notizen text
);

-- KPIs
drop table if exists kpis cascade;
create table kpis (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  client_id uuid references clients(id) on delete cascade,
  monat integer,
  follower_ig integer default 0,
  follower_tt integer default 0,
  umsatz numeric default 0,
  neue_kunden integer default 0,
  email_sub integer default 0,
  open_rate numeric default 0,
  conv_rate numeric default 0,
  engage_rate numeric default 0
);

-- Weekly updates
drop table if exists updates cascade;
create table updates (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  client_id uuid references clients(id) on delete cascade,
  woche integer,
  erledigt text,
  probleme text,
  plan text
);

-- RLS
alter table profiles enable row level security;
alter table leads enable row level security;
alter table clients enable row level security;
alter table kpis enable row level security;
alter table updates enable row level security;

create policy "Full access" on profiles for all using (true);
create policy "Full access" on leads for all using (true);
create policy "Full access" on clients for all using (true);
create policy "Full access" on kpis for all using (true);
create policy "Full access" on updates for all using (true);

-- Tasks table
drop table if exists tasks cascade;
create table tasks (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  title text not null,
  beschreibung text,
  faellig date,
  prioritaet text default 'Mittel',
  erledigt boolean default false,
  referenz_typ text,
  referenz_id uuid,
  referenz_name text
);

-- Content Planner table
drop table if exists content_planner cascade;
create table content_planner (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  titel text not null,
  inhalt text,
  plattform text default 'Instagram',
  typ text default 'Post',
  geplant_fuer date,
  status text default 'Entwurf',
  hashtags text
);

alter table tasks enable row level security;
alter table content_planner enable row level security;
create policy "Full access tasks" on tasks for all using (true);
create policy "Full access content_planner" on content_planner for all using (true);
