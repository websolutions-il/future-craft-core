import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Calendar, Clock, MapPin, ChevronRight, ChevronLeft, Car, User,
  Building2, CheckCircle, XCircle, Shield, ClipboardList, Loader2,
} from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { he } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { STATUS_LABELS, STATUS_COLORS } from './statusConfig';
import AssignmentChat from './AssignmentChat';
import AssignmentStatusLog from './AssignmentStatusLog';

interface Assignment {
  id: string;
  title: string;
  description: string;
  vehicle_plate: string;
  driver_name: string;
  driver_id: string | null;
  customer_name: string;
  companion_name: string;
  scheduled_date: string | null;
  scheduled_time: string;
  end_time: string;
  location: string;
  priority: string;
  status: string;
  driver_approved_at: string | null;
  manager_approved_at: string | null;
  manager_approved_name: string;
  approval_source_driver: string;
  approval_source_manager: string;
  rejected_by: string;
  rejection_reason: string;
  notes: string;
  company_name: string;
  created_at: string;
}

const PRIORITY_LABELS: Record<string, string> = { normal: 'רגיל', high: 'גבוהה', urgent: 'דחוף' };
const PRIORITY_COLORS: Record<string, string> = { normal: 'bg-muted text-muted-foreground', high: 'bg-warning/10 text-warning', urgent: 'bg-destructive/10 text-destructive' };
const DAY_LABELS_SHORT = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];
const DAY_LABELS_FULL = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

const TIMELINE_COLORS = [
  'border-primary/40 bg-primary/5',
  'border-emerald-500/40 bg-emerald-500/5',
  'border-amber-500/40 bg-amber-500/5',
  'border-sky-500/40 bg-sky-500/5',
  'border-rose-500/40 bg-rose-500/5',
];

export default function DriverWorkSchedule() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay());
  const [selected, setSelected] = useState<Assignment | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [rejectOpen, setRejectOpen] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const weekStart = useMemo(() => {
    const base = startOfWeek(new Date(), { weekStartsOn: 0 });
    return addDays(base, weekOffset * 7);
  }, [weekOffset]);

  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // For drivers: fetch assignments where driver_id = user.id OR driver_name = user.full_name
    let query = supabase
      .from('work_assignments')
      .select('*')
      .order('scheduled_date', { ascending: true })
      .order('scheduled_time', { ascending: true });

    // Filter by driver identity - match by driver_id OR driver_name
    if (user.role === 'driver') {
      query = query.or(`driver_id.eq.${user.id},driver_name.eq.${user.full_name}`);
    }

    const { data } = await query;
    if (data) setAssignments(data as Assignment[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  // Group assignments by day of week within the current week
  const assignmentsByDay = useMemo(() => {
    const map: Record<number, Assignment[]> = {};
    for (let i = 0; i < 7; i++) map[i] = [];

    assignments.forEach(a => {
      if (!a.scheduled_date) return;
      if (filterStatus && a.status !== filterStatus) return;
      const d = new Date(a.scheduled_date);
      weekDays.forEach((wd, i) => {
        if (isSameDay(d, wd)) {
          map[i].push(a);
        }
      });
    });

    // Sort each day by time
    for (const key in map) {
      map[key].sort((a, b) => (a.scheduled_time || '').localeCompare(b.scheduled_time || ''));
    }
    return map;
  }, [assignments, weekDays, filterStatus]);

  const totalThisWeek = useMemo(
    () => Object.values(assignmentsByDay).reduce((sum, arr) => sum + arr.length, 0),
    [assignmentsByDay]
  );

  const pendingCount = assignments.filter(a =>
    ['created', 'sent_for_approval', 'pending_driver_approval'].includes(a.status) && !a.driver_approved_at
  ).length;

  const logStatusChange = async (assignmentId: string, oldStatus: string, newStatus: string, notes?: string) => {
    await supabase.from('work_assignment_status_log').insert({
      assignment_id: assignmentId,
      old_status: oldStatus,
      new_status: newStatus,
      changed_by: user?.id,
      changed_by_name: user?.full_name || '',
      company_name: user?.company_name || '',
      notes: notes || '',
    });
  };

  const handleDriverApprove = async (a: Assignment) => {
    const newStatus = a.manager_approved_at ? 'approved' : 'pending_manager_approval';
    await supabase.from('work_assignments').update({
      driver_approved_at: new Date().toISOString(),
      approval_source_driver: 'system',
      status: newStatus,
      updated_at: new Date().toISOString(),
    }).eq('id', a.id);
    await logStatusChange(a.id, a.status, newStatus, 'הנהג אישר דרך המערכת');

    // Notify managers
    const { data: managers } = await supabase.from('user_roles').select('user_id').eq('role', 'fleet_manager');
    if (managers) {
      const { data: mProfiles } = await supabase.from('profiles').select('id, company_name')
        .in('id', managers.map(m => m.user_id)).eq('company_name', a.company_name);
      if (mProfiles) {
        await supabase.from('driver_notifications').insert(
          mProfiles.map(p => ({
            user_id: p.id, type: 'work_assignment',
            title: '✅ נהג אישר סידור עבודה',
            message: `${a.driver_name} אישר את סידור העבודה: ${a.title}`,
            link: '/work-orders',
          }))
        );
      }
    }

    toast.success(a.manager_approved_at ? 'סידור העבודה אושר על ידי שני הצדדים!' : 'אישרת את סידור העבודה');
    loadData();
  };

  const handleReject = async (a: Assignment, reason: string) => {
    await supabase.from('work_assignments').update({
      status: 'rejected',
      rejected_by: user?.full_name || '',
      rejection_reason: reason,
      updated_at: new Date().toISOString(),
    }).eq('id', a.id);
    await logStatusChange(a.id, a.status, 'rejected', `נדחה ע״י ${user?.full_name}: ${reason}`);

    const { data: managers } = await supabase.from('user_roles').select('user_id').eq('role', 'fleet_manager');
    if (managers) {
      const { data: mProfiles } = await supabase.from('profiles').select('id').in('id', managers.map(m => m.user_id)).eq('company_name', a.company_name);
      if (mProfiles) {
        await supabase.from('driver_notifications').insert(mProfiles.map(p => ({
          user_id: p.id, type: 'work_assignment',
          title: '❌ נהג דחה סידור עבודה',
          message: `${a.driver_name} דחה: ${a.title}. סיבה: ${reason}`,
          link: '/work-orders',
        })));
      }
    }
    toast.success('סידור העבודה נדחה');
    setRejectOpen(null);
    setRejectReason('');
    loadData();
  };

  const today = new Date();

  if (loading) {
    return (
      <div className="animate-fade-in text-center py-12">
        <Loader2 size={32} className="mx-auto mb-4 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">טוען סידורי עבודה...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
          <ClipboardList size={24} className="text-primary" />
          סידורי העבודה שלי
        </h1>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <span className="bg-destructive text-destructive-foreground text-xs font-bold px-2.5 py-1 rounded-full animate-pulse">
              {pendingCount} ממתינים
            </span>
          )}
          <span className="text-sm text-muted-foreground">{totalThisWeek} השבוע</span>
        </div>
      </div>

      {/* Status filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button onClick={() => setFilterStatus('')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${!filterStatus ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
          הכל
        </button>
        {['created', 'sent_for_approval', 'pending_driver_approval', 'approved', 'active', 'in_progress', 'completed'].map(s => {
          const count = assignments.filter(a => a.status === s).length;
          if (count === 0) return null;
          return (
            <button key={s} onClick={() => setFilterStatus(filterStatus === s ? '' : s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${filterStatus === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              {STATUS_LABELS[s]} ({count})
            </button>
          );
        })}
      </div>

      {/* Week navigation */}
      <div className="flex items-center justify-between card-elevated">
        <button onClick={() => setWeekOffset(w => w + 1)} className="p-2 rounded-xl hover:bg-muted transition-colors">
          <ChevronRight size={20} />
        </button>
        <div className="text-center">
          <p className="font-bold text-foreground">
            {format(weekStart, 'd MMMM', { locale: he })} - {format(addDays(weekStart, 6), 'd MMMM yyyy', { locale: he })}
          </p>
          {weekOffset !== 0 && (
            <button onClick={() => setWeekOffset(0)} className="text-xs text-primary font-semibold hover:underline">
              חזור להשבוע הנוכחי
            </button>
          )}
        </div>
        <button onClick={() => setWeekOffset(w => w - 1)} className="p-2 rounded-xl hover:bg-muted transition-colors">
          <ChevronLeft size={20} />
        </button>
      </div>

      {/* Day selector strip */}
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((date, i) => {
          const isToday = isSameDay(date, today);
          const isSelected = selectedDay === i;
          const count = assignmentsByDay[i].length;
          const hasPending = assignmentsByDay[i].some(a =>
            ['created', 'sent_for_approval', 'pending_driver_approval'].includes(a.status) && !a.driver_approved_at
          );
          return (
            <button
              key={i}
              onClick={() => setSelectedDay(i)}
              className={`flex flex-col items-center py-2 px-1 rounded-xl transition-all relative ${
                isSelected
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : isToday
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-muted'
              }`}
            >
              <span className="text-xs font-semibold">{DAY_LABELS_SHORT[i]}</span>
              <span className={`text-lg font-bold ${isSelected ? '' : 'text-foreground'}`}>{format(date, 'd')}</span>
              {count > 0 && (
                <span className={`text-[10px] font-bold mt-0.5 ${isSelected ? 'text-primary-foreground/80' : 'text-primary'}`}>
                  {count}
                </span>
              )}
              {hasPending && (
                <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-destructive animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day detail */}
      <div>
        <h2 className="text-lg font-bold text-foreground mb-3">
          יום {DAY_LABELS_FULL[selectedDay]} • {format(weekDays[selectedDay], 'd/M', { locale: he })}
        </h2>

        {assignmentsByDay[selectedDay].length === 0 ? (
          <div className="card-elevated text-center py-8">
            <Calendar size={40} className="mx-auto mb-2 text-muted-foreground/30" />
            <p className="text-muted-foreground">אין סידורי עבודה ביום זה</p>
          </div>
        ) : (
          <div className="space-y-3 relative">
            {/* Timeline line */}
            <div className="absolute right-[19px] top-4 bottom-4 w-0.5 bg-border" />

            {assignmentsByDay[selectedDay].map((a, idx) => {
              const colorClass = TIMELINE_COLORS[idx % TIMELINE_COLORS.length];
              const needsApproval = ['created', 'sent_for_approval', 'pending_driver_approval'].includes(a.status) && !a.driver_approved_at;
              const isRejected = a.status === 'rejected';

              return (
                <div key={a.id} className="flex gap-3 relative">
                  {/* Timeline dot */}
                  <div className="w-10 flex-shrink-0 flex items-start justify-center pt-4 z-10">
                    <div className={`w-3.5 h-3.5 rounded-full border-2 border-background ${
                      needsApproval ? 'bg-warning animate-pulse' :
                      isRejected ? 'bg-destructive' :
                      a.status === 'completed' || a.status === 'closed' ? 'bg-emerald-500' :
                      a.status === 'in_progress' || a.status === 'active' ? 'bg-primary' :
                      'bg-muted-foreground'
                    }`} />
                  </div>

                  {/* Assignment card */}
                  <div className={`flex-1 rounded-2xl border-2 p-4 ${needsApproval ? 'border-warning/50 bg-warning/5' : colorClass}`}>
                    <button onClick={() => setSelected(a)} className="w-full text-right">
                      {/* Time bar */}
                      {(a.scheduled_time || a.end_time) && (
                        <div className="flex items-center gap-1.5 text-sm font-bold bg-background/80 px-2.5 py-1 rounded-lg w-fit mb-2">
                          <Clock size={13} />
                          <span>{a.scheduled_time || '?'}{a.end_time ? ` - ${a.end_time}` : ''}</span>
                        </div>
                      )}

                      <div className="flex items-start justify-between mb-1">
                        <p className="font-bold text-foreground text-lg">{a.title}</p>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${PRIORITY_COLORS[a.priority] || PRIORITY_COLORS.normal}`}>
                            {PRIORITY_LABELS[a.priority] || a.priority}
                          </span>
                          <span className={`status-badge ${STATUS_COLORS[a.status] || 'status-pending'} text-[10px]`}>
                            {STATUS_LABELS[a.status] || a.status}
                          </span>
                        </div>
                      </div>

                      {a.description && <p className="text-muted-foreground text-sm line-clamp-2 mb-2">{a.description}</p>}

                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        {a.vehicle_plate && <span className="flex items-center gap-1"><Car size={12} /> {a.vehicle_plate}</span>}
                        {a.customer_name && <span className="flex items-center gap-1"><Building2 size={12} /> {a.customer_name}</span>}
                        {a.location && <span className="flex items-center gap-1"><MapPin size={12} /> {a.location}</span>}
                        {a.companion_name && <span className="flex items-center gap-1"><User size={12} /> מלווה: {a.companion_name}</span>}
                      </div>

                      {/* Approval indicators */}
                      <div className="flex gap-3 mt-2">
                        <span className={`flex items-center gap-1 text-xs ${a.driver_approved_at ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                          {a.driver_approved_at ? <CheckCircle size={12} /> : <Clock size={12} />}
                          נהג {a.driver_approved_at ? '✓' : '⏳'}
                        </span>
                        <span className={`flex items-center gap-1 text-xs ${a.manager_approved_at ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                          {a.manager_approved_at ? <CheckCircle size={12} /> : <Clock size={12} />}
                          מנהל {a.manager_approved_at ? '✓' : '⏳'}
                        </span>
                      </div>
                    </button>

                    {/* Driver approval actions */}
                    {needsApproval && a.driver_id === user?.id && (
                      <div className="mt-3 pt-3 border-t border-border/40">
                        {rejectOpen === a.id ? (
                          <div className="space-y-2">
                            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                              placeholder="סיבת הדחייה..." rows={2}
                              className="w-full p-3 rounded-xl border-2 border-input bg-background text-sm resize-none" />
                            <div className="flex gap-2">
                              <button onClick={() => handleReject(a, rejectReason)}
                                className="flex-1 py-2 rounded-xl bg-destructive text-destructive-foreground font-bold text-sm">
                                אשר דחייה
                              </button>
                              <button onClick={() => { setRejectOpen(null); setRejectReason(''); }}
                                className="py-2 px-4 rounded-xl bg-muted text-muted-foreground font-bold text-sm">
                                ביטול
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button onClick={() => handleDriverApprove(a)}
                              className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-lg active:scale-95 transition-transform">
                              ✅ אישור
                            </button>
                            <button onClick={() => setRejectOpen(a.id)}
                              className="py-3 px-6 rounded-xl bg-destructive/10 text-destructive font-bold text-lg">
                              ❌ דחה
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Weekly overview mini grid */}
      <div className="card-elevated">
        <h3 className="font-bold text-foreground mb-3">סיכום שבועי</h3>
        <div className="grid grid-cols-7 gap-1">
          {DAY_LABELS_SHORT.map((label, i) => {
            const count = assignmentsByDay[i].length;
            const hasPending = assignmentsByDay[i].some(a =>
              ['sent_for_approval', 'pending_driver_approval'].includes(a.status) && !a.driver_approved_at
            );
            return (
              <button key={i} onClick={() => setSelectedDay(i)} className="text-center">
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <div className={`h-8 rounded-lg flex items-center justify-center text-sm font-bold relative ${
                  count > 0 ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
                }`}>
                  {count || '-'}
                  {hasPending && <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 rounded-full bg-destructive" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) { setSelected(null); loadData(); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" dir="rtl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selected.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`status-badge ${STATUS_COLORS[selected.status]} text-sm`}>{STATUS_LABELS[selected.status]}</span>
                  <span className={`px-2 py-1 rounded-lg text-xs font-bold ${PRIORITY_COLORS[selected.priority] || PRIORITY_COLORS.normal}`}>
                    {PRIORITY_LABELS[selected.priority] || selected.priority}
                  </span>
                </div>

                {selected.description && <p className="text-muted-foreground">{selected.description}</p>}

                <div className="grid grid-cols-2 gap-3 text-sm">
                  {selected.scheduled_date && (
                    <div className="rounded-xl bg-muted p-3">
                      <p className="text-xs text-muted-foreground">תאריך</p>
                      <p className="font-bold">{new Date(selected.scheduled_date).toLocaleDateString('he-IL')}</p>
                    </div>
                  )}
                  {selected.scheduled_time && (
                    <div className="rounded-xl bg-muted p-3">
                      <p className="text-xs text-muted-foreground">שעות</p>
                      <p className="font-bold">{selected.scheduled_time}{selected.end_time ? ` - ${selected.end_time}` : ''}</p>
                    </div>
                  )}
                  {selected.customer_name && (
                    <div className="rounded-xl bg-muted p-3">
                      <p className="text-xs text-muted-foreground">לקוח</p>
                      <p className="font-bold">{selected.customer_name}</p>
                    </div>
                  )}
                  {selected.vehicle_plate && (
                    <div className="rounded-xl bg-muted p-3">
                      <p className="text-xs text-muted-foreground">רכב</p>
                      <p className="font-bold">{selected.vehicle_plate}</p>
                    </div>
                  )}
                  {selected.location && (
                    <div className="rounded-xl bg-muted p-3 col-span-2">
                      <p className="text-xs text-muted-foreground">מיקום</p>
                      <p className="font-bold">{selected.location}</p>
                    </div>
                  )}
                </div>

                {/* Approval status panel */}
                <div className="rounded-xl border-2 border-border p-4 space-y-3">
                  <h3 className="font-bold flex items-center gap-2"><Shield size={18} /> סטטוס אישורים</h3>
                  <div className="space-y-2">
                    <div className={`flex items-center justify-between p-3 rounded-xl ${selected.driver_approved_at ? 'bg-primary/10' : 'bg-muted'}`}>
                      <div className="flex items-center gap-2">
                        {selected.driver_approved_at ? <CheckCircle size={18} className="text-primary" /> : <Clock size={18} className="text-muted-foreground" />}
                        <p className="font-bold text-sm">אישור נהג</p>
                      </div>
                      <span className={`text-xs font-bold ${selected.driver_approved_at ? 'text-primary' : 'text-muted-foreground'}`}>
                        {selected.driver_approved_at ? 'אושר ✓' : 'ממתין'}
                      </span>
                    </div>
                    <div className={`flex items-center justify-between p-3 rounded-xl ${selected.manager_approved_at ? 'bg-primary/10' : 'bg-muted'}`}>
                      <div className="flex items-center gap-2">
                        {selected.manager_approved_at ? <CheckCircle size={18} className="text-primary" /> : <Clock size={18} className="text-muted-foreground" />}
                        <p className="font-bold text-sm">אישור מנהל צי</p>
                      </div>
                      <span className={`text-xs font-bold ${selected.manager_approved_at ? 'text-primary' : 'text-muted-foreground'}`}>
                        {selected.manager_approved_at ? 'אושר ✓' : 'ממתין'}
                      </span>
                    </div>
                  </div>
                </div>

                {selected.status === 'rejected' && selected.rejection_reason && (
                  <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-sm">
                    <p className="font-bold text-destructive">❌ נדחה על ידי: {selected.rejected_by}</p>
                    <p className="text-muted-foreground">{selected.rejection_reason}</p>
                  </div>
                )}

                {selected.notes && <p className="text-sm bg-muted p-3 rounded-xl text-muted-foreground">{selected.notes}</p>}

                {/* Driver approval in dialog */}
                {['sent_for_approval', 'pending_driver_approval'].includes(selected.status) && selected.driver_id === user?.id && !selected.driver_approved_at && (
                  <div className="flex gap-2">
                    <button onClick={() => handleDriverApprove(selected)}
                      className="flex-1 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg">
                      ✅ אישור קבלת עבודה
                    </button>
                    <button onClick={() => setRejectOpen(selected.id)}
                      className="py-4 px-6 rounded-xl bg-destructive/10 text-destructive font-bold text-lg">
                      ❌ דחה
                    </button>
                  </div>
                )}

                <AssignmentChat assignmentId={selected.id} companyName={selected.company_name} />
                <AssignmentStatusLog assignmentId={selected.id} />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
