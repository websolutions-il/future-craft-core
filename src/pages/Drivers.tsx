import { useState, useEffect } from 'react';
import { Users, Search, ArrowRight, Phone, Mail, Plus, Save, Edit2, X, Download } from 'lucide-react';
import { exportToCsv } from '@/utils/exportCsv';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCompanyFilter, applyCompanyScope } from '@/hooks/useCompanyFilter';
import { toast } from 'sonner';

interface DriverRow {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  license_number: string;
  license_expiry: string | null;
  license_types: string[];
  city: string;
  street: string;
  status: string;
  notes: string;
  company_name: string;
  id_number: string;
}

const licenseOptions = ['A', 'A1', 'A2', 'B', 'C', 'C1', 'D', 'D1', 'E'];

export default function Drivers() {
  const { user } = useAuth();
  const companyFilter = useCompanyFilter();
  const [drivers, setDrivers] = useState<DriverRow[]>([]);
  const [search, setSearch] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [selected, setSelected] = useState<DriverRow | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingDriver, setEditingDriver] = useState<DriverRow | null>(null);

  const loadDrivers = async () => {
    const { data } = await applyCompanyScope(supabase.from('drivers').select('*'), companyFilter).order('created_at', { ascending: false });
    if (data) setDrivers(data as DriverRow[]);
  };

  useEffect(() => { loadDrivers(); }, []);

  const companies = [...new Set(drivers.map(d => d.company_name).filter(Boolean))];

  const filtered = drivers.filter(d => {
    const matchSearch = !search || d.full_name?.includes(search) || d.phone?.includes(search) || d.license_number?.includes(search);
    const matchCompany = !filterCompany || d.company_name === filterCompany;
    return matchSearch && matchCompany;
  });

  if (showForm || editingDriver) {
    return (
      <DriverForm
        driver={editingDriver}
        user={user}
        onDone={() => { setShowForm(false); setEditingDriver(null); loadDrivers(); }}
      />
    );
  }

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
            <h1 className="text-2xl font-bold">{d.full_name}</h1>
            <div className="flex items-center gap-2">
              <span className={`status-badge ${d.status === 'active' ? 'status-active' : 'status-inactive'}`}>
                {d.status === 'active' ? 'פעיל' : 'לא פעיל'}
              </span>
              {user?.role !== 'driver' && (
                <button onClick={() => { setSelected(null); setEditingDriver(d); }}
                  className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Edit2 size={18} className="text-primary" />
                </button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-lg">
            <div><span className="text-muted-foreground">טלפון:</span><p className="font-bold">{d.phone}</p></div>
            <div><span className="text-muted-foreground">אימייל:</span><p className="font-bold">{d.email || '—'}</p></div>
            <div><span className="text-muted-foreground">רישיון:</span><p className="font-bold">{d.license_number || '—'}</p></div>
            <div><span className="text-muted-foreground">תוקף רישיון:</span><p className="font-bold">{d.license_expiry ? new Date(d.license_expiry).toLocaleDateString('he-IL') : '—'}</p></div>
            <div className="col-span-2"><span className="text-muted-foreground">סוגי רישיון:</span><p className="font-bold">{d.license_types?.join(', ') || '—'}</p></div>
            <div><span className="text-muted-foreground">עיר:</span><p className="font-bold">{d.city || '—'}</p></div>
            <div><span className="text-muted-foreground">רחוב:</span><p className="font-bold">{d.street || '—'}</p></div>
          </div>
          {d.notes && <p className="mt-4 p-3 bg-muted rounded-xl text-muted-foreground">{d.notes}</p>}
          <div className="flex gap-3 mt-6">
            {d.phone && (
              <a href={`tel:${d.phone}`} className="flex-1 bg-primary text-primary-foreground rounded-2xl p-4 flex items-center justify-center gap-2 text-lg font-bold">
                <Phone size={22} /> התקשר
              </a>
            )}
            {d.email && (
              <a href={`mailto:${d.email}`} className="flex-1 bg-muted text-foreground rounded-2xl p-4 flex items-center justify-center gap-2 text-lg font-bold">
                <Mail size={22} /> שלח מייל
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h1 className="page-header mb-0">ניהול נהגים</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => exportToCsv('drivers', [
            { key: 'full_name', label: 'שם מלא' },
            { key: 'phone', label: 'טלפון' },
            { key: 'email', label: 'אימייל' },
            { key: 'license_number', label: 'מספר רישיון' },
            { key: 'license_expiry', label: 'תוקף רישיון' },
            { key: 'city', label: 'עיר' },
            { key: 'status', label: 'סטטוס' },
            { key: 'company_name', label: 'חברה' },
            { key: 'notes', label: 'הערות' },
          ], filtered)} className="flex items-center gap-2 px-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm font-bold min-h-[48px] hover:bg-muted transition-colors">
            <Download size={18} /> ייצוא
          </button>
          {user?.role !== 'driver' && (
            <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-lg font-bold min-h-[48px]">
              <Plus size={22} />
              נהג חדש
            </button>
          )}
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="חיפוש לפי שם, טלפון או רישיון..."
          className="w-full pr-12 p-4 text-lg rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none" />
      </div>

      {/* Company filter - visible to super_admin */}
      {user?.role === 'super_admin' && companies.length > 1 && (
        <div className="mb-4">
          <select value={filterCompany} onChange={e => setFilterCompany(e.target.value)}
            className="w-full p-4 text-lg rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none">
            <option value="">כל החברות</option>
            {companies.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map(d => (
          <button key={d.id} onClick={() => setSelected(d)} className="card-elevated w-full text-right hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-info/10 flex items-center justify-center flex-shrink-0">
                <Users size={28} className="text-info" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xl font-bold">{d.full_name}</p>
                <p className="text-muted-foreground text-lg">{d.phone}</p>
                {d.license_types?.length > 0 && <p className="text-sm text-muted-foreground">{d.license_types.join(', ')}</p>}
              </div>
              <span className={`status-badge ${d.status === 'active' ? 'status-active' : 'status-inactive'}`}>
                {d.status === 'active' ? 'פעיל' : 'לא פעיל'}
              </span>
            </div>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Users size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-xl">אין נהגים</p>
        </div>
      )}
    </div>
  );
}

function DriverForm({ driver, user, onDone }: { driver: DriverRow | null; user: any; onDone: () => void }) {
  const isEdit = !!driver;
  const [fullName, setFullName] = useState(driver?.full_name || '');
  const [phone, setPhone] = useState(driver?.phone || '');
  const [email, setEmail] = useState(driver?.email || '');
  const [licenseNumber, setLicenseNumber] = useState(driver?.license_number || '');
  const [licenseExpiry, setLicenseExpiry] = useState(driver?.license_expiry || '');
  const [licenseTypes, setLicenseTypes] = useState<string[]>(driver?.license_types || []);
  const [city, setCity] = useState(driver?.city || '');
  const [street, setStreet] = useState(driver?.street || '');
  const [status, setStatus] = useState(driver?.status || 'active');
  const [notes, setNotes] = useState(driver?.notes || '');
  const [loading, setLoading] = useState(false);

  const isValid = fullName.trim().length > 0 && phone.trim().length > 0 && licenseNumber.trim().length > 0;
  const inputClass = "w-full p-4 text-lg rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none";

  const toggleLicense = (type: string) => {
    setLicenseTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);

    const payload = {
      full_name: fullName,
      phone,
      email,
      license_number: licenseNumber,
      license_expiry: licenseExpiry || null,
      license_types: licenseTypes,
      city,
      street,
      status,
      notes,
      company_name: user?.company_name || '',
      ...(isEdit ? {} : { created_by: user?.id }),
    };

    const { error } = isEdit
      ? await supabase.from('drivers').update(payload).eq('id', driver!.id)
      : await supabase.from('drivers').insert(payload);

    setLoading(false);
    if (error) {
      toast.error(isEdit ? 'שגיאה בעדכון הנהג' : 'שגיאה בהוספת הנהג');
      console.error(error);
    } else {
      toast.success(isEdit ? 'הנהג עודכן בהצלחה' : 'הנהג נוסף בהצלחה');
      onDone();
    }
  };

  return (
    <div className="animate-fade-in">
      <button onClick={onDone} className="flex items-center gap-2 text-primary text-lg font-medium mb-4 min-h-[48px]">
        <ArrowRight size={20} />
        חזרה לרשימה
      </button>
      <h1 className="text-2xl font-bold mb-6">{isEdit ? 'עריכת נהג' : 'הוספת נהג חדש'}</h1>

      <div className="space-y-5">
        <div>
          <label className="block text-lg font-medium mb-2">שם מלא <span className="text-destructive">*</span></label>
          <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="שם הנהג..." className={inputClass} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-lg font-medium mb-2">טלפון <span className="text-destructive">*</span></label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="050-..." className={inputClass} dir="ltr" style={{ textAlign: 'right' }} />
          </div>
          <div>
            <label className="block text-lg font-medium mb-2">אימייל</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@..." className={inputClass} dir="ltr" style={{ textAlign: 'right' }} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-lg font-medium mb-2">מספר רישיון <span className="text-destructive">*</span></label>
            <input value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)} placeholder="מספר רישיון..." className={inputClass} />
          </div>
          <div>
            <label className="block text-lg font-medium mb-2">תוקף רישיון</label>
            <input type="date" value={licenseExpiry} onChange={e => setLicenseExpiry(e.target.value)} className={inputClass} />
          </div>
        </div>

        <div>
          <label className="block text-lg font-medium mb-2">סוגי רישיון</label>
          <div className="flex flex-wrap gap-2">
            {licenseOptions.map(type => (
              <button key={type} type="button" onClick={() => toggleLicense(type)}
                className={`px-4 py-2.5 rounded-xl text-base font-medium transition-colors ${licenseTypes.includes(type) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-lg font-medium mb-2">עיר</label>
            <input value={city} onChange={e => setCity(e.target.value)} placeholder="עיר..." className={inputClass} />
          </div>
          <div>
            <label className="block text-lg font-medium mb-2">רחוב</label>
            <input value={street} onChange={e => setStreet(e.target.value)} placeholder="רחוב..." className={inputClass} />
          </div>
        </div>

        <div>
          <label className="block text-lg font-medium mb-2">סטטוס</label>
          <div className="flex gap-3">
            <button type="button" onClick={() => setStatus('active')}
              className={`flex-1 py-3 rounded-xl text-lg font-medium transition-colors ${status === 'active' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              פעיל
            </button>
            <button type="button" onClick={() => setStatus('inactive')}
              className={`flex-1 py-3 rounded-xl text-lg font-medium transition-colors ${status === 'inactive' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              לא פעיל
            </button>
          </div>
        </div>

        <div>
          <label className="block text-lg font-medium mb-2">הערות</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="הערות..." className={`${inputClass} resize-none`} />
        </div>

        <button onClick={handleSubmit} disabled={!isValid || loading}
          className={`w-full py-5 rounded-xl text-xl font-bold transition-colors ${isValid && !loading ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}>
          <Save size={24} className="inline ml-2" />
          {loading ? 'שומר...' : isEdit ? 'עדכן נהג' : 'הוסף נהג'}
        </button>
      </div>
    </div>
  );
}
