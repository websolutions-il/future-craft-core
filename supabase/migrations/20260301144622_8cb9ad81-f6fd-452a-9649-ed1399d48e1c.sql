CREATE POLICY "Managers can update handovers"
ON public.vehicle_handovers
FOR UPDATE
TO authenticated
USING (
  (has_role(auth.uid(), 'fleet_manager') AND company_name = get_user_company(auth.uid()))
  OR has_role(auth.uid(), 'super_admin')
)
WITH CHECK (
  (has_role(auth.uid(), 'fleet_manager') AND company_name = get_user_company(auth.uid()))
  OR has_role(auth.uid(), 'super_admin')
);