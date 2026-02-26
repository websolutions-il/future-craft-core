import { useState } from 'react';
import { demoFaults, Fault, faultTypes } from '@/data/demo-data';
import { Wrench, Search, AlertTriangle, Plus, Paperclip } from 'lucide-react';
import FaultForm from '@/components/FaultForm';
import { toast } from 'sonner';

const urgencyLabels: Record<string, { text: string; cls: string }> = {
  normal: { text: 'רגיל', cls: 'status-active' },
  urgent: { text: 'דחוף', cls: 'status-pending' },
  critical: { text: 'מיידי', cls: 'status-urgent' },
};

export default function Faults() {
  const [search, setSearch] = useState('');
  const [filterUrgency, setFilterUrgency] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [faults, setFaults] = useState<Fault[]>(demoFaults);

  const filtered = faults.filter(f => {
    const matchSearch = f.driverName.includes(search) || f.vehiclePlate.includes(search) || f.faultType.includes(search);
    const matchUrgency = !filterUrgency || f.urgency === filterUrgency;
    return matchSearch && matchUrgency;
  });

  const handleNewFault = (fault: Fault) => {
    setFaults(prev => [fault, ...prev]);
    setShowForm(false);
    toast.success('התקלה נוספה בהצלחה');
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
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-lg font-bold min-h-[48px]"
        >
          <Plus size={22} />
          תקלה חדשה
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="חיפוש לפי נהג, רכב או סוג תקלה..."
          className="w-full pr-12 p-4 text-lg rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none"
        />
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        <button
          onClick={() => setFilterUrgency('')}
          className={`px-5 py-3 rounded-xl text-lg font-medium whitespace-nowrap transition-colors ${!filterUrgency ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
        >
          הכל
        </button>
        {Object.entries(urgencyLabels).map(([key, { text }]) => (
          <button
            key={key}
            onClick={() => setFilterUrgency(filterUrgency === key ? '' : key)}
            className={`px-5 py-3 rounded-xl text-lg font-medium whitespace-nowrap transition-colors ${filterUrgency === key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
          >
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
                    <p className="text-xl font-bold">{f.faultType}</p>
                    <span className={`status-badge ${urg.cls}`}>{urg.text}</span>
                  </div>
                  <p className="text-lg text-foreground">{f.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-muted-foreground">
                    <span>🚗 {f.vehiclePlate}</span>
                    <span>👤 {f.driverName}</span>
                    <span>📅 {f.date}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="status-badge status-new">חדש</span>
                    {f.attachments && f.attachments.length > 0 && (
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Paperclip size={14} />
                        {f.attachments.length} קבצים
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
