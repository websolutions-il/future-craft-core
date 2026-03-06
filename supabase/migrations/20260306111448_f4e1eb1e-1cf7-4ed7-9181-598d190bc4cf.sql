
-- Trigger: notify fleet managers internally when a new service order is created
CREATE OR REPLACE FUNCTION public.notify_managers_on_service_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Always notify on new orders
  INSERT INTO public.driver_notifications (user_id, type, title, message, link)
  SELECT ur.user_id,
         'service_order',
         CASE 
           WHEN NEW.urgency IN ('critical', 'urgent') THEN '🚨 הזמנת שירות דחופה'
           ELSE '🔧 הזמנת שירות חדשה'
         END,
         'הזמנת שירות חדשה לרכב ' || COALESCE(NEW.vehicle_plate, '') || 
         CASE WHEN NEW.towing_requested = true THEN ' (נדרש שינוע)' ELSE '' END ||
         ': ' || COALESCE(NEW.description, ''),
         '/service-orders'
  FROM public.user_roles ur
  JOIN public.profiles p ON p.id = ur.user_id
  WHERE ur.role = 'fleet_manager'
    AND p.company_name = NEW.company_name
    AND ur.user_id != COALESCE(NEW.created_by, '00000000-0000-0000-0000-000000000000');
  
  RETURN NEW;
END;
$$;

-- Create the trigger on service_orders
DROP TRIGGER IF EXISTS on_service_order_created ON public.service_orders;
CREATE TRIGGER on_service_order_created
  AFTER INSERT ON public.service_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_managers_on_service_order();

-- Also notify when urgency is changed to critical/urgent on UPDATE
CREATE OR REPLACE FUNCTION public.notify_managers_on_service_order_urgent()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only fire when urgency changes TO critical/urgent
  IF NEW.urgency IN ('critical', 'urgent') AND (OLD.urgency IS NULL OR OLD.urgency NOT IN ('critical', 'urgent')) THEN
    INSERT INTO public.driver_notifications (user_id, type, title, message, link)
    SELECT ur.user_id,
           'service_order',
           '🚨 הזמנת שירות סומנה כדחופה',
           'הזמנה לרכב ' || COALESCE(NEW.vehicle_plate, '') || ' שודרגה לדחיפות ' ||
           CASE WHEN NEW.urgency = 'critical' THEN 'מיידית' ELSE 'דחופה' END,
           '/service-orders'
    FROM public.user_roles ur
    JOIN public.profiles p ON p.id = ur.user_id
    WHERE ur.role = 'fleet_manager'
      AND p.company_name = NEW.company_name;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_service_order_urgency_change ON public.service_orders;
CREATE TRIGGER on_service_order_urgency_change
  AFTER UPDATE ON public.service_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_managers_on_service_order_urgent();
