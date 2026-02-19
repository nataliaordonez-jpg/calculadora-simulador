-- ============================================================
-- Fix: Aplicar políticas RLS para todas las tablas bf_
-- Solo afecta tablas de esta herramienta (prefijo bf_)
-- NO modifica ninguna otra tabla del proyecto
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- ── bf_sessions ──────────────────────────────────────────
alter table public.bf_sessions enable row level security;

drop policy if exists bf_sessions_insert_anon on public.bf_sessions;
create policy bf_sessions_insert_anon on public.bf_sessions
for insert to anon with check (true);

drop policy if exists bf_sessions_select_anon on public.bf_sessions;
create policy bf_sessions_select_anon on public.bf_sessions
for select to anon using (true);

-- ── bf_business_profiles ─────────────────────────────────
alter table public.bf_business_profiles enable row level security;

drop policy if exists bf_business_insert_anon on public.bf_business_profiles;
create policy bf_business_insert_anon on public.bf_business_profiles
for insert to anon with check (true);

drop policy if exists bf_business_update_anon on public.bf_business_profiles;
create policy bf_business_update_anon on public.bf_business_profiles
for update to anon using (true) with check (true);

drop policy if exists bf_business_select_anon on public.bf_business_profiles;
create policy bf_business_select_anon on public.bf_business_profiles
for select to anon using (true);

-- ── bf_question_answers ───────────────────────────────────
alter table public.bf_question_answers enable row level security;

drop policy if exists bf_answers_insert_anon on public.bf_question_answers;
create policy bf_answers_insert_anon on public.bf_question_answers
for insert to anon with check (true);

drop policy if exists bf_answers_update_anon on public.bf_question_answers;
create policy bf_answers_update_anon on public.bf_question_answers
for update to anon using (true) with check (true);

drop policy if exists bf_answers_select_anon on public.bf_question_answers;
create policy bf_answers_select_anon on public.bf_question_answers
for select to anon using (true);

-- ── bf_diagnostic_results ────────────────────────────────
alter table public.bf_diagnostic_results enable row level security;

drop policy if exists bf_results_insert_anon on public.bf_diagnostic_results;
create policy bf_results_insert_anon on public.bf_diagnostic_results
for insert to anon with check (true);

drop policy if exists bf_results_update_anon on public.bf_diagnostic_results;
create policy bf_results_update_anon on public.bf_diagnostic_results
for update to anon using (true) with check (true);

drop policy if exists bf_results_select_anon on public.bf_diagnostic_results;
create policy bf_results_select_anon on public.bf_diagnostic_results
for select to anon using (true);

-- ── bf_leads ─────────────────────────────────────────────
alter table public.bf_leads enable row level security;

drop policy if exists bf_leads_insert_anon on public.bf_leads;
create policy bf_leads_insert_anon on public.bf_leads
for insert to anon with check (true);

drop policy if exists bf_leads_select_anon on public.bf_leads;
create policy bf_leads_select_anon on public.bf_leads
for select to anon using (true);

-- ── Verificación final ────────────────────────────────────
select tablename, policyname, cmd, roles
from pg_policies
where schemaname = 'public'
  and tablename like 'bf_%'
order by tablename, cmd;
