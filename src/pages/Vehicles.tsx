import { useState } from 'react';
import { demoVehicles, Vehicle } from '@/data/demo-data';
import { Car, Search, Plus, ArrowRight } from 'lucide-react';

export default function Vehicles() {
  const [search, setSearch] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const filtered = demoVehicles.filter(v =>
    v.licensePlate.includes(search) || v.manufacturer.includes(search) || v.model.includes(search)
  );

  const statusLabel = (s: string) => {
    switch (s) {
      case 'active': return { text: 'פעיל', cls: 'status-active' };
      case 'in_service': return { text: 'בטיפול', cls: 'status-pending' };
      case 'out_of_service': return { text: 'לא פעיל', cls: 'status-inactive' };
      default: return { text: s, cls: '' };
    }
  };

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
            <div><span className="text-muted-foreground">מספר רכב:</span><p className="font-bold">{v.licensePlate}</p></div>
            <div><span className="text-muted-foreground">שנה:</span><p className="font-bold">{v.year}</p></div>
            <div><span className="text-muted-foreground">סוג:</span><p className="font-bold">{v.vehicleType}</p></div>
            <div><span className="text-muted-foreground">ק"מ:</span><p className="font-bold">{v.odometer.toLocaleString()}</p></div>
            <div><span className="text-muted-foreground">נהג משויך:</span><p className="font-bold">{v.assignedDriverName || 'לא משויך'}</p></div>
            <div><span className="text-muted-foreground">חברה:</span><p className="font-bold">{v.companyName}</p></div>
            {v.testExpiry && <div><span className="text-muted-foreground">תוקף טסט:</span><p className="font-bold">{v.testExpiry}</p></div>}
            {v.insuranceExpiry && <div><span className="text-muted-foreground">תוקף ביטוח:</span><p className="font-bold">{v.insuranceExpiry}</p></div>}
          </div>
          {v.notes && <p className="mt-4 p-3 bg-muted rounded-xl text-muted-foreground">{v.notes}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 className="page-header">ניהול רכבים</h1>
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="חיפוש לפי מספר, יצרן או דגם..."
            className="w-full pr-12 p-4 text-lg rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none"
          />
        </div>
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
                  <p className="text-muted-foreground text-lg">{v.licensePlate} • {v.year}</p>
                  {v.assignedDriverName && <p className="text-sm text-muted-foreground">נהג: {v.assignedDriverName}</p>}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`status-badge ${sl.cls}`}>{sl.text}</span>
                  <span className="text-sm text-muted-foreground">{v.odometer.toLocaleString()} ק"מ</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
