-- ============================================================
-- Bewe Funnel - Esquema aislado para esta herramienta
-- NO modifica ni elimina tablas existentes
-- ============================================================

begin;

create extension if not exists "pgcrypto";

-- 1) Sesiones de la herramienta
create table if not exists public.bf_sessions (
  id uuid primary key default gen_random_uuid(),
  session_token text not null unique,
  source text,
  user_agent text,
  referrer text,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) Perfil de negocio (onboarding)
create table if not exists public.bf_business_profiles (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references public.bf_sessions(id) on delete cascade,
  business_name text not null,
  sector text not null check (sector in ('BELLEZA', 'SALUD', 'FITNESS', 'BIENESTAR')),
  currency text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3) Respuestas del cuestionario
create table if not exists public.bf_question_answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.bf_sessions(id) on delete cascade,
  question_id text not null,
  question_number int not null,
  selected_option_id text not null,
  numeric_value numeric(14,4),
  answer_label text,
  answered_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (session_id, question_id)
);

-- 4) Resultados calculados del diagnostico
create table if not exists public.bf_diagnostic_results (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references public.bf_sessions(id) on delete cascade,
  bewe_score int not null check (bewe_score >= 0 and bewe_score <= 100),
  bewe_level text not null,
  bewe_label text not null,
  roi_total_monthly_benefit numeric(14,2),
  roi_monthly_revenue_increase numeric(14,2),
  roi_monthly_cost_savings numeric(14,2),
  growth_total_monthly_gain numeric(14,2),
  growth_total_annual_gain numeric(14,2),
  pillars jsonb not null default '[]'::jsonb,
  scenarios jsonb not null default '[]'::jsonb,
  growth_metrics jsonb not null default '[]'::jsonb,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5) Captura de lead
create table if not exists public.bf_leads (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.bf_sessions(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text not null,
  is_existing_client boolean not null default false,
  created_at timestamptz not null default now()
);

-- Indices
create index if not exists idx_bf_sessions_started_at on public.bf_sessions(started_at);
create index if not exists idx_bf_answers_session on public.bf_question_answers(session_id);
create index if not exists idx_bf_answers_question on public.bf_question_answers(question_id);
create index if not exists idx_bf_results_session on public.bf_diagnostic_results(session_id);
create index if not exists idx_bf_leads_session on public.bf_leads(session_id);
create index if not exists idx_bf_leads_email on public.bf_leads(email);

-- Row Level Security (sin afectar otras tablas)
alter table public.bf_sessions enable row level security;
alter table public.bf_business_profiles enable row level security;
alter table public.bf_question_answers enable row level security;
alter table public.bf_diagnostic_results enable row level security;
alter table public.bf_leads enable row level security;

-- Policies base para uso frontend anon
drop policy if exists bf_sessions_insert_anon on public.bf_sessions;
create policy bf_sessions_insert_anon on public.bf_sessions
for insert to anon
with check (true);

drop policy if exists bf_sessions_select_anon on public.bf_sessions;
create policy bf_sessions_select_anon on public.bf_sessions
for select to anon
using (true);

drop policy if exists bf_business_insert_anon on public.bf_business_profiles;
create policy bf_business_insert_anon on public.bf_business_profiles
for insert to anon
with check (true);

drop policy if exists bf_business_update_anon on public.bf_business_profiles;
create policy bf_business_update_anon on public.bf_business_profiles
for update to anon
using (true)
with check (true);

drop policy if exists bf_answers_insert_anon on public.bf_question_answers;
create policy bf_answers_insert_anon on public.bf_question_answers
for insert to anon
with check (true);

drop policy if exists bf_answers_update_anon on public.bf_question_answers;
create policy bf_answers_update_anon on public.bf_question_answers
for update to anon
using (true)
with check (true);

drop policy if exists bf_results_insert_anon on public.bf_diagnostic_results;
create policy bf_results_insert_anon on public.bf_diagnostic_results
for insert to anon
with check (true);

drop policy if exists bf_results_update_anon on public.bf_diagnostic_results;
create policy bf_results_update_anon on public.bf_diagnostic_results
for update to anon
using (true)
with check (true);

drop policy if exists bf_results_select_anon on public.bf_diagnostic_results;
create policy bf_results_select_anon on public.bf_diagnostic_results
for select to anon
using (true);

drop policy if exists bf_leads_insert_anon on public.bf_leads;
create policy bf_leads_insert_anon on public.bf_leads
for insert to anon
with check (true);

drop policy if exists bf_leads_select_anon on public.bf_leads;
create policy bf_leads_select_anon on public.bf_leads
for select to anon
using (true);

commit;

