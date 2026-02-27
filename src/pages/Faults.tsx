import { useState, useEffect } from 'react';
import { Wrench, Search, AlertTriangle, Plus, Paperclip } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import FaultForm from '@/components/FaultForm';
import { Fault } from '@/data/demo-data';
import { toast } from 'sonner';

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
}

const urgencyLabels: Record<string, { text: string; cls: string }> = {
  normal: { text: 'רגיל', cls: 'status-active' },
  urgent: { text: 'דחוף', cls: 'status-pending' },
  critical: { text: 'מיידי', cls: 'status-urgent' },
};

export default function Faults() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [filterUrgency, setFilterUrgency] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [faults, setFaults] = useState<FaultRow[]>([]);

  const loadFaults = async () => {
    const { data } = await supabase.from('faults').select('*').order('created_at', { ascending: false });
    if (data) setFaults(data as FaultRow[]);
  };

  useEffect(() => { loadFaults(); }, []);

  const filtered = faults.filter(f => {
    const matchSearch = f.driver_name?.includes(search) || f.vehicle_plate?.includes(search) || f.fault_type?.includes(search);
    const matchUrgency = !filterUrgency || f.urgency === filterUrgency;
    return matchSearch && matchUrgency;
  });

  const handleNewFault = async (fault: Fault) => {
    const { error } = await supabase.from('faults').insert({
      serial_id: fault.id,
      driver_name: fault.driverName,
      vehicle_plate: fault.vehiclePlate,
      fault_type: fault.faultType,
      description: fault.description,
      urgency: fault.urgency,
      status: 'new',
      notes: fault.notes || '',
      company_name: user?.company_name || '',
      created_by: user?.id,
    });
    if (error) {
      toast.error('שגיאה בשמירת התקלה');
      console.error(error);
    } else {
      toast.success('התקלה נוספה בהצלחה');
      setShowForm(false);
      loadFaults();
    }
  };

  if (showForm) {
    return (
      <div className="animate-fade-in">
        <FaultForm onSubmit={handleNewFault} onCancel={() => setShowForm(false)} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h1 className="page-header mb-0">דיווח ומעקב תקלות</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-lg font-bold min-h-[48px]">
          <Plus size={22} />
          תקלה חדשה
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="חיפוש לפי נהג, רכב או סוג תקלה..." className="w-full pr-12 p-4 text-lg rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none" />
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        <button onClick={() => setFilterUrgency('')} className={`px-5 py-3 rounded-xl text-lg font-medium whitespace-nowrap transition-colors ${!filterUrgency ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
          הכל
        </button>
        {Object.entries(urgencyLabels).map(([key, { text }]) => (
          <button key={key} onClick={() => setFilterUrgency(filterUrgency === key ? '' : key)} className={`px-5 py-3 rounded-xl text-lg font-medium whitespace-nowrap transition-colors ${filterUrgency === key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            {text}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(f => {
          const urg = urgencyLabels[f.urgency] || urgencyLabels.normal;
          return (
            <div key={f.id} className="card-elevated">
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${f.urgency === 'critical' ? 'bg-destructive/10' : f.urgency === 'urgent' ? 'bg-warning/10' : 'bg-info/10'}`}>
                  {f.urgency === 'critical' ? <AlertTriangle size={28} className="text-destructive" /> : <Wrench size={28} className={f.urgency === 'urgent' ? 'text-warning' : 'text-info'} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xl font-bold">{f.fault_type}</p>
                    <span className={`status-badge ${urg.cls}`}>{urg.text}</span>
                  </div>
                  <p className="text-lg text-foreground">{f.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-muted-foreground">
                    <span>🚗 {f.vehicle_plate}</span>
                    <span>👤 {f.driver_name}</span>
                    <span>📅 {f.date ? new Date(f.date).toLocaleDateString('he-IL') : ''}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="status-badge status-new">{f.status === 'new' ? 'חדש' : f.status}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Wrench size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-xl">אין תקלות</p>
        </div>
      )}
    </div>
  );
}
