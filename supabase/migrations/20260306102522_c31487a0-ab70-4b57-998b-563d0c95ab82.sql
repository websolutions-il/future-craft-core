
-- Add missing columns to service_orders
ALTER TABLE public.service_orders
  ADD COLUMN IF NOT EXISTS urgency text DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS towing_requested boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS towing_address text DEFAULT '',
  ADD COLUMN IF NOT EXISTS towing_time text DEFAULT '',
  ADD COLUMN IF NOT EXISTS towing_contact text DEFAULT '',
  ADD COLUMN IF NOT EXISTS images text DEFAULT '';

-- Create service_order_messages table for internal chat
CREATE TABLE IF NOT EXISTS public.service_order_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.service_orders(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  user_name text NOT NULL DEFAULT '',
  message text NOT NULL DEFAULT '',
  company_name text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.service_order_messages ENABLE ROW LEVEL SECURITY;

-- RLS: users can view messages for their company's orders
CREATE POLICY "Users can view own company order messages"
  ON public.service_order_messages FOR SELECT TO authenticated
  USING (company_name = get_user_company(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS: authenticated users can insert messages for their company
CREATE POLICY "Authenticated can insert order messages"
  ON public.service_order_messages FOR INSERT TO authenticated
  WITH CHECK (company_name = get_user_company(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Add INSERT policy for regular users on service_orders
CREATE POLICY "Authenticated users can insert service orders"
  ON public.service_orders FOR INSERT TO authenticated
  WITH CHECK (company_name = get_user_company(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Add UPDATE policy for creators on pending orders
CREATE POLICY "Creators can update own pending orders"
  ON public.service_orders FOR UPDATE TO authenticated
  USING (created_by = auth.uid() AND treatment_status = 'pending_approval')
  WITH CHECK (created_by = auth.uid() AND treatment_status = 'pending_approval');

-- Add DELETE policy for creators on pending orders
CREATE POLICY "Creators can delete own pending orders"
  ON public.service_orders FOR DELETE TO authenticated
  USING (created_by = auth.uid() AND treatment_status = 'pending_approval');

-- Enable realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.service_order_messages;
