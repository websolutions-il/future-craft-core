import { useState, useEffect } from 'react';
import { Car, Search, Plus, ArrowRight, Edit2, Phone, Mail, Trash2 } from 'lucide-react';
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

interface DriverRow { id: string; full_name: string; phone: string | null; }

type ViewMode = 'list' | 'detail' | 'form';

export default function Vehicles() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<VehicleRow[]>([]);
  const [drivers, setDrivers] = useState<DriverRow[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [filterCompany, setFilterCompany] = useState('');
  const [filterDriver, setFilterDriver] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleRow | null>(null);
  const [editVehicle, setEditVehicle] = useState<VehicleRow | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const [vRes, dRes] = await Promise.all([
      supabase.from('vehicles').select('*').order('created_at', { ascending: false }),
      supabase.from('drivers').select('id, full_name, phone'),
    ]);
    if (vRes.data) setVehicles(vRes.data as VehicleRow[]);
    if (dRes.data) setDrivers(dRes.data as DriverRow[]);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const getDriverName = (id: string | null) => {
    if (!id) return 'לא משויך';
    return drivers.find(d => d.id === id)?.full_name || 'לא ידוע';
  };

  const companies = [...new Set(vehicles.map(v => v.company_name).filter(Boolean))];

  const filtered = vehicles.filter(v => {
    const matchSearch = !search || v.license_plate.includes(search) || v.manufacturer?.includes(search) || v.model?.includes(search);
    const matchStatus = statusFilter === 'all' || v.status === statusFilter;
    const matchCompany = !filterCompany || v.company_name === filterCompany;
    const matchDriver = !filterDriver || v.assigned_driver_id === filterDriver;
    return matchSearch && matchStatus && matchCompany && matchDriver;
  });

  const statusLabel = (s: string) => {
    switch (s) {
      case 'active': return { text: 'פעיל', cls: 'status-active' };
      case 'in_service': return { text: 'בטיפול', cls: 'status-pending' };
      case 'out_of_service': return { text: 'לא פעיל', cls: 'status-inactive' };
      default: return { text: s || 'לא ידוע', cls: '' };
    }
  };

  const isManager = user?.role === 'fleet_manager' || user?.role === 'super_admin';

  const handleOpenForm = (vehicle?: VehicleRow) => {
    setEditVehicle(vehicle || null);
    setViewMode('form');
  };

  const handleViewDetail = (v: VehicleRow) => {
    setSelectedVehicle(v);
    setViewMode('detail');
  };

  const handleBack = () => {
    setViewMode('list');
    setSelectedVehicle(null);
    setEditVehicle(null);
  };

  const handleFormDone = () => {
    handleBack();
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק רכב זה?')) return;
    const { error } = await supabase.from('vehicles').delete().eq('id', id);
    if (error) {
      toast.error('שגיאה במחיקת הרכב');
    } else {
      toast.success('הרכב נמחק בהצלחה');
      handleFormDone();
    }
  };

  // === FORM VIEW ===
  if (viewMode === 'form') {
    return <VehicleForm vehicle={editVehicle} drivers={drivers} onDone={handleFormDone} onBack={handleBack} user={user} />;
  }

  // === DETAIL VIEW ===
  if (viewMode === 'detail' && selectedVehicle) {
    const v = selectedVehicle;
    const sl = statusLabel(v.status);
    const driver = drivers.find(d => d.id === v.assigned_driver_id);
    const daysUntil = (dateStr: string | null) => {
      if (!dateStr) return null;
      return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
    };
    const testDays = daysUntil(v.test_expiry);
    const insDays = daysUntil(v.insurance_expiry);
    const compDays = daysUntil(v.comprehensive_insurance_expiry);
    const expiryColor = (days: number | null) => {
      if (days === null) return '';
      if (days <= 0) return 'text-destructive font-bold';
      if (days <= 14) return 'text-warning font-bold';
      return '';
    };

    return (
      <div className="animate-fade-in">
        <button onClick={handleBack} className="flex items-center gap-2 text-primary text-lg font-medium mb-4 min-h-[48px]">
          <ArrowRight size={20} /> חזרה לרשימה
        </button>

        <div className="card-elevated mb-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">{v.manufacturer} {v.model}</h1>
              <p className="text-lg text-muted-foreground mt-1">{v.license_plate} • {v.year || ''}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`status-badge ${sl.cls}`}>{sl.text}</span>
              {isManager && (
                <button onClick={() => handleOpenForm(v)} className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                  <Edit2 size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-y-5 gap-x-4 text-lg">
            <InfoField label="סוג רכב" value={v.vehicle_type || '—'} />
            <InfoField label='ק"מ' value={`${(v.odometer || 0).toLocaleString()}`} />
            <InfoField label="חברה" value={v.company_name || '—'} />
            <InfoField label="נהג משויך" value={getDriverName(v.assigned_driver_id)} />
          </div>

          {/* Driver quick actions */}
          {driver && (
            <div className="flex gap-2 mt-4">
              {driver.phone && (
                <a href={`tel:${driver.phone}`} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 text-primary font-medium text-sm">
                  <Phone size={16} /> {driver.phone}
                </a>
              )}
            </div>
          )}
        </div>

        {/* Expiry Dates */}
        <div className="card-elevated mb-4">
          <h2 className="text-lg font-bold mb-4">תוקף מסמכים</h2>
          <div className="space-y-3">
            <ExpiryRow label="טסט" date={v.test_expiry} daysLeft={testDays} colorCls={expiryColor(testDays)} />
            <ExpiryRow label="ביטוח חובה" date={v.insurance_expiry} daysLeft={insDays} colorCls={expiryColor(insDays)} />
            <ExpiryRow label="ביטוח מקיף" date={v.comprehensive_insurance_expiry} daysLeft={compDays} colorCls={expiryColor(compDays)} />
          </div>
        </div>

        {/* Notes */}
        {v.notes && (
          <div className="card-elevated">
            <h2 className="text-lg font-bold mb-2">הערות</h2>
            <p className="text-muted-foreground">{v.notes}</p>
          </div>
        )}

        {/* Delete */}
        {isManager && (
          <button onClick={() => handleDelete(v.id)} className="w-full mt-4 py-4 rounded-xl border-2 border-destructive/30 text-destructive font-bold text-lg flex items-center justify-center gap-2 hover:bg-destructive/5 transition-colors">
            <Trash2 size={20} /> מחק רכב
          </button>
        )}
      </div>
    );
  }

  // === LIST VIEW ===
  const statusCounts = {
    all: vehicles.length,
    active: vehicles.filter(v => v.status === 'active').length,
    in_service: vehicles.filter(v => v.status === 'in_service').length,
    out_of_service: vehicles.filter(v => v.status === 'out_of_service').length,
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h1 className="page-header !mb-0 flex items-center gap-3"><Car size={28} /> ניהול רכבים</h1>
        {isManager && (
          <button onClick={() => handleOpenForm()} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-lg font-bold min-h-[48px]">
            <Plus size={22} /> רכב חדש
          </button>
        )}
      </div>

      <div className="relative mb-4">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="חיפוש לפי מספר, יצרן או דגם..."
          className="w-full pr-12 p-4 text-lg rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none" />
      </div>

      {/* Advanced Filters */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {user?.role === 'super_admin' && companies.length > 1 && (
          <select value={filterCompany} onChange={e => setFilterCompany(e.target.value)}
            className="p-3 text-base rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none col-span-2">
            <option value="">כל החברות</option>
            {companies.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
        <select value={filterDriver} onChange={e => setFilterDriver(e.target.value)}
          className="p-3 text-base rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none col-span-2">
          <option value="">כל הנהגים</option>
          {drivers.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
        </select>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {([
          { key: 'all', label: 'הכל' },
          { key: 'active', label: 'פעיל' },
          { key: 'in_service', label: 'בטיפול' },
          { key: 'out_of_service', label: 'לא פעיל' },
        ] as const).map(f => (
          <button key={f.key} onClick={() => setStatusFilter(f.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${statusFilter === f.key ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
            {f.label} ({statusCounts[f.key]})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">טוען רכבים...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Car size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-xl">אין רכבים</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(v => {
            const sl = statusLabel(v.status);
            return (
              <button key={v.id} onClick={() => handleViewDetail(v)} className="card-elevated w-full text-right hover:shadow-lg transition-shadow">
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
      )}
    </div>
  );
}

// === Helper Components ===
function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-muted-foreground text-sm">{label}</span>
      <p className="font-bold">{value}</p>
    </div>
  );
}

function ExpiryRow({ label, date, daysLeft, colorCls }: { label: string; date: string | null; daysLeft: number | null; colorCls: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="font-medium">{label}</span>
      {date ? (
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{new Date(date).toLocaleDateString('he-IL')}</span>
          <span className={`text-sm ${colorCls}`}>
            {daysLeft !== null && (daysLeft <= 0 ? 'פג תוקף!' : `${daysLeft} ימים`)}
          </span>
        </div>
      ) : (
        <span className="text-sm text-muted-foreground">לא הוגדר</span>
      )}
    </div>
  );
}

// === Vehicle Form (Add / Edit) ===
function VehicleForm({ vehicle, drivers, onDone, onBack, user }: {
  vehicle: VehicleRow | null;
  drivers: DriverRow[];
  onDone: () => void;
  onBack: () => void;
  user: any;
}) {
  const isEdit = !!vehicle;
  const [licensePlate, setLicensePlate] = useState(vehicle?.license_plate || '');
  const [manufacturer, setManufacturer] = useState(vehicle?.manufacturer || '');
  const [model, setModel] = useState(vehicle?.model || '');
  const [year, setYear] = useState(vehicle?.year?.toString() || new Date().getFullYear().toString());
  const [vehicleType, setVehicleType] = useState(vehicle?.vehicle_type || '');
  const [status, setStatus] = useState(vehicle?.status || 'active');
  const [odometer, setOdometer] = useState(vehicle?.odometer?.toString() || '');
  const [assignedDriver, setAssignedDriver] = useState(vehicle?.assigned_driver_id || '');
  const [testExpiry, setTestExpiry] = useState(vehicle?.test_expiry || '');
  const [insuranceExpiry, setInsuranceExpiry] = useState(vehicle?.insurance_expiry || '');
  const [compInsExpiry, setCompInsExpiry] = useState(vehicle?.comprehensive_insurance_expiry || '');
  const [notes, setNotes] = useState(vehicle?.notes || '');
  const [loading, setLoading] = useState(false);

  const isValid = licensePlate && manufacturer && model;
  const inputClass = "w-full p-4 text-lg rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none";

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);

    const payload = {
      license_plate: licensePlate,
      manufacturer,
      model,
      year: parseInt(year) || null,
      vehicle_type: vehicleType,
      status,
      odometer: parseInt(odometer) || 0,
      assigned_driver_id: assignedDriver || null,
      test_expiry: testExpiry || null,
      insurance_expiry: insuranceExpiry || null,
      comprehensive_insurance_expiry: compInsExpiry || null,
      notes,
    };

    let error;
    if (isEdit) {
      ({ error } = await supabase.from('vehicles').update(payload).eq('id', vehicle!.id));
    } else {
      ({ error } = await supabase.from('vehicles').insert({
        ...payload,
        company_name: user?.company_name || '',
        created_by: user?.id,
      }));
    }

    setLoading(false);
    if (error) {
      toast.error(isEdit ? 'שגיאה בעדכון הרכב' : 'שגיאה בהוספת הרכב');
      console.error(error);
    } else {
      toast.success(isEdit ? 'הרכב עודכן בהצלחה' : 'הרכב נוסף בהצלחה');
      onDone();
    }
  };

  return (
    <div className="animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-primary text-lg font-medium mb-4 min-h-[48px]">
        <ArrowRight size={20} /> חזרה
      </button>
      <h1 className="text-2xl font-bold mb-6">{isEdit ? 'עריכת רכב' : 'הוספת רכב חדש'}</h1>
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
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-lg font-medium mb-2">סטטוס</label>
            <select value={status} onChange={e => setStatus(e.target.value)} className={inputClass}>
              <option value="active">פעיל</option>
              <option value="in_service">בטיפול</option>
              <option value="out_of_service">לא פעיל</option>
            </select>
          </div>
          <div>
            <label className="block text-lg font-medium mb-2">ק"מ נוכחי</label>
            <input type="number" value={odometer} onChange={e => setOdometer(e.target.value)} placeholder="0" className={inputClass} />
          </div>
        </div>
        <div>
          <label className="block text-lg font-medium mb-2">נהג משויך</label>
          <select value={assignedDriver} onChange={e => setAssignedDriver(e.target.value)} className={inputClass}>
            <option value="">ללא שיוך</option>
            {drivers.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-lg font-medium mb-2">תוקף טסט</label>
            <input type="date" value={testExpiry} onChange={e => setTestExpiry(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-lg font-medium mb-2">ביטוח חובה</label>
            <input type="date" value={insuranceExpiry} onChange={e => setInsuranceExpiry(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-lg font-medium mb-2">ביטוח מקיף</label>
            <input type="date" value={compInsExpiry} onChange={e => setCompInsExpiry(e.target.value)} className={inputClass} />
          </div>
        </div>
        <div>
          <label className="block text-lg font-medium mb-2">הערות</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="הערות..." className={`${inputClass} resize-none`} />
        </div>
        <button onClick={handleSubmit} disabled={!isValid || loading}
          className={`w-full py-5 rounded-xl text-xl font-bold transition-colors ${isValid && !loading ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}>
          {loading ? 'שומר...' : isEdit ? '💾 עדכן רכב' : '💾 שמור רכב'}
        </button>
      </div>
    </div>
  );
}
