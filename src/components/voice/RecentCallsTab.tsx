import { useState } from 'react';
import { PhoneIncoming, PhoneOutgoing, PhoneCall, X } from 'lucide-react';
import type { CallLog } from '@/hooks/useCallLogs';

const flowLabels: Record<string, string> = {
  pickup_ready: 'איסוף רכב', service_reminder: 'תזכורת טיפול',
  price_offer: 'הצעת מחיר', inbound_general: 'שיחה נכנסת',
  customer_call: 'שיחת לקוח', general: 'כללי',
};
const statusBadge: Record<string, string> = {
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  no_answer: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 animate-pulse',
  pending: 'bg-muted text-muted-foreground',
};
const statusLabels: Record<string, string> = {
  completed: 'הושלמה', no_answer: 'אין מענה', failed: 'נכשלה', in_progress: 'בשיחה', pending: 'ממתין',
};
const outcomeLabels: Record<string, string> = {
  booked: '✅ נקבע תור', declined: '❌ סירב', callback: '🔁 חזרה', unknown: '❓ לא ידוע',
};

export default function RecentCallsTab({ calls }: { calls: CallLog[] }) {
  const [filterDir, setFilterDir] = useState<string>('all');
  const [filterFlow, setFilterFlow] = useState<string>('all');
  const [selected, setSelected] = useState<CallLog | null>(null);

  const filtered = calls.filter(c =>
    (filterDir === 'all' || c.direction === filterDir) &&
    (filterFlow === 'all' || c.flow_type === filterFlow)
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <select value={filterDir} onChange={e => setFilterDir(e.target.value)} className="rounded-xl border-2 border-input bg-background px-3 py-2 text-sm">
          <option value="all">כל הכיוונים</option>
          <option value="outbound">יוצאות 📤</option>
          <option value="inbound">נכנסות 📥</option>
        </select>
        <select value={filterFlow} onChange={e => setFilterFlow(e.target.value)} className="rounded-xl border-2 border-input bg-background px-3 py-2 text-sm">
          <option value="all">כל הסוגים</option>
          {Object.entries(flowLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      <div className="card-elevated overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-right text-muted-foreground border-b border-border">
            <tr>
              <th className="p-3">לקוח</th><th className="p-3">רכב</th><th className="p-3">כיוון</th>
              <th className="p-3">סוג</th><th className="p-3">סטטוס</th><th className="p-3">תוצאה</th>
              <th className="p-3">משך</th><th className="p-3">תאריך</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} onClick={() => setSelected(c)} className="border-b border-border hover:bg-muted/40 cursor-pointer">
                <td className="p-3 font-medium">{c.customer_name || '—'}</td>
                <td className="p-3">{c.vehicle_plate || '—'}</td>
                <td className="p-3">{c.direction === 'inbound' ? <PhoneIncoming size={16} className="text-blue-500" /> : <PhoneOutgoing size={16} className="text-green-600" />}</td>
                <td className="p-3 text-xs">{flowLabels[c.flow_type] || c.flow_type}</td>
                <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs font-bold ${statusBadge[c.status]}`}>{statusLabels[c.status]}</span></td>
                <td className="p-3 text-xs">{c.outcome ? outcomeLabels[c.outcome] : '—'}</td>
                <td className="p-3 tabular-nums text-xs">{c.duration_sec ? `${Math.floor(c.duration_sec/60)}:${String(c.duration_sec%60).padStart(2,'0')}` : '—'}</td>
                <td className="p-3 text-xs text-muted-foreground">{new Date(c.created_at).toLocaleString('he-IL')}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">אין שיחות להצגה</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-card rounded-2xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2"><PhoneCall size={20} /> פרטי שיחה</h3>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-muted rounded-full"><X size={18} /></button>
            </div>
            <div className="space-y-2 text-sm">
              <div><span className="text-muted-foreground">לקוח:</span> <strong>{selected.customer_name || '—'}</strong></div>
              <div><span className="text-muted-foreground">טלפון:</span> {selected.phone || '—'}</div>
              <div><span className="text-muted-foreground">רכב:</span> {selected.vehicle_plate || '—'}</div>
              <div><span className="text-muted-foreground">סוג:</span> {flowLabels[selected.flow_type] || selected.flow_type}</div>
              <div><span className="text-muted-foreground">תוצאה:</span> {selected.outcome ? outcomeLabels[selected.outcome] : '—'}</div>
              <div className="pt-3 border-t border-border">
                <div className="text-muted-foreground mb-2">📝 תמליל:</div>
                <pre className="bg-muted p-3 rounded-xl text-xs whitespace-pre-wrap font-sans">{selected.transcript || 'אין תמליל זמין'}</pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
