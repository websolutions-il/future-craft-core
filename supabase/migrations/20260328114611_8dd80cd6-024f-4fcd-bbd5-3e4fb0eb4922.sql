
-- Sequence for exchange form numbers
CREATE SEQUENCE IF NOT EXISTS vehicle_exchange_number_seq START WITH 1;

CREATE TABLE public.vehicle_exchanges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exchange_number text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  company_name text DEFAULT '',

  -- Part 1: Basic info
  exchange_date date DEFAULT CURRENT_DATE,
  exchange_time text DEFAULT '',
  action_type text DEFAULT '',

  -- Part 2: Vehicle
  vehicle_plate text NOT NULL DEFAULT '',
  vehicle_type text DEFAULT '',
  vehicle_type_custom text DEFAULT '',
  branch text DEFAULT '',
  internal_number text DEFAULT '',
  permanent_driver_name text DEFAULT '',
  has_permanent_driver boolean DEFAULT false,

  -- Part 3: Drivers
  giving_driver_name text DEFAULT '',
  giving_driver_phone text DEFAULT '',
  receiving_driver_name text DEFAULT '',
  receiving_driver_phone text DEFAULT '',
  receiving_driver_type text DEFAULT '',

  -- Part 4: Location
  location_address text DEFAULT '',
  lat numeric,
  lng numeric,
  handover_date date DEFAULT CURRENT_DATE,
  handover_time text DEFAULT '',

  -- Part 5: Vehicle condition
  odometer integer NOT NULL DEFAULT 0,
  fuel_level text DEFAULT '',
  cleanliness text DEFAULT '',
  has_damages boolean DEFAULT false,
  damage_details text DEFAULT '',
  has_warning_light boolean DEFAULT false,

  -- Part 6: Photos (JSON array of URLs per category)
  photo_front text DEFAULT '',
  photo_rear text DEFAULT '',
  photo_right text DEFAULT '',
  photo_left text DEFAULT '',
  photo_interior text DEFAULT '',
  photo_odometer text DEFAULT '',
  photo_damage text DEFAULT '',

  -- Part 7: Equipment
  key_count integer DEFAULT 1,
  has_license_doc boolean DEFAULT true,
  has_insurance_doc boolean DEFAULT true,
  has_spare_tire boolean DEFAULT true,
  has_jack boolean DEFAULT true,
  extra_equipment text DEFAULT '',

  -- Part 8: Notes
  exchange_reason text DEFAULT '',
  giving_driver_notes text DEFAULT '',
  receiving_driver_notes text DEFAULT '',
  special_instructions text DEFAULT '',

  -- Part 9: Approvals
  giving_driver_approved boolean DEFAULT false,
  receiving_driver_approved boolean DEFAULT false,
  giving_driver_signature text DEFAULT '',
  receiving_driver_signature text DEFAULT '',
  manager_approved boolean DEFAULT false,
  manager_approved_by text DEFAULT '',

  -- Part 10: WhatsApp
  whatsapp_status text DEFAULT 'pending',
  whatsapp_phone text DEFAULT '',

  -- General status
  status text DEFAULT 'draft'
);

-- Auto-generate exchange number
CREATE OR REPLACE FUNCTION public.set_exchange_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.exchange_number IS NULL OR NEW.exchange_number = '' THEN
    NEW.exchange_number := 'EX-' || LPAD(nextval('vehicle_exchange_number_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_exchange_number_trigger
  BEFORE INSERT ON public.vehicle_exchanges
  FOR EACH ROW EXECUTE FUNCTION public.set_exchange_number();

-- RLS
ALTER TABLE public.vehicle_exchanges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company exchanges"
  ON public.vehicle_exchanges FOR SELECT TO authenticated
  USING (company_name = get_user_company(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Authenticated can insert exchanges"
  ON public.vehicle_exchanges FOR INSERT TO authenticated
  WITH CHECK (company_name = get_user_company(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Managers can update exchanges"
  ON public.vehicle_exchanges FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'fleet_manager'::app_role) AND company_name = get_user_company(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role) OR created_by = auth.uid());

CREATE POLICY "Managers can delete exchanges"
  ON public.vehicle_exchanges FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'fleet_manager'::app_role) AND company_name = get_user_company(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));
