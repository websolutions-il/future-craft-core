import { useState, useEffect } from 'react';
import {
  ClipboardList, Plus, Search, Calendar, Clock, Car, User, MapPin,
  ArrowRight, MessageSquare, Users, ChevronDown, Send, Building2, CheckCircle, XCircle,
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
  customer_name: string;
  customer_id: string | null;
  customer_approved_at: string | null;
  companion_name: string;
  companion_requested: boolean;
  scheduled_date: string | null;
  scheduled_time: string;
  end_time: string;
  location: string;
  priority: string;
  status: string;
  driver_approved_at: string | null;
  rejected_by: string;
  rejection_reason: string;
  notes: string;
  company_name: string;
  created_at: string;
}

const PRIORITY_LABELS: Record<string, string> = { normal: 'רגיל', high: 'גבוהה', urgent: 'דחוף' };
const PRIORITY_COLORS: Record<string, string> = { normal: 'bg-muted text-muted-foreground', high: 'bg-warning/10 text-warning', urgent: 'bg-destructive/10 text-destructive' };

export default function WorkOrders() {
  const { user } = useAuth();
  const companyFilter = useCompanyFilter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<Assignment | null>(null);

  const loadData = async () => {
    const { data } = await applyCompanyScope(
      supabase.from('work_assignments').select('*').order('scheduled_date', { ascending: true }).order('scheduled_time', { ascending: true }),
      companyFilter
    );
    if (data) setAssignments(data as Assignment[]);
  };

  useEffect(() => { loadData(); }, [companyFilter]);

  const isManager = user?.role === 'fleet_manager' || user?.role === 'super_admin';
  const isDriver = user?.role === 'driver';

  const filtered = assignments.filter(a => {
    const matchSearch = !search || a.title?.includes(search) || a.driver_name?.includes(search) || a.vehicle_plate?.includes(search) || a.customer_name?.includes(search);
    const matchStatus = !filterStatus || a.status === filterStatus;
    const matchDate = !filterDate || a.scheduled_date === filterDate;
    return matchSearch && matchStatus && matchDate;
  });

  const grouped: Record<string, Assignment[]> = {};
  filtered.forEach(a => {
    const day = a.scheduled_date
      ? new Date(a.scheduled_date).toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })
      : 'ללא תאריך';
    if (!grouped[day]) grouped[day] = [];
    grouped[day].push(a);
  });

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

  const checkDualApproval = async (assignment: Assignment, approverType: 'driver' | 'customer') => {
    // After one side approves, check if both sides have approved
    const { data } = await supabase.from('work_assignments').select('driver_approved_at, customer_approved_at').eq('id', assignment.id).single();
    if (data?.driver_approved_at && data?.customer_approved_at) {
      await supabase.from('work_assignments').update({ status: 'approved', updated_at: new Date().toISOString() }).eq('id', assignment.id);
      await logStatusChange(assignment.id, approverType === 'driver' ? 'driver_approved' : 'customer_approved', 'approved', 'שני הצדדים אישרו');
      toast.success('סידור העבודה אושר על ידי שני הצדדים!');
    }
  };

  const handleStatusChange = async (assignment: Assignment, newStatus: string) => {
    const updatePayload: any = { status: newStatus, updated_at: new Date().toISOString() };

    const { error } = await supabase.from('work_assignments').update(updatePayload).eq('id', assignment.id);
    if (error) { toast.error('שגיאה בעדכון'); return; }

    await logStatusChange(assignment.id, assignment.status, newStatus);
    toast.success(`הסטטוס עודכן ל: ${STATUS_LABELS[newStatus]}`);
    loadData();
    if (selected?.id === assignment.id) setSelected({ ...assignment, status: newStatus });
  };

  const handleDriverApprove = async (assignment: Assignment) => {
    await supabase.from('work_assignments').update({
      driver_approved_at: new Date().toISOString(),
      status: 'driver_approved',
      updated_at: new Date().toISOString(),
    }).eq('id', assignment.id);
    await logStatusChange(assignment.id, assignment.status, 'driver_approved', 'הנהג אישר');
    toast.success('אישרת את סידור העבודה');
    await checkDualApproval(assignment, 'driver');
    loadData();
  };

  const handleCustomerApprove = async (assignment: Assignment) => {
    await supabase.from('work_assignments').update({
      customer_approved_at: new Date().toISOString(),
      status: assignment.driver_approved_at ? 'approved' : 'customer_approved',
      updated_at: new Date().toISOString(),
    }).eq('id', assignment.id);
    await logStatusChange(assignment.id, assignment.status, 'customer_approved', 'הלקוח אישר');
    toast.success('הלקוח אישר את סידור העבודה');
    await checkDualApproval(assignment, 'customer');
    loadData();
  };

  const handleReject = async (assignment: Assignment, reason: string) => {
    await supabase.from('work_assignments').update({
      status: 'rejected',
      rejected_by: user?.full_name || '',
      rejection_reason: reason,
      updated_at: new Date().toISOString(),
    }).eq('id', assignment.id);
    await logStatusChange(assignment.id, assignment.status, 'rejected', `נדחה: ${reason}`);
    toast.success('סידור העבודה נדחה');
    loadData();
  };

  if (showForm) {
    return <AssignmentForm onDone={() => { setShowForm(false); loadData(); }} user={user} />;
  }

  const statusCounts = ORDERED_STATUSES.map(s => ({ s, count: assignments.filter(a => a.status === s).length })).filter(x => x.count > 0);

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

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="חיפוש משימה, רכב או נהג..."
          className="w-full pr-12 p-4 text-lg rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none" />
      </div>

      {/* Date filter */}
      <div className="flex gap-2 items-center mb-3">
        <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
          className="p-3 rounded-xl border-2 border-input bg-background text-sm focus:border-primary focus:outline-none" />
        {filterDate && (
          <button onClick={() => setFilterDate('')} className="px-3 py-2 rounded-xl bg-muted text-muted-foreground text-sm font-bold">נקה</button>
        )}
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        <button onClick={() => setFilterStatus('')}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${!filterStatus ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
          הכל ({assignments.length})
        </button>
        {statusCounts.map(({ s, count }) => (
          <button key={s} onClick={() => setFilterStatus(filterStatus === s ? '' : s)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            {STATUS_LABELS[s]} ({count})
          </button>
        ))}
      </div>

      {/* Assignment list */}
      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <ClipboardList size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-xl">אין סידורי עבודה</p>
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
                  <AssignmentCard key={a.id} assignment={a} user={user} isManager={isManager} isDriver={isDriver}
                    onSelect={() => setSelected(a)}
                    onStatusChange={handleStatusChange}
                    onDriverApprove={handleDriverApprove}
                    onReject={handleReject}
                  />
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
            <AssignmentDetail
              assignment={selected}
              user={user}
              isManager={isManager}
              isDriver={isDriver}
              onStatusChange={handleStatusChange}
              onDriverApprove={handleDriverApprove}
              onCustomerApprove={handleCustomerApprove}
              onReject={handleReject}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ======================== Assignment Card ======================== */
function AssignmentCard({ assignment: a, user, isManager, isDriver, onSelect, onStatusChange, onDriverApprove, onReject }: any) {
  return (
    <div className="card-elevated">
      <button onClick={onSelect} className="w-full text-right">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="text-lg font-bold">{a.title}</p>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${PRIORITY_COLORS[a.priority] || PRIORITY_COLORS.normal}`}>
                  {PRIORITY_LABELS[a.priority] || a.priority}
                </span>
                <span className={`status-badge ${STATUS_COLORS[a.status] || 'status-pending'} text-xs`}>
                  {STATUS_LABELS[a.status] || a.status}
                </span>
              </div>
            </div>
            {a.description && <p className="text-muted-foreground text-sm line-clamp-2 mb-2">{a.description}</p>}
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {a.scheduled_time && <span className="flex items-center gap-1"><Clock size={14} /> {a.scheduled_time}{a.end_time ? ` - ${a.end_time}` : ''}</span>}
              {a.vehicle_plate && <span className="flex items-center gap-1"><Car size={14} /> {a.vehicle_plate}</span>}
              {a.driver_name && <span className="flex items-center gap-1"><User size={14} /> {a.driver_name}</span>}
              {a.customer_name && <span className="flex items-center gap-1"><Building2 size={14} /> {a.customer_name}</span>}
              {a.location && <span className="flex items-center gap-1"><MapPin size={14} /> {a.location}</span>}
            </div>

            {/* Approval indicators */}
            <div className="flex gap-2 mt-2">
              {a.driver_approved_at && (
                <span className="flex items-center gap-1 text-xs text-primary"><CheckCircle size={12} /> נהג אישר</span>
              )}
              {a.customer_approved_at && (
                <span className="flex items-center gap-1 text-xs text-primary"><CheckCircle size={12} /> לקוח אישר</span>
              )}
            </div>
          </div>
        </div>
      </button>

      {/* Driver approval */}
      {isDriver && a.status === 'pending_approval' && a.driver_id === user?.id && !a.driver_approved_at && (
        <div className="mt-3 pt-3 border-t border-border flex gap-2">
          <button onClick={() => onDriverApprove(a)}
            className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-lg">
            ✅ אישור
          </button>
          <RejectButton onReject={(reason: string) => onReject(a, reason)} />
        </div>
      )}

      {/* Manager quick actions */}
      {isManager && (
        <div className="mt-3 pt-3 border-t border-border flex gap-2 flex-wrap">
          {a.status === 'created' && (
            <button onClick={() => onStatusChange(a, 'pending_approval')}
              className="flex-1 py-2 rounded-xl bg-primary/10 text-primary font-bold text-sm min-h-[40px]">
              📤 שלח לאישור
            </button>
          )}
          {a.status === 'approved' && (
            <button onClick={() => onStatusChange(a, 'in_progress')}
              className="flex-1 py-2 rounded-xl bg-primary/10 text-primary font-bold text-sm min-h-[40px]">
              ▶️ התחל ביצוע
            </button>
          )}
          {a.status === 'in_progress' && (
            <button onClick={() => onStatusChange(a, 'completed')}
              className="flex-1 py-2 rounded-xl bg-primary/10 text-primary font-bold text-sm min-h-[40px]">
              ✅ הושלם
            </button>
          )}
          {a.status === 'completed' && (
            <button onClick={() => onStatusChange(a, 'closed')}
              className="flex-1 py-2 rounded-xl bg-muted text-muted-foreground font-bold text-sm min-h-[40px]">
              🔒 סגור
            </button>
          )}
          {a.status === 'rejected' && (
            <button onClick={() => onStatusChange(a, 'revision')}
              className="flex-1 py-2 rounded-xl bg-warning/10 text-warning font-bold text-sm min-h-[40px]">
              🔄 שלח לתיקון
            </button>
          )}
          <button onClick={onSelect}
            className="py-2 px-4 rounded-xl bg-muted text-muted-foreground font-bold text-sm min-h-[40px]">
            <MessageSquare size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

/* ======================== Assignment Detail ======================== */
function AssignmentDetail({ assignment: a, user, isManager, isDriver, onStatusChange, onDriverApprove, onCustomerApprove, onReject }: any) {
  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl">{a.title}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`status-badge ${STATUS_COLORS[a.status]} text-sm`}>{STATUS_LABELS[a.status]}</span>
          <span className={`px-2 py-1 rounded-lg text-xs font-bold ${PRIORITY_COLORS[a.priority] || PRIORITY_COLORS.normal}`}>
            {PRIORITY_LABELS[a.priority] || a.priority}
          </span>
        </div>

        {a.description && <p className="text-muted-foreground">{a.description}</p>}

        <div className="grid grid-cols-2 gap-3 text-sm">
          {a.scheduled_date && (
            <InfoBox label="תאריך" value={new Date(a.scheduled_date).toLocaleDateString('he-IL')} />
          )}
          {a.scheduled_time && (
            <InfoBox label="שעות עבודה" value={`${a.scheduled_time}${a.end_time ? ` - ${a.end_time}` : ''}`} />
          )}
          {a.driver_name && <InfoBox label="נהג / עובד" value={a.driver_name} />}
          {a.customer_name && <InfoBox label="לקוח" value={a.customer_name} />}
          {a.vehicle_plate && <InfoBox label="רכב" value={a.vehicle_plate} />}
          {a.location && <InfoBox label="מיקום" value={a.location} />}
          {a.companion_name && <InfoBox label="מלווה" value={a.companion_name} />}
        </div>

        {/* Approval status */}
        <div className="rounded-xl border border-border p-4 space-y-2">
          <h3 className="font-bold text-sm">סטטוס אישורים</h3>
          <div className="flex items-center gap-2 text-sm">
            {a.driver_approved_at ? (
              <span className="flex items-center gap-1 text-primary"><CheckCircle size={16} /> נהג אישר — {format(new Date(a.driver_approved_at), 'dd/MM HH:mm', { locale: he })}</span>
            ) : (
              <span className="flex items-center gap-1 text-muted-foreground"><Clock size={16} /> ממתין לאישור נהג</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm">
            {a.customer_approved_at ? (
              <span className="flex items-center gap-1 text-primary"><CheckCircle size={16} /> לקוח אישר — {format(new Date(a.customer_approved_at), 'dd/MM HH:mm', { locale: he })}</span>
            ) : (
              <span className="flex items-center gap-1 text-muted-foreground"><Clock size={16} /> ממתין לאישור לקוח</span>
            )}
          </div>
        </div>

        {/* Rejection info */}
        {a.status === 'rejected' && a.rejection_reason && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-sm">
            <p className="font-bold text-destructive">❌ נדחה על ידי: {a.rejected_by}</p>
            <p className="text-muted-foreground">{a.rejection_reason}</p>
          </div>
        )}

        {a.notes && <p className="text-sm bg-muted p-3 rounded-xl text-muted-foreground">{a.notes}</p>}

        {/* Driver approval */}
        {isDriver && a.status === 'pending_approval' && a.driver_id === user?.id && !a.driver_approved_at && (
          <div className="flex gap-2">
            <button onClick={() => onDriverApprove(a)}
              className="flex-1 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg">
              ✅ אישור קבלת עבודה
            </button>
            <RejectButton onReject={(reason: string) => onReject(a, reason)} />
          </div>
        )}

        {/* Manager: approve on behalf of customer */}
        {isManager && (a.status === 'pending_approval' || a.status === 'driver_approved') && !a.customer_approved_at && (
          <button onClick={() => onCustomerApprove(a)}
            className="w-full py-3 rounded-xl bg-primary/10 text-primary font-bold">
            ✅ אישור לקוח
          </button>
        )}

        {/* Status change for managers */}
        {isManager && (
          <div>
            <label className="block text-sm font-bold mb-2">שנה סטטוס</label>
            <select value={a.status} onChange={e => onStatusChange(a, e.target.value)}
              className="w-full p-3 rounded-xl border-2 border-input bg-background text-sm focus:border-primary focus:outline-none">
              {ORDERED_STATUSES.map(s => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>
        )}

        <AssignmentChat assignmentId={a.id} companyName={a.company_name} />
        <AssignmentStatusLog assignmentId={a.id} />
      </div>
    </>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-bold">{value}</p>
    </div>
  );
}

function RejectButton({ onReject }: { onReject: (reason: string) => void }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="py-3 px-6 rounded-xl bg-destructive/10 text-destructive font-bold text-lg">
        ❌ דחה
      </button>
    );
  }

  return (
    <div className="flex-1 space-y-2">
      <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="סיבת הדחייה..."
        className="w-full p-3 rounded-xl border-2 border-input bg-background text-sm resize-none" rows={2} />
      <div className="flex gap-2">
        <button onClick={() => { onReject(reason); setOpen(false); }}
          className="flex-1 py-2 rounded-xl bg-destructive text-destructive-foreground font-bold text-sm">
          אשר דחייה
        </button>
        <button onClick={() => setOpen(false)}
          className="py-2 px-4 rounded-xl bg-muted text-muted-foreground font-bold text-sm">
          ביטול
        </button>
      </div>
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
  const [customerName, setCustomerName] = useState('');
  const [companionId, setCompanionId] = useState('');
  const [companionName, setCompanionName] = useState('');
  const [companionRequested, setCompanionRequested] = useState(false);
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduledTime, setScheduledTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState('normal');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewCompanion, setShowNewCompanion] = useState(false);

  const [dbVehicles, setDbVehicles] = useState<{ license_plate: string; manufacturer: string; model: string }[]>([]);
  const [dbDrivers, setDbDrivers] = useState<{ full_name: string; phone: string }[]>([]);
  const [dbProfiles, setDbProfiles] = useState<{ id: string; full_name: string }[]>([]);
  const [dbCompanions, setDbCompanions] = useState<{ id: string; full_name: string }[]>([]);
  const [dbCustomers, setDbCustomers] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    Promise.all([
      supabase.from('vehicles').select('license_plate, manufacturer, model'),
      supabase.from('drivers').select('full_name, phone'),
      supabase.from('profiles').select('id, full_name'),
      supabase.from('companions').select('id, full_name').eq('status', 'active'),
      supabase.from('customers').select('id, name'),
    ]).then(([v, d, p, c, cust]) => {
      if (v.data) setDbVehicles(v.data);
      if (d.data) setDbDrivers(d.data);
      if (p.data) setDbProfiles(p.data);
      if (c.data) setDbCompanions(c.data);
      if (cust.data) setDbCustomers(cust.data);
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
    const { data } = await supabase.from('companions').select('id, full_name').eq('status', 'active');
    if (data) {
      setDbCompanions(data);
      const newComp = data.find(c => c.full_name === name);
      if (newComp) { setCompanionId(newComp.id); setCompanionName(newComp.full_name); }
    }
    setShowNewCompanion(false);
  };

  const isValid = title && vehiclePlate && driverName;
  const inputClass = "w-full p-4 text-lg rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none";

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    const { error, data: inserted } = await supabase.from('work_assignments').insert({
      title,
      description,
      vehicle_plate: vehiclePlate,
      driver_name: driverName,
      driver_id: driverId,
      customer_name: customerName,
      companion_id: companionId || null,
      companion_name: companionName,
      companion_requested: companionRequested,
      scheduled_date: scheduledDate || null,
      scheduled_time: scheduledTime,
      end_time: endTime,
      location,
      priority,
      status: 'created',
      notes,
      company_name: user?.company_name || '',
      created_by: user?.id,
    }).select('id').single();

    if (!error && inserted) {
      await supabase.from('work_assignment_status_log').insert({
        assignment_id: inserted.id,
        old_status: '',
        new_status: 'created',
        changed_by: user?.id,
        changed_by_name: user?.full_name || '',
        company_name: user?.company_name || '',
        notes: 'סידור עבודה חדש נוצר',
      });

      // Notify driver
      if (driverId) {
        await supabase.from('driver_notifications').insert({
          user_id: driverId,
          type: 'work_assignment',
          title: '📋 סידור עבודה חדש',
          message: `${title} - ${scheduledDate ? new Date(scheduledDate).toLocaleDateString('he-IL') : ''} ${scheduledTime || ''}`,
          link: '/work-orders',
        });
      }
    }

    setLoading(false);
    if (error) { toast.error('שגיאה ביצירת סידור העבודה'); console.error(error); }
    else { toast.success('סידור עבודה חדש נוצר'); onDone(); }
  };

  const taskTypes = ['הסעה', 'משלוח', 'איסוף', 'העברת רכב', 'טיפול', 'בדיקה', 'רחיצה', 'סיור', 'ליווי', 'אחר'];

  return (
    <div className="animate-fade-in">
      <button onClick={onDone} className="flex items-center gap-2 text-primary text-lg font-medium mb-4 min-h-[48px]">
        <ArrowRight size={20} /> חזרה
      </button>
      <h1 className="text-2xl font-bold mb-6">סידור עבודה חדש</h1>
      <div className="space-y-5">
        <div>
          <label className="block text-lg font-medium mb-2">סוג עבודה *</label>
          <select value={title} onChange={e => setTitle(e.target.value)} className={inputClass}>
            <option value="">בחר...</option>
            {taskTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-lg font-medium mb-2">לקוח</label>
          <select value={customerName} onChange={e => setCustomerName(e.target.value)} className={inputClass}>
            <option value="">בחר לקוח...</option>
            {dbCustomers.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
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
          <label className="block text-lg font-medium mb-2">נהג / עובד *</label>
          <select value={driverName} onChange={e => handleDriverChange(e.target.value)} className={inputClass}>
            <option value="">בחר...</option>
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
                <input type="checkbox" checked={companionRequested} onChange={e => setCompanionRequested(e.target.checked)} className="rounded" />
                נדרש מלווה
              </label>
            )}
          </div>
        </div>

        <div>
          <label className="block text-lg font-medium mb-2">פירוט העבודה</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="תאר את העבודה המלאה לביצוע..."
            className={`${inputClass} resize-none`} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-lg font-medium mb-2">תאריך</label>
            <input type="date" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} className={inputClass} /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-lg font-medium mb-2">שעת התחלה</label>
            <input type="time" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)} className={inputClass} /></div>
          <div><label className="block text-lg font-medium mb-2">שעת סיום</label>
            <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className={inputClass} /></div>
        </div>

        <div><label className="block text-lg font-medium mb-2">מיקום</label>
          <input value={location} onChange={e => setLocation(e.target.value)} className={inputClass} /></div>

        <div>
          <label className="block text-lg font-medium mb-2">רמת עדיפות</label>
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
          {loading ? 'שומר...' : '📋 צור סידור עבודה'}
        </button>
      </div>

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
