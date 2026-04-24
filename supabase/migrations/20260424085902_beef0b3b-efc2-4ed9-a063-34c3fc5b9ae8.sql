
CREATE TABLE public.practical_driving_exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL,
  driver_name TEXT NOT NULL DEFAULT '',
  driver_id_number TEXT,
  vehicle_plate TEXT,
  company_name TEXT,
  examiner_name TEXT NOT NULL DEFAULT '',
  exam_date DATE NOT NULL DEFAULT CURRENT_DATE,
  checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  driver_signature_url TEXT,
  examiner_signature_url TEXT,
  passed BOOLEAN,
  status TEXT NOT NULL DEFAULT 'completed',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.practical_driving_exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View company practical exams"
ON public.practical_driving_exams FOR SELECT
USING (
  public.has_role(auth.uid(), 'super_admin') OR
  company_name = public.get_user_company(auth.uid())
);

CREATE POLICY "Managers create practical exams"
ON public.practical_driving_exams FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin') OR
  public.has_role(auth.uid(), 'fleet_manager')
);

CREATE POLICY "Managers update practical exams"
ON public.practical_driving_exams FOR UPDATE
USING (
  public.has_role(auth.uid(), 'super_admin') OR
  public.has_role(auth.uid(), 'fleet_manager')
);

CREATE POLICY "Managers delete practical exams"
ON public.practical_driving_exams FOR DELETE
USING (
  public.has_role(auth.uid(), 'super_admin') OR
  public.has_role(auth.uid(), 'fleet_manager')
);

CREATE TRIGGER update_practical_exams_updated_at
BEFORE UPDATE ON public.practical_driving_exams
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_practical_exams_driver ON public.practical_driving_exams(driver_id);
CREATE INDEX idx_practical_exams_company ON public.practical_driving_exams(company_name);
