import { useState, useEffect } from 'react';
import { Wrench, Search, AlertTriangle, Plus, ArrowRight, Edit2, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import MultiImageUpload from '@/components/MultiImageUpload';

interface FaultRow {
  id: string;
  serial_id: string;
  date: string;
  driver_name: string;
  vehicle_plate: string;
  fault_type: string;
  description: string;
  urgency: string;
  status: string;
  notes: string;
  images: string;
  created_at: string;
}

const urgencyLabels: Record<string, { text: string; cls: string }> = {
  normal: { text: 'רגיל', cls: 'status-active' },
  urgent: { text: 'דחוף', cls: 'status-pending' },
  critical: { text: 'מיידי', cls: 'status-urgent' },
};

const statusLabels: Record<string, { text: string; cls: string }> = {
  new: { text: 'חדש', cls: 'status-new' },
  open: { text: 'פתוח', cls: 'status-new' },
  in_progress: { text: 'בטיפול', cls: 'status-pending' },
  resolved: { text: 'טופל', cls: 'status-active' },
  closed: { text: 'סגור', cls: 'status-inactive' },
};

const faultTypes = ['מנוע', 'בלמים', 'צמיגים', 'חשמל', 'מיזוג', 'פחחות', 'תאורה', 'אחר'];

type ViewMode = 'list' | 'detail' | 'form';

function parseImages(images: string | null): string[] {
  if (!images) return [];
  try {
    const parsed = JSON.parse(images);
    return Array.isArray(parsed) ? parsed : [images];
  } catch {
    return images ? [images] : [];
  }
}

export default function Faults() {
  const { user } = useAuth();
  const [faults, setFaults] = useState<FaultRow[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterUrgency, setFilterUrgency] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedFault, setSelectedFault] = useState<FaultRow | null>(null);
  const [editFault, setEditFault] = useState<FaultRow | null>(null);
  const [loading, setLoading] = useState(true);

  const loadFaults = async () => {
    setLoading(true);
    const { data } = await supabase.from('faults').select('*').order('created_at', { ascending: false });
    if (data) setFaults(data as FaultRow[]);
    setLoading(false);
  };

  useEffect(() => { loadFaults(); }, []);

  const isManager = user?.role === 'fleet_manager' || user?.role === 'super_admin';

  const filtered = faults.filter(f => {
    const matchSearch = !search || f.driver_name?.includes(search) || f.vehicle_plate?.includes(search) || f.fault_type?.includes(search) || f.description?.includes(search);
    const matchStatus = !filterStatus || f.status === filterStatus;
    const matchUrgency = !filterUrgency || f.urgency === filterUrgency;
    return matchSearch && matchStatus && matchUrgency;
  });

  const handleStatusChange = async (id: string, newStatus: string) => {
    const { error } = await supabase.from('faults').update({ status: newStatus }).eq('id', id);
    if (error) { toast.error('שגיאה בעדכון'); } else { toast.success('סטטוס עודכן'); loadFaults(); }
  };

  if (viewMode === 'form') {
    return <FaultForm fault={editFault} onDone={() => { setViewMode('list'); setEditFault(null); loadFaults(); }} onBack={() => { setViewMode('list'); setEditFault(null); }} user={user} />;
  }

  if (viewMode === 'detail' && selectedFault) {
    const f = selectedFault;
    const urg = urgencyLabels[f.urgency] || urgencyLabels.normal;
    const st = statusLabels[f.status] || statusLabels.new;
    const isClosed = f.status === 'closed' || f.status === 'resolved';
    const faultImages = parseImages(f.images);

    return (
      <div className="animate-fade-in">
        <button onClick={() => { setViewMode('list'); setSelectedFault(null); }} className="flex items-center gap-2 text-primary text-lg font-medium mb-4 min-h-[48px]">
          <ArrowRight size={20} /> חזרה לרשימה
        </button>
        <div className="card-elevated mb-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">{f.fault_type}</h1>
            <div className="flex items-center gap-2">
              <span className={`status-badge ${urg.cls}`}>{urg.text}</span>
              <span className={`status-badge ${st.cls}`}>{st.text}</span>
              {isManager && !isClosed && (
                <button onClick={() => { setEditFault(f); setViewMode('form'); }} className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Edit2 size={18} />
                </button>
              )}
            </div>
          </div>
          <p className="text-lg mb-4">{f.description}</p>
          <div className="grid grid-cols-2 gap-4 text-lg">
            <div><span className="text-muted-foreground text-sm">רכב</span><p className="font-bold">{f.vehicle_plate}</p></div>
            <div><span className="text-muted-foreground text-sm">נהג</span><p className="font-bold">{f.driver_name}</p></div>
            <div><span className="text-muted-foreground text-sm">תאריך</span><p className="font-bold">{f.date ? new Date(f.date).toLocaleDateString('he-IL') : '—'}</p></div>
            {f.serial_id && <div><span className="text-muted-foreground text-sm">מספר סידורי</span><p className="font-bold">{f.serial_id}</p></div>}
          </div>
          {f.notes && <p className="mt-4 p-3 bg-muted rounded-xl text-muted-foreground">{f.notes}</p>}

          {/* Images */}
          {faultImages.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">תמונות</p>
              <div className="grid grid-cols-2 gap-3">
                {faultImages.map((url, i) => (
                  <img key={i} src={url} alt={`תקלה ${i + 1}`} className="w-full rounded-xl max-h-48 object-cover" />
                ))}
              </div>
            </div>
          )}

          {isClosed && (
            <div className="mt-4 flex items-center gap-2 p-3 bg-muted rounded-xl text-muted-foreground">
              <Lock size={16} />
              <span className="text-sm">תקלה סגורה – לא ניתן לערוך</span>
            </div>
          )}
        </div>
        {isManager && (
          <div className="card-elevated">
            <h2 className="text-lg font-bold mb-3">שנה סטטוס</h2>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(statusLabels).map(([key, { text }]) => (
                <button key={key} onClick={() => { handleStatusChange(f.id, key); setSelectedFault({ ...f, status: key }); }}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${f.status === key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  {text}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h1 className="page-header !mb-0 flex items-center gap-3"><Wrench size={28} /> תקלות</h1>
        <button onClick={() => { setEditFault(null); setViewMode('form'); }} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-lg font-bold min-h-[48px]">
          <Plus size={22} /> תקלה חדשה
        </button>
      </div>
      <div className="relative mb-4">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="חיפוש..." className="w-full pr-12 p-4 text-lg rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none" />
      </div>
      <div className="flex gap-2 mb-3 flex-wrap">
        {Object.entries(urgencyLabels).map(([key, { text }]) => (
          <button key={key} onClick={() => setFilterUrgency(filterUrgency === key ? '' : key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filterUrgency === key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            {text}
          </button>
        ))}
      </div>
      <div className="flex gap-2 mb-5 flex-wrap">
        {(['', 'new', 'open', 'in_progress', 'resolved', 'closed'] as const).map(key => (
          <button key={key} onClick={() => setFilterStatus(filterStatus === key ? '' : key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filterStatus === key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            {key === '' ? 'הכל' : (statusLabels[key]?.text || key)}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="text-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground"><Wrench size={48} className="mx-auto mb-4 opacity-50" /><p className="text-xl">אין תקלות</p></div>
      ) : (
        <div className="space-y-3">
          {filtered.map(f => {
            const urg = urgencyLabels[f.urgency] || urgencyLabels.normal;
            const st = statusLabels[f.status] || statusLabels.new;
            return (
              <button key={f.id} onClick={() => { setSelectedFault(f); setViewMode('detail'); }} className="card-elevated w-full text-right hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${f.urgency === 'critical' ? 'bg-destructive/10' : f.urgency === 'urgent' ? 'bg-warning/10' : 'bg-primary/10'}`}>
                    {f.urgency === 'critical' ? <AlertTriangle size={28} className="text-destructive" /> : <Wrench size={28} className={f.urgency === 'urgent' ? 'text-warning' : 'text-primary'} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xl font-bold">{f.fault_type}</p>
                      <div className="flex gap-1.5">
                        <span className={`status-badge ${urg.cls}`}>{urg.text}</span>
                        <span className={`status-badge ${st.cls}`}>{st.text}</span>
                      </div>
                    </div>
                    <p className="text-muted-foreground line-clamp-1">{f.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                      <span>🚗 {f.vehicle_plate}</span>
                      <span>👤 {f.driver_name}</span>
                      <span>📅 {f.date ? new Date(f.date).toLocaleDateString('he-IL') : ''}</span>
                    </div>
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

function FaultForm({ fault, onDone, onBack, user }: { fault: FaultRow | null; onDone: () => void; onBack: () => void; user: any }) {
  const isEdit = !!fault;
  const [vehiclePlate, setVehiclePlate] = useState(fault?.vehicle_plate || '');
  const [driverName, setDriverName] = useState(fault?.driver_name || '');
  const [faultType, setFaultType] = useState(fault?.fault_type || '');
  const [description, setDescription] = useState(fault?.description || '');
  const [urgency, setUrgency] = useState(fault?.urgency || 'normal');
  const [notes, setNotes] = useState(fault?.notes || '');
  const [imageUrls, setImageUrls] = useState<string[]>(parseImages(fault?.images || ''));
  const [loading, setLoading] = useState(false);

  const [vehicles, setVehicles] = useState<{ license_plate: string; manufacturer: string; model: string }[]>([]);
  const [drivers, setDrivers] = useState<{ full_name: string }[]>([]);

  useEffect(() => {
    Promise.all([
      supabase.from('vehicles').select('license_plate, manufacturer, model'),
      supabase.from('drivers').select('full_name'),
    ]).then(([v, d]) => {
      if (v.data) setVehicles(v.data);
      if (d.data) setDrivers(d.data);
    });
  }, []);

  const isValid = vehiclePlate && faultType && description;
  const inputClass = "w-full p-4 text-lg rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none";

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    const payload = {
      vehicle_plate: vehiclePlate,
      driver_name: driverName,
      fault_type: faultType,
      description,
      urgency,
      notes,
      images: imageUrls.length > 0 ? JSON.stringify(imageUrls) : '',
    };
    let error;
    if (isEdit) {
      ({ error } = await supabase.from('faults').update(payload).eq('id', fault!.id));
    } else {
      const insertPayload = { ...payload, status: 'open', company_name: user?.company_name || '', created_by: user?.id };
      ({ error } = await supabase.from('faults').insert(insertPayload));
      if (!error && (urgency === 'urgent' || urgency === 'critical')) {
        supabase.functions.invoke('notify-accident-email', { body: { record: insertPayload, type: 'fault' } }).catch(console.error);
      }
    }
    setLoading(false);
    if (error) { toast.error('שגיאה בשמירה'); console.error(error); }
    else { toast.success(isEdit ? 'התקלה עודכנה' : 'התקלה נוספה'); onDone(); }
  };

  return (
    <div className="animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-primary text-lg font-medium mb-4 min-h-[48px]"><ArrowRight size={20} /> חזרה</button>
      <h1 className="text-2xl font-bold mb-6">{isEdit ? 'עריכת תקלה' : 'דיווח תקלה חדשה'}</h1>
      <div className="space-y-5">
        <div>
          <label className="block text-lg font-medium mb-2">רכב *</label>
          <select value={vehiclePlate} onChange={e => setVehiclePlate(e.target.value)} className={inputClass}>
            <option value="">בחר רכב...</option>
            {vehicles.map(v => <option key={v.license_plate} value={v.license_plate}>{v.license_plate} - {v.manufacturer} {v.model}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-lg font-medium mb-2">נהג</label>
          <select value={driverName} onChange={e => setDriverName(e.target.value)} className={inputClass}>
            <option value="">בחר נהג...</option>
            {drivers.map(d => <option key={d.full_name} value={d.full_name}>{d.full_name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-lg font-medium mb-2">סוג תקלה *</label>
          <select value={faultType} onChange={e => setFaultType(e.target.value)} className={inputClass}>
            <option value="">בחר סוג...</option>
            {faultTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-lg font-medium mb-2">תיאור *</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="תאר את התקלה..." className={`${inputClass} resize-none`} />
        </div>
        <div>
          <label className="block text-lg font-medium mb-2">דחיפות</label>
          <div className="flex gap-3">
            {Object.entries(urgencyLabels).map(([key, { text }]) => (
              <button key={key} type="button" onClick={() => setUrgency(key)}
                className={`flex-1 py-3 rounded-xl text-lg font-bold border-2 transition-colors ${urgency === key ? 'border-primary bg-primary/10 text-primary' : 'bg-muted text-muted-foreground border-transparent'}`}>
                {text}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-lg font-medium mb-2">הערות</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="הערות..." className={`${inputClass} resize-none`} />
        </div>

        {/* Image Upload */}
        <MultiImageUpload
          label="תמונות תקלה"
          imageUrls={imageUrls}
          onImagesChanged={setImageUrls}
          folder="faults"
          max={5}
        />

        <button onClick={handleSubmit} disabled={!isValid || loading}
          className={`w-full py-5 rounded-xl text-xl font-bold transition-colors ${isValid && !loading ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}>
          {loading ? 'שומר...' : isEdit ? '💾 עדכן תקלה' : '💾 שמור תקלה'}
        </button>
      </div>
    </div>
  );
}
