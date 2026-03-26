
CREATE TABLE public.dev_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_number serial NOT NULL,
  summary text NOT NULL,
  clarification text DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz DEFAULT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.dev_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can do everything on dev_tasks"
ON public.dev_tasks FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Fleet managers can view and insert dev_tasks"
ON public.dev_tasks FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'fleet_manager'));

CREATE POLICY "Fleet managers can insert dev_tasks"
ON public.dev_tasks FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'fleet_manager'));
