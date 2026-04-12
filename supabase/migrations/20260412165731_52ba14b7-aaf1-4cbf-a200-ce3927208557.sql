CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  _role app_role;
BEGIN
  _role := COALESCE(
    (NEW.raw_user_meta_data->>'role')::app_role,
    'driver'::app_role
  );

  INSERT INTO public.profiles (id, full_name, phone, company_name, is_active)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'company_name', ''),
    CASE WHEN _role = 'super_admin' THEN true ELSE false END
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, _role);

  -- Auto-create driver record when role is driver
  IF _role = 'driver' THEN
    INSERT INTO public.drivers (id, full_name, phone, email, company_name, status, created_by)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'phone', ''),
      COALESCE(NEW.email, ''),
      COALESCE(NEW.raw_user_meta_data->>'company_name', ''),
      'active',
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$;