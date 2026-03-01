import { useState, useEffect } from 'react';
import { Briefcase, Plus, Search, ArrowRight, Clock, CheckCircle, MessageSquareReply, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCompanyFilter, applyCompanyScope } from '@/hooks/useCompanyFilter';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ServiceRow {
  id: string;
  service_category: string;
  description: string;
  vehicle_plate: string;
  driver_name: string;
  driver_phone: string;
  vendor_name: string;
  vendor_phone: string;
  service_date: string;
  service_time: string;
  treatment_status: string;
  odometer: number;
  notes: string;
  created_at: string;
  company_name: string;
  manager_approval: string;
  ordering_user: string;
  reference_number: string;
}

const statusLabels: Record<string, { text: string; cls: string }> = {
  new: { text: 'חדש', cls: 'status-new' },
  in_progress: { text: 'בטיפול', cls: 'status-pending' },
  completed: { text: 'הושלם', cls: 'status-active' },
  cancelled: { text: 'בוטל', cls: 'status-inactive' },
};

const serviceCategories = ['טיפול תקופתי', 'תיקון', 'צמיגים', 'בלמים', 'מיזוג', 'חשמל', 'פחחות וצבע', 'חידוש טסט', 'חידוש ביטוח', 'אחר'];

export default function ServiceOrders() {
  const { user } = useAuth();
  const companyFilter = useCompanyFilter();
  const [orders, setOrders] = useState<ServiceRow[]>([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterName, setFilterName] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [filterVehicle, setFilterVehicle] = useState('');
  const [filterRef, setFilterRef] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [replyOrder, setReplyOrder] = useState<ServiceRow | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyStatus, setReplyStatus] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ServiceRow | null>(null);

  const loadOrders = async () => {
    const { data } = await applyCompanyScope(supabase.from('service_orders').select('*'), companyFilter).order('created_at', { ascending: false });
    if (data) setOrders(data as unknown as ServiceRow[]);
  };

  useEffect(() => { loadOrders(); }, []);

  const isManager = user?.role === 'fleet_manager' || user?.role === 'super_admin';

  const filtered = orders.filter(o => {
    const matchSearch = !search ||
      o.vehicle_plate?.includes(search) ||
      o.service_category?.includes(search) ||
      o.vendor_name?.includes(search) ||
      o.driver_name?.includes(search) ||
      o.company_name?.includes(search) ||
      o.ordering_user?.includes(search) ||
      o.reference_number?.includes(search);
    const matchStatus = !filterStatus || o.treatment_status === filterStatus;
    const matchName = !filterName || o.driver_name?.includes(filterName) || o.ordering_user?.includes(filterName);
    const matchCompany = !filterCompany || o.company_name?.includes(filterCompany);
    const matchVehicle = !filterVehicle || o.vehicle_plate?.includes(filterVehicle);
    const matchRef = !filterRef || o.reference_number?.includes(filterRef);
    return matchSearch && matchStatus && matchName && matchCompany && matchVehicle && matchRef;
  });

  const activeFilterCount = [filterName, filterCompany, filterVehicle, filterRef].filter(Boolean).length;

  const handleReply = async () => {
    if (!replyOrder) return;
    setSendingReply(true);
    const updates: any = {};
    if (replyText) updates.manager_approval = replyText;
    if (replyStatus) updates.treatment_status = replyStatus;

    const { error } = await supabase.from('service_orders').update(updates).eq('id', replyOrder.id);

    if (!error && replyOrder.ordering_user) {
      // Notify the ordering user via driver_notifications if we can find them
      const { data: profiles } = await supabase.from('profiles').select('id').eq('full_name', replyOrder.ordering_user).limit(1);
      if (profiles && profiles.length > 0) {
        await supabase.from('driver_notifications').insert({
          user_id: profiles[0].id,
          type: 'service',
          title: '📋 מענה להזמנת שירות',
          message: `הזמנת שירות "${replyOrder.service_category}" לרכב ${replyOrder.vehicle_plate}: ${replyText}`,
          link: '/service-orders',
        });
      }
    }

    setSendingReply(false);
    if (error) { toast.error('שגיאה'); console.error(error); }
    else { toast.success('המענה נשלח בהצלחה'); setReplyOrder(null); setReplyText(''); setReplyStatus(''); loadOrders(); }
  };

  if (showForm) {
    return <ServiceOrderForm onDone={() => { setShowForm(false); loadOrders(); }} user={user} />;
  }

  if (selectedOrder) {
    const o = selectedOrder;
    const st = statusLabels[o.treatment_status] || statusLabels.new;
    return (
      <div className="animate-fade-in">
        <button onClick={() => setSelectedOrder(null)} className="flex items-center gap-2 text-primary text-lg font-medium mb-4 min-h-[48px]"><ArrowRight size={20} /> חזרה</button>
        <div className="card-elevated">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">{o.service_category}</h1>
            <span className={`status-badge ${st.cls}`}>{st.text}</span>
          </div>
          {o.description && <p className="text-muted-foreground mb-4">{o.description}</p>}
          <div className="grid grid-cols-2 gap-4 text-lg mb-4">
            <div><span className="text-muted-foreground text-sm">רכב</span><p className="font-bold">{o.vehicle_plate}</p></div>
            <div><span className="text-muted-foreground text-sm">נהג</span><p className="font-bold">{o.driver_name}</p></div>
            {o.company_name && <div><span className="text-muted-foreground text-sm">חברה</span><p className="font-bold">{o.company_name}</p></div>}
            {o.ordering_user && <div><span className="text-muted-foreground text-sm">מזמין</span><p className="font-bold">{o.ordering_user}</p></div>}
            {o.vendor_name && <div><span className="text-muted-foreground text-sm">ספק</span><p className="font-bold">{o.vendor_name}</p></div>}
            {o.vendor_phone && <div><span className="text-muted-foreground text-sm">טלפון ספק</span><p className="font-bold" dir="ltr">{o.vendor_phone}</p></div>}
            {o.service_date && <div><span className="text-muted-foreground text-sm">תאריך</span><p className="font-bold">{new Date(o.service_date).toLocaleDateString('he-IL')}</p></div>}
            {o.service_time && <div><span className="text-muted-foreground text-sm">שעה</span><p className="font-bold">{o.service_time}</p></div>}
            {o.odometer > 0 && <div><span className="text-muted-foreground text-sm">ק"מ</span><p className="font-bold">{o.odometer.toLocaleString()}</p></div>}
            {o.reference_number && <div><span className="text-muted-foreground text-sm">מס׳ אסמכתא</span><p className="font-bold">{o.reference_number}</p></div>}
          </div>
          {o.notes && <p className="p-3 bg-muted rounded-xl text-muted-foreground mb-4">{o.notes}</p>}
          {o.manager_approval && (
            <div className="p-3 bg-primary/10 rounded-xl mb-4">
              <span className="text-sm text-muted-foreground">מענה מנהל</span>
              <p className="font-bold text-primary">{o.manager_approval}</p>
            </div>
          )}
          {isManager && (
            <button onClick={() => { setReplyOrder(o); setReplyStatus(o.treatment_status || 'new'); }}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg flex items-center justify-center gap-2">
              <MessageSquareReply size={20} /> הגב להזמנה
            </button>
          )}
        </div>

        {/* Reply Dialog - must be inside this return block */}
        <Dialog open={!!replyOrder} onOpenChange={(open) => { if (!open) setReplyOrder(null); }}>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-xl">מענה להזמנת שירות</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-xl">
                <p className="text-sm text-muted-foreground">הזמנה</p>
                <p className="font-bold">{replyOrder?.service_category} - רכב {replyOrder?.vehicle_plate}</p>
                {replyOrder?.ordering_user && <p className="text-sm text-muted-foreground">מזמין: {replyOrder.ordering_user}</p>}
              </div>
              <div>
                <label className="block font-medium mb-2">עדכון סטטוס</label>
                <select value={replyStatus} onChange={e => setReplyStatus(e.target.value)}
                  className="w-full p-4 text-lg rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none">
                  {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v.text}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-medium mb-2">תגובה / מענה</label>
                <textarea value={replyText} onChange={e => setReplyText(e.target.value)} rows={3}
                  className="w-full p-4 text-lg rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none resize-none"
                  placeholder="כתוב מענה ללקוח..." />
              </div>
              <button onClick={handleReply} disabled={sendingReply || (!replyText && !replyStatus)}
                className="w-full py-4 rounded-xl text-lg font-bold bg-primary text-primary-foreground disabled:opacity-50">
                {sendingReply ? 'שולח...' : '📨 שלח מענה'}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h1 className="page-header mb-0 flex items-center gap-3">
          <Briefcase size={28} />
          הזמנות שירות
        </h1>
        {user?.role !== 'driver' && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-lg font-bold min-h-[48px]">
            <Plus size={22} />
            הזמנה חדשה
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="חיפוש..."
            className="w-full pr-12 p-4 text-lg rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none" />
        </div>
        {isManager && (
          <button onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`relative flex items-center gap-1 px-4 py-3 rounded-xl border-2 font-bold transition-colors ${showAdvancedFilters ? 'border-primary bg-primary/10 text-primary' : 'border-input text-foreground'}`}>
            <Filter size={20} />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">{activeFilterCount}</span>
            )}
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {isManager && showAdvancedFilters && (
        <div className="card-elevated mb-4 space-y-3">
          <h3 className="font-bold text-sm text-muted-foreground">סינון מתקדם</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">שם</label>
              <input value={filterName} onChange={e => setFilterName(e.target.value)}
                className="w-full p-3 text-base rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none" placeholder="שם נהג / מזמין..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">שם חברה</label>
              <input value={filterCompany} onChange={e => setFilterCompany(e.target.value)}
                className="w-full p-3 text-base rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none" placeholder="חברה..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">מספר רכב</label>
              <input value={filterVehicle} onChange={e => setFilterVehicle(e.target.value)}
                className="w-full p-3 text-base rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none" placeholder="לוחית רישוי..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">מספר אסמכתא</label>
              <input value={filterRef} onChange={e => setFilterRef(e.target.value)}
                className="w-full p-3 text-base rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none" placeholder="מספר..." />
            </div>
          </div>
          {activeFilterCount > 0 && (
            <button onClick={() => { setFilterName(''); setFilterCompany(''); setFilterVehicle(''); setFilterRef(''); }} className="text-sm text-primary font-medium">
              ✕ נקה סינון
            </button>
          )}
        </div>
      )}

      {/* Status filter */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        <button onClick={() => setFilterStatus('')}
          className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${!filterStatus ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
          הכל ({orders.length})
        </button>
        {Object.entries(statusLabels).map(([key, val]) => {
          const count = orders.filter(o => o.treatment_status === key).length;
          return (
            <button key={key} onClick={() => setFilterStatus(filterStatus === key ? '' : key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              {val.text} ({count})
            </button>
          );
        })}
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        <button onClick={() => setFilterStatus('')}
          className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${!filterStatus ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
          הכל ({orders.length})
        </button>
        {Object.entries(statusLabels).map(([key, val]) => {
          const count = orders.filter(o => o.treatment_status === key).length;
          return (
            <button key={key} onClick={() => setFilterStatus(filterStatus === key ? '' : key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              {val.text} ({count})
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {filtered.map(o => {
          const st = statusLabels[o.treatment_status] || statusLabels.new;
          return (
            <button key={o.id} onClick={() => setSelectedOrder(o)} className="card-elevated w-full text-right hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {o.treatment_status === 'completed' ? <CheckCircle size={28} className="text-primary" /> : <Clock size={28} className="text-primary" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xl font-bold">{o.service_category}</p>
                    <span className={`status-badge ${st.cls}`}>{st.text}</span>
                  </div>
                  {o.description && <p className="text-muted-foreground line-clamp-1">{o.description}</p>}
                  <div className="grid grid-cols-2 gap-2 mt-3 text-sm text-muted-foreground">
                    <span>🚗 {o.vehicle_plate}</span>
                    <span>👤 {o.driver_name}</span>
                    {o.company_name && <span>🏢 {o.company_name}</span>}
                    {o.service_date && <span>📅 {new Date(o.service_date).toLocaleDateString('he-IL')}</span>}
                  </div>
                  {o.manager_approval && (
                    <p className="text-xs text-primary mt-2 font-medium">✅ יש מענה מנהל</p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Briefcase size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-xl">אין הזמנות שירות</p>
        </div>
      )}

    </div>
  );
}

function ServiceOrderForm({ onDone, user }: { onDone: () => void; user: any }) {
  const [serviceCategory, setServiceCategory] = useState('');
  const [description, setDescription] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [vendorPhone, setVendorPhone] = useState('');
  const [serviceDate, setServiceDate] = useState('');
  const [serviceTime, setServiceTime] = useState('');
  const [odometer, setOdometer] = useState('');
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

  const isValid = serviceCategory && vehiclePlate;
  const inputClass = "w-full p-4 text-lg rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none";

  const handleDriverChange = (name: string) => {
    setDriverName(name);
    const driver = dbDrivers.find(d => d.full_name === name);
    if (driver) setDriverPhone(driver.phone || '');
  };

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    const { error } = await supabase.from('service_orders').insert({
      service_category: serviceCategory,
      description,
      vehicle_plate: vehiclePlate,
      driver_name: driverName,
      driver_phone: driverPhone,
      vendor_name: vendorName,
      vendor_phone: vendorPhone,
      service_date: serviceDate || null,
      service_time: serviceTime,
      odometer: parseInt(odometer) || 0,
      notes,
      company_name: user?.company_name || '',
      created_by: user?.id,
      ordering_user: user?.full_name || '',
    });
    setLoading(false);
    if (error) {
      toast.error('שגיאה בשמירת ההזמנה');
      console.error(error);
    } else {
      toast.success('הזמנת השירות נשמרה');
      onDone();
    }
  };

  return (
    <div className="animate-fade-in">
      <button onClick={onDone} className="flex items-center gap-2 text-primary text-lg font-medium mb-4 min-h-[48px]">
        <ArrowRight size={20} />
        חזרה לרשימה
      </button>
      <h1 className="text-2xl font-bold mb-6">הזמנת שירות חדשה</h1>
      <div className="space-y-5">
        <div>
          <label className="block text-lg font-medium mb-2">קטגוריית שירות *</label>
          <select value={serviceCategory} onChange={e => setServiceCategory(e.target.value)} className={inputClass}>
            <option value="">בחר קטגוריה...</option>
            {serviceCategories.map(c => <option key={c} value={c}>{c}</option>)}
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
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="תיאור השירות..." className={`${inputClass} resize-none`} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-lg font-medium mb-2">שם ספק</label>
            <input value={vendorName} onChange={e => setVendorName(e.target.value)} placeholder="שם המוסך/ספק..." className={inputClass} />
          </div>
          <div>
            <label className="block text-lg font-medium mb-2">טלפון ספק</label>
            <input type="tel" value={vendorPhone} onChange={e => setVendorPhone(e.target.value)} placeholder="050-..." className={inputClass} dir="ltr" style={{ textAlign: 'right' }} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-lg font-medium mb-2">תאריך שירות</label>
            <input type="date" value={serviceDate} onChange={e => setServiceDate(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-lg font-medium mb-2">שעת שירות</label>
            <input type="time" value={serviceTime} onChange={e => setServiceTime(e.target.value)} className={inputClass} />
          </div>
        </div>
        <div>
          <label className="block text-lg font-medium mb-2">ק"מ</label>
          <input type="number" value={odometer} onChange={e => setOdometer(e.target.value)} placeholder="0" className={inputClass} />
        </div>
        <div>
          <label className="block text-lg font-medium mb-2">הערות</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="הערות..." className={`${inputClass} resize-none`} />
        </div>
        <button onClick={handleSubmit} disabled={!isValid || loading}
          className={`w-full py-5 rounded-xl text-xl font-bold transition-colors ${isValid && !loading ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}>
          {loading ? 'שומר...' : '📋 שמור הזמנת שירות'}
        </button>
      </div>
    </div>
  );
}
