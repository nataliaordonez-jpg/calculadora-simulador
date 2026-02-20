-- ============================================================
-- Migración: Añadir columnas para Analytics Dashboard
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- Agregar columna ab_variant a bf_sessions
ALTER TABLE public.bf_sessions
  ADD COLUMN IF NOT EXISTS ab_variant text DEFAULT 'C';

-- Agregar columna device_type a bf_sessions
ALTER TABLE public.bf_sessions
  ADD COLUMN IF NOT EXISTS device_type text;

-- Agregar columna country a bf_sessions
ALTER TABLE public.bf_sessions
  ADD COLUMN IF NOT EXISTS country text;

-- Agregar columna time_spent_ms a bf_question_answers (tiempo en responder cada pregunta)
ALTER TABLE public.bf_question_answers
  ADD COLUMN IF NOT EXISTS time_spent_ms int;

-- Actualizar device_type en sesiones existentes basándonos en user_agent
UPDATE public.bf_sessions
SET device_type = CASE
  WHEN user_agent ILIKE '%bot%' OR user_agent ILIKE '%crawler%' OR user_agent ILIKE '%spider%' THEN 'Bot'
  WHEN user_agent ILIKE '%mobile%' AND user_agent ILIKE '%android%' THEN 'Mobile - Android'
  WHEN user_agent ILIKE '%iphone%' OR user_agent ILIKE '%ipad%' THEN 'Mobile - iOS'
  WHEN user_agent ILIKE '%mobile%' THEN 'Mobile'
  ELSE 'Desktop'
END
WHERE device_type IS NULL;

-- Verificación
SELECT
  ab_variant,
  device_type,
  COUNT(*) as total
FROM public.bf_sessions
GROUP BY ab_variant, device_type
ORDER BY total DESC;
