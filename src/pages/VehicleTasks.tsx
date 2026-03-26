import { useState, useEffect } from 'react';
import { AlertTriangle, Search, CheckCircle2, Clock, Wrench, Filter, Car } from 'lucide-react';
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

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  open: { label: 'פתוח', color: 'text-destructive', bg: 'bg-destructive/10', icon: AlertTriangle },
  in_progress: { label: 'בטיפול', color: 'text-warning', bg: 'bg-warning/10', icon: Wrench },
  resolved: { label: 'טופל', color: 'text-success', bg: 'bg-success/10', icon: CheckCircle2 },
};

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
    const matchSearch = !search || t.vehicle_plate?.includes(search) || t.title?.includes(search) || t.description?.includes(search);
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const isManager = user?.role === 'fleet_manager' || user?.role === 'super_admin';

  const handleStatusChange = async (task: TaskRow, newStatus: string) => {
    const updates: any = { status: newStatus };
    if (newStatus === 'resolved') {
      updates.resolved_at = new Date().toISOString();
      updates.resolved_by_name = user?.full_name || '';
    } else {
      updates.resolved_at = null;
      updates.resolved_by_name = '';
    }

    const { error } = await supabase.from('vehicle_tasks').update(updates).eq('id', task.id);
    if (error) {
      toast.error('שגיאה בעדכון');
    } else {
      const statusLabel = STATUS_CONFIG[newStatus]?.label || newStatus;
      toast.success(`הליקוי עודכן ל: ${statusLabel}`);
      loadTasks();
    }
  };

  const statusCounts = {
    all: tasks.length,
    open: tasks.filter(t => t.status === 'open').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    resolved: tasks.filter(t => t.status === 'resolved').length,
  };

  return (
    <div className="animate-fade-in">
      <h1 className="page-header flex items-center gap-3">
        <AlertTriangle size={28} /> ניהול ליקויים
      </h1>
      <p className="text-muted-foreground mb-4 -mt-2">ליקויים שנמצאו בביקורות רכב — מעקב וטיפול</p>

      <div className="relative mb-4">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="חיפוש לפי מספר רכב, ליקוי או תיאור..."
          className="w-full pr-12 p-4 text-lg rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none" />
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {([
          { key: 'all', label: 'הכל', emoji: '📋' },
          { key: 'open', label: 'פתוחים', emoji: '🔴' },
          { key: 'in_progress', label: 'בטיפול', emoji: '🟡' },
          { key: 'resolved', label: 'טופלו', emoji: '🟢' },
        ] as const).map(f => (
          <button key={f.key} onClick={() => setStatusFilter(f.key)}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 ${
              statusFilter === f.key ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}>
            <span>{f.emoji}</span>
            {f.label} ({statusCounts[f.key]})
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="card-elevated text-center py-3">
          <p className="text-2xl font-black text-destructive">{statusCounts.open}</p>
          <p className="text-xs text-muted-foreground font-medium">פתוחים</p>
        </div>
        <div className="card-elevated text-center py-3">
          <p className="text-2xl font-black text-warning">{statusCounts.in_progress}</p>
          <p className="text-xs text-muted-foreground font-medium">בטיפול</p>
        </div>
        <div className="card-elevated text-center py-3">
          <p className="text-2xl font-black text-success">{statusCounts.resolved}</p>
          <p className="text-xs text-muted-foreground font-medium">טופלו</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <AlertTriangle size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-xl">אין ליקויים{statusFilter !== 'all' ? ` בסטטוס "${STATUS_CONFIG[statusFilter]?.label || statusFilter}"` : ''}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(t => {
            const cfg = STATUS_CONFIG[t.status] || STATUS_CONFIG.open;
            const StatusIcon = cfg.icon;
            return (
              <div key={t.id} className="card-elevated">
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                    <StatusIcon size={24} className={cfg.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-lg font-bold">{t.title}</p>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${cfg.bg} ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <Car size={14} />
                      <span className="font-medium">רכב {t.vehicle_plate}</span>
                      <span>•</span>
                      <span>{new Date(t.created_at).toLocaleDateString('he-IL')}</span>
                    </div>
                    {t.description && (
                      <p className="text-sm text-muted-foreground mt-1.5 bg-muted/50 p-2 rounded-lg">{t.description}</p>
                    )}
                    {t.resolved_at && (
                      <p className="text-xs text-success mt-1.5">
                        ✅ טופל ב-{new Date(t.resolved_at).toLocaleDateString('he-IL')} ע"י {t.resolved_by_name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Status action buttons for managers */}
                {isManager && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                    {t.status === 'open' && (
                      <>
                        <button onClick={() => handleStatusChange(t, 'in_progress')}
                          className="flex-1 py-2 rounded-xl bg-warning/10 text-warning text-sm font-bold hover:bg-warning/20 transition-colors flex items-center justify-center gap-1.5">
                          <Wrench size={16} /> העבר לטיפול
                        </button>
                        <button onClick={() => handleStatusChange(t, 'resolved')}
                          className="flex-1 py-2 rounded-xl bg-success/10 text-success text-sm font-bold hover:bg-success/20 transition-colors flex items-center justify-center gap-1.5">
                          <CheckCircle2 size={16} /> סגור ליקוי
                        </button>
                      </>
                    )}
                    {t.status === 'in_progress' && (
                      <>
                        <button onClick={() => handleStatusChange(t, 'open')}
                          className="flex-1 py-2 rounded-xl bg-muted text-muted-foreground text-sm font-bold hover:bg-muted/80 transition-colors flex items-center justify-center gap-1.5">
                          <AlertTriangle size={16} /> החזר לפתוח
                        </button>
                        <button onClick={() => handleStatusChange(t, 'resolved')}
                          className="flex-1 py-2 rounded-xl bg-success/10 text-success text-sm font-bold hover:bg-success/20 transition-colors flex items-center justify-center gap-1.5">
                          <CheckCircle2 size={16} /> סגור ליקוי
                        </button>
                      </>
                    )}
                    {t.status === 'resolved' && (
                      <button onClick={() => handleStatusChange(t, 'open')}
                        className="flex-1 py-2 rounded-xl bg-destructive/10 text-destructive text-sm font-bold hover:bg-destructive/20 transition-colors flex items-center justify-center gap-1.5">
                        <AlertTriangle size={16} /> פתח מחדש
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
