
-- Companions table
CREATE TABLE public.companions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  id_number TEXT DEFAULT '',
  company_name TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID DEFAULT NULL
);

ALTER TABLE public.companions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Managers can manage companions" ON public.companions FOR ALL
  USING ((has_role(auth.uid(), 'fleet_manager') AND company_name = get_user_company(auth.uid())) OR has_role(auth.uid(), 'super_admin'))
  WITH CHECK ((has_role(auth.uid(), 'fleet_manager') AND company_name = get_user_company(auth.uid())) OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can view own company companions" ON public.companions FOR SELECT
  USING (company_name = get_user_company(auth.uid()) OR has_role(auth.uid(), 'super_admin'));

-- Work assignments table
CREATE TABLE public.work_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID DEFAULT NULL,
  title TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  vehicle_plate TEXT DEFAULT '',
  driver_name TEXT DEFAULT '',
  driver_id UUID DEFAULT NULL,
  companion_id UUID REFERENCES public.companions(id) DEFAULT NULL,
  companion_name TEXT DEFAULT '',
  companion_requested BOOLEAN DEFAULT false,
  scheduled_date DATE DEFAULT NULL,
  scheduled_time TEXT DEFAULT '',
  location TEXT DEFAULT '',
  priority TEXT DEFAULT 'normal',
  status TEXT NOT NULL DEFAULT 'created',
  driver_approved_at TIMESTAMPTZ DEFAULT NULL,
  company_name TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_by UUID DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.work_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Managers can manage work assignments" ON public.work_assignments FOR ALL
  USING ((has_role(auth.uid(), 'fleet_manager') AND company_name = get_user_company(auth.uid())) OR has_role(auth.uid(), 'super_admin'))
  WITH CHECK ((has_role(auth.uid(), 'fleet_manager') AND company_name = get_user_company(auth.uid())) OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Drivers can view own assignments" ON public.work_assignments FOR SELECT
  USING (driver_id = auth.uid() OR company_name = get_user_company(auth.uid()));

CREATE POLICY "Drivers can update own assignments" ON public.work_assignments FOR UPDATE
  USING (driver_id = auth.uid())
  WITH CHECK (driver_id = auth.uid());

-- Work assignment messages (chat)
CREATE TABLE public.work_assignment_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.work_assignments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  is_read BOOLEAN DEFAULT false,
  company_name TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.work_assignment_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view assignment messages" ON public.work_assignment_messages FOR SELECT
  USING (company_name = get_user_company(auth.uid()) OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can insert assignment messages" ON public.work_assignment_messages FOR INSERT
  WITH CHECK (company_name = get_user_company(auth.uid()) OR has_role(auth.uid(), 'super_admin'));

-- Work assignment status log
CREATE TABLE public.work_assignment_status_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.work_assignments(id) ON DELETE CASCADE,
  old_status TEXT DEFAULT '',
  new_status TEXT NOT NULL DEFAULT '',
  changed_by UUID DEFAULT NULL,
  changed_by_name TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  company_name TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.work_assignment_status_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view assignment status log" ON public.work_assignment_status_log FOR SELECT
  USING (company_name = get_user_company(auth.uid()) OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can insert assignment status log" ON public.work_assignment_status_log FOR INSERT
  WITH CHECK (company_name = get_user_company(auth.uid()) OR has_role(auth.uid(), 'super_admin'));

-- Enable realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.work_assignment_messages;
