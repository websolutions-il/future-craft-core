
-- Enable realtime for faults and service_orders tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.faults;
ALTER PUBLICATION supabase_realtime ADD TABLE public.service_orders;
