ALTER PUBLICATION supabase_realtime ADD TABLE public.work_assignments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.driver_notifications;
ALTER TABLE public.work_assignments REPLICA IDENTITY FULL;
ALTER TABLE public.driver_notifications REPLICA IDENTITY FULL;