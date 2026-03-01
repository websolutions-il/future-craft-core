import { useState, useEffect } from 'react';
import { ClipboardList, Plus, Search, Calendar, Clock, Car, User, MapPin, CheckCircle2, Circle, AlertCircle, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCompanyFilter, applyCompanyScope } from '@/hooks/useCompanyFilter';
import { toast } from 'sonner';

interface WorkOrder {
  id: string;
  title: string;
  description: string;
  vehicle_plate: string;
  driver_name: string;
  scheduled_date: string;
  scheduled_time: string;
  location: string;
  priority: 'low' | 'normal' | 'high';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  notes: string;
  company_name: string;
  created_at: string;
}

const priorityConfig: Record<string, { text: string; cls: string }> = {
  low: { text: 'נמוך', cls: 'status-active' },
  normal: { text: 'רגיל', cls: 'status-pending' },
  high: { text: 'דחוף', cls: 'status-urgent' },
};

const statusConfig: Record<string, { text: string; cls: string; icon: typeof Circle }> = {
  pending: { text: 'ממתין', cls: 'status-pending', icon: Circle },
  in_progress: { text: 'בביצוע', cls: 'status-new', icon: AlertCircle },
  completed: { text: 'הושלם', cls: 'status-active', icon: CheckCircle2 },
  cancelled: { text: 'בוטל', cls: 'status-inactive', icon: Circle },
};

// We'll use service_orders table with a "work_order" service_category to represent work orders
// This avoids creating a new table and leverages the existing schema

export default function WorkOrders() {
  const { user } = useAuth();
  const companyFilter = useCompanyFilter();
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  const loadOrders = async () => {
    const { data } = await applyCompanyScope(
      supabase.from('service_orders').select('*').order('service_date', { ascending: true }),
      companyFilter
    );

    if (data) {
      setOrders(data.map((d: any) => ({
        id: d.id,
        title: d.service_category || 'משימה',
        description: d.description || '',
        vehicle_plate: d.vehicle_plate || '',
        driver_name: d.driver_name || '',
        scheduled_date: d.service_date || '',
        scheduled_time: d.service_time || '',
        location: d.vendor_name || '',
        priority: d.manager_approval === 'high' ? 'high' : d.manager_approval === 'low' ? 'low' : 'normal',
        status: (d.treatment_status as WorkOrder['status']) || 'pending',
        notes: d.notes || '',
        company_name: d.company_name || '',
        created_at: d.created_at || '',
      })));
    }
  };

  useEffect(() => { loadOrders(); }, [companyFilter]);

  // Group by date
  const filtered = orders.filter(o => {
    const matchSearch = !search || o.title.includes(search) || o.vehicle_plate.includes(search) || o.driver_name.includes(search);
    const matchStatus = !filterStatus || o.status === filterStatus;
    const matchDate = !selectedDate || o.scheduled_date === selectedDate;
    return matchSearch && matchStatus && matchDate;
  });

  const grouped: Record<string, WorkOrder[]> = {};
  filtered.forEach(o => {
    const day = o.scheduled_date
      ? new Date(o.scheduled_date).toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })
      : 'ללא תאריך';
    if (!grouped[day]) grouped[day] = [];
    grouped[day].push(o);
  });

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('service_orders')
      .update({ treatment_status: newStatus })
      .eq('id', orderId);
    if (error) {
      toast.error('שגיאה בעדכון הסטטוס');
    } else {
      toast.success('הסטטוס עודכן');
      loadOrders();
    }
  };

  if (showForm) {
    return <WorkOrderForm onDone={() => { setShowForm(false); loadOrders(); }} user={user} />;
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h1 className="page-header mb-0 flex items-center gap-3">
          <ClipboardList size={28} />
          סידור עבודה
        </h1>
        {user?.role !== 'driver' && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-lg font-bold min-h-[48px]">
            <Plus size={22} />
            משימה חדשה
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
      <div className="flex gap-2 mb-4">
        <div className="flex-1">
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
            className="w-full p-3 text-base rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none" />
        </div>
        {selectedDate && (
          <button onClick={() => setSelectedDate('')} className="px-4 py-3 rounded-xl bg-muted text-muted-foreground text-base font-medium">
            נקה
          </button>
        )}
      </div>

      {/* Status filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        <button onClick={() => setFilterStatus('')}
          className={`px-4 py-2.5 rounded-xl text-base font-medium whitespace-nowrap transition-colors ${!filterStatus ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
          הכל ({orders.length})
        </button>
        {Object.entries(statusConfig).map(([key, cfg]) => {
          const count = orders.filter(o => o.status === key).length;
          return (
            <button key={key} onClick={() => setFilterStatus(filterStatus === key ? '' : key)}
              className={`px-4 py-2.5 rounded-xl text-base font-medium whitespace-nowrap transition-colors ${filterStatus === key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              {cfg.text} ({count})
            </button>
          );
        })}
      </div>

      {/* Orders grouped by date */}
      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <ClipboardList size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-xl">אין משימות</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([day, dayOrders]) => (
            <div key={day}>
              <div className="flex items-center gap-2 mb-3">
                <Calendar size={16} className="text-primary" />
                <h2 className="text-sm font-bold text-muted-foreground">{day}</h2>
                <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-lg">{dayOrders.length}</span>
              </div>
              <div className="space-y-3">
                {dayOrders.map(o => {
                  const st = statusConfig[o.status] || statusConfig.pending;
                  const pr = priorityConfig[o.priority] || priorityConfig.normal;
                  const StIcon = st.icon;
                  return (
                    <div key={o.id} className="card-elevated">
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => handleStatusChange(o.id, o.status === 'completed' ? 'pending' : o.status === 'pending' ? 'in_progress' : 'completed')}
                          className="mt-1 flex-shrink-0"
                          title="שנה סטטוס"
                        >
                          <StIcon size={28} className={o.status === 'completed' ? 'text-primary' : o.status === 'in_progress' ? 'text-warning' : 'text-muted-foreground'} />
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className={`text-lg font-bold ${o.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>{o.title}</p>
                            <div className="flex gap-2">
                              <span className={`status-badge ${pr.cls} text-xs`}>{pr.text}</span>
                              <span className={`status-badge ${st.cls} text-xs`}>{st.text}</span>
                            </div>
                          </div>
                          {o.description && <p className="text-muted-foreground">{o.description}</p>}
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                            {o.scheduled_time && (
                              <span className="flex items-center gap-1"><Clock size={14} /> {o.scheduled_time}</span>
                            )}
                            {o.vehicle_plate && (
                              <span className="flex items-center gap-1"><Car size={14} /> {o.vehicle_plate}</span>
                            )}
                            {o.driver_name && (
                              <span className="flex items-center gap-1"><User size={14} /> {o.driver_name}</span>
                            )}
                            {o.location && (
                              <span className="flex items-center gap-1"><MapPin size={14} /> {o.location}</span>
                            )}
                          </div>
                          {o.notes && <p className="text-sm text-muted-foreground mt-2 bg-muted p-2 rounded-lg">{o.notes}</p>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function WorkOrderForm({ onDone, user }: { onDone: () => void; user: any }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduledTime, setScheduledTime] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [priority, setPriority] = useState('normal');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const [dbVehicles, setDbVehicles] = useState<{ license_plate: string; manufacturer: string; model: string }[]>([]);
  const [dbDrivers, setDbDrivers] = useState<{ full_name: string; phone: string }[]>([]);

  useEffect(() => {
    supabase.from('vehicles').select('license_plate, manufacturer, model').then(({ data }) => {
      if (data) setDbVehicles(data);
    });
    supabase.from('drivers').select('full_name, phone').then(({ data }) => {
      if (data) setDbDrivers(data);
    });
  }, []);

  const handleDriverChange = (name: string) => {
    setDriverName(name);
    const d = dbDrivers.find(d => d.full_name === name);
    if (d) setDriverPhone(d.phone || '');
  };

  const isValid = title && vehiclePlate;
  const inputClass = "w-full p-4 text-lg rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none";

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    const { error } = await supabase.from('service_orders').insert({
      service_category: title,
      description,
      vehicle_plate: vehiclePlate,
      driver_name: driverName,
      driver_phone: driverPhone,
      vendor_name: vendorName,
      service_date: scheduledDate || null,
      service_time: scheduledTime,
      manager_approval: priority,
      treatment_status: 'pending',
      notes,
      company_name: user?.company_name || '',
      created_by: user?.id,
      ordering_user: user?.full_name || '',
    });
    setLoading(false);
    if (error) {
      toast.error('שגיאה ביצירת המשימה');
      console.error(error);
    } else {
      toast.success('המשימה נוצרה בהצלחה');
      onDone();
    }
  };

  const taskTypes = ['טיפול תקופתי', 'תיקון', 'בדיקה', 'איסוף רכב', 'החזרת רכב', 'העברת רכב', 'צמיגים', 'רחיצה', 'אחר'];

  return (
    <div className="animate-fade-in">
      <button onClick={onDone} className="flex items-center gap-2 text-primary text-lg font-medium mb-4 min-h-[48px]">
        <ArrowRight size={20} />
        חזרה לסידור עבודה
      </button>
      <h1 className="text-2xl font-bold mb-6">משימה חדשה</h1>
      <div className="space-y-5">
        <div>
          <label className="block text-lg font-medium mb-2">סוג משימה *</label>
          <select value={title} onChange={e => setTitle(e.target.value)} className={inputClass}>
            <option value="">בחר סוג...</option>
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
        <div>
          <label className="block text-lg font-medium mb-2">תיאור</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="פירוט המשימה..." className={`${inputClass} resize-none`} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-lg font-medium mb-2">תאריך</label>
            <input type="date" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-lg font-medium mb-2">שעה</label>
            <input type="time" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)} className={inputClass} />
          </div>
        </div>
        <div>
          <label className="block text-lg font-medium mb-2">מיקום / ספק</label>
          <input value={vendorName} onChange={e => setVendorName(e.target.value)} placeholder="מוסך / מיקום..." className={inputClass} />
        </div>
        <div>
          <label className="block text-lg font-medium mb-2">עדיפות</label>
          <div className="flex gap-3">
            {Object.entries(priorityConfig).map(([key, cfg]) => (
              <button key={key} type="button" onClick={() => setPriority(key)}
                className={`flex-1 py-3 rounded-xl text-lg font-medium transition-colors ${priority === key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                {cfg.text}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-lg font-medium mb-2">הערות</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="הערות..." className={`${inputClass} resize-none`} />
        </div>
        <button onClick={handleSubmit} disabled={!isValid || loading}
          className={`w-full py-5 rounded-xl text-xl font-bold transition-colors ${isValid && !loading ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}>
          {loading ? 'שומר...' : '📋 צור משימה'}
        </button>
      </div>
    </div>
  );
}
