import { useState, useEffect } from 'react';
import { Building2, User, Search, ArrowRight, Phone, Mail, Plus, Edit2, Trash2, Hash, FileText, Printer } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface CustomerRow {
  id: string;
  name: string;
  customer_type: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  status: string;
  customer_number: string;
  business_id: string;
  fax: string;
  agreement_description: string;
  agreement_amount_before_vat: number | null;
  agreement_amount_with_vat: number | null;
  agreement_serial_number: string;
}

type ViewMode = 'list' | 'detail' | 'form';

export default function Customers() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selected, setSelected] = useState<CustomerRow | null>(null);
  const [editItem, setEditItem] = useState<CustomerRow | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const { data } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
    if (data) setCustomers(data as unknown as CustomerRow[]);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const isManager = user?.role === 'fleet_manager' || user?.role === 'super_admin';
  const filtered = customers.filter(c => !search || c.name?.includes(search) || c.contact_person?.includes(search) || c.phone?.includes(search) || c.customer_number?.includes(search));

  const handleDelete = async (id: string) => {
    if (!confirm('למחוק לקוח זה?')) return;
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (error) toast.error('שגיאה'); else { toast.success('נמחק'); setViewMode('list'); loadData(); }
  };

  if (viewMode === 'form') {
    return <CustomerForm customer={editItem} onDone={() => { setViewMode('list'); setEditItem(null); loadData(); }} onBack={() => { setViewMode('list'); setEditItem(null); }} user={user} />;
  }

  if (viewMode === 'detail' && selected) {
    const c = selected;
    return (
      <div className="animate-fade-in">
        <button onClick={() => { setViewMode('list'); setSelected(null); }} className="flex items-center gap-2 text-primary text-lg font-medium mb-4 min-h-[48px]"><ArrowRight size={20} /> חזרה</button>
        <div className="card-elevated">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">{c.name}</h1>
              {c.customer_number && <p className="text-muted-foreground text-sm">מס׳ לקוח: {c.customer_number}</p>}
            </div>
            <div className="flex items-center gap-2">
              <span className={`status-badge ${c.status === 'active' ? 'status-active' : 'status-inactive'}`}>{c.status === 'active' ? 'פעיל' : 'לא פעיל'}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-lg">
            <div><span className="text-muted-foreground text-sm">סוג</span><p className="font-bold">{c.customer_type === 'company' ? 'חברה' : 'פרטי'}</p></div>
            {c.business_id && <div><span className="text-muted-foreground text-sm">עוסק מורשה / ח.פ</span><p className="font-bold">{c.business_id}</p></div>}
            <div><span className="text-muted-foreground text-sm">איש קשר</span><p className="font-bold">{c.contact_person}</p></div>
            <div><span className="text-muted-foreground text-sm">טלפון</span><p className="font-bold" dir="ltr">{c.phone}</p></div>
            {c.fax && <div><span className="text-muted-foreground text-sm">פקס</span><p className="font-bold" dir="ltr">{c.fax}</p></div>}
            <div><span className="text-muted-foreground text-sm">אימייל</span><p className="font-bold" dir="ltr">{c.email}</p></div>
            {c.address && <div className="col-span-2"><span className="text-muted-foreground text-sm">כתובת</span><p className="font-bold">{c.address}</p></div>}
          </div>

          {c.notes && <p className="mt-4 p-3 bg-muted rounded-xl text-muted-foreground">{c.notes}</p>}

          <div className="flex gap-3 mt-6">
            {c.phone && <a href={`tel:${c.phone}`} className="flex-1 bg-primary text-primary-foreground rounded-2xl p-4 flex items-center justify-center gap-2 text-lg font-bold"><Phone size={22} /> התקשר</a>}
            {c.email && <a href={`mailto:${c.email}`} className="flex-1 bg-muted text-foreground rounded-2xl p-4 flex items-center justify-center gap-2 text-lg font-bold"><Mail size={22} /> מייל</a>}
          </div>

          {isManager && (
            <div className="flex gap-3 mt-4">
              <button onClick={() => { setEditItem(c); setViewMode('form'); }} className="flex-1 py-4 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center gap-2 text-lg">
                <Edit2 size={20} /> עריכת פרטי לקוח
              </button>
              <button onClick={() => handleDelete(c.id)} className="py-4 px-6 rounded-xl border-2 border-destructive/30 text-destructive font-bold flex items-center justify-center gap-2">
                <Trash2 size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h1 className="page-header !mb-0 flex items-center gap-3"><Building2 size={28} /> לקוחות</h1>
        {isManager && <button onClick={() => { setEditItem(null); setViewMode('form'); }} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-lg font-bold min-h-[48px]"><Plus size={22} /> לקוח חדש</button>}
      </div>
      <div className="relative mb-5">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="חיפוש..." className="w-full pr-12 p-4 text-lg rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none" />
      </div>
      {loading ? (
        <div className="text-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground"><Building2 size={48} className="mx-auto mb-4 opacity-50" /><p className="text-xl">אין לקוחות</p></div>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => (
            <button key={c.id} onClick={() => { setSelected(c); setViewMode('detail'); }} className="card-elevated w-full text-right hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {c.customer_type === 'company' ? <Building2 size={28} className="text-primary" /> : <User size={28} className="text-primary" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xl font-bold">{c.name}</p>
                  <p className="text-muted-foreground">{c.contact_person} • {c.phone}</p>
                  {c.customer_number && <p className="text-xs text-muted-foreground">מס׳ {c.customer_number}</p>}
                </div>
                <span className={`status-badge ${c.status === 'active' ? 'status-active' : 'status-inactive'}`}>{c.status === 'active' ? 'פעיל' : 'לא פעיל'}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CustomerForm({ customer, onDone, onBack, user }: { customer: CustomerRow | null; onDone: () => void; onBack: () => void; user: any }) {
  const isEdit = !!customer;
  const [name, setName] = useState(customer?.name || '');
  const [customerType, setCustomerType] = useState(customer?.customer_type || 'company');
  const [contactPerson, setContactPerson] = useState(customer?.contact_person || '');
  const [phone, setPhone] = useState(customer?.phone || '');
  const [email, setEmail] = useState(customer?.email || '');
  const [address, setAddress] = useState(customer?.address || '');
  const [status, setStatus] = useState(customer?.status || 'active');
  const [notes, setNotes] = useState(customer?.notes || '');
  const [customerNumber, setCustomerNumber] = useState(customer?.customer_number || '');
  const [businessId, setBusinessId] = useState(customer?.business_id || '');
  const [fax, setFax] = useState(customer?.fax || '');
  const [agreementDesc, setAgreementDesc] = useState(customer?.agreement_description || '');
  const [agreementBeforeVat, setAgreementBeforeVat] = useState(customer?.agreement_amount_before_vat?.toString() || '');
  const [agreementWithVat, setAgreementWithVat] = useState(customer?.agreement_amount_with_vat?.toString() || '');
  const [agreementSerial, setAgreementSerial] = useState(customer?.agreement_serial_number || '');
  const [loading, setLoading] = useState(false);

  const isValid = name && contactPerson;
  const inputClass = "w-full p-4 text-lg rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none";

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    const payload = {
      name, customer_type: customerType, contact_person: contactPerson,
      phone, email, address, status, notes,
      customer_number: customerNumber, business_id: businessId, fax,
      agreement_description: agreementDesc || null,
      agreement_amount_before_vat: agreementBeforeVat ? parseFloat(agreementBeforeVat) : null,
      agreement_amount_with_vat: agreementWithVat ? parseFloat(agreementWithVat) : null,
      agreement_serial_number: agreementSerial || null,
    } as any;
    let error;
    if (isEdit) { ({ error } = await supabase.from('customers').update(payload).eq('id', customer!.id)); }
    else { ({ error } = await supabase.from('customers').insert({ ...payload, company_name: user?.company_name || '', created_by: user?.id })); }
    setLoading(false);
    if (error) { toast.error('שגיאה'); console.error(error); } else { toast.success(isEdit ? 'עודכן' : 'נוסף'); onDone(); }
  };

  const handlePrintAgreement = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const today = new Date().toLocaleDateString('he-IL');
    printWindow.document.write(`
      <html dir="rtl">
      <head>
        <title>הסכם עבודה - ${name}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #222; }
          h1 { text-align: center; font-size: 24px; margin-bottom: 4px; }
          .subtitle { text-align: center; color: #666; font-size: 14px; margin-bottom: 30px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
          .info-item label { font-size: 12px; color: #888; display: block; margin-bottom: 2px; }
          .info-item p { font-size: 16px; font-weight: bold; margin: 0; }
          .section { border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
          .section-title { font-size: 18px; font-weight: bold; margin-bottom: 12px; border-bottom: 2px solid #333; padding-bottom: 6px; }
          .amount-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; font-size: 16px; }
          .amount-row:last-child { border-bottom: none; font-weight: bold; font-size: 18px; }
          .note { background: #f9f9f9; padding: 12px; border-radius: 6px; margin-top: 16px; font-size: 13px; color: #666; text-align: center; }
          .signatures { display: flex; justify-content: space-between; margin-top: 60px; }
          .sig-block { text-align: center; width: 200px; }
          .sig-line { border-top: 1px solid #333; margin-top: 60px; padding-top: 8px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <h1>הסכם עבודה</h1>
        <p class="subtitle">מסמך פתיחת לקוח • תאריך: ${today}</p>
        <p class="subtitle" style="font-size:12px; color:#999;">מסמך זה אינו מהווה חשבונית</p>
        <div class="section">
          <div class="section-title">פרטי לקוח</div>
          <div class="info-grid">
            <div class="info-item"><label>שם</label><p>${name}</p></div>
            <div class="info-item"><label>מספר לקוח</label><p>${customerNumber || '—'}</p></div>
            <div class="info-item"><label>סוג</label><p>${customerType === 'company' ? 'חברה' : 'פרטי'}</p></div>
            <div class="info-item"><label>עוסק מורשה / ח.פ</label><p>${businessId || '—'}</p></div>
            <div class="info-item"><label>איש קשר</label><p>${contactPerson}</p></div>
            <div class="info-item"><label>טלפון</label><p>${phone || '—'}</p></div>
            <div class="info-item"><label>אימייל</label><p>${email || '—'}</p></div>
            <div class="info-item"><label>כתובת</label><p>${address || '—'}</p></div>
          </div>
        </div>
        <div class="section">
          <div class="section-title">פרטי הסכם</div>
          ${agreementSerial ? `<div class="info-item" style="margin-bottom:12px"><label>מספר סידורי</label><p>${agreementSerial}</p></div>` : ''}
          ${agreementDesc ? `<div class="info-item" style="margin-bottom:16px"><label>פירוט</label><p>${agreementDesc}</p></div>` : ''}
          <div class="amount-row"><span>סכום לפני מע״מ</span><span>₪${agreementBeforeVat ? parseFloat(agreementBeforeVat).toLocaleString('he-IL') : '—'}</span></div>
          <div class="amount-row"><span>סכום כולל מע״מ</span><span>₪${agreementWithVat ? parseFloat(agreementWithVat).toLocaleString('he-IL') : '—'}</span></div>
        </div>
        <div class="note">מסמך זה מהווה הסכם עבודה בלבד ואינו מהווה חשבונית מס</div>
        <div class="signatures">
          <div class="sig-block"><div class="sig-line">חתימת הלקוח</div></div>
          <div class="sig-block"><div class="sig-line">חתימת החברה</div></div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-primary text-lg font-medium mb-4 min-h-[48px]"><ArrowRight size={20} /> חזרה</button>
      <h1 className="text-2xl font-bold mb-6">{isEdit ? 'עריכת לקוח' : 'לקוח חדש'}</h1>
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-lg font-medium mb-2">שם *</label><input value={name} onChange={e => setName(e.target.value)} className={inputClass} /></div>
          <div><label className="block text-lg font-medium mb-2">מספר לקוח</label><input value={customerNumber} onChange={e => setCustomerNumber(e.target.value)} className={inputClass} placeholder="מספר ייחודי" /></div>
        </div>
        <div><label className="block text-lg font-medium mb-2">סוג</label>
          <select value={customerType} onChange={e => setCustomerType(e.target.value)} className={inputClass}>
            <option value="company">חברה</option><option value="private">פרטי</option>
          </select></div>
        <div><label className="block text-lg font-medium mb-2">עוסק מורשה / ח.פ</label><input value={businessId} onChange={e => setBusinessId(e.target.value)} className={inputClass} /></div>
        <div><label className="block text-lg font-medium mb-2">איש קשר *</label><input value={contactPerson} onChange={e => setContactPerson(e.target.value)} className={inputClass} /></div>
        <div><label className="block text-lg font-medium mb-2">כתובת מלאה</label><input value={address} onChange={e => setAddress(e.target.value)} className={inputClass} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-lg font-medium mb-2">טלפון</label><input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className={inputClass} dir="ltr" style={{ textAlign: 'right' }} /></div>
          <div><label className="block text-lg font-medium mb-2">פקס</label><input type="tel" value={fax} onChange={e => setFax(e.target.value)} className={inputClass} dir="ltr" style={{ textAlign: 'right' }} /></div>
        </div>
        <div><label className="block text-lg font-medium mb-2">אימייל</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} dir="ltr" style={{ textAlign: 'right' }} /></div>
        <div><label className="block text-lg font-medium mb-2">סטטוס</label>
          <select value={status} onChange={e => setStatus(e.target.value)} className={inputClass}><option value="active">פעיל</option><option value="inactive">לא פעיל</option></select></div>
        <div><label className="block text-lg font-medium mb-2">הערות</label><textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className={`${inputClass} resize-none`} /></div>

        {/* הסכם עבודה */}
        <div className="border-2 border-primary/20 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <FileText size={22} />
            <h2 className="text-xl font-bold">הסכם עבודה</h2>
          </div>
          <p className="text-sm text-muted-foreground">מסמך פתיחת לקוח — אינו מהווה חשבונית</p>
          <div><label className="block text-lg font-medium mb-2">מספר סידורי</label><input value={agreementSerial} onChange={e => setAgreementSerial(e.target.value)} className={inputClass} placeholder="מספר סידורי להסכם" /></div>
          <div><label className="block text-lg font-medium mb-2">פירוט קצר</label><textarea value={agreementDesc} onChange={e => setAgreementDesc(e.target.value)} rows={2} className={`${inputClass} resize-none`} placeholder="תיאור השירות / ההסכם" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-lg font-medium mb-2">סכום לפני מע״מ</label><input type="number" value={agreementBeforeVat} onChange={e => setAgreementBeforeVat(e.target.value)} className={inputClass} dir="ltr" style={{ textAlign: 'right' }} placeholder="₪" /></div>
            <div><label className="block text-lg font-medium mb-2">סכום כולל מע״מ</label><input type="number" value={agreementWithVat} onChange={e => setAgreementWithVat(e.target.value)} className={inputClass} dir="ltr" style={{ textAlign: 'right' }} placeholder="₪" /></div>
          </div>
        </div>

        <button onClick={handleSubmit} disabled={!isValid || loading}
          className={`w-full py-5 rounded-xl text-xl font-bold transition-colors ${isValid && !loading ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}>
          {loading ? 'שומר...' : isEdit ? '💾 עדכן' : '💾 שמור'}
        </button>

        {isEdit && (agreementDesc || agreementBeforeVat || agreementWithVat) && (
          <button onClick={handlePrintAgreement} className="w-full py-4 rounded-xl border-2 border-primary/30 text-primary text-lg font-bold flex items-center justify-center gap-2">
            <Printer size={20} /> הדפסת הסכם עבודה
          </button>
        )}
      </div>
    </div>
  );
}
