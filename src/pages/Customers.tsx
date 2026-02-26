import { useState } from 'react';
import { demoCustomers, Customer } from '@/data/demo-data';
import { Building2, User, Search, ArrowRight, Phone, Mail } from 'lucide-react';

export default function Customers() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Customer | null>(null);

  const filtered = demoCustomers.filter(c =>
    c.name.includes(search) || c.contactPerson.includes(search) || c.phone.includes(search)
  );

  if (selected) {
    const c = selected;
    return (
      <div className="animate-fade-in">
        <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-primary text-lg font-medium mb-4 min-h-[48px]">
          <ArrowRight size={20} />
          חזרה לרשימה
        </button>
        <div className="card-elevated">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">{c.name}</h1>
            <span className={`status-badge ${c.status === 'active' ? 'status-active' : 'status-inactive'}`}>
              {c.status === 'active' ? 'פעיל' : 'לא פעיל'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-lg">
            <div><span className="text-muted-foreground">סוג:</span><p className="font-bold">{c.customerType === 'company' ? 'חברה' : 'פרטי'}</p></div>
            <div><span className="text-muted-foreground">איש קשר:</span><p className="font-bold">{c.contactPerson}</p></div>
            <div><span className="text-muted-foreground">נוצר:</span><p className="font-bold">{c.createdAt}</p></div>
          </div>
          {c.notes && <p className="mt-4 p-3 bg-muted rounded-xl text-muted-foreground">{c.notes}</p>}
          <div className="flex gap-3 mt-6">
            <a href={`tel:${c.phone}`} className="flex-1 bg-success text-success-foreground rounded-2xl p-4 flex items-center justify-center gap-2 text-lg font-bold">
              <Phone size={22} /> התקשר
            </a>
            <a href={`mailto:${c.email}`} className="flex-1 bg-info text-info-foreground rounded-2xl p-4 flex items-center justify-center gap-2 text-lg font-bold">
              <Mail size={22} /> שלח מייל
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 className="page-header">ניהול לקוחות</h1>
      <div className="relative mb-6">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="חיפוש לפי שם, איש קשר או טלפון..."
          className="w-full pr-12 p-4 text-lg rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none"
        />
      </div>
      <div className="space-y-3">
        {filtered.map(c => (
          <button key={c.id} onClick={() => setSelected(c)} className="card-elevated w-full text-right hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-accent/30 flex items-center justify-center flex-shrink-0">
                {c.customerType === 'company' ? <Building2 size={28} className="text-accent-foreground" /> : <User size={28} className="text-accent-foreground" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xl font-bold">{c.name}</p>
                <p className="text-muted-foreground text-lg">{c.contactPerson} • {c.phone}</p>
              </div>
              <span className={`status-badge ${c.status === 'active' ? 'status-active' : 'status-inactive'}`}>
                {c.status === 'active' ? 'פעיל' : 'לא פעיל'}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
