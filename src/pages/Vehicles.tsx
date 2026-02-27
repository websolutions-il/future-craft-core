import { useState, useEffect } from 'react';
import { Car, Search, Plus, ArrowRight, Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface VehicleRow {
  id: string;
  license_plate: string;
  manufacturer: string;
  model: string;
  year: number;
  vehicle_type: string;
  status: string;
  odometer: number;
  assigned_driver_id: string | null;
  company_name: string;
  test_expiry: string | null;
  insurance_expiry: string | null;
  comprehensive_insurance_expiry: string | null;
  notes: string;
}

interface DriverRow { id: string; full_name: string; }

export default function Vehicles() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<VehicleRow[]>([]);
  const [drivers, setDrivers] = useState<DriverRow[]>([]);
  const [search, setSearch] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleRow | null>(null);
  const [showForm, setShowForm] = useState(false);

  const loadData = async () => {
    const [vRes, dRes] = await Promise.all([
      supabase.from('vehicles').select('*').order('created_at', { ascending: false }),
      supabase.from('drivers').select('id, full_name'),
    ]);
    if (vRes.data) setVehicles(vRes.data as VehicleRow[]);
    if (dRes.data) setDrivers(dRes.data as DriverRow[]);
  };

  useEffect(() => { loadData(); }, []);

  const getDriverName = (id: string | null) => {
    if (!id) return 'לא משויך';
    return drivers.find(d => d.id === id)?.full_name || 'לא ידוע';
  };

  const filtered = vehicles.filter(v =>
    v.license_plate.includes(search) || v.manufacturer?.includes(search) || v.model?.includes(search)
  );

  const statusLabel = (s: string) => {
    switch (s) {
      case 'active': return { text: 'פעיל', cls: 'status-active' };
      case 'in_service': return { text: 'בטיפול', cls: 'status-pending' };
      case 'out_of_service': return { text: 'לא פעיל', cls: 'status-inactive' };
      default: return { text: s, cls: '' };
    }
  };

  if (showForm) {
    return <VehicleForm onDone={() => { setShowForm(false); loadData(); }} user={user} />;
  }

  if (selectedVehicle) {
    const v = selectedVehicle;
    const sl = statusLabel(v.status);
    return (
      <div className="animate-fade-in">
        <button onClick={() => setSelectedVehicle(null)} className="flex items-center gap-2 text-primary text-lg font-medium mb-4 min-h-[48px]">
          <ArrowRight size={20} />
          חזרה לרשימה
        </button>
        <div className="card-elevated">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">{v.manufacturer} {v.model}</h1>
            <span className={`status-badge ${sl.cls}`}>{sl.text}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-lg">
            <div><span className="text-muted-foreground">מספר רכב:</span><p className="font-bold">{v.license_plate}</p></div>
            <div><span className="text-muted-foreground">שנה:</span><p className="font-bold">{v.year}</p></div>
            <div><span className="text-muted-foreground">סוג:</span><p className="font-bold">{v.vehicle_type}</p></div>
            <div><span className="text-muted-foreground">ק"מ:</span><p className="font-bold">{(v.odometer || 0).toLocaleString()}</p></div>
            <div><span className="text-muted-foreground">נהג משויך:</span><p className="font-bold">{getDriverName(v.assigned_driver_id)}</p></div>
            <div><span className="text-muted-foreground">חברה:</span><p className="font-bold">{v.company_name}</p></div>
            {v.test_expiry && <div><span className="text-muted-foreground">תוקף טסט:</span><p className="font-bold">{new Date(v.test_expiry).toLocaleDateString('he-IL')}</p></div>}
            {v.insurance_expiry && <div><span className="text-muted-foreground">תוקף ביטוח:</span><p className="font-bold">{new Date(v.insurance_expiry).toLocaleDateString('he-IL')}</p></div>}
            {v.comprehensive_insurance_expiry && <div><span className="text-muted-foreground">ביטוח מקיף:</span><p className="font-bold">{new Date(v.comprehensive_insurance_expiry).toLocaleDateString('he-IL')}</p></div>}
          </div>
          {v.notes && <p className="mt-4 p-3 bg-muted rounded-xl text-muted-foreground">{v.notes}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h1 className="page-header mb-0">ניהול רכבים</h1>
        {user?.role !== 'driver' && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-lg font-bold min-h-[48px]">
            <Plus size={22} />
            רכב חדש
          </button>
        )}
      </div>

      <div className="relative mb-6">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="חיפוש לפי מספר, יצרן או דגם..."
          className="w-full pr-12 p-4 text-lg rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none" />
      </div>

      <div className="space-y-3">
        {filtered.map(v => {
          const sl = statusLabel(v.status);
          return (
            <button key={v.id} onClick={() => setSelectedVehicle(v)} className="card-elevated w-full text-right hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Car size={28} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xl font-bold">{v.manufacturer} {v.model}</p>
                  <p className="text-muted-foreground text-lg">{v.license_plate} • {v.year}</p>
                  <p className="text-sm text-muted-foreground">נהג: {getDriverName(v.assigned_driver_id)}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`status-badge ${sl.cls}`}>{sl.text}</span>
                  <span className="text-sm text-muted-foreground">{(v.odometer || 0).toLocaleString()} ק"מ</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Car size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-xl">אין רכבים</p>
        </div>
      )}
    </div>
  );
}

function VehicleForm({ onDone, user }: { onDone: () => void; user: any }) {
  const [licensePlate, setLicensePlate] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [vehicleType, setVehicleType] = useState('');
  const [odometer, setOdometer] = useState('');
  const [testExpiry, setTestExpiry] = useState('');
  const [insuranceExpiry, setInsuranceExpiry] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const isValid = licensePlate && manufacturer && model;
  const inputClass = "w-full p-4 text-lg rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none";

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    const { error } = await supabase.from('vehicles').insert({
      license_plate: licensePlate,
      manufacturer,
      model,
      year: parseInt(year) || null,
      vehicle_type: vehicleType,
      odometer: parseInt(odometer) || 0,
      test_expiry: testExpiry || null,
      insurance_expiry: insuranceExpiry || null,
      notes,
      company_name: user?.company_name || '',
      created_by: user?.id,
    });
    setLoading(false);
    if (error) {
      toast.error('שגיאה בשמירת הרכב');
      console.error(error);
    } else {
      toast.success('הרכב נוסף בהצלחה');
      onDone();
    }
  };

  return (
    <div className="animate-fade-in">
      <button onClick={onDone} className="flex items-center gap-2 text-primary text-lg font-medium mb-4 min-h-[48px]">
        <ArrowRight size={20} />
        חזרה לרשימה
      </button>
      <h1 className="text-2xl font-bold mb-6">הוספת רכב חדש</h1>
      <div className="space-y-5">
        <div>
          <label className="block text-lg font-medium mb-2">מספר רכב *</label>
          <input value={licensePlate} onChange={e => setLicensePlate(e.target.value)} placeholder="12-345-67" className={inputClass} dir="ltr" style={{ textAlign: 'right' }} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-lg font-medium mb-2">יצרן *</label>
            <input value={manufacturer} onChange={e => setManufacturer(e.target.value)} placeholder="יצרן..." className={inputClass} />
          </div>
          <div>
            <label className="block text-lg font-medium mb-2">דגם *</label>
            <input value={model} onChange={e => setModel(e.target.value)} placeholder="דגם..." className={inputClass} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-lg font-medium mb-2">שנה</label>
            <input type="number" value={year} onChange={e => setYear(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-lg font-medium mb-2">סוג רכב</label>
            <select value={vehicleType} onChange={e => setVehicleType(e.target.value)} className={inputClass}>
              <option value="">בחר סוג...</option>
              <option value="רכב פרטי">רכב פרטי</option>
              <option value="רכב מסחרי">רכב מסחרי</option>
              <option value="משאית">משאית</option>
              <option value="אופנוע">אופנוע</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-lg font-medium mb-2">ק"מ נוכחי</label>
          <input type="number" value={odometer} onChange={e => setOdometer(e.target.value)} placeholder="0" className={inputClass} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-lg font-medium mb-2">תוקף טסט</label>
            <input type="date" value={testExpiry} onChange={e => setTestExpiry(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-lg font-medium mb-2">תוקף ביטוח</label>
            <input type="date" value={insuranceExpiry} onChange={e => setInsuranceExpiry(e.target.value)} className={inputClass} />
          </div>
        </div>
        <div>
          <label className="block text-lg font-medium mb-2">הערות</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="הערות..." className={`${inputClass} resize-none`} />
        </div>
        <button onClick={handleSubmit} disabled={!isValid || loading}
          className={`w-full py-5 rounded-xl text-xl font-bold transition-colors ${isValid && !loading ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}>
          {loading ? 'שומר...' : '💾 שמור רכב'}
        </button>
      </div>
    </div>
  );
}
