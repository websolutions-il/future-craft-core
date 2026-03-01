ALTER TABLE public.vehicle_handovers 
ADD COLUMN driver_approval_status text NOT NULL DEFAULT 'pending',
ADD COLUMN approval_updated_at timestamp with time zone;