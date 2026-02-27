import { useState, useRef, useEffect } from 'react';
import { AlertTriangle, Plus, ArrowRight, Camera, X, Search } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AccidentRow {
  id: string;
  date: string;
  vehicle_plate: string;
  driver_name: string;
  location: string;
  description: string;
  has_insurance: boolean;
  third_party: boolean;
  estimated_cost: number;
  status: string;
  notes: string;
}

const statusLabels: Record<string, { text: string; cls: string }> = {
  open: { text: 'פתוח', cls: 'status-urgent' },
  in_progress: { text: 'בטיפול', cls: 'status-pending' },
  closed: { text: 'סגור', cls: 'status-active' },
};

export default function Accidents() {
  const { user } = useAuth();
  const [accidents, setAccidents] = useState<AccidentRow[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');

  const loadAccidents = async () => {
    const { data } = await supabase.from('accidents').select('*').order('created_at', { ascending: false });
    if (data) setAccidents(data as AccidentRow[]);
  };

  useEffect(() => { loadAccidents(); }, []);

  const filtered = accidents.filter(a =>
    a.driver_name?.includes(search) || a.vehicle_plate?.includes(search) || a.description?.includes(search)
  );

  if (showForm) {
    return <AccidentForm onDone={() => { setShowForm(false); loadAccidents(); }} />;
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h1 className="page-header mb-0">תאונות ואירועים</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-destructive text-destructive-foreground text-lg font-bold min-h-[48px]">
          <Plus size={22} />
          דיווח תאונה
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="חיפוש..." className="w-full pr-12 p-4 text-lg rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none" />
      </div>

      <div className="space-y-3">
        {filtered.map(a => {
          const st = statusLabels[a.status] || statusLabels.open;
          return (
            <div key={a.id} className="card-elevated">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle size={28} className="text-destructive" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xl font-bold">תאונה - {a.vehicle_plate}</p>
                    <span className={`status-badge ${st.cls}`}>{st.text}</span>
                  </div>
                  <p className="text-lg">{a.description}</p>
                  <div className="grid grid-cols-2 gap-2 mt-3 text-muted-foreground">
                    <span>📅 {new Date(a.date).toLocaleDateString('he-IL')}</span>
                    <span>👤 {a.driver_name}</span>
                    <span>📍 {a.location}</span>
                    <span>💰 עלות משוערת: ₪{(a.estimated_cost || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex gap-3 mt-3">
                    {a.has_insurance && <span className="status-badge status-active">ביטוח ✓</span>}
                    {a.third_party && <span className="status-badge status-pending">צד ג׳</span>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <AlertTriangle size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-xl">אין תאונות רשומות</p>
        </div>
      )}
    </div>
  );
}

function AccidentForm({ onDone }: { onDone: () => void }) {
  const { user } = useAuth();
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [driverName, setDriverName] = useState(user?.full_name || '');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [hasInsurance, setHasInsurance] = useState(false);
  const [thirdParty, setThirdParty] = useState(false);
  const [estimatedCost, setEstimatedCost] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Load vehicles from DB
  const [vehicles, setVehicles] = useState<{ license_plate: string; manufacturer: string; model: string }[]>([]);
  useEffect(() => {
    supabase.from('vehicles').select('license_plate, manufacturer, model').then(({ data }) => {
      if (data) setVehicles(data);
    });
  }, []);

  const isValid = vehiclePlate && driverName && description;

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    const { error } = await supabase.from('accidents').insert({
      vehicle_plate: vehiclePlate,
      driver_name: driverName,
      location,
      description,
      has_insurance: hasInsurance,
      third_party: thirdParty,
      estimated_cost: parseFloat(estimatedCost) || 0,
      notes,
      company_name: user?.company_name || '',
      created_by: user?.id,
    });
    setLoading(false);
    if (error) {
      toast.error('שגיאה בשמירת הדיווח');
      console.error(error);
    } else {
      toast.success('דיווח התאונה נשלח בהצלחה');
      onDone();
    }
  };

  const inputClass = "w-full p-4 text-lg rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none";

  return (
    <div className="animate-fade-in">
      <button onClick={onDone} className="flex items-center gap-2 text-primary text-lg font-medium mb-4 min-h-[48px]">
        <ArrowRight size={20} />
        חזרה לרשימת תאונות
      </button>

      <h1 className="text-2xl font-bold mb-6">דיווח תאונה</h1>

      <div className="space-y-5">
        <div>
          <label className="block text-lg font-medium mb-2">מספר רכב</label>
          <select value={vehiclePlate} onChange={e => setVehiclePlate(e.target.value)} className={inputClass}>
            <option value="">בחר רכב...</option>
            {vehicles.map(v => (
              <option key={v.license_plate} value={v.license_plate}>{v.license_plate} - {v.manufacturer} {v.model}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-lg font-medium mb-2">שם הנהג</label>
          <input type="text" value={driverName} onChange={e => setDriverName(e.target.value)} placeholder="שם הנהג..." className={inputClass} />
        </div>

        <div>
          <label className="block text-lg font-medium mb-2">מיקום התאונה</label>
          <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="כתובת / צומת / כביש..." className={inputClass} />
        </div>

        <div>
          <label className="block text-lg font-medium mb-2">תיאור האירוע</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="תאר את האירוע בפירוט..." className={`${inputClass} resize-none`} />
        </div>

        <div>
          <label className="block text-lg font-medium mb-2">עלות משוערת (₪)</label>
          <input type="number" value={estimatedCost} onChange={e => setEstimatedCost(e.target.value)} placeholder="0" className={inputClass} />
        </div>

        <div className="flex gap-4">
          <label className="flex items-center gap-3 flex-1 p-4 rounded-xl border-2 border-input cursor-pointer">
            <input type="checkbox" checked={hasInsurance} onChange={e => setHasInsurance(e.target.checked)} className="w-6 h-6 rounded" />
            <span className="text-lg font-medium">יש ביטוח</span>
          </label>
          <label className="flex items-center gap-3 flex-1 p-4 rounded-xl border-2 border-input cursor-pointer">
            <input type="checkbox" checked={thirdParty} onChange={e => setThirdParty(e.target.checked)} className="w-6 h-6 rounded" />
            <span className="text-lg font-medium">צד ג׳</span>
          </label>
        </div>

        <div>
          <label className="block text-lg font-medium mb-2">הערות</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="הערות נוספות..." className={`${inputClass} resize-none`} />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!isValid || loading}
          className={`w-full py-5 rounded-xl text-xl font-bold transition-colors ${isValid && !loading ? 'bg-destructive text-destructive-foreground' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}
        >
          {loading ? 'שולח...' : '🚨 שלח דיווח תאונה'}
        </button>
      </div>
    </div>
  );
}
