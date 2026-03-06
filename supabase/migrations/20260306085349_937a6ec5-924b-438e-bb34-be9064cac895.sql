
DROP POLICY IF EXISTS "Users can view own company service orders" ON public.service_orders;
CREATE POLICY "Users can view own company service orders"
  ON public.service_orders FOR SELECT
  TO authenticated
  USING (company_name = get_user_company(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));
