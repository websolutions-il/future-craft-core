import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { STATUS_LABELS } from './statusConfig';

interface LogEntry {
  id: string;
  old_status: string;
  new_status: string;
  changed_by_name: string;
  notes: string;
  created_at: string;
}

export default function AssignmentStatusLog({ assignmentId }: { assignmentId: string }) {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    supabase
      .from('work_assignment_status_log')
      .select('*')
      .eq('assignment_id', assignmentId)
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setLogs(data as LogEntry[]); });
  }, [assignmentId]);

  if (logs.length === 0) return null;

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="bg-muted px-4 py-2 text-sm font-bold">📋 לוג שינויי סטטוס</div>
      <div className="max-h-48 overflow-y-auto divide-y divide-border">
        {logs.map(log => (
          <div key={log.id} className="px-4 py-2 text-sm">
            <div className="flex items-center justify-between">
              <span>
                {STATUS_LABELS[log.old_status] || log.old_status || '—'} → <strong>{STATUS_LABELS[log.new_status] || log.new_status}</strong>
              </span>
              <span className="text-xs text-muted-foreground">
                {format(new Date(log.created_at), 'dd/MM HH:mm', { locale: he })}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{log.changed_by_name}</p>
            {log.notes && <p className="text-xs text-muted-foreground italic">{log.notes}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
