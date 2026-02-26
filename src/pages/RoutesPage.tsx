import { useState } from 'react';
import { demoRoutes, Route as RouteType, serviceTypes } from '@/data/demo-data';
import { Route as RouteIcon, Search, ArrowRight, MapPin, Clock, Calendar } from 'lucide-react';

export default function Routes() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<RouteType | null>(null);

  const filtered = demoRoutes.filter(r =>
    r.name.includes(search) || r.origin.includes(search) || r.destination.includes(search)
  );

  if (selected) {
    const r = selected;
    return (
      <div className="animate-fade-in">
        <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-primary text-lg font-medium mb-4 min-h-[48px]">
          <ArrowRight size={20} />
          חזרה לרשימה
        </button>
        <div className="card-elevated">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">{r.name}</h1>
            <span className={`status-badge ${r.status === 'active' ? 'status-active' : 'status-inactive'}`}>
              {r.status === 'active' ? 'פעיל' : 'לא פעיל'}
            </span>
          </div>

          <div className="bg-muted rounded-2xl p-4 mb-4">
            <div className="flex items-start gap-3 mb-3">
              <MapPin size={20} className="text-success mt-1 flex-shrink-0" />
              <div><span className="text-sm text-muted-foreground">מוצא</span><p className="font-bold text-lg">{r.origin}</p></div>
            </div>
            {r.stops.length > 0 && (
              <div className="mr-2 pr-6 border-r-2 border-dashed border-muted-foreground/30 py-2 space-y-1">
                {r.stops.map((stop, i) => (
                  <p key={i} className="text-muted-foreground">📍 {stop}</p>
                ))}
              </div>
            )}
            <div className="flex items-start gap-3 mt-3">
              <MapPin size={20} className="text-destructive mt-1 flex-shrink-0" />
              <div><span className="text-sm text-muted-foreground">יעד</span><p className="font-bold text-lg">{r.destination}</p></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-lg">
            <div><span className="text-muted-foreground">סוג שירות:</span><p className="font-bold">{serviceTypes[r.serviceType]}</p></div>
            <div><span className="text-muted-foreground">מרחק:</span><p className="font-bold">{r.distanceKm} ק"מ</p></div>
            <div><span className="text-muted-foreground">שעת יציאה:</span><p className="font-bold">{r.startTime}</p></div>
            <div><span className="text-muted-foreground">שעת סיום:</span><p className="font-bold">{r.endTime}</p></div>
            {r.daysOfWeek.length > 0 && (
              <div className="col-span-2"><span className="text-muted-foreground">ימי פעילות:</span><p className="font-bold">{r.daysOfWeek.join(', ')}</p></div>
            )}
            {r.customerName && <div><span className="text-muted-foreground">לקוח:</span><p className="font-bold">{r.customerName}</p></div>}
            {r.driverName && <div><span className="text-muted-foreground">נהג:</span><p className="font-bold">{r.driverName}</p></div>}
            {r.vehiclePlate && <div><span className="text-muted-foreground">רכב:</span><p className="font-bold">{r.vehiclePlate}</p></div>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 className="page-header">ניהול מסלולים</h1>
      <div className="relative mb-6">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="חיפוש לפי שם, מוצא או יעד..."
          className="w-full pr-12 p-4 text-lg rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none"
        />
      </div>
      <div className="space-y-3">
        {filtered.map(r => (
          <button key={r.id} onClick={() => setSelected(r)} className="card-elevated w-full text-right hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center flex-shrink-0">
                <RouteIcon size={28} className="text-success" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xl font-bold">{r.name}</p>
                <p className="text-muted-foreground">{r.origin} → {r.destination}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm text-muted-foreground flex items-center gap-1"><Clock size={14} />{r.startTime}</span>
                  <span className="text-sm text-muted-foreground">{serviceTypes[r.serviceType]}</span>
                </div>
              </div>
              <span className={`status-badge ${r.status === 'active' ? 'status-active' : 'status-inactive'}`}>
                {r.status === 'active' ? 'פעיל' : 'לא פעיל'}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
