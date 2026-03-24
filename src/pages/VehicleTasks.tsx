import { useState, useEffect } from 'react';
import { ListTodo, Search, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCompanyFilter, applyCompanyScope } from '@/hooks/useCompanyFilter';
import { toast } from 'sonner';

interface TaskRow {
  id: string;
  vehicle_id: string | null;
  vehicle_plate: string;
  inspection_id: string | null;
  title: string;
  description: string;
  status: string;
  resolved_at: string | null;
  resolved_by_name: string;
  company_name: string;
  created_at: string;
}

export default function VehicleTasks() {
  const { user } = useAuth();
  const companyFilter = useCompanyFilter();
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('open');
  const [loading, setLoading] = useState(true);

  const loadTasks = async () => {
    setLoading(true);
    const { data } = await applyCompanyScope(
      supabase.from('vehicle_tasks').select('*'), companyFilter
    ).order('created_at', { ascending: false });
    if (data) setTasks(data as TaskRow[]);
    setLoading(false);
  };

  useEffect(() => { loadTasks(); }, []);

  const filtered = tasks.filter(t => {
    const matchSearch = !search || t.vehicle_plate?.includes(search) || t.title?.includes(search);
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const isManager = user?.role === 'fleet_manager' || user?.role === 'super_admin';

  const handleResolve = async (task: TaskRow) => {
    const { error } = await supabase.from('vehicle_tasks').update({
      status: 'resolved',
      resolved_at: new Date().toISOString(),
      resolved_by_name: user?.full_name || '',
    }).eq('id', task.id);

    if (error) {
      toast.error('שגיאה בעדכון');
    } else {
      toast.success('המשימה סומנה כטופלה');
      loadTasks();
    }
  };

  const statusCounts = {
    all: tasks.length,
    open: tasks.filter(t => t.status === 'open').length,
    resolved: tasks.filter(t => t.status === 'resolved').length,
  };

  return (
    <div className="animate-fade-in">
      <h1 className="page-header flex items-center gap-3"><ListTodo size={28} /> משימות טיפול רכב</h1>

      <div className="relative mb-4">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="חיפוש לפי מספר רכב או משימה..."
          className="w-full pr-12 p-4 text-lg rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none" />
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        {([
          { key: 'all', label: 'הכל' },
          { key: 'open', label: 'פתוחות' },
          { key: 'resolved', label: 'טופלו' },
        ] as const).map(f => (
          <button key={f.key} onClick={() => setStatusFilter(f.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${statusFilter === f.key ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
            {f.label} ({statusCounts[f.key]})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <ListTodo size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-xl">אין משימות</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(t => (
            <div key={t.id} className="card-elevated">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${t.status === 'open' ? 'bg-warning/10' : 'bg-success/10'}`}>
                  {t.status === 'open' ? <Clock size={24} className="text-warning" /> : <CheckCircle2 size={24} className="text-success" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-bold">{t.title}</p>
                  <p className="text-muted-foreground text-sm">רכב {t.vehicle_plate} • {new Date(t.created_at).toLocaleDateString('he-IL')}</p>
                  {t.description && <p className="text-sm text-muted-foreground mt-1">{t.description}</p>}
                  {t.resolved_at && <p className="text-xs text-success mt-1">טופל ב-{new Date(t.resolved_at).toLocaleDateString('he-IL')} ע"י {t.resolved_by_name}</p>}
                </div>
                {isManager && t.status === 'open' && (
                  <button onClick={() => handleResolve(t)}
                    className="px-4 py-2 rounded-xl bg-success/10 text-success text-sm font-bold hover:bg-success/20 transition-colors">
                    ✅ טופל
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
