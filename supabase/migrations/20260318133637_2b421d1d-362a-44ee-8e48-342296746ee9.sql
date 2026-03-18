DROP POLICY IF EXISTS "Users can view own company vehicles" ON public.vehicles;
CREATE POLICY "Users can view own company vehicles"
  ON public.vehicles FOR SELECT
  TO authenticated
  USING (
    (company_name = get_user_company(auth.uid()))
    OR has_role(auth.uid(), 'super_admin'::app_role)
    OR (assigned_driver_id = auth.uid())
  );