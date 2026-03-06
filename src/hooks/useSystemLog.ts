import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useSystemLog() {
  const { user } = useAuth();

  const log = async (params: {
    action_type: string;
    entity_type: string;
    entity_id?: string;
    vehicle_plate?: string;
    old_status?: string;
    new_status?: string;
    details?: string;
    channel?: string;
  }) => {
    await supabase.from('system_logs').insert({
      user_id: user?.id,
      user_name: user?.full_name || '',
      company_name: user?.company_name || '',
      ...params,
    });
  };

  return { log };
}
