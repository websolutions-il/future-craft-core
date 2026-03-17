DO $$
DECLARE
  r RECORD;
  next_num INT;
BEGIN
  FOR r IN SELECT id FROM suppliers WHERE supplier_number IS NULL OR supplier_number = '' ORDER BY created_at LOOP
    next_num := nextval('supplier_number_seq');
    UPDATE suppliers SET supplier_number = 'SUP-' || LPAD(next_num::text, 5, '0') WHERE id = r.id;
  END LOOP;
END $$;