import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Clock } from 'lucide-react';

interface LogEntry {
  id: string;
  old_status: string;
  new_status: string;
  changed_by_name: string;
  notes: string;
  created_at: string;
}

const statusHebrew: Record<string, string> = {
  opened: 'נפתחה',
  pending_approval: 'ממתינה לאישור',
  approved: 'אושרה',
  in_treatment: 'בטיפול',
  referred_to_provider: 'הופנתה לספק',
  towing_done: 'שינוע בוצע',
  completed: 'הושלמה',
  closed: 'נסגרה',
  // legacy
  new: 'חדש',
  open: 'פתוח',
  in_progress: 'בטיפול',
  resolved: 'טופל',
};

export function getStatusLabel(s: string) {
  return statusHebrew[s] || s;
}

export default function FaultStatusLog({ faultId }: { faultId: string }) {
  const [log, setLog] = useState<LogEntry[]>([]);

  useEffect(() => {
    supabase
      .from('fault_status_log')
      .select('*')
      .eq('fault_id', faultId)
      .order('created_at', { ascending: true })
      .then(({ data }) => { if (data) setLog(data); });
  }, [faultId]);

  if (log.length === 0) return null;

  return (
    <div className="card-elevated">
      <h3 className="text-lg font-bold mb-3 flex items-center gap-2"><Clock size={18} /> היסטוריית סטטוס</h3>
      <div className="space-y-2">
        {log.map(entry => (
          <div key={entry.id} className="flex items-start gap-3 p-2 rounded-lg bg-muted/30 text-sm">
            <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
            <div className="flex-1">
              <p>
                <span className="font-medium">{getStatusLabel(entry.old_status)}</span>
                {' → '}
                <span className="font-bold text-primary">{getStatusLabel(entry.new_status)}</span>
              </p>
              <p className="text-muted-foreground text-xs">
                {entry.changed_by_name} • {new Date(entry.created_at).toLocaleDateString('he-IL')} {new Date(entry.created_at).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
              </p>
              {entry.notes && <p className="text-xs mt-1">{entry.notes}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
