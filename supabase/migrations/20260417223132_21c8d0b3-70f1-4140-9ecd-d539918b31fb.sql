DROP POLICY "Managers can update prompts" ON public.voice_prompts;
CREATE POLICY "Super admin can update prompts" ON public.voice_prompts FOR UPDATE TO authenticated
  USING (has_role(auth.uid(),'super_admin'))
  WITH CHECK (has_role(auth.uid(),'super_admin'));