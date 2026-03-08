
-- Add missing DELETE policies for tables that need them

-- accidents: managers can delete
CREATE POLICY "Managers can delete accidents"
ON public.accidents FOR DELETE TO authenticated
USING (
  (has_role(auth.uid(), 'fleet_manager'::app_role) AND company_name = get_user_company(auth.uid()))
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- expenses: managers can update
CREATE POLICY "Managers can update expenses"
ON public.expenses FOR UPDATE TO authenticated
USING (
  (has_role(auth.uid(), 'fleet_manager'::app_role) AND company_name = get_user_company(auth.uid()))
  OR has_role(auth.uid(), 'super_admin'::app_role)
  OR created_by = auth.uid()
);

-- expenses: managers can delete
CREATE POLICY "Managers can delete expenses"
ON public.expenses FOR DELETE TO authenticated
USING (
  (has_role(auth.uid(), 'fleet_manager'::app_role) AND company_name = get_user_company(auth.uid()))
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- faults: managers can delete
CREATE POLICY "Managers can delete faults"
ON public.faults FOR DELETE TO authenticated
USING (
  (has_role(auth.uid(), 'fleet_manager'::app_role) AND company_name = get_user_company(auth.uid()))
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- driver_notifications: users can delete own
CREATE POLICY "Users can delete own notifications"
ON public.driver_notifications FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- temporary_drivers: managers can update/delete
CREATE POLICY "Managers can update temp drivers"
ON public.temporary_drivers FOR UPDATE TO authenticated
USING (
  (has_role(auth.uid(), 'fleet_manager'::app_role) AND company_name = get_user_company(auth.uid()))
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Managers can delete temp drivers"
ON public.temporary_drivers FOR DELETE TO authenticated
USING (
  (has_role(auth.uid(), 'fleet_manager'::app_role) AND company_name = get_user_company(auth.uid()))
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- vehicle_handovers: managers can delete
CREATE POLICY "Managers can delete handovers"
ON public.vehicle_handovers FOR DELETE TO authenticated
USING (
  (has_role(auth.uid(), 'fleet_manager'::app_role) AND company_name = get_user_company(auth.uid()))
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- emergency_logs: managers can delete
CREATE POLICY "Managers can delete emergency logs"
ON public.emergency_logs FOR DELETE TO authenticated
USING (
  (has_role(auth.uid(), 'fleet_manager'::app_role) AND company_name = get_user_company(auth.uid()))
  OR has_role(auth.uid(), 'super_admin'::app_role)
);
