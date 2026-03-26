
import { CheckCircle, Calendar, Rocket, Plus, Clock, ArrowLeftRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

interface DevTask {
  id: string;
  task_number: number;
  summary: string;
  clarification: string;
  status: string;
  created_at: string;
  completed_at: string | null;
}

const CompletedTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<DevTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSummary, setNewSummary] = useState('');
  const [newClarification, setNewClarification] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isSuperAdmin = user?.role === 'super_admin';

  if (!user || (user.role !== 'super_admin' && user.role !== 'fleet_manager')) {
    return <Navigate to="/dashboard" replace />;
  }

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('dev_tasks')
      .select('*')
      .order('task_number', { ascending: true });
    if (!error && data) {
      setTasks(data as unknown as DevTask[]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchTasks(); }, []);

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  const handleAddTask = async () => {
    if (!newSummary.trim()) {
      toast.error('יש למלא תיאור משימה');
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('dev_tasks').insert({
      summary: newSummary.trim(),
      clarification: newClarification.trim(),
      status: 'pending',
      created_by: user.id,
    } as any);
    if (error) {
      toast.error('שגיאה בשמירה');
    } else {
      toast.success('המשימה נוספה בהצלחה');
      setNewSummary('');
      setNewClarification('');
      fetchTasks();
    }
    setSubmitting(false);
  };

  const handleMarkCompleted = async (task: DevTask) => {
    const { error } = await supabase
      .from('dev_tasks')
      .update({ status: 'completed', completed_at: new Date().toISOString() } as any)
      .eq('id', task.id);
    if (!error) {
      toast.success(`משימה #${task.task_number} סומנה כבוצעה`);
      fetchTasks();
    }
  };

  const handleMarkPending = async (task: DevTask) => {
    const { error } = await supabase
      .from('dev_tasks')
      .update({ status: 'pending', completed_at: null } as any)
      .eq('id', task.id);
    if (!error) {
      toast.success(`משימה #${task.task_number} הוחזרה לביצוע`);
      fetchTasks();
    }
  };

  const TaskTable = ({ items, showComplete }: { items: DevTask[]; showComplete: boolean }) => (
    <div className="border border-border rounded-lg overflow-hidden overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted">
            <th className="text-right p-3 font-semibold w-8">#</th>
            <th className="text-right p-3 font-semibold w-32">
              <div className="flex items-center gap-1"><Calendar size={14} />תאריך</div>
            </th>
            <th className="text-right p-3 font-semibold">תיאור המשימה</th>
            <th className="text-center p-3 font-semibold w-20">סטטוס</th>
            {isSuperAdmin && <th className="text-center p-3 font-semibold w-24">פעולה</th>}
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">אין משימות</td></tr>
          )}
          {items.map((task, i) => (
            <tr key={task.id} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
              <td className="p-3 text-muted-foreground">{task.task_number}</td>
              <td className="p-3 text-muted-foreground font-mono text-xs">
                {task.created_at?.split('T')[0]}
              </td>
              <td className="p-3">
                <p>{task.summary}</p>
                {task.clarification && (
                  <p className="text-xs text-muted-foreground mt-1">הבהרה: {task.clarification}</p>
                )}
              </td>
              <td className="p-3 text-center">
                {task.status === 'completed'
                  ? <CheckCircle className="text-green-500 h-4 w-4 mx-auto" />
                  : <Clock className="text-amber-500 h-4 w-4 mx-auto" />
                }
              </td>
              {isSuperAdmin && (
                <td className="p-3 text-center">
                  {showComplete ? (
                    <Button size="sm" variant="outline" className="text-xs h-7 gap-1" onClick={() => handleMarkCompleted(task)}>
                      <CheckCircle size={12} /> בוצע
                    </Button>
                  ) : (
                    <Button size="sm" variant="ghost" className="text-xs h-7 gap-1" onClick={() => handleMarkPending(task)}>
                      <ArrowLeftRight size={12} /> החזר
                    </Button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (loading) return <div className="flex justify-center py-20 text-muted-foreground">טוען...</div>;

  return (
    <div dir="rtl" className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
          <Rocket className="text-primary" size={28} />
          משימות פיתוח תוכנה
        </h1>
        <div className="flex gap-2">
          <Badge variant="outline" className="gap-1">
            <Clock size={12} className="text-amber-500" />
            {pendingTasks.length} לביצוע
          </Badge>
          <Badge variant="outline" className="gap-1">
            <CheckCircle size={12} className="text-green-500" />
            {completedTasks.length} בוצעו
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="pending" className="gap-1.5">
            <Clock size={14} />
            משימות לביצוע ({pendingTasks.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-1.5">
            <CheckCircle size={14} />
            משימות שבוצעו ({completedTasks.length})
          </TabsTrigger>
          <TabsTrigger value="add" className="gap-1.5">
            <Plus size={14} />
            הוספת משימה
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <TaskTable items={pendingTasks} showComplete={true} />
        </TabsContent>

        <TabsContent value="completed">
          <TaskTable items={completedTasks} showComplete={false} />
        </TabsContent>

        <TabsContent value="add">
          <div className="border border-border rounded-lg p-6 bg-card space-y-4 max-w-2xl">
            <h2 className="text-lg font-semibold">הוספת משימה חדשה</h2>
            <p className="text-sm text-muted-foreground">המשימה תקבל מספור אוטומטי ותופיע בחוצץ "משימות לביצוע"</p>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">תיאור המשימה</label>
              <Input
                placeholder="לדוגמה: תיקון באג בדף הגדרות..."
                value={newSummary}
                onChange={(e) => setNewSummary(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">הבהרה (אופציונלי)</label>
              <Textarea
                placeholder="פרטים נוספים, הקשר, דרישות..."
                value={newClarification}
                onChange={(e) => setNewClarification(e.target.value)}
                rows={3}
              />
            </div>
            <Button onClick={handleAddTask} disabled={submitting} className="gap-1.5">
              <Plus size={16} />
              {submitting ? 'שומר...' : 'הוסף משימה'}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <footer className="text-center text-muted-foreground text-sm py-8 border-t border-border mt-8">
        מסמך זה נוצר אוטומטית | {new Date().toLocaleDateString('he-IL')}
      </footer>
    </div>
  );
};

export default CompletedTasks;
