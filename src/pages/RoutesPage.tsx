import { useState, useEffect } from 'react';
import { Route as RouteIcon, Search, ArrowRight, MapPin, Clock, Plus, Edit2, Trash2, UserRoundCog, Download } from 'lucide-react';
import { exportToCsv } from '@/utils/exportCsv';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCompanyFilter, applyCompanyScope } from '@/hooks/useCompanyFilter';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface RouteRow {
  id: string;
  name: string;
  origin: string;
  destination: string;
  stops: string[];
  distance_km: number;
  start_time: string;
  end_time: string;
  days_of_week: string[];
  service_type: string;
  customer_name: string;
  driver_name: string;
  vehicle_plate: string;
  status: string;
  notes: string;
  execution_date: string | null;
}

function isDatePassed(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return d < today;
}

const serviceTypes: Record<string, string> = { regular: 'קו קבוע', charter: 'שכר', school: 'הסעות תלמידים', tourism: 'תיירות', delivery: 'משלוחים', other: 'אחר' };
const daysOptions = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

type ViewMode = 'list' | 'detail' | 'form';

export default function RoutesPage() {
  const { user } = useAuth();
  const companyFilter = useCompanyFilter();
  const [routes, setRoutes] = useState<RouteRow[]>([]);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selected, setSelected] = useState<RouteRow | null>(null);
  const [editItem, setEditItem] = useState<RouteRow | null>(null);
  const [loading, setLoading] = useState(true);

  // Change driver dialog state
  const [changeDriverRoute, setChangeDriverRoute] = useState<RouteRow | null>(null);
  const [allDrivers, setAllDrivers] = useState<{ full_name: string }[]>([]);
  const [newDriverName, setNewDriverName] = useState('');
  const [changingDriver, setChangingDriver] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const { data } = await applyCompanyScope(supabase.from('routes').select('*'), companyFilter).order('created_at', { ascending: false });
    if (data) setRoutes(data as RouteRow[]);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (changeDriverRoute) {
      supabase.from('drivers').select('full_name').then(({ data }) => { if (data) setAllDrivers(data); });
      setNewDriverName(changeDriverRoute.driver_name || '');
    }
  }, [changeDriverRoute]);

  const handleChangeDriver = async () => {
    if (!changeDriverRoute) return;
    setChangingDriver(true);
    const { error } = await supabase.from('routes').update({ driver_name: newDriverName }).eq('id', changeDriverRoute.id);
    setChangingDriver(false);
    if (error) { toast.error('שגיאה בעדכון נהג'); console.error(error); }
    else { toast.success('הנהג עודכן בהצלחה'); setChangeDriverRoute(null); loadData(); }
  };

  const isManager = user?.role === 'fleet_manager' || user?.role === 'super_admin';
  const filtered = routes.filter(r => !search || r.name?.includes(search) || r.origin?.includes(search) || r.destination?.includes(search));

  if (viewMode === 'form') {
    return <RouteForm route={editItem} onDone={() => { setViewMode('list'); setEditItem(null); loadData(); }} onBack={() => { setViewMode('list'); setEditItem(null); }} user={user} />;
  }

  if (viewMode === 'detail' && selected) {
    const r = selected;
    return (
      <div className="animate-fade-in">
        <button onClick={() => { setViewMode('list'); setSelected(null); }} className="flex items-center gap-2 text-primary text-lg font-medium mb-4 min-h-[48px]"><ArrowRight size={20} /> חזרה</button>
        <div className="card-elevated">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">{r.name}</h1>
            <div className="flex items-center gap-2">
              <span className={`status-badge ${r.status === 'active' ? 'status-active' : 'status-inactive'}`}>{r.status === 'active' ? 'פעיל' : 'לא פעיל'}</span>
              {isManager && !isDatePassed(r.execution_date) && <button onClick={() => { setEditItem(r); setViewMode('form'); }} className="p-2 rounded-xl bg-primary/10 text-primary"><Edit2 size={18} /></button>}
            </div>
          </div>
          <div className="bg-muted rounded-2xl p-4 mb-4">
            <div className="flex items-start gap-3 mb-3"><MapPin size={20} className="text-primary mt-1 flex-shrink-0" /><div><span className="text-sm text-muted-foreground">מוצא</span><p className="font-bold text-lg">{r.origin}</p></div></div>
            {r.stops?.length > 0 && <div className="mr-2 pr-6 border-r-2 border-dashed border-muted-foreground/30 py-2 space-y-1">{r.stops.map((s, i) => <p key={i} className="text-muted-foreground">📍 {s}</p>)}</div>}
            <div className="flex items-start gap-3 mt-3"><MapPin size={20} className="text-destructive mt-1 flex-shrink-0" /><div><span className="text-sm text-muted-foreground">יעד</span><p className="font-bold text-lg">{r.destination}</p></div></div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-lg">
            <div><span className="text-muted-foreground text-sm">סוג שירות</span><p className="font-bold">{serviceTypes[r.service_type] || r.service_type}</p></div>
            <div><span className="text-muted-foreground text-sm">מרחק</span><p className="font-bold">{r.distance_km} ק"מ</p></div>
            <div><span className="text-muted-foreground text-sm">שעת יציאה</span><p className="font-bold">{r.start_time}</p></div>
            <div><span className="text-muted-foreground text-sm">שעת סיום</span><p className="font-bold">{r.end_time}</p></div>
            {r.days_of_week?.length > 0 && <div className="col-span-2"><span className="text-muted-foreground text-sm">ימי פעילות</span><p className="font-bold">{r.days_of_week.join(', ')}</p></div>}
            {r.customer_name && <div><span className="text-muted-foreground text-sm">לקוח</span><p className="font-bold">{r.customer_name}</p></div>}
            {r.driver_name && <div><span className="text-muted-foreground text-sm">נהג</span><p className="font-bold">{r.driver_name}</p></div>}
            {r.vehicle_plate && <div><span className="text-muted-foreground text-sm">רכב</span><p className="font-bold">{r.vehicle_plate}</p></div>}
          </div>
          {r.notes && <p className="mt-4 p-3 bg-muted rounded-xl text-muted-foreground">{r.notes}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h1 className="page-header !mb-0 flex items-center gap-3"><RouteIcon size={28} /> מסלולים</h1>
        {isManager && <button onClick={() => { setEditItem(null); setViewMode('form'); }} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-lg font-bold min-h-[48px]"><Plus size={22} /> מסלול חדש</button>}
      </div>
      <div className="relative mb-5">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="חיפוש..." className="w-full pr-12 p-4 text-lg rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none" />
      </div>
      {loading ? (
        <div className="text-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground"><RouteIcon size={48} className="mx-auto mb-4 opacity-50" /><p className="text-xl">אין מסלולים</p></div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => (
            <div key={r.id} className="card-elevated hover:shadow-lg transition-shadow">
              <button onClick={() => { setSelected(r); setViewMode('detail'); }} className="w-full text-right">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0"><RouteIcon size={28} className="text-primary" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xl font-bold">{r.name}</p>
                    <p className="text-muted-foreground">{r.origin} → {r.destination}</p>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock size={14} />{r.start_time}</span>
                      <span>{serviceTypes[r.service_type] || r.service_type}</span>
                      {r.distance_km > 0 && <span>{r.distance_km} ק"מ</span>}
                    </div>
                  </div>
                  <span className={`status-badge ${r.status === 'active' ? 'status-active' : 'status-inactive'}`}>{r.status === 'active' ? 'פעיל' : 'לא פעיל'}</span>
                </div>
              </button>
              {isManager && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                  <button onClick={() => setChangeDriverRoute(r)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-accent/50 text-accent-foreground font-bold text-sm min-h-[44px]">
                    <UserRoundCog size={16} /> שינוי נהג
                  </button>
                  {!isDatePassed(r.execution_date) && (
                    <button onClick={() => { setEditItem(r); setViewMode('form'); }} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary/10 text-primary font-bold text-sm min-h-[44px]">
                      <Edit2 size={16} /> תיקון
                    </button>
                  )}
                  {!isDatePassed(r.execution_date) && (
                    <button onClick={async () => { if (!confirm('למחוק מסלול זה?')) return; await supabase.from('routes').delete().eq('id', r.id); toast.success('נמחק'); loadData(); }}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-destructive/10 text-destructive font-bold text-sm min-h-[44px]">
                      <Trash2 size={16} /> מחיקה
                    </button>
                  )}
                  {isDatePassed(r.execution_date) && r.execution_date && (
                    <span className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-muted text-muted-foreground text-sm min-h-[44px]">
                      🔒 בוצע ב-{r.execution_date}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Change Driver Dialog */}
      <Dialog open={!!changeDriverRoute} onOpenChange={(open) => { if (!open) setChangeDriverRoute(null); }}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl">שינוי נהג למסלול</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-xl">
              <p className="text-sm text-muted-foreground">מסלול</p>
              <p className="font-bold text-lg">{changeDriverRoute?.name}</p>
              <p className="text-muted-foreground">{changeDriverRoute?.origin} → {changeDriverRoute?.destination}</p>
            </div>
            {changeDriverRoute?.driver_name && (
              <div className="p-3 bg-muted rounded-xl">
                <p className="text-sm text-muted-foreground">נהג נוכחי</p>
                <p className="font-bold">{changeDriverRoute.driver_name}</p>
              </div>
            )}
            <div>
              <label className="block text-lg font-medium mb-2">בחר נהג חדש</label>
              <select value={newDriverName} onChange={e => setNewDriverName(e.target.value)}
                className="w-full p-4 text-lg rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none">
                <option value="">ללא נהג</option>
                {allDrivers.map(d => <option key={d.full_name} value={d.full_name}>{d.full_name}</option>)}
              </select>
            </div>
            <button onClick={handleChangeDriver} disabled={changingDriver}
              className="w-full py-4 rounded-xl text-lg font-bold bg-primary text-primary-foreground disabled:opacity-50">
              {changingDriver ? 'מעדכן...' : '✅ עדכן נהג'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RouteForm({ route, onDone, onBack, user }: { route: RouteRow | null; onDone: () => void; onBack: () => void; user: any }) {
  const isEdit = !!route;
  const [name, setName] = useState(route?.name || '');
  const [origin, setOrigin] = useState(route?.origin || '');
  const [destination, setDestination] = useState(route?.destination || '');
  const [stopsText, setStopsText] = useState(route?.stops?.join(', ') || '');
  const [distanceKm, setDistanceKm] = useState(route?.distance_km?.toString() || '');
  const [startTime, setStartTime] = useState(route?.start_time || '');
  const [endTime, setEndTime] = useState(route?.end_time || '');
  const [selectedDays, setSelectedDays] = useState<string[]>(route?.days_of_week || []);
  const [serviceType, setServiceType] = useState(route?.service_type || '');
  const [customerName, setCustomerName] = useState(route?.customer_name || '');
  const [driverName, setDriverName] = useState(route?.driver_name || '');
  const [vehiclePlate, setVehiclePlate] = useState(route?.vehicle_plate || '');
  const [status, setStatus] = useState(route?.status || 'active');
  const [notes, setNotes] = useState(route?.notes || '');
  const [executionDate, setExecutionDate] = useState(route?.execution_date || '');
  const [loading, setLoading] = useState(false);

  const [drivers, setDrivers] = useState<{ full_name: string }[]>([]);
  const [vehicles, setVehicles] = useState<{ license_plate: string; manufacturer: string; model: string }[]>([]);

  useEffect(() => {
    Promise.all([supabase.from('drivers').select('full_name'), supabase.from('vehicles').select('license_plate, manufacturer, model')]).then(([d, v]) => {
      if (d.data) setDrivers(d.data);
      if (v.data) setVehicles(v.data);
    });
  }, []);

  const toggleDay = (day: string) => setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  const isValid = name && origin && destination;
  const inputClass = "w-full p-4 text-lg rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none";

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    const payload = { name, origin, destination, stops: stopsText ? stopsText.split(',').map(s => s.trim()) : [], distance_km: parseFloat(distanceKm) || 0, start_time: startTime, end_time: endTime, days_of_week: selectedDays, service_type: serviceType, customer_name: customerName, driver_name: driverName, vehicle_plate: vehiclePlate, status, notes, execution_date: executionDate || null };
    let error;
    if (isEdit) { ({ error } = await supabase.from('routes').update(payload).eq('id', route!.id)); }
    else { ({ error } = await supabase.from('routes').insert({ ...payload, company_name: user?.company_name || '', created_by: user?.id })); }
    setLoading(false);
    if (error) { toast.error('שגיאה'); console.error(error); } else { toast.success(isEdit ? 'עודכן' : 'נוסף'); onDone(); }
  };

  return (
    <div className="animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-primary text-lg font-medium mb-4 min-h-[48px]"><ArrowRight size={20} /> חזרה</button>
      <h1 className="text-2xl font-bold mb-6">{isEdit ? 'עריכת מסלול' : 'מסלול חדש'}</h1>
      <div className="space-y-5">
        <div><label className="block text-lg font-medium mb-2">שם מסלול *</label><input value={name} onChange={e => setName(e.target.value)} className={inputClass} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-lg font-medium mb-2">מוצא *</label><input value={origin} onChange={e => setOrigin(e.target.value)} className={inputClass} /></div>
          <div><label className="block text-lg font-medium mb-2">יעד *</label><input value={destination} onChange={e => setDestination(e.target.value)} className={inputClass} /></div>
        </div>
        <div><label className="block text-lg font-medium mb-2">תחנות ביניים (מופרדות בפסיק)</label><input value={stopsText} onChange={e => setStopsText(e.target.value)} placeholder="תחנה 1, תחנה 2..." className={inputClass} /></div>
        <div className="grid grid-cols-3 gap-4">
          <div><label className="block text-lg font-medium mb-2">מרחק (ק"מ)</label><input type="number" value={distanceKm} onChange={e => setDistanceKm(e.target.value)} className={inputClass} /></div>
          <div><label className="block text-lg font-medium mb-2">שעת יציאה</label><input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className={inputClass} /></div>
          <div><label className="block text-lg font-medium mb-2">שעת סיום</label><input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className={inputClass} /></div>
        </div>
        <div><label className="block text-lg font-medium mb-2">ימי פעילות</label>
          <div className="flex gap-2 flex-wrap">{daysOptions.map(day => (
            <button key={day} type="button" onClick={() => toggleDay(day)}
              className={`px-3 py-2 rounded-xl text-sm font-medium border-2 transition-all ${selectedDays.includes(day) ? 'border-primary bg-primary/10 text-primary' : 'border-transparent bg-muted text-muted-foreground'}`}>{day}</button>
          ))}</div>
        </div>
        <div><label className="block text-lg font-medium mb-2">סוג שירות</label>
          <select value={serviceType} onChange={e => setServiceType(e.target.value)} className={inputClass}>
            <option value="">בחר...</option>{Object.entries(serviceTypes).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-lg font-medium mb-2">נהג</label>
            <select value={driverName} onChange={e => setDriverName(e.target.value)} className={inputClass}>
              <option value="">בחר...</option>{drivers.map(d => <option key={d.full_name} value={d.full_name}>{d.full_name}</option>)}
            </select></div>
          <div><label className="block text-lg font-medium mb-2">רכב</label>
            <select value={vehiclePlate} onChange={e => setVehiclePlate(e.target.value)} className={inputClass}>
              <option value="">בחר...</option>{vehicles.map(v => <option key={v.license_plate} value={v.license_plate}>{v.license_plate}</option>)}
            </select></div>
        </div>
        <div><label className="block text-lg font-medium mb-2">לקוח</label><input value={customerName} onChange={e => setCustomerName(e.target.value)} className={inputClass} /></div>
        <div><label className="block text-lg font-medium mb-2">תאריך ביצוע</label><input type="date" value={executionDate} onChange={e => setExecutionDate(e.target.value)} className={inputClass} /></div>
        <div><label className="block text-lg font-medium mb-2">הערות</label><textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className={`${inputClass} resize-none`} /></div>
        <button onClick={handleSubmit} disabled={!isValid || loading}
          className={`w-full py-5 rounded-xl text-xl font-bold transition-colors ${isValid && !loading ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}>
          {loading ? 'שומר...' : isEdit ? '💾 עדכן' : '💾 שמור'}
        </button>
      </div>
    </div>
  );
}
