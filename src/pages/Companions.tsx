import { useState, useEffect } from 'react';
import { Users, Plus, Search, Edit2, ArrowRight, Phone, CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCompanyFilter, applyCompanyScope } from '@/hooks/useCompanyFilter';
import { toast } from 'sonner';

interface Companion {
  id: string;
  full_name: string;
  phone: string;
  id_number: string;
  company_name: string;
  notes: string;
  status: string;
}

export default function Companions() {
  const { user } = useAuth();
  const companyFilter = useCompanyFilter();
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Companion | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const { data } = await applyCompanyScope(
      supabase.from('companions').select('*').order('created_at', { ascending: false }),
      companyFilter
    );
    if (data) setCompanions(data as Companion[]);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [companyFilter]);

  const isManager = user?.role === 'fleet_manager' || user?.role === 'super_admin';
  const filtered = companions.filter(c =>
    !search || c.full_name?.includes(search) || c.phone?.includes(search) || c.id_number?.includes(search)
  );

  if (showForm) {
    return (
      <CompanionForm
        companion={editItem}
        onDone={() => { setShowForm(false); setEditItem(null); loadData(); }}
        onBack={() => { setShowForm(false); setEditItem(null); }}
        user={user}
      />
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h1 className="page-header !mb-0 flex items-center gap-3"><Users size={28} /> מלווים</h1>
        {isManager && (
          <button onClick={() => { setEditItem(null); setShowForm(true); }}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-lg font-bold min-h-[48px]">
            <Plus size={22} /> מלווה חדש
          </button>
        )}
      </div>

      <div className="relative mb-5">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="חיפוש מלווה..."
          className="w-full pr-12 p-4 text-lg rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none" />
      </div>

      {loading ? (
        <div className="text-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Users size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-xl">אין מלווים</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => (
            <div key={c.id} className="card-elevated">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Users size={24} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-bold">{c.full_name}</p>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    {c.phone && <span className="flex items-center gap-1"><Phone size={12} /> {c.phone}</span>}
                    {c.id_number && <span className="flex items-center gap-1"><CreditCard size={12} /> {c.id_number}</span>}
                  </div>
                  {c.notes && <p className="text-sm text-muted-foreground mt-1">{c.notes}</p>}
                </div>
                <span className={`status-badge ${c.status === 'active' ? 'status-active' : 'status-inactive'}`}>
                  {c.status === 'active' ? 'פעיל' : 'לא פעיל'}
                </span>
                {isManager && (
                  <button onClick={() => { setEditItem(c); setShowForm(true); }}
                    className="p-2 rounded-xl bg-primary/10 text-primary"><Edit2 size={18} /></button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CompanionForm({ companion, onDone, onBack, user }: { companion: Companion | null; onDone: () => void; onBack: () => void; user: any }) {
  const isEdit = !!companion;
  const [fullName, setFullName] = useState(companion?.full_name || '');
  const [phone, setPhone] = useState(companion?.phone || '');
  const [idNumber, setIdNumber] = useState(companion?.id_number || '');
  const [notes, setNotes] = useState(companion?.notes || '');
  const [status, setStatus] = useState(companion?.status || 'active');
  const [loading, setLoading] = useState(false);

  const inputClass = "w-full p-4 text-lg rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none";

  const handleSubmit = async () => {
    if (!fullName.trim()) return;
    setLoading(true);
    const payload = { full_name: fullName, phone, id_number: idNumber, notes, status };
    let error;
    if (isEdit) {
      ({ error } = await supabase.from('companions').update(payload).eq('id', companion!.id));
    } else {
      ({ error } = await supabase.from('companions').insert({
        ...payload,
        company_name: user?.company_name || '',
        created_by: user?.id,
      }));
    }
    setLoading(false);
    if (error) { toast.error('שגיאה בשמירה'); console.error(error); }
    else { toast.success(isEdit ? 'המלווה עודכן' : 'מלווה חדש נוסף'); onDone(); }
  };

  return (
    <div className="animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-primary text-lg font-medium mb-4 min-h-[48px]">
        <ArrowRight size={20} /> חזרה
      </button>
      <h1 className="text-2xl font-bold mb-6">{isEdit ? 'עריכת מלווה' : 'מלווה חדש'}</h1>
      <div className="space-y-5">
        <div><label className="block text-lg font-medium mb-2">שם מלא *</label>
          <input value={fullName} onChange={e => setFullName(e.target.value)} className={inputClass} /></div>
        <div><label className="block text-lg font-medium mb-2">טלפון</label>
          <input value={phone} onChange={e => setPhone(e.target.value)} className={inputClass} /></div>
        <div><label className="block text-lg font-medium mb-2">תעודת זהות</label>
          <input value={idNumber} onChange={e => setIdNumber(e.target.value)} className={inputClass} /></div>
        <div><label className="block text-lg font-medium mb-2">הערות</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className={`${inputClass} resize-none`} /></div>
        <div><label className="block text-lg font-medium mb-2">סטטוס</label>
          <select value={status} onChange={e => setStatus(e.target.value)} className={inputClass}>
            <option value="active">פעיל</option>
            <option value="inactive">לא פעיל</option>
          </select>
        </div>
        <button onClick={handleSubmit} disabled={!fullName.trim() || loading}
          className={`w-full py-5 rounded-xl text-xl font-bold transition-colors ${fullName.trim() && !loading ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}>
          {loading ? 'שומר...' : isEdit ? '✅ עדכן מלווה' : '➕ הוסף מלווה'}
        </button>
      </div>
    </div>
  );
}
