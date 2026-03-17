import { useState, useEffect } from 'react';
import { Building2, Plus, Search, Edit2, Phone, Mail, MapPin, Trash2, Download, ArrowRight, ClipboardList, Hash } from 'lucide-react';
import { exportToCsv } from '@/utils/exportCsv';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCompanyFilter, applyCompanyScope } from '@/hooks/useCompanyFilter';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface Supplier {
  id: string;
  name: string;
  supplier_type: string;
  supplier_kind: string;
  supplier_number: string;
  phone: string;
  email: string;
  address: string;
  contact_person: string;
  notes: string;
  status: string;
  company_name: string;
  business_id: string;
  entity_type: string;
}

const supplierTypes = ['מוסך', 'גרר', 'פחחות', 'חשמלאי רכב', 'צמיגים', 'ביטוח', 'דלק', 'אחר'];
const entityTypes = [
  { value: 'authorized_dealer', label: 'עוסק מורשה' },
  { value: 'ltd_company', label: 'חברה בע"מ' },
  { value: 'other', label: 'אחר' },
];
const supplierKinds = [
  { value: 'permanent', label: 'ספק קבוע' },
  { value: 'temporary', label: 'ספק זמני' },
];

export default function Suppliers() {
  const { user } = useAuth();
  const companyFilter = useCompanyFilter();
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterKind, setFilterKind] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const { data } = await applyCompanyScope(
      supabase.from('suppliers').select('*').order('created_at', { ascending: false }),
      companyFilter
    );
    if (data) setSuppliers(data as Supplier[]);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [companyFilter]);

  const isManager = user?.role === 'fleet_manager' || user?.role === 'super_admin';

  const filtered = suppliers.filter(s => {
    const matchSearch = !search || s.name?.includes(search) || s.phone?.includes(search) || s.contact_person?.includes(search) || s.supplier_number?.includes(search);
    const matchType = !filterType || s.supplier_type === filterType;
    const matchKind = !filterKind || s.supplier_kind === filterKind;
    return matchSearch && matchType && matchKind;
  });

  const handleDelete = async (id: string) => {
    if (!confirm('האם למחוק ספק זה?')) return;
    const { error } = await supabase.from('suppliers').delete().eq('id', id);
    if (error) toast.error('שגיאה במחיקה');
    else { toast.success('הספק נמחק'); loadData(); }
  };

  if (showForm) {
    return (
      <SupplierForm
        supplier={editItem}
        onDone={() => { setShowForm(false); setEditItem(null); loadData(); }}
        onBack={() => { setShowForm(false); setEditItem(null); }}
        user={user}
      />
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h1 className="page-header !mb-0 flex items-center gap-3"><Building2 size={28} /> ניהול ספקים</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => exportToCsv('suppliers', [
            { key: 'supplier_number', label: 'מספר ספק' },
            { key: 'name', label: 'שם ספק' },
            { key: 'supplier_kind', label: 'סוג' },
            { key: 'supplier_type', label: 'קטגוריה' },
            { key: 'phone', label: 'טלפון' },
            { key: 'email', label: 'אימייל' },
            { key: 'contact_person', label: 'איש קשר' },
            { key: 'business_id', label: 'ח.פ / עוסק מורשה' },
            { key: 'address', label: 'כתובת' },
            { key: 'status', label: 'סטטוס' },
          ], filtered)} className="flex items-center gap-1 px-3 py-2 rounded-xl bg-muted text-muted-foreground hover:bg-muted/80 text-sm font-medium min-h-[48px]">
            <Download size={18} /> ייצוא
          </button>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="חיפוש לפי שם, טלפון, מספר ספק..."
          className="w-full pr-12 p-4 text-lg rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none" />
      </div>

      {/* Kind filter */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
        <button onClick={() => setFilterKind('')}
          className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${!filterKind ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
          הכל
        </button>
        {supplierKinds.map(k => (
          <button key={k.value} onClick={() => setFilterKind(filterKind === k.value ? '' : k.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${filterKind === k.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            {k.label}
          </button>
        ))}
      </div>

      {/* Type filter */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {supplierTypes.map(t => (
          <button key={t} onClick={() => setFilterType(filterType === t ? '' : t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${filterType === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Building2 size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-xl">אין ספקים</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(s => (
            <div key={s.id} className="card-elevated">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Building2 size={24} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-bold">{s.name}</p>
                      {s.supplier_number && (
                        <span className="text-xs px-2 py-0.5 rounded-lg bg-primary/10 text-primary font-mono">{s.supplier_number}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`status-badge ${s.status === 'active' ? 'status-active' : 'status-inactive'}`}>
                        {s.status === 'active' ? 'פעיל' : 'לא פעיל'}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-lg ${s.supplier_kind === 'temporary' ? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground'}`}>
                        {s.supplier_kind === 'temporary' ? 'זמני' : 'קבוע'}
                      </span>
                      {s.supplier_type && (
                        <span className="text-xs px-2 py-0.5 rounded-lg bg-muted text-muted-foreground">{s.supplier_type}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                    {s.contact_person && <span>👤 {s.contact_person}</span>}
                    {s.phone && <span className="flex items-center gap-1"><Phone size={12} /> {s.phone}</span>}
                    {s.email && <span className="flex items-center gap-1"><Mail size={12} /> {s.email}</span>}
                    {s.address && <span className="flex items-center gap-1"><MapPin size={12} /> {s.address}</span>}
                    {s.business_id && <span className="flex items-center gap-1"><Hash size={12} /> {s.business_id}</span>}
                  </div>
                  {s.notes && <p className="text-sm text-muted-foreground mt-1">{s.notes}</p>}
                </div>
                {isManager && (
                  <div className="flex flex-col items-center gap-1">
                    <button onClick={() => navigate(`/supplier-orders?supplier=${s.id}`)}
                      className="p-2 rounded-xl bg-accent/10 text-accent-foreground" title="הזמנות עבודה"><ClipboardList size={18} /></button>
                    <button onClick={() => { setEditItem(s); setShowForm(true); }}
                      className="p-2 rounded-xl bg-primary/10 text-primary" title="עריכה"><Edit2 size={18} /></button>
                    <button onClick={() => handleDelete(s.id)}
                      className="p-2 rounded-xl bg-destructive/10 text-destructive" title="מחיקה"><Trash2 size={18} /></button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
       )}

      {/* Floating + button */}
      {isManager && (
        <button
          onClick={() => { setEditItem(null); setShowForm(true); }}
          className="fixed bottom-24 left-6 z-40 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-xl hover:shadow-2xl transition-all flex items-center justify-center hover:scale-110"
          title="ספק חדש"
        >
          <Plus size={28} />
        </button>
      )}
    </div>
  );
}

function SupplierForm({ supplier, onDone, onBack, user }: { supplier: Supplier | null; onDone: () => void; onBack: () => void; user: any }) {
  const isEdit = !!supplier;
  const [name, setName] = useState(supplier?.name || '');
  const [supplierType, setSupplierType] = useState(supplier?.supplier_type || '');
  const [supplierKind, setSupplierKind] = useState(supplier?.supplier_kind || 'permanent');
  const [phone, setPhone] = useState(supplier?.phone || '');
  const [email, setEmail] = useState(supplier?.email || '');
  const [address, setAddress] = useState(supplier?.address || '');
  const [contactPerson, setContactPerson] = useState(supplier?.contact_person || '');
  const [businessId, setBusinessId] = useState(supplier?.business_id || '');
  const [entityType, setEntityType] = useState(supplier?.entity_type || '');
  const [notes, setNotes] = useState(supplier?.notes || '');
  const [status, setStatus] = useState(supplier?.status || 'active');
  const [loading, setLoading] = useState(false);

  const inputClass = "w-full p-4 text-lg rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none";

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setLoading(true);
    const payload = {
      name, supplier_type: supplierType, supplier_kind: supplierKind,
      phone, email, address, contact_person: contactPerson,
      business_id: businessId, entity_type: entityType,
      notes, status,
    };
    let error;
    if (isEdit) {
      ({ error } = await supabase.from('suppliers').update(payload).eq('id', supplier!.id));
    } else {
      ({ error } = await supabase.from('suppliers').insert({
        ...payload,
        company_name: user?.company_name || '',
        created_by: user?.id,
      }));
    }
    setLoading(false);
    if (error) { toast.error('שגיאה בשמירה'); console.error(error); }
    else { toast.success(isEdit ? 'הספק עודכן' : 'ספק חדש נוסף'); onDone(); }
  };

  return (
    <div className="animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-primary text-lg font-medium mb-4 min-h-[48px]">
        <ArrowRight size={20} /> חזרה
      </button>
      <h1 className="text-2xl font-bold mb-6">{isEdit ? 'עריכת ספק' : 'ספק חדש'}</h1>
      {isEdit && supplier?.supplier_number && (
        <div className="mb-4 p-3 rounded-xl bg-primary/10 text-primary font-mono text-lg text-center">
          מספר ספק: {supplier.supplier_number}
        </div>
      )}
      <div className="space-y-5">
        <div><label className="block text-lg font-medium mb-2">שם ספק *</label>
          <input value={name} onChange={e => setName(e.target.value)} className={inputClass} /></div>

        <div><label className="block text-lg font-medium mb-2">סוג ספק *</label>
          <div className="flex gap-3">
            {supplierKinds.map(k => (
              <button key={k.value} type="button" onClick={() => setSupplierKind(k.value)}
                className={`flex-1 py-3 rounded-xl text-lg font-bold transition-colors ${supplierKind === k.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                {k.label}
              </button>
            ))}
          </div>
        </div>

        <div><label className="block text-lg font-medium mb-2">קטגוריית ספק</label>
          <select value={supplierType} onChange={e => setSupplierType(e.target.value)} className={inputClass}>
            <option value="">בחר...</option>
            {supplierTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div><label className="block text-lg font-medium mb-2">סוג התאגדות</label>
          <select value={entityType} onChange={e => setEntityType(e.target.value)} className={inputClass}>
            <option value="">בחר...</option>
            {entityTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        <div><label className="block text-lg font-medium mb-2">מספר עוסק מורשה / ח.פ</label>
          <input value={businessId} onChange={e => setBusinessId(e.target.value)} className={inputClass} /></div>

        <div><label className="block text-lg font-medium mb-2">איש קשר</label>
          <input value={contactPerson} onChange={e => setContactPerson(e.target.value)} className={inputClass} /></div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="block text-lg font-medium mb-2">טלפון</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} className={inputClass} /></div>
          <div><label className="block text-lg font-medium mb-2">אימייל</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" className={inputClass} /></div>
        </div>

        <div><label className="block text-lg font-medium mb-2">כתובת מלאה</label>
          <input value={address} onChange={e => setAddress(e.target.value)} className={inputClass} /></div>

        <div><label className="block text-lg font-medium mb-2">הערות</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className={`${inputClass} resize-none`} /></div>

        <div><label className="block text-lg font-medium mb-2">סטטוס</label>
          <select value={status} onChange={e => setStatus(e.target.value)} className={inputClass}>
            <option value="active">פעיל</option>
            <option value="inactive">לא פעיל</option>
          </select>
        </div>

        <button onClick={handleSubmit} disabled={!name.trim() || loading}
          className={`w-full py-5 rounded-xl text-xl font-bold transition-colors ${name.trim() && !loading ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}>
          {loading ? 'שומר...' : isEdit ? '✅ עדכן ספק' : '➕ הוסף ספק'}
        </button>
      </div>
    </div>
  );
}
