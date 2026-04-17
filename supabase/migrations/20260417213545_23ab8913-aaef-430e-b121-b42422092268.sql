
-- Create helper function for updated_at if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE public.driving_exams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL,
  driver_name TEXT NOT NULL DEFAULT '',
  driver_phone TEXT DEFAULT '',
  vehicle_plate TEXT DEFAULT '',
  company_name TEXT DEFAULT '',
  sent_via TEXT DEFAULT 'app',
  sent_at TIMESTAMPTZ,
  sent_to TEXT DEFAULT '',
  token TEXT DEFAULT encode(gen_random_bytes(24), 'hex'),
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  passing_score INTEGER NOT NULL DEFAULT 70,
  status TEXT NOT NULL DEFAULT 'sent',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  answers JSONB DEFAULT '[]'::jsonb,
  score INTEGER,
  correct_count INTEGER,
  total_questions INTEGER,
  passed BOOLEAN,
  category_breakdown JSONB DEFAULT '{}'::jsonb,
  signature_url TEXT DEFAULT '',
  manager_note TEXT DEFAULT '',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_driving_exams_driver_id ON public.driving_exams(driver_id);
CREATE INDEX idx_driving_exams_token ON public.driving_exams(token);
CREATE INDEX idx_driving_exams_company ON public.driving_exams(company_name);

ALTER TABLE public.driving_exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own company exams"
ON public.driving_exams FOR SELECT
TO authenticated
USING (
  company_name = get_user_company(auth.uid())
  OR has_role(auth.uid(), 'super_admin'::app_role)
  OR driver_id = auth.uid()
);

CREATE POLICY "Managers create exams"
ON public.driving_exams FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'fleet_manager'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Driver or manager update exam"
ON public.driving_exams FOR UPDATE
TO authenticated
USING (
  driver_id = auth.uid()
  OR (has_role(auth.uid(), 'fleet_manager'::app_role) AND company_name = get_user_company(auth.uid()))
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Managers delete exams"
ON public.driving_exams FOR DELETE
TO authenticated
USING (
  (has_role(auth.uid(), 'fleet_manager'::app_role) AND company_name = get_user_company(auth.uid()))
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Anon view exam by token"
ON public.driving_exams FOR SELECT
TO anon
USING (true);

CREATE POLICY "Anon submit exam by token"
ON public.driving_exams FOR UPDATE
TO anon
USING (true);

CREATE TRIGGER update_driving_exams_updated_at
BEFORE UPDATE ON public.driving_exams
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.notify_driver_on_exam()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.sent_via = 'app' OR NEW.sent_via IS NULL THEN
    INSERT INTO public.driver_notifications (user_id, type, title, message, link)
    VALUES (
      NEW.driver_id,
      'driving_exam',
      '📝 מבחן כשירות נהיגה חדש',
      'נשלח אליך מבחן כשירות נהיגה למילוי. לחץ כאן כדי להתחיל.',
      '/driving-exam/' || NEW.id::text
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_driver_on_exam
AFTER INSERT ON public.driving_exams
FOR EACH ROW
EXECUTE FUNCTION public.notify_driver_on_exam();
