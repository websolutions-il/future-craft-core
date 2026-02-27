import { useState, useEffect } from 'react';
import { Briefcase, Plus, Search, ArrowRight, Clock, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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
}

const statusLabels: Record<string, { text: string; cls: string }> = {
  new: { text: 'חדש', cls: 'status-new' },
  in_progress: { text: 'בטיפול', cls: 'status-pending' },
  completed: { text: 'הושלם', cls: 'status-active' },
  cancelled: { text: 'בוטל', cls: 'status-inactive' },
};

const serviceCategories = ['טיפול תקופתי', 'תיקון', 'צמיגים', 'בלמים', 'מיזוג', 'חשמל', 'פחחות וצבע', 'אחר'];

export default function ServiceOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<ServiceRow[]>([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  const loadOrders = async () => {
    const { data } = await supabase.from('service_orders').select('*').order('created_at', { ascending: false });
    if (data) setOrders(data as ServiceRow[]);
  };

  useEffect(() => { loadOrders(); }, []);

  const filtered = orders.filter(o =>
    o.vehicle_plate?.includes(search) || o.service_category?.includes(search) || o.vendor_name?.includes(search) || o.driver_name?.includes(search)
  );

  if (showForm) {
    return <ServiceOrderForm onDone={() => { setShowForm(false); loadOrders(); }} user={user} />;
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

      <div className="relative mb-4">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="חיפוש..."
          className="w-full pr-12 p-4 text-lg rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none" />
      </div>

      <div className="space-y-3">
        {filtered.map(o => {
          const st = statusLabels[o.treatment_status] || statusLabels.new;
          return (
            <div key={o.id} className="card-elevated">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {o.treatment_status === 'completed' ? <CheckCircle size={28} className="text-primary" /> : <Clock size={28} className="text-primary" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xl font-bold">{o.service_category}</p>
                    <span className={`status-badge ${st.cls}`}>{st.text}</span>
                  </div>
                  {o.description && <p className="text-muted-foreground">{o.description}</p>}
                  <div className="grid grid-cols-2 gap-2 mt-3 text-sm text-muted-foreground">
                    <span>🚗 {o.vehicle_plate}</span>
                    <span>👤 {o.driver_name}</span>
                    {o.vendor_name && <span>🏪 {o.vendor_name}</span>}
                    {o.service_date && <span>📅 {new Date(o.service_date).toLocaleDateString('he-IL')}</span>}
                    {o.odometer > 0 && <span>📊 {o.odometer.toLocaleString()} ק"מ</span>}
                  </div>
                  {o.notes && <p className="text-sm text-muted-foreground mt-2 bg-muted p-2 rounded-lg">{o.notes}</p>}
                </div>
              </div>
            </div>
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
