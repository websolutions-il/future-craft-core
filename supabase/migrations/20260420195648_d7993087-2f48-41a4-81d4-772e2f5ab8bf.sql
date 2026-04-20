
ALTER TABLE public.vehicle_tasks
ADD COLUMN IF NOT EXISTS requires_follow_up boolean NOT NULL DEFAULT true;

ALTER TABLE public.vehicle_tasks
ADD COLUMN IF NOT EXISTS follow_up_date date DEFAULT NULL;

ALTER TABLE public.vehicle_tasks
ADD COLUMN IF NOT EXISTS resolution_notes text DEFAULT '';
