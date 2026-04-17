import { useEffect, useState } from 'react';
import { Plus, Play, Pause, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Campaign {
  id: string; name: string; flow_type: string; status: string;
  total_calls: number; completed_calls: number; booked_count: number;
  scheduled_at: string | null;
}

const flowLabels: Record<string, string> = {
  pickup_ready: 'איסוף רכב', service_reminder: 'תזכורת טיפול',
  price_offer: 'הצעת מחיר', inbound_general: 'שיחה נכנסת',
};

export default function CampaignsTab() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [flow, setFlow] = useState('pickup_ready');

  const load = async () => {
    const { data } = await supabase.from('voice_campaigns').select('*').order('created_at', { ascending: false });
    setCampaigns((data as Campaign[]) || []);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!name) return toast.error('הזן שם קמפיין');
    const { error } = await supabase.from('voice_campaigns').insert({ name, flow_type: flow, status: 'draft' });
    if (error) return toast.error('שגיאה');
    toast.success('קמפיין נוצר');
    setShowForm(false); setName(''); load();
  };

  const toggle = async (c: Campaign) => {
    const next = c.status === 'running' ? 'paused' : 'running';
    await supabase.from('voice_campaigns').update({ status: next }).eq('id', c.id);
    load();
  };

  return (
    <div className="space-y-3">
      <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-bold">
        <Plus size={18} /> צור קמפיין חדש
      </button>

      {showForm && (
        <div className="card-elevated space-y-3">
          <h3 className="font-bold">קמפיין חדש</h3>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="שם הקמפיין"
            className="w-full p-3 rounded-xl border-2 border-input bg-background" />
          <select value={flow} onChange={e => setFlow(e.target.value)}
            className="w-full p-3 rounded-xl border-2 border-input bg-background">
            {Object.entries(flowLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <div className="flex gap-2">
            <button onClick={create} className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground font-bold">צור</button>
            <button onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-xl border border-border">ביטול</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {campaigns.map(c => {
          const pct = c.total_calls > 0 ? Math.round((c.completed_calls / c.total_calls) * 100) : 0;
          return (
            <div key={c.id} className="card-elevated">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-bold text-lg">{c.name}</h4>
                  <p className="text-xs text-muted-foreground">{flowLabels[c.flow_type]} · סטטוס: {c.status}</p>
                </div>
                <button onClick={() => toggle(c)} className="p-2 rounded-xl bg-muted hover:bg-muted/70">
                  {c.status === 'running' ? <Pause size={18} /> : <Play size={18} />}
                </button>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{c.completed_calls}/{c.total_calls} שיחות</span>
                  <span className="flex items-center gap-1"><BarChart3 size={12} /> נקבעו: {c.booked_count}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            </div>
          );
        })}
        {campaigns.length === 0 && (
          <div className="card-elevated text-center text-muted-foreground py-8">אין קמפיינים עדיין</div>
        )}
      </div>
    </div>
  );
}
