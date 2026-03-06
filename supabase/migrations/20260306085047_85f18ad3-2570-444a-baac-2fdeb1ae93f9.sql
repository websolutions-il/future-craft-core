
-- Replace overly permissive INSERT policy on system_logs
DROP POLICY IF EXISTS "Authenticated can insert system logs" ON public.system_logs;
CREATE POLICY "Authenticated can insert system logs"
  ON public.system_logs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);
