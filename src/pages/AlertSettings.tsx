import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, Save, Building2 } from 'lucide-react';
import { toast } from 'sonner';

interface CompanyAlertConfig {
  id: string;
  company_name: string;
  alert_days_before: number;
  reminder_30_days: boolean;
  reminder_7_days: boolean;
  reminder_1_day: boolean;
}

export default function AlertSettings() {
  const { user } = useAuth();
  const [configs, setConfigs] = useState<CompanyAlertConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const isSuperAdmin = user?.role === 'super_admin';

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    setLoading(true);
    const { data } = await supabase.from('company_settings').select('id, company_name, alert_days_before, reminder_30_days, reminder_7_days, reminder_1_day');
    if (data) setConfigs(data as CompanyAlertConfig[]);
    setLoading(false);
  };

  const handleSave = async (config: CompanyAlertConfig) => {
    const { error } = await supabase.from('company_settings').update({
      alert_days_before: config.alert_days_before,
      reminder_30_days: config.reminder_30_days,
      reminder_7_days: config.reminder_7_days,
      reminder_1_day: config.reminder_1_day,
    }).eq('id', config.id);
    if (error) toast.error('שגיאה בשמירה');
    else toast.success(`הגדרות ${config.company_name} עודכנו`);
  };

  const updateConfig = (id: string, field: string, value: any) => {
    setConfigs(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  if (!isSuperAdmin) {
    return (
      <div className="animate-fade-in text-center py-16">
        <Bell size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
        <p className="text-xl text-muted-foreground">אין הרשאה</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <h1 className="page-header flex items-center gap-3"><Bell size={28} /> הגדרות התראות</h1>
      <p className="text-muted-foreground">הגדר תזכורות אוטומטיות לפי חברה — 30 יום, 7 ימים ויום לפני תפוגה.</p>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" /></div>
      ) : configs.length === 0 ? (
        <div className="card-elevated text-center py-12 text-muted-foreground">אין חברות מוגדרות</div>
      ) : (
        <div className="space-y-4">
          {configs.map(config => (
            <div key={config.id} className="card-elevated space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg flex items-center gap-2"><Building2 size={18} /> {config.company_name}</h3>
                <button onClick={() => handleSave(config)}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-sm">
                  <Save size={16} /> שמור
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">ימים לפני תזכורת ראשונה</label>
                <input type="number" value={config.alert_days_before} min={1} max={90}
                  onChange={e => updateConfig(config.id, 'alert_days_before', parseInt(e.target.value) || 30)}
                  className="w-32 p-3 rounded-xl border-2 border-input bg-background text-sm focus:border-primary focus:outline-none" />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">תזכורות אוטומטיות:</p>
                {[
                  { key: 'reminder_30_days', label: '30 יום לפני' },
                  { key: 'reminder_7_days', label: '7 ימים לפני' },
                  { key: 'reminder_1_day', label: 'יום לפני' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-3 p-3 rounded-xl bg-muted cursor-pointer">
                    <input type="checkbox"
                      checked={(config as any)[key]}
                      onChange={e => updateConfig(config.id, key, e.target.checked)}
                      className="rounded" />
                    <span className="text-sm font-medium">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
