import { useState, useEffect } from 'react';
import { ClipboardList, Plus, Search, ArrowRight, Edit2, Trash2, Calendar, FileText, Mail, Download, Building2, ChevronRight, ChevronLeft, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCompanyFilter, applyCompanyScope } from '@/hooks/useCompanyFilter';
import { toast } from 'sonner';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { format, startOfWeek, endOfWeek, addWeeks, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { he } from 'date-fns/locale';
import { exportToCsv } from '@/utils/exportCsv';
import { generateWorkOrderPdf } from '@/utils/generateWorkOrderPdf';

interface SupplierOrder {
  id: string;
  order_number: string;
  supplier_id: string;
  supplier_name: string;
  supplier_number: string;
  description: string;
  work_type: string;
  approved_amount: number;
  execution_date: string | null;
  status: string;
  ordering_user: string;
  ordering_user_id: string;
  company_name: string;
  created_at: string;
  notes: string;
  expense_id: string | null;
}

interface Supplier {
  id: string;
  name: string;
  supplier_number: string;
  email: string;
  phone: string;
}

const workTypes = ['טיפול שוטף', 'תיקון', 'אחזקה מונעת', 'פחחות וצבע', 'חשמל', 'צמיגים', 'גרירה', 'ביטוח', 'אחר'];
const statusLabels: Record<string, string> = {
  open: 'פתוח',
  in_progress: 'בביצוע',
  completed: 'הושלם',
  closed: 'נסגר',
};
const statusColors: Record<string, string> = {
  open: 'status-pending',
  in_progress: 'status-active',
  completed: 'bg-primary/20 text-primary',
  closed: 'bg-muted text-muted-foreground',
};

export default function SupplierOrders() {
  const { user } = useAuth();
  const companyFilter = useCompanyFilter();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const supplierIdParam = searchParams.get('supplier');

  const [orders, setOrders] = useState<SupplierOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSupplier, setFilterSupplier] = useState(supplierIdParam || '');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<SupplierOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarWeek, setCalendarWeek] = useState(new Date());

  const loadData = async () => {
    setLoading(true);
    const [ordersRes, suppliersRes] = await Promise.all([
      applyCompanyScope(
        supabase.from('supplier_work_orders').select('*').order('created_at', { ascending: false }),
        companyFilter
      ),
      applyCompanyScope(
        supabase.from('suppliers').select('id, name, supplier_number, email, phone').eq('status', 'active'),
        companyFilter
      ),
    ]);
    if (ordersRes.data) setOrders(ordersRes.data as SupplierOrder[]);
    if (suppliersRes.data) setSuppliers(suppliersRes.data as Supplier[]);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [companyFilter]);

  const isManager = user?.role === 'fleet_manager' || user?.role === 'super_admin';

  const filtered = orders.filter(o => {
    const matchSearch = !search || o.description?.includes(search) || o.supplier_name?.includes(search) || o.order_number?.includes(search);
    const matchStatus = !filterStatus || o.status === filterStatus;
    const matchSupplier = !filterSupplier || o.supplier_id === filterSupplier;
    return matchSearch && matchStatus && matchSupplier;
  });

  // Group by date for calendar view
  const grouped: Record<string, SupplierOrder[]> = {};
  if (showCalendar) {
    filtered.forEach(o => {
      const day = o.execution_date
        ? format(new Date(o.execution_date), 'EEEE, d בMMMM yyyy', { locale: he })
        : 'ללא תאריך';
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(o);
    });
  }

  const handleDelete = async (id: string) => {
    if (!confirm('האם למחוק הזמנה זו?')) return;
    const { error } = await supabase.from('supplier_work_orders').delete().eq('id', id);
    if (error) toast.error('שגיאה במחיקה');
    else { toast.success('ההזמנה נמחקה'); loadData(); }
  };

  const handleStatusChange = async (order: SupplierOrder, newStatus: string) => {
    const { error } = await supabase.from('supplier_work_orders').update({
      status: newStatus, updated_at: new Date().toISOString(),
    }).eq('id', order.id);
    if (error) { toast.error('שגיאה בעדכון'); return; }

    // Auto-create expense when closing/completing
    if ((newStatus === 'completed' || newStatus === 'closed') && !order.expense_id && order.approved_amount > 0) {
      const { data: expData, error: expErr } = await supabase.from('expenses').insert({
        amount: order.approved_amount,
        category: 'ספק - ' + order.work_type,
        vendor: order.supplier_name,
        vehicle_plate: '',
        notes: `הזמנת עבודה ${order.order_number} - ${order.description}`,
        company_name: order.company_name,
        created_by: user?.id,
        invoice_number: order.order_number,
      }).select('id').single();

      if (expData) {
        await supabase.from('supplier_work_orders').update({ expense_id: expData.id }).eq('id', order.id);
      }
      if (expErr) console.error('Error creating expense:', expErr);
    }

    toast.success(`סטטוס עודכן ל: ${statusLabels[newStatus]}`);
    loadData();
  };

  const handleSendEmail = async (order: SupplierOrder) => {
    const supplier = suppliers.find(s => s.id === order.supplier_id);
    if (!supplier?.email) {
      toast.error('לספק אין כתובת אימייל');
      return;
    }
    toast.loading('שולח מייל...');
    try {
      const { data, error } = await supabase.functions.invoke('send-supplier-order-email', {
        body: { to: supplier.email, order },
      });
      toast.dismiss();
      if (error) throw error;
      if (data?.success) {
        toast.success('המייל נשלח בהצלחה ל-' + supplier.email);
      } else {
        throw new Error(data?.error || 'שגיאה בשליחה');
      }
    } catch (err: any) {
      toast.dismiss();
      // Fallback to mailto
      const subject = encodeURIComponent(`הזמנת עבודה ${order.order_number} - ${order.description}`);
      const body = encodeURIComponent(
        `שלום,\n\nמצורפים פרטי הזמנת עבודה:\n\n` +
        `מספר הזמנה: ${order.order_number}\n` +
        `תיאור: ${order.description}\n` +
        `סוג עבודה: ${order.work_type}\n` +
        `סכום מאושר: ₪${order.approved_amount?.toLocaleString()}\n` +
        `תאריך ביצוע: ${order.execution_date || 'לא נקבע'}\n` +
        `מוציא הזמנה: ${order.ordering_user}\n\n` +
        `בברכה`
      );
      window.open(`mailto:${supplier.email}?subject=${subject}&body=${body}`, '_blank');
      toast.info('נפתח חלון מייל (שליחה ישירה לא זמינה כרגע)');
    }
  };

  const handleExportPdf = (order: SupplierOrder) => {
    generateWorkOrderPdf(order, statusLabels[order.status]);
    toast.success('PDF נפתח להדפסה');
  };

  if (showForm) {
    return (
      <OrderForm
        order={editItem}
        suppliers={suppliers}
        defaultSupplierId={filterSupplier || supplierIdParam || ''}
        onDone={() => { setShowForm(false); setEditItem(null); loadData(); }}
        onBack={() => { setShowForm(false); setEditItem(null); }}
        user={user}
      />
    );
  }

  const statusCounts = Object.keys(statusLabels).map(s => ({
    s, count: orders.filter(o => o.status === s && (!filterSupplier || o.supplier_id === filterSupplier)).length
  })).filter(x => x.count > 0);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/suppliers')} className="p-2 rounded-xl bg-muted text-muted-foreground min-h-[48px]">
            <ArrowRight size={20} />
          </button>
          <h1 className="page-header !mb-0 flex items-center gap-3"><ClipboardList size={28} /> הזמנות עבודה לספקים</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowCalendar(!showCalendar)}
            className={`flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium min-h-[48px] ${showCalendar ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            <Calendar size={18} /> {showCalendar ? 'רשימה' : 'יומן'}
          </button>
          <button onClick={() => exportToCsv('supplier_orders', [
            { key: 'order_number', label: 'מספר הזמנה' },
            { key: 'supplier_name', label: 'ספק' },
            { key: 'description', label: 'תיאור' },
            { key: 'work_type', label: 'סוג עבודה' },
            { key: 'approved_amount', label: 'סכום' },
            { key: 'execution_date', label: 'תאריך ביצוע' },
            { key: 'status', label: 'סטטוס' },
            { key: 'ordering_user', label: 'מוציא הזמנה' },
          ], filtered)} className="flex items-center gap-1 px-3 py-2 rounded-xl bg-muted text-muted-foreground text-sm font-medium min-h-[48px]">
            <Download size={18} /> ייצוא
          </button>
          {isManager && (
            <button onClick={() => { setEditItem(null); setShowForm(true); }}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-lg font-bold min-h-[48px]">
              <Plus size={22} /> הזמנה חדשה
            </button>
          )}
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="חיפוש הזמנה..."
          className="w-full pr-12 p-4 text-lg rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none" />
      </div>

      {/* Supplier filter */}
      {suppliers.length > 0 && (
        <div className="mb-3">
          <select value={filterSupplier} onChange={e => setFilterSupplier(e.target.value)}
            className="w-full p-3 rounded-xl border-2 border-input bg-background text-sm focus:border-primary focus:outline-none">
            <option value="">כל הספקים</option>
            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.supplier_number})</option>)}
          </select>
        </div>
      )}

      {/* Status filter */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        <button onClick={() => setFilterStatus('')}
          className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${!filterStatus ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
          הכל ({filtered.length})
        </button>
        {statusCounts.map(({ s, count }) => (
          <button key={s} onClick={() => setFilterStatus(filterStatus === s ? '' : s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            {statusLabels[s]} ({count})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <ClipboardList size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-xl">אין הזמנות עבודה</p>
        </div>
      ) : showCalendar ? (
        // Calendar/grouped view
        <div className="space-y-6">
          {Object.entries(grouped).map(([day, dayOrders]) => (
            <div key={day}>
              <div className="flex items-center gap-2 mb-3">
                <Calendar size={16} className="text-primary" />
                <h2 className="text-sm font-bold text-muted-foreground">{day}</h2>
                <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-lg">{dayOrders.length}</span>
              </div>
              <div className="space-y-3">
                {dayOrders.map(o => <OrderCard key={o.id} order={o} isManager={isManager}
                  onEdit={() => { setEditItem(o); setShowForm(true); }}
                  onDelete={() => handleDelete(o.id)}
                  onStatusChange={handleStatusChange}
                  onEmail={() => handleSendEmail(o)}
                  onPdf={() => handleExportPdf(o)}
                />)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(o => <OrderCard key={o.id} order={o} isManager={isManager}
            onEdit={() => { setEditItem(o); setShowForm(true); }}
            onDelete={() => handleDelete(o.id)}
            onStatusChange={handleStatusChange}
            onEmail={() => handleSendEmail(o)}
            onPdf={() => handleExportPdf(o)}
          />)}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order, isManager, onEdit, onDelete, onStatusChange, onEmail, onPdf }: {
  order: SupplierOrder; isManager: boolean;
  onEdit: () => void; onDelete: () => void;
  onStatusChange: (o: SupplierOrder, s: string) => void;
  onEmail: () => void; onPdf: () => void;
}) {
  const isOpen = order.status === 'open' || order.status === 'in_progress';

  return (
    <div className="card-elevated">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <ClipboardList size={24} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded-lg bg-primary/10 text-primary">{order.order_number}</span>
              <p className="text-lg font-bold">{order.description || 'הזמנת עבודה'}</p>
            </div>
            <span className={`status-badge ${statusColors[order.status]} text-xs`}>
              {statusLabels[order.status]}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Building2 size={14} /> {order.supplier_name}</span>
            {order.work_type && <span>📋 {order.work_type}</span>}
            {order.approved_amount > 0 && <span className="font-bold text-foreground">₪{order.approved_amount.toLocaleString()}</span>}
            {order.execution_date && (
              <span className="flex items-center gap-1"><Calendar size={14} /> {format(new Date(order.execution_date), 'd/M/yyyy')}</span>
            )}
            {order.ordering_user && <span>👤 {order.ordering_user}</span>}
          </div>
          {order.notes && <p className="text-sm text-muted-foreground mt-1">{order.notes}</p>}
          {order.expense_id && (
            <span className="text-xs text-primary mt-1 inline-block">✅ נרשם בדוח כספי</span>
          )}
        </div>
        {isManager && (
          <div className="flex flex-col items-center gap-1">
            <button onClick={onEmail} className="p-2 rounded-xl bg-accent/10 text-accent-foreground" title="שלח מייל"><Mail size={16} /></button>
            <button onClick={onPdf} className="p-2 rounded-xl bg-muted text-muted-foreground" title="הורד PDF"><FileText size={16} /></button>
            {isOpen && (
              <button onClick={onEdit} className="p-2 rounded-xl bg-primary/10 text-primary" title="עריכה"><Edit2 size={16} /></button>
            )}
            <button onClick={onDelete} className="p-2 rounded-xl bg-destructive/10 text-destructive" title="מחיקה"><Trash2 size={16} /></button>
          </div>
        )}
      </div>
      {/* Status change buttons */}
      {isManager && isOpen && (
        <div className="mt-3 pt-3 border-t border-border flex gap-2 flex-wrap">
          {order.status === 'open' && (
            <button onClick={() => onStatusChange(order, 'in_progress')}
              className="flex-1 py-2 rounded-xl bg-primary/10 text-primary font-bold text-sm min-h-[40px]">
              ▶️ התחל ביצוע
            </button>
          )}
          {(order.status === 'open' || order.status === 'in_progress') && (
            <button onClick={() => onStatusChange(order, 'completed')}
              className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-sm min-h-[40px]">
              ✅ הושלם
            </button>
          )}
          {order.status === 'in_progress' && (
            <button onClick={() => onStatusChange(order, 'closed')}
              className="flex-1 py-2 rounded-xl bg-muted text-muted-foreground font-bold text-sm min-h-[40px]">
              🔒 סגור הזמנה
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function OrderForm({ order, suppliers, defaultSupplierId, onDone, onBack, user }: {
  order: SupplierOrder | null; suppliers: Supplier[]; defaultSupplierId: string;
  onDone: () => void; onBack: () => void; user: any;
}) {
  const isEdit = !!order;
  const [supplierId, setSupplierId] = useState(order?.supplier_id || defaultSupplierId || '');
  const [description, setDescription] = useState(order?.description || '');
  const [workType, setWorkType] = useState(order?.work_type || '');
  const [approvedAmount, setApprovedAmount] = useState(order?.approved_amount?.toString() || '');
  const [executionDate, setExecutionDate] = useState(order?.execution_date || '');
  const [status, setStatus] = useState(order?.status || 'open');
  const [notes, setNotes] = useState(order?.notes || '');
  const [loading, setLoading] = useState(false);

  const inputClass = "w-full p-4 text-lg rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none";

  const selectedSupplier = suppliers.find(s => s.id === supplierId);

  const handleSubmit = async () => {
    if (!supplierId || !description.trim()) return;
    setLoading(true);
    const payload = {
      supplier_id: supplierId,
      supplier_name: selectedSupplier?.name || '',
      supplier_number: selectedSupplier?.supplier_number || '',
      description,
      work_type: workType,
      approved_amount: parseFloat(approvedAmount) || 0,
      execution_date: executionDate || null,
      status,
      notes,
      ordering_user: user?.full_name || '',
      ordering_user_id: user?.id,
    };
    let error;
    if (isEdit) {
      ({ error } = await supabase.from('supplier_work_orders').update({
        ...payload, updated_at: new Date().toISOString(),
      }).eq('id', order!.id));
    } else {
      ({ error } = await supabase.from('supplier_work_orders').insert({
        ...payload,
        company_name: user?.company_name || '',
        created_by: user?.id,
      }));
    }
    setLoading(false);
    if (error) { toast.error('שגיאה בשמירה'); console.error(error); }
    else { toast.success(isEdit ? 'ההזמנה עודכנה' : 'הזמנת עבודה חדשה נוצרה'); onDone(); }
  };

  return (
    <div className="animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-primary text-lg font-medium mb-4 min-h-[48px]">
        <ArrowRight size={20} /> חזרה
      </button>
      <h1 className="text-2xl font-bold mb-6">{isEdit ? 'עריכת הזמנת עבודה' : 'הזמנת עבודה חדשה'}</h1>
      <div className="space-y-5">
        <div><label className="block text-lg font-medium mb-2">ספק *</label>
          <select value={supplierId} onChange={e => setSupplierId(e.target.value)} className={inputClass}>
            <option value="">בחר ספק...</option>
            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.supplier_number})</option>)}
          </select>
        </div>

        <div><label className="block text-lg font-medium mb-2">תיאור / שם העבודה *</label>
          <input value={description} onChange={e => setDescription(e.target.value)} className={inputClass} /></div>

        <div><label className="block text-lg font-medium mb-2">סוג העבודה</label>
          <select value={workType} onChange={e => setWorkType(e.target.value)} className={inputClass}>
            <option value="">בחר...</option>
            {workTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div><label className="block text-lg font-medium mb-2">סכום הזמנה מאושר (₪)</label>
          <input type="number" value={approvedAmount} onChange={e => setApprovedAmount(e.target.value)} className={inputClass} /></div>

        <div><label className="block text-lg font-medium mb-2">תאריך ביצוע</label>
          <input type="date" value={executionDate} onChange={e => setExecutionDate(e.target.value)} className={inputClass} /></div>

        <div><label className="block text-lg font-medium mb-2">מוציא הזמנה</label>
          <input value={user?.full_name || ''} disabled className={`${inputClass} bg-muted`} /></div>

        {isEdit && (
          <div><label className="block text-lg font-medium mb-2">סטטוס</label>
            <select value={status} onChange={e => setStatus(e.target.value)} className={inputClass}>
              {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        )}

        <div><label className="block text-lg font-medium mb-2">הערות</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className={`${inputClass} resize-none`} /></div>

        <button onClick={handleSubmit} disabled={!supplierId || !description.trim() || loading}
          className={`w-full py-5 rounded-xl text-xl font-bold transition-colors ${supplierId && description.trim() && !loading ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}>
          {loading ? 'שומר...' : isEdit ? '✅ עדכן הזמנה' : '➕ צור הזמנת עבודה'}
        </button>
      </div>
    </div>
  );
}
