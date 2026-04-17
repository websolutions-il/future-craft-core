import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Save } from 'lucide-react';

interface Prompt {
  id: string; flow_type: string; display_name: string;
  system_prompt: string; opener_text: string;
}

const VARS = ['{{customer_name}}', '{{vehicle_make}}', '{{vehicle_model}}', '{{plate}}', '{{garage_name}}', '{{slot_1}}', '{{slot_2}}'];

export default function PromptsTab() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [editing, setEditing] = useState<Prompt | null>(null);
  const [sys, setSys] = useState('');
  const [opener, setOpener] = useState('');

  const load = async () => {
    const { data } = await supabase.from('voice_prompts').select('*').order('flow_type');
    setPrompts((data as Prompt[]) || []);
  };
  useEffect(() => { load(); }, []);

  const startEdit = (p: Prompt) => { setEditing(p); setSys(p.system_prompt); setOpener(p.opener_text); };

  const save = async () => {
    if (!editing) return;
    const { error } = await supabase.from('voice_prompts').update({ system_prompt: sys, opener_text: opener }).eq('id', editing.id);
    if (error) return toast.error('שגיאה - ייתכן שאין לך הרשאה');
    toast.success('נשמר');
    setEditing(null); load();
  };

  return (
    <div className="space-y-3">
      <div className="card-elevated bg-primary/5 border-primary/20">
        <div className="text-sm font-bold mb-2">משתנים זמינים:</div>
        <div className="flex flex-wrap gap-2">
          {VARS.map(v => <code key={v} className="px-2 py-1 bg-card border border-border rounded text-xs">{v}</code>)}
        </div>
      </div>

      {prompts.map(p => (
        <div key={p.id} className="card-elevated">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold">{p.display_name}</h4>
            <button onClick={() => startEdit(p)} className="text-primary text-sm font-medium">ערוך</button>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">{p.opener_text}</p>
        </div>
      ))}

      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-card rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">{editing.display_name}</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">פרומפט מערכת (System Prompt)</label>
                <textarea value={sys} onChange={e => setSys(e.target.value)} rows={5}
                  className="w-full mt-1 p-3 rounded-xl border-2 border-input bg-background text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium">משפט פתיחה (Opener)</label>
                <textarea value={opener} onChange={e => setOpener(e.target.value)} rows={3}
                  className="w-full mt-1 p-3 rounded-xl border-2 border-input bg-background text-sm" />
              </div>
              <div className="flex gap-2">
                <button onClick={save} className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2">
                  <Save size={16} /> שמור
                </button>
                <button onClick={() => setEditing(null)} className="flex-1 py-3 rounded-xl border border-border">ביטול</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
