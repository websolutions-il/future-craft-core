-- Create RPC to export full schema DDL for the public schema
-- Used by the full-supabase-export edge function

CREATE OR REPLACE FUNCTION public.export_schema_ddl()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  result text := '';
  rec record;
BEGIN
  -- Only super_admins may run
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'super_admin'
  ) THEN
    RAISE EXCEPTION 'Forbidden: super_admin only';
  END IF;

  result := E'-- Full schema DDL export\n-- Generated: ' || now()::text || E'\n\n';
  result := result || E'CREATE SCHEMA IF NOT EXISTS public;\n\n';

  -- Extensions
  result := result || E'-- Extensions\n';
  FOR rec IN SELECT extname FROM pg_extension WHERE extname NOT IN ('plpgsql') ORDER BY extname LOOP
    result := result || 'CREATE EXTENSION IF NOT EXISTS "' || rec.extname || E'";\n';
  END LOOP;
  result := result || E'\n';

  -- Sequences
  result := result || E'-- Sequences\n';
  FOR rec IN
    SELECT sequencename FROM pg_sequences WHERE schemaname = 'public' ORDER BY sequencename
  LOOP
    result := result || 'CREATE SEQUENCE IF NOT EXISTS public."' || rec.sequencename || E'";\n';
  END LOOP;
  result := result || E'\n';

  -- Tables (column definitions)
  result := result || E'-- Tables\n';
  FOR rec IN
    SELECT c.relname AS table_name
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind = 'r'
    ORDER BY c.relname
  LOOP
    result := result || 'CREATE TABLE IF NOT EXISTS public."' || rec.table_name || E'" (\n';
    result := result || (
      SELECT string_agg(
        '  "' || column_name || '" ' || udt_name ||
        CASE WHEN character_maximum_length IS NOT NULL THEN '(' || character_maximum_length || ')' ELSE '' END ||
        CASE WHEN column_default IS NOT NULL THEN ' DEFAULT ' || column_default ELSE '' END ||
        CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END,
        E',\n' ORDER BY ordinal_position
      )
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = rec.table_name
    );
    result := result || E'\n);\n';
    -- RLS
    IF EXISTS (SELECT 1 FROM pg_class cc JOIN pg_namespace nn ON nn.oid = cc.relnamespace
               WHERE nn.nspname = 'public' AND cc.relname = rec.table_name AND cc.relrowsecurity) THEN
      result := result || 'ALTER TABLE public."' || rec.table_name || E'" ENABLE ROW LEVEL SECURITY;\n';
    END IF;
    result := result || E'\n';
  END LOOP;

  -- Primary keys + unique constraints + foreign keys
  result := result || E'-- Constraints\n';
  FOR rec IN
    SELECT conname, pg_get_constraintdef(oid) AS def, conrelid::regclass::text AS tbl
    FROM pg_constraint
    WHERE connamespace = 'public'::regnamespace
    ORDER BY conrelid::regclass::text, conname
  LOOP
    result := result || 'ALTER TABLE ' || rec.tbl || ' ADD CONSTRAINT "' || rec.conname || '" ' || rec.def || E';\n';
  END LOOP;
  result := result || E'\n';

  -- Indexes (skip those auto-created by constraints)
  result := result || E'-- Indexes\n';
  FOR rec IN
    SELECT indexdef FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname NOT IN (SELECT conname FROM pg_constraint WHERE connamespace = 'public'::regnamespace)
    ORDER BY tablename, indexname
  LOOP
    result := result || rec.indexdef || E';\n';
  END LOOP;
  result := result || E'\n';

  -- Functions
  result := result || E'-- Functions\n';
  FOR rec IN
    SELECT pg_get_functiondef(p.oid) AS def
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prokind = 'f'
    ORDER BY p.proname
  LOOP
    result := result || rec.def || E';\n\n';
  END LOOP;

  -- Triggers
  result := result || E'-- Triggers\n';
  FOR rec IN
    SELECT pg_get_triggerdef(t.oid) AS def
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND NOT t.tgisinternal
    ORDER BY c.relname, t.tgname
  LOOP
    result := result || rec.def || E';\n';
  END LOOP;
  result := result || E'\n';

  -- RLS Policies
  result := result || E'-- RLS Policies\n';
  FOR rec IN
    SELECT
      'CREATE POLICY "' || polname || '" ON public."' || c.relname || '" AS ' ||
      CASE polpermissive WHEN true THEN 'PERMISSIVE' ELSE 'RESTRICTIVE' END ||
      ' FOR ' ||
      CASE polcmd WHEN 'r' THEN 'SELECT' WHEN 'a' THEN 'INSERT' WHEN 'w' THEN 'UPDATE' WHEN 'd' THEN 'DELETE' ELSE 'ALL' END ||
      ' TO ' ||
      COALESCE((SELECT string_agg(quote_ident(rolname), ', ') FROM pg_roles WHERE oid = ANY(polroles)), 'public') ||
      COALESCE(' USING (' || pg_get_expr(polqual, polrelid) || ')', '') ||
      COALESCE(' WITH CHECK (' || pg_get_expr(polwithcheck, polrelid) || ')', '') ||
      ';' AS def
    FROM pg_policy p
    JOIN pg_class c ON c.oid = p.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
    ORDER BY c.relname, polname
  LOOP
    result := result || rec.def || E'\n';
  END LOOP;

  RETURN result;
END;
$$;

-- Restrict execution to authenticated users (the function itself enforces super_admin)
REVOKE ALL ON FUNCTION public.export_schema_ddl() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.export_schema_ddl() TO authenticated;