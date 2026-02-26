import { useState } from 'react';
import { demoDrivers, Driver } from '@/data/demo-data';
import { Users, Search, ArrowRight, Phone, Mail } from 'lucide-react';

export default function Drivers() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Driver | null>(null);

  const filtered = demoDrivers.filter(d =>
    d.fullName.includes(search) || d.phone.includes(search) || d.licenseNumber.includes(search)
  );

  if (selected) {
    const d = selected;
    return (
      <div className="animate-fade-in">
        <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-primary text-lg font-medium mb-4 min-h-[48px]">
          <ArrowRight size={20} />
          חזרה לרשימה
        </button>
        <div className="card-elevated">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">{d.fullName}</h1>
            <span className={`status-badge ${d.status === 'active' ? 'status-active' : 'status-inactive'}`}>
              {d.status === 'active' ? 'פעיל' : 'לא פעיל'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-lg">
            <div><span className="text-muted-foreground">רישיון:</span><p className="font-bold">{d.licenseNumber}</p></div>
            <div><span className="text-muted-foreground">תוקף רישיון:</span><p className="font-bold">{d.licenseExpiry}</p></div>
            <div className="col-span-2"><span className="text-muted-foreground">סוגי רישיון:</span><p className="font-bold">{d.licenseTypes.join(', ')}</p></div>
            <div><span className="text-muted-foreground">עיר:</span><p className="font-bold">{d.city}</p></div>
            <div><span className="text-muted-foreground">רחוב:</span><p className="font-bold">{d.street}</p></div>
          </div>
          <div className="flex gap-3 mt-6">
            <a href={`tel:${d.phone}`} className="flex-1 bg-success text-success-foreground rounded-2xl p-4 flex items-center justify-center gap-2 text-lg font-bold">
              <Phone size={22} /> התקשר
            </a>
            <a href={`mailto:${d.email}`} className="flex-1 bg-info text-info-foreground rounded-2xl p-4 flex items-center justify-center gap-2 text-lg font-bold">
              <Mail size={22} /> שלח מייל
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 className="page-header">ניהול נהגים</h1>
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="חיפוש לפי שם, טלפון או רישיון..."
            className="w-full pr-12 p-4 text-lg rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none"
          />
        </div>
      </div>
      <div className="space-y-3">
        {filtered.map(d => (
          <button key={d.id} onClick={() => setSelected(d)} className="card-elevated w-full text-right hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-info/10 flex items-center justify-center flex-shrink-0">
                <Users size={28} className="text-info" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xl font-bold">{d.fullName}</p>
                <p className="text-muted-foreground text-lg">{d.phone}</p>
                <p className="text-sm text-muted-foreground">{d.licenseTypes.join(', ')}</p>
              </div>
              <span className={`status-badge ${d.status === 'active' ? 'status-active' : 'status-inactive'}`}>
                {d.status === 'active' ? 'פעיל' : 'לא פעיל'}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
