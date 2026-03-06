import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AssignedVehicle {
  license_plate: string;
  manufacturer: string;
  model: string;
  year: number | null;
  company_name: string;
  odometer: number;
}

/**
 * For drivers: returns the vehicle assigned to them (assigned_driver_id = user.id).
 * For managers: returns null (they pick manually).
 */
export function useDriverVehicle() {
  const { user } = useAuth();
  const [vehicle, setVehicle] = useState<AssignedVehicle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    if (user.role !== 'driver') { setLoading(false); return; }

    supabase
      .from('vehicles')
      .select('license_plate, manufacturer, model, year, company_name, odometer')
      .eq('assigned_driver_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        setVehicle(data as AssignedVehicle | null);
        setLoading(false);
      });
  }, [user?.id, user?.role]);

  return { vehicle, loading, isDriver: user?.role === 'driver' };
}
