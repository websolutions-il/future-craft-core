-- Add private_customer to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'private_customer';
