import { useState, useEffect } from 'react';
import {
  ClipboardList, Plus, Search, Calendar, Clock, Car, User, MapPin,
  ArrowRight, MessageSquare, Users, ChevronDown, Send,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCompanyFilter, applyCompanyScope } from '@/hooks/useCompanyFilter';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AssignmentChat from '@/components/work-assignments/AssignmentChat';
import AssignmentStatusLog from '@/components/work-assignments/AssignmentStatusLog';
import { ORDERED_STATUSES, STATUS_LABELS, STATUS_COLORS } from '@/components/work-assignments/statusConfig';

interface Assignment {
  id: string;
  title: string;
  description: string;
  vehicle_plate: string;
  driver_name: string;
  driver_id: string | null;
  companion_name: string;
  companion_requested: boolean;
  scheduled_date: string | null;
  scheduled_time: string;
  location: string;
  priority: string;
  status: string;
  driver_approved_at: string | null;
  notes: string;
  company_name: string;
  created_at: string;
}

const PRIORITY_LABELS: Record<string, string> = { low: 'נמוך', normal: 'רגיל', high: 'דחוף' };

export default function WorkOrders() {
  const { user } = useAuth();
  const companyFilter = useCompanyFilter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<Assignment | null>(null);

  const loadData = async () => {
    const { data } = await applyCompanyScope(
      supabase.from('work_assignments').select('*').order('created_at', { ascending: false }),
      companyFilter
    );
    if (data) setAssignments(data as Assignment[]);
  };

  useEffect(() => { loadData(); }, [companyFilter]);

  const isManager = user?.role === 'fleet_manager' || user?.role === 'super_admin';
  const isDriver = user?.role === 'driver';

  const filtered = assignments.filter(a => {
    const matchSearch = !search || a.title?.includes(search) || a.driver_name?.includes(search) || a.vehicle_plate?.includes(search);
    const matchStatus = !filterStatus || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const grouped: Record<string, Assignment[]> = {};
  filtered.forEach(a => {
    const day = a.scheduled_date
      ? new Date(a.scheduled_date).toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })
      : 'ללא תאריך';
    if (!grouped[day]) grouped[day] = [];
    grouped[day].push(a);
  });

  const handleStatusChange = async (assignment: Assignment, newStatus: string) => {
    const updatePayload: any = { status: newStatus, updated_at: new Date().toISOString() };
    if (newStatus === 'driver_approved') {
      updatePayload.driver_approved_at = new Date().toISOString();
    }

    const { error } = await supabase.from('work_assignments').update(updatePayload).eq('id', assignment.id);
    if (error) { toast.error('שגיאה בעדכון'); return; }

    // Log status change
    await supabase.from('work_assignment_status_log').insert({
      assignment_id: assignment.id,
      old_status: assignment.status,
      new_status: newStatus,
      changed_by: user?.id,
      changed_by_name: user?.full_name || '',
      company_name: assignment.company_name,
    });

    toast.success(`הסטטוס עודכן ל: ${STATUS_LABELS[newStatus]}`);
    loadData();
    if (selected?.id === assignment.id) setSelected({ ...assignment, status: newStatus });
  };

  const handleDriverApprove = async (assignment: Assignment) => {
    await handleStatusChange(assignment, 'driver_approved');
  };

  if (showForm) {
    return <AssignmentForm onDone={() => { setShowForm(false); loadData(); }} user={user} />;
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h1 className="page-header mb-0 flex items-center gap-3"><ClipboardList size={28} /> סידור עבודה</h1>
        {isManager && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-lg font-bold min-h-[48px]">
            <Plus size={22} /> עבודה חדשה
          </button>
        )}
      </div>

      <div className="relative mb-4">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="חיפוש..."
          className="w-full pr-12 p-4 text-lg rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none" />
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        <button onClick={() => setFilterStatus('')}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${!filterStatus ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
          הכל ({assignments.length})
        </button>
        {ORDERED_STATUSES.map(s => {
          const count = assignments.filter(a => a.status === s).length;
          if (count === 0) return null;
          return (
            <button key={s} onClick={() => setFilterStatus(filterStatus === s ? '' : s)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              {STATUS_LABELS[s]} ({count})
            </button>
          );
        })}
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <ClipboardList size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-xl">אין עבודות</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([day, dayAssignments]) => (
            <div key={day}>
              <div className="flex items-center gap-2 mb-3">
                <Calendar size={16} className="text-primary" />
                <h2 className="text-sm font-bold text-muted-foreground">{day}</h2>
                <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-lg">{dayAssignments.length}</span>
              </div>
              <div className="space-y-3">
                {dayAssignments.map(a => (
                  <div key={a.id} className="card-elevated">
                    <button onClick={() => setSelected(a)} className="w-full text-right">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-lg font-bold">{a.title}</p>
                            <span className={`status-badge ${STATUS_COLORS[a.status] || 'status-pending'} text-xs`}>
                              {STATUS_LABELS[a.status] || a.status}
                            </span>
                          </div>
                          {a.description && <p className="text-muted-foreground text-sm">{a.description}</p>}
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                            {a.scheduled_time && <span className="flex items-center gap-1"><Clock size={14} /> {a.scheduled_time}</span>}
                            {a.vehicle_plate && <span className="flex items-center gap-1"><Car size={14} /> {a.vehicle_plate}</span>}
                            {a.driver_name && <span className="flex items-center gap-1"><User size={14} /> {a.driver_name}</span>}
                            {a.companion_name && <span className="flex items-center gap-1"><Users size={14} /> {a.companion_name}</span>}
                            {a.location && <span className="flex items-center gap-1"><MapPin size={14} /> {a.location}</span>}
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Driver approval button */}
                    {isDriver && a.status === 'pending_driver_approval' && a.driver_id === user?.id && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <button onClick={() => handleDriverApprove(a)}
                          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-lg">
                          ✅ אישור קבלת עבודה
                        </button>
                      </div>
                    )}

                    {/* Manager quick status change */}
                    {isManager && (
                      <div className="mt-3 pt-3 border-t border-border flex gap-2 flex-wrap">
                        {a.status === 'created' && (
                          <button onClick={() => handleStatusChange(a, 'sent_to_driver')}
                            className="flex-1 py-2 rounded-xl bg-primary/10 text-primary font-bold text-sm min-h-[40px]">
                            📤 שלח לנהג
                          </button>
                        )}
                        {a.status === 'sent_to_driver' && (
                          <button onClick={() => handleStatusChange(a, 'pending_driver_approval')}
                            className="flex-1 py-2 rounded-xl bg-warning/10 text-warning font-bold text-sm min-h-[40px]">
                            ⏳ ממתין לאישור
                          </button>
                        )}
                        {a.status === 'driver_approved' && (
                          <button onClick={() => handleStatusChange(a, 'in_progress')}
                            className="flex-1 py-2 rounded-xl bg-primary/10 text-primary font-bold text-sm min-h-[40px]">
                            ▶️ התחל ביצוע
                          </button>
                        )}
                        {a.status === 'in_progress' && (
                          <button onClick={() => handleStatusChange(a, 'completed')}
                            className="flex-1 py-2 rounded-xl bg-primary/10 text-primary font-bold text-sm min-h-[40px]">
                            ✅ הושלמה
                          </button>
                        )}
                        {a.status === 'completed' && (
                          <button onClick={() => handleStatusChange(a, 'closed')}
                            className="flex-1 py-2 rounded-xl bg-muted text-muted-foreground font-bold text-sm min-h-[40px]">
                            🔒 סגור
                          </button>
                        )}
                        <button onClick={() => setSelected(a)}
                          className="py-2 px-4 rounded-xl bg-muted text-muted-foreground font-bold text-sm min-h-[40px]">
                          <MessageSquare size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) { setSelected(null); loadData(); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" dir="rtl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selected.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className={`status-badge ${STATUS_COLORS[selected.status]} text-sm`}>
                    {STATUS_LABELS[selected.status]}
                  </span>
                  <span className="text-sm text-muted-foreground">
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
                      <p className="text-xs text-muted-foreground">שעה</p>
                      <p className="font-bold">{selected.scheduled_time}</p>
                    </div>
                  )}
                  {selected.driver_name && (
                    <div className="rounded-xl bg-muted p-3">
                      <p className="text-xs text-muted-foreground">נהג</p>
                      <p className="font-bold">{selected.driver_name}</p>
                    </div>
                  )}
                  {selected.vehicle_plate && (
                    <div className="rounded-xl bg-muted p-3">
                      <p className="text-xs text-muted-foreground">רכב</p>
                      <p className="font-bold">{selected.vehicle_plate}</p>
                    </div>
                  )}
                  {selected.companion_name && (
                    <div className="rounded-xl bg-muted p-3">
                      <p className="text-xs text-muted-foreground">מלווה</p>
                      <p className="font-bold">{selected.companion_name}</p>
                    </div>
                  )}
                  {selected.location && (
                    <div className="rounded-xl bg-muted p-3">
                      <p className="text-xs text-muted-foreground">מיקום</p>
                      <p className="font-bold">{selected.location}</p>
                    </div>
                  )}
                </div>

                {selected.driver_approved_at && (
                  <div className="rounded-xl bg-primary/5 border border-primary/20 p-3 text-sm">
                    <p className="font-bold text-primary">✅ אושר ע״י הנהג</p>
                    <p className="text-muted-foreground text-xs">
                      {format(new Date(selected.driver_approved_at), 'dd/MM/yyyy HH:mm', { locale: he })}
                    </p>
                  </div>
                )}

                {selected.companion_requested && !selected.companion_name && (
                  <div className="rounded-xl bg-warning/10 border border-warning/20 p-3 text-sm">
                    <p className="font-bold text-warning">⏳ נדרש מלווה – ממתין לשיבוץ</p>
                  </div>
                )}

                {selected.notes && <p className="text-sm bg-muted p-3 rounded-xl text-muted-foreground">{selected.notes}</p>}

                {/* Status change for managers */}
                {isManager && (
                  <div>
                    <label className="block text-sm font-bold mb-2">שנה סטטוס</label>
                    <select
                      value={selected.status}
                      onChange={e => handleStatusChange(selected, e.target.value)}
                      className="w-full p-3 rounded-xl border-2 border-input bg-background text-sm focus:border-primary focus:outline-none"
                    >
                      {ORDERED_STATUSES.map(s => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Driver approval in dialog */}
                {isDriver && selected.status === 'pending_driver_approval' && selected.driver_id === user?.id && (
                  <button onClick={() => handleDriverApprove(selected)}
                    className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg">
                    ✅ אישור קבלת עבודה
                  </button>
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

/* ======================== Form ======================== */

function AssignmentForm({ onDone, user }: { onDone: () => void; user: any }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverId, setDriverId] = useState<string | null>(null);
  const [companionId, setCompanionId] = useState('');
  const [companionName, setCompanionName] = useState('');
  const [companionRequested, setCompanionRequested] = useState(false);
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduledTime, setScheduledTime] = useState('');
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState('normal');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewCompanion, setShowNewCompanion] = useState(false);

  const [dbVehicles, setDbVehicles] = useState<{ license_plate: string; manufacturer: string; model: string }[]>([]);
  const [dbDrivers, setDbDrivers] = useState<{ full_name: string; phone: string }[]>([]);
  const [dbProfiles, setDbProfiles] = useState<{ id: string; full_name: string }[]>([]);
  const [dbCompanions, setDbCompanions] = useState<{ id: string; full_name: string }[]>([]);

  useEffect(() => {
    Promise.all([
      supabase.from('vehicles').select('license_plate, manufacturer, model'),
      supabase.from('drivers').select('full_name, phone'),
      supabase.from('profiles').select('id, full_name'),
      supabase.from('companions').select('id, full_name').eq('status', 'active'),
    ]).then(([v, d, p, c]) => {
      if (v.data) setDbVehicles(v.data);
      if (d.data) setDbDrivers(d.data);
      if (p.data) setDbProfiles(p.data);
      if (c.data) setDbCompanions(c.data);
    });
  }, []);

  const handleDriverChange = (name: string) => {
    setDriverName(name);
    const profile = dbProfiles.find(p => p.full_name === name);
    setDriverId(profile?.id || null);
  };

  const handleCompanionChange = (id: string) => {
    setCompanionId(id);
    const comp = dbCompanions.find(c => c.id === id);
    setCompanionName(comp?.full_name || '');
  };

  const handleNewCompanionSaved = async (name: string) => {
    // Reload companions
    const { data } = await supabase.from('companions').select('id, full_name').eq('status', 'active');
    if (data) {
      setDbCompanions(data);
      const newComp = data.find(c => c.full_name === name);
      if (newComp) {
        setCompanionId(newComp.id);
        setCompanionName(newComp.full_name);
      }
    }
    setShowNewCompanion(false);
  };

  const isValid = title && vehiclePlate;
  const inputClass = "w-full p-4 text-lg rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none";

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    const { error } = await supabase.from('work_assignments').insert({
      title,
      description,
      vehicle_plate: vehiclePlate,
      driver_name: driverName,
      driver_id: driverId,
      companion_id: companionId || null,
      companion_name: companionName,
      companion_requested: companionRequested,
      scheduled_date: scheduledDate || null,
      scheduled_time: scheduledTime,
      location,
      priority,
      status: 'created',
      notes,
      company_name: user?.company_name || '',
      created_by: user?.id,
    });

    if (!error) {
      // Log creation
      const { data: inserted } = await supabase.from('work_assignments')
        .select('id').eq('created_by', user?.id).order('created_at', { ascending: false }).limit(1);
      if (inserted?.[0]) {
        await supabase.from('work_assignment_status_log').insert({
          assignment_id: inserted[0].id,
          old_status: '',
          new_status: 'created',
          changed_by: user?.id,
          changed_by_name: user?.full_name || '',
          company_name: user?.company_name || '',
        });
      }
    }

    setLoading(false);
    if (error) { toast.error('שגיאה ביצירת העבודה'); console.error(error); }
    else { toast.success('עבודה חדשה נוצרה'); onDone(); }
  };

  const taskTypes = ['הסעה', 'משלוח', 'איסוף', 'העברת רכב', 'טיפול', 'בדיקה', 'רחיצה', 'אחר'];

  return (
    <div className="animate-fade-in">
      <button onClick={onDone} className="flex items-center gap-2 text-primary text-lg font-medium mb-4 min-h-[48px]">
        <ArrowRight size={20} /> חזרה
      </button>
      <h1 className="text-2xl font-bold mb-6">עבודה חדשה</h1>
      <div className="space-y-5">
        <div>
          <label className="block text-lg font-medium mb-2">סוג עבודה *</label>
          <select value={title} onChange={e => setTitle(e.target.value)} className={inputClass}>
            <option value="">בחר...</option>
            {taskTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-lg font-medium mb-2">רכב *</label>
          <select value={vehiclePlate} onChange={e => setVehiclePlate(e.target.value)} className={inputClass}>
            <option value="">בחר רכב...</option>
            {dbVehicles.map(v => <option key={v.license_plate} value={v.license_plate}>{v.license_plate} - {v.manufacturer} {v.model}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-lg font-medium mb-2">נהג</label>
          <select value={driverName} onChange={e => handleDriverChange(e.target.value)} className={inputClass}>
            <option value="">בחר נהג...</option>
            {dbDrivers.map(d => <option key={d.full_name} value={d.full_name}>{d.full_name}</option>)}
          </select>
        </div>

        {/* Companion section */}
        <div className="border border-border rounded-xl p-4 space-y-3">
          <h3 className="font-bold flex items-center gap-2"><Users size={18} /> מלווה</h3>
          <select value={companionId} onChange={e => handleCompanionChange(e.target.value)} className={inputClass}>
            <option value="">ללא מלווה</option>
            {dbCompanions.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
          </select>
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowNewCompanion(true)}
              className="flex items-center gap-1 px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-bold">
              <Plus size={16} /> מלווה חדש
            </button>
            {!companionId && (
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input type="checkbox" checked={companionRequested} onChange={e => setCompanionRequested(e.target.checked)}
                  className="rounded" />
                נדרש מלווה (בקשה)
              </label>
            )}
          </div>
        </div>

        <div>
          <label className="block text-lg font-medium mb-2">תיאור</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className={`${inputClass} resize-none`} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-lg font-medium mb-2">תאריך</label>
            <input type="date" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} className={inputClass} /></div>
          <div><label className="block text-lg font-medium mb-2">שעה</label>
            <input type="time" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)} className={inputClass} /></div>
        </div>
        <div><label className="block text-lg font-medium mb-2">מיקום</label>
          <input value={location} onChange={e => setLocation(e.target.value)} className={inputClass} /></div>
        <div>
          <label className="block text-lg font-medium mb-2">עדיפות</label>
          <div className="flex gap-3">
            {Object.entries(PRIORITY_LABELS).map(([key, label]) => (
              <button key={key} type="button" onClick={() => setPriority(key)}
                className={`flex-1 py-3 rounded-xl text-lg font-medium transition-colors ${priority === key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div><label className="block text-lg font-medium mb-2">הערות</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className={`${inputClass} resize-none`} /></div>
        <button onClick={handleSubmit} disabled={!isValid || loading}
          className={`w-full py-5 rounded-xl text-xl font-bold transition-colors ${isValid && !loading ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}>
          {loading ? 'שומר...' : '📋 צור עבודה'}
        </button>
      </div>

      {/* New companion inline dialog */}
      <Dialog open={showNewCompanion} onOpenChange={setShowNewCompanion}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader><DialogTitle>מלווה חדש</DialogTitle></DialogHeader>
          <NewCompanionInline companyName={user?.company_name || ''} userId={user?.id} onSaved={handleNewCompanionSaved} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NewCompanionInline({ companyName, userId, onSaved }: { companyName: string; userId: string; onSaved: (name: string) => void }) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const inputClass = "w-full p-3 text-base rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none";

  const handleSave = async () => {
    if (!fullName.trim()) return;
    setLoading(true);
    const { error } = await supabase.from('companions').insert({
      full_name: fullName, phone, id_number: idNumber, notes,
      company_name: companyName, created_by: userId,
    });
    setLoading(false);
    if (error) toast.error('שגיאה');
    else onSaved(fullName);
  };

  return (
    <div className="space-y-4">
      <div><label className="block font-medium mb-1">שם מלא *</label><input value={fullName} onChange={e => setFullName(e.target.value)} className={inputClass} /></div>
      <div><label className="block font-medium mb-1">טלפון</label><input value={phone} onChange={e => setPhone(e.target.value)} className={inputClass} /></div>
      <div><label className="block font-medium mb-1">ת.ז</label><input value={idNumber} onChange={e => setIdNumber(e.target.value)} className={inputClass} /></div>
      <div><label className="block font-medium mb-1">הערות</label><input value={notes} onChange={e => setNotes(e.target.value)} className={inputClass} /></div>
      <button onClick={handleSave} disabled={!fullName.trim() || loading}
        className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold disabled:opacity-50">
        {loading ? 'שומר...' : '➕ הוסף מלווה'}
      </button>
    </div>
  );
}
