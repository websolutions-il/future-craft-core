
ALTER TABLE public.routes
  ADD COLUMN IF NOT EXISTS route_number text DEFAULT '',
  ADD COLUMN IF NOT EXISTS route_vehicle_type text DEFAULT '',
  ADD COLUMN IF NOT EXISTS route_vehicle_type_custom text DEFAULT '',
  ADD COLUMN IF NOT EXISTS amount numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS vehicle_type_pricing jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS valid_from date DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS valid_to date DEFAULT NULL;
