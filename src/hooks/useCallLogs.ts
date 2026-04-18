import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CallLog {
  id: string;
  customer_id: string | null;
  vehicle_id: string | null;
  customer_name: string;
  vehicle_plate: string;
  phone: string;
  direction: 'outbound' | 'inbound';
  flow_type: 'pickup_ready' | 'service_reminder' | 'price_offer' | 'inbound_general' | 'customer_call' | 'general' | string;
  status: 'pending' | 'in_progress' | 'completed' | 'no_answer' | 'failed';
  outcome: 'booked' | 'declined' | 'callback' | 'unknown' | null;
  transcript: string;
  duration_sec: number;
  created_at: string;
}

export function useCallLogs() {
  const [calls, setCalls] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase.from('call_logs').select('*').order('created_at', { ascending: false }).limit(200);
    setCalls((data as CallLog[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase.channel('call_logs_rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'call_logs' }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const activeCall = calls.find(c => c.status === 'in_progress') || null;
  return { calls, loading, activeCall, reload: load };
}
