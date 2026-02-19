-- ============================================================
-- Verificación y garantía del campo id (shareId) en bf_diagnostic_results
-- Solo afecta la tabla bf_diagnostic_results de esta herramienta
-- NO modifica ninguna otra tabla del proyecto
-- ============================================================

-- 1) Verificar que la tabla existe y listar sus columnas
SELECT
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE
  table_schema = 'public'
  AND table_name  = 'bf_diagnostic_results'
ORDER BY ordinal_position;

-- ============================================================
-- RESULTADO ESPERADO:
-- La columna "id" debe aparecer con:
--   data_type    = uuid
--   column_default = gen_random_uuid()
--   is_nullable  = NO
-- Si no aparece, ejecuta el bloque ALTER TABLE de abajo.
-- ============================================================


-- 2) (Solo si "id" NO existe) Agregar la columna id como llave primaria
--    Descomenta y ejecuta SOLO si el SELECT anterior no muestra la columna "id"
/*
ALTER TABLE public.bf_diagnostic_results
  ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid();

-- Establecer como llave primaria si aún no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name   = 'bf_diagnostic_results'
      AND constraint_type = 'PRIMARY KEY'
  ) THEN
    ALTER TABLE public.bf_diagnostic_results
      ADD PRIMARY KEY (id);
  END IF;
END $$;

-- Rellenar UUIDs para filas existentes que pudieran tener id NULL
UPDATE public.bf_diagnostic_results
SET id = gen_random_uuid()
WHERE id IS NULL;
*/


-- 3) Verificar que la política SELECT permite leer la columna "id"
SELECT
  policyname,
  cmd,
  roles,
  qual
FROM pg_policies
WHERE
  schemaname = 'public'
  AND tablename = 'bf_diagnostic_results';

-- RESULTADO ESPERADO: debe existir "bf_results_select_anon" con cmd = SELECT
