
-- Function to notify fleet managers when a fault is reported
CREATE OR REPLACE FUNCTION public.notify_managers_on_fault()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.driver_notifications (user_id, type, title, message, link)
  SELECT ur.user_id,
         'fault',
         'תקלה חדשה דווחה',
         'נהג ' || COALESCE(NEW.driver_name, '') || ' דיווח תקלה ברכב ' || COALESCE(NEW.vehicle_plate, '') || ': ' || COALESCE(NEW.description, ''),
         '/faults'
  FROM public.user_roles ur
  JOIN public.profiles p ON p.id = ur.user_id
  WHERE ur.role = 'fleet_manager'
    AND p.company_name = NEW.company_name
    AND ur.user_id != COALESCE(NEW.created_by, '00000000-0000-0000-0000-000000000000');
  RETURN NEW;
END;
$$;

-- Function to notify fleet managers when an accident is reported
CREATE OR REPLACE FUNCTION public.notify_managers_on_accident()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.driver_notifications (user_id, type, title, message, link)
  SELECT ur.user_id,
         'accident',
         '🚨 תאונה חדשה דווחה',
         'נהג ' || COALESCE(NEW.driver_name, '') || ' דיווח תאונה ברכב ' || COALESCE(NEW.vehicle_plate, '') || ': ' || COALESCE(NEW.description, ''),
         '/accidents'
  FROM public.user_roles ur
  JOIN public.profiles p ON p.id = ur.user_id
  WHERE ur.role = 'fleet_manager'
    AND p.company_name = NEW.company_name
    AND ur.user_id != COALESCE(NEW.created_by, '00000000-0000-0000-0000-000000000000');
  RETURN NEW;
END;
$$;

-- Create triggers
CREATE TRIGGER on_fault_notify_managers
  AFTER INSERT ON public.faults
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_managers_on_fault();

CREATE TRIGGER on_accident_notify_managers
  AFTER INSERT ON public.accidents
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_managers_on_accident();
