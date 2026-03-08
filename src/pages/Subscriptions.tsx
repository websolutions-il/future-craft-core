import { useState, useEffect, useMemo } from 'react';
import { CreditCard, Plus, Pencil, Trash2, Zap, TestTube, Loader2, Search, Calendar, DollarSign, Users, Snowflake, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCompanyFilter } from '@/hooks/useCompanyFilter';
import { useCompanyScope } from '@/contexts/CompanyScopeContext';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';

interface Subscription {
  id: string;
  company_name: string;
  plan_name: string;
  monthly_price: number;
  billing_day: number;
  status: string;
  payment_method: string;
  last_payment_date: string | null;
  next_payment_date: string | null;
  notes: string;
}

const emptyForm = {
  company_name: '',
  plan_name: 'בסיסי',
  monthly_price: 0,
  billing_day: 1,
  status: 'active',
  payment_method: '',
  notes: '',
};

const statusConfig: Record<string, { text: string; color: string; border: string; icon: React.ReactNode }> = {
  active: { text: 'פעיל', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', border: 'border-r-emerald-500', icon: <Zap size={14} /> },
  frozen: { text: 'מוקפא', color: 'bg-sky-500/10 text-sky-600 border-sky-500/20', border: 'border-r-sky-500', icon: <Snowflake size={14} /> },
  cancelled: { text: 'בוטל', color: 'bg-rose-500/10 text-rose-600 border-rose-500/20', border: 'border-r-rose-500', icon: <XCircle size={14} /> },
};

const planColors: Record<string, string> = {
  'בסיסי': 'bg-muted text-muted-foreground',
  'מתקדם': 'bg-blue-500/10 text-blue-600',
  'פרימיום': 'bg-amber-500/10 text-amber-700',
  'מותאם אישית': 'bg-violet-500/10 text-violet-600',
};

export default function Subscriptions() {
  const { user } = useAuth();
  const companyFilter = useCompanyFilter();
  const { companyOptions } = useCompanyScope();
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [chargingId, setChargingId] = useState<string | null>(null);
  const [testingConnection, setTestingConnection] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const isSuperAdmin = user?.role === 'super_admin';

  const loadSubs = async () => {
    setLoading(true);
    let q = supabase.from('company_subscriptions').select('*').order('company_name');
    if (companyFilter) q = q.eq('company_name', companyFilter);
    const { data } = await q;
    if (data) setSubs(data as Subscription[]);
    setLoading(false);
  };

  useEffect(() => { loadSubs(); }, [companyFilter]);

  const filtered = useMemo(() => {
    return subs.filter(s => {
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      if (search && !s.company_name.includes(search) && !s.plan_name?.includes(search)) return false;
      return true;
    });
  }, [subs, search, statusFilter]);

  const stats = useMemo(() => {
    const active = subs.filter(s => s.status === 'active');
    return {
      total: subs.length,
      active: active.length,
      frozen: subs.filter(s => s.status === 'frozen').length,
      cancelled: subs.filter(s => s.status === 'cancelled').length,
      revenue: active.reduce((sum, s) => sum + (s.monthly_price || 0), 0),
    };
  }, [subs]);

  const openCreate = () => {
    setEditingSub(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (s: Subscription) => {
    setEditingSub(s);
    setForm({
      company_name: s.company_name,
      plan_name: s.plan_name || 'בסיסי',
      monthly_price: s.monthly_price || 0,
      billing_day: s.billing_day || 1,
      status: s.status || 'active',
      payment_method: s.payment_method || '',
      notes: s.notes || '',
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.company_name.trim()) {
      toast.error('יש לבחור שם חברה');
      return;
    }
    setSaving(true);

    const now = new Date();
    let nextDate = new Date(now.getFullYear(), now.getMonth(), form.billing_day);
    if (nextDate <= now) nextDate.setMonth(nextDate.getMonth() + 1);

    const payload = {
      company_name: form.company_name.trim(),
      plan_name: form.plan_name,
      monthly_price: form.monthly_price,
      billing_day: form.billing_day,
      status: form.status,
      payment_method: form.payment_method,
      notes: form.notes,
      next_payment_date: nextDate.toISOString(),
    };

    if (editingSub) {
      const { error } = await supabase.from('company_subscriptions').update(payload).eq('id', editingSub.id);
      if (error) toast.error('שגיאה בעדכון: ' + error.message);
      else toast.success('מנוי עודכן בהצלחה');
    } else {
      const { error } = await supabase.from('company_subscriptions').insert(payload);
      if (error) toast.error('שגיאה ביצירה: ' + error.message);
      else toast.success('מנוי נוצר בהצלחה');
    }

    setSaving(false);
    setModalOpen(false);
    loadSubs();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from('company_subscriptions').delete().eq('id', deleteId);
    if (error) toast.error('שגיאה במחיקה: ' + error.message);
    else toast.success('מנוי נמחק');
    setDeleteId(null);
    loadSubs();
  };

  const testPayPalConnection = async () => {
    setTestingConnection(true);
    try {
      const { data, error } = await supabase.functions.invoke('paypal-charge', { body: { action: 'test_connection' } });
      if (error) throw error;
      if (data?.success) toast.success('חיבור PayPal תקין ✓');
      else toast.error('בעיה בחיבור PayPal: ' + (data?.error || 'שגיאה לא ידועה'));
    } catch (err: any) {
      toast.error('שגיאה בבדיקת חיבור: ' + (err.message || 'שגיאה'));
    }
    setTestingConnection(false);
  };

  const chargeSubscription = async (sub: Subscription) => {
    setChargingId(sub.id);
    try {
      const { data, error } = await supabase.functions.invoke('paypal-charge', {
        body: { action: 'create_order', subscription_id: sub.id },
      });
      if (error) throw error;
      if (data?.order_id) {
        const { data: captureData, error: captureError } = await supabase.functions.invoke('paypal-charge', {
          body: { action: 'capture_order', order_id: data.order_id, subscription_id: sub.id },
        });
        if (captureError) throw captureError;
        if (captureData?.status === 'COMPLETED') {
          toast.success(`חיוב ₪${sub.monthly_price} עבור ${sub.company_name} בוצע בהצלחה`);
          loadSubs();
        } else {
          toast.warning(`סטטוס חיוב: ${captureData?.status || 'לא ידוע'}`);
        }
      }
    } catch (err: any) {
      toast.error('שגיאה בחיוב: ' + (err.message || 'שגיאה'));
    }
    setChargingId(null);
  };

  const chargeAllDue = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('paypal-charge', { body: { action: 'charge_all_due' } });
      if (error) throw error;
      toast.success(`חויבו ${data?.charged || 0} מנויים`);
      if (data?.results) {
        data.results.forEach((r: any) => {
          if (r.status === 'error') toast.error(`שגיאה ב-${r.company}: ${r.error}`);
        });
      }
      loadSubs();
    } catch (err: any) {
      toast.error('שגיאה בחיוב כולל: ' + (err.message || 'שגיאה'));
    }
  };

  const getDaysUntilPayment = (dateStr: string | null) => {
    if (!dateStr) return null;
    const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="page-header !mb-0 flex items-center gap-3">
          <CreditCard size={28} /> מנויים וחיוב
        </h1>
        {isSuperAdmin && (
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={testPayPalConnection} disabled={testingConnection} className="gap-1.5">
              {testingConnection ? <Loader2 size={15} className="animate-spin" /> : <TestTube size={15} />}
              בדוק PayPal
            </Button>
            <Button variant="outline" size="sm" onClick={chargeAllDue} className="gap-1.5">
              <Zap size={15} />
              חייב היום
            </Button>
            <Button onClick={openCreate} className="gap-1.5 text-base font-bold px-5 py-2.5">
              <Plus size={20} /> מנוי חדש
            </Button>
          </div>
        )}
      </div>

      {/* Stats Counters */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'סה״כ מנויים', value: stats.total, icon: <Users size={20} />, color: 'text-primary', bg: 'bg-primary/5', filter: 'all' },
          { label: 'פעילים', value: stats.active, icon: <Zap size={20} />, color: 'text-emerald-600', bg: 'bg-emerald-500/5', filter: 'active' },
          { label: 'מוקפאים', value: stats.frozen, icon: <Snowflake size={20} />, color: 'text-sky-600', bg: 'bg-sky-500/5', filter: 'frozen' },
          { label: 'בוטלו', value: stats.cancelled, icon: <XCircle size={20} />, color: 'text-rose-600', bg: 'bg-rose-500/5', filter: 'cancelled' },
          { label: 'הכנסה חודשית', value: `₪${stats.revenue.toLocaleString()}`, icon: <DollarSign size={20} />, color: 'text-amber-600', bg: 'bg-amber-500/5', filter: null },
        ].map((s, i) => (
          <button
            key={i}
            onClick={() => s.filter !== null && setStatusFilter(prev => prev === s.filter ? 'all' : s.filter!)}
            className={`rounded-xl border p-4 text-right transition-all ${
              s.filter !== null && statusFilter === s.filter
                ? 'ring-2 ring-primary border-primary shadow-md'
                : 'border-border hover:border-primary/30'
            } ${s.bg} ${s.filter === null ? 'cursor-default' : 'cursor-pointer'}`}
          >
            <div className={`flex items-center gap-2 mb-1 ${s.color}`}>
              {s.icon}
              <span className="text-xs font-medium text-muted-foreground">{s.label}</span>
            </div>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="חפש לפי שם חברה..."
          className="pr-10"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 size={32} className="animate-spin text-primary" />
          <p className="text-muted-foreground">טוען מנויים...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-elevated text-center py-12">
          <CreditCard size={48} className="mx-auto mb-4 text-muted-foreground opacity-40" />
          <p className="text-xl font-bold text-muted-foreground">
            {subs.length === 0 ? 'אין מנויים' : 'לא נמצאו תוצאות'}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {subs.length === 0 ? 'לחץ על "מנוי חדש" כדי ליצור מנוי ראשון' : 'נסה לשנות את מילות החיפוש'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(s => {
            const st = statusConfig[s.status] || statusConfig.active;
            const plan = planColors[s.plan_name] || planColors['בסיסי'];
            const daysUntil = getDaysUntilPayment(s.next_payment_date);
            const isUrgent = daysUntil !== null && daysUntil <= 3 && daysUntil >= 0;

            return (
              <div
                key={s.id}
                className={`card-elevated border-r-4 ${st.border} transition-all hover:shadow-md`}
              >
                {/* Card Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold">{s.company_name}</h2>
                    <Badge variant="outline" className={`${st.color} gap-1 text-xs`}>
                      {st.icon} {st.text}
                    </Badge>
                    <Badge variant="secondary" className={`${plan} text-xs`}>
                      {s.plan_name}
                    </Badge>
                  </div>
                  {isSuperAdmin && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => chargeSubscription(s)}
                        disabled={chargingId === s.id || s.status !== 'active'}
                        title="חייב עכשיו"
                        className="h-8 w-8"
                      >
                        {chargingId === s.id ? (
                          <Loader2 size={15} className="animate-spin text-emerald-600" />
                        ) : (
                          <Zap size={15} className="text-emerald-600" />
                        )}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(s)} className="h-8 w-8">
                        <Pencil size={15} className="text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(s.id)} className="h-8 w-8">
                        <Trash2 size={15} className="text-destructive" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-0.5">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <DollarSign size={12} /> מחיר חודשי
                    </p>
                    <p className="text-lg font-bold">₪{(s.monthly_price || 0).toLocaleString()}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar size={12} /> יום חיוב
                    </p>
                    <p className="font-bold">{s.billing_day} בחודש</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs text-muted-foreground">חיוב אחרון</p>
                    <p className="font-medium">
                      {s.last_payment_date ? new Date(s.last_payment_date).toLocaleDateString('he-IL') : '—'}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs text-muted-foreground">חיוב הבא</p>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {s.next_payment_date ? new Date(s.next_payment_date).toLocaleDateString('he-IL') : '—'}
                      </p>
                      {isUrgent && (
                        <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                          {daysUntil === 0 ? 'היום!' : `עוד ${daysUntil} ימים`}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer info */}
                {(s.payment_method || s.notes) && (
                  <div className="mt-3 pt-3 border-t border-border flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
                    {s.payment_method && (
                      <span>💳 {s.payment_method}</span>
                    )}
                    {s.notes && (
                      <span>📝 {s.notes}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl">{editingSub ? '✏️ עריכת מנוי' : '➕ מנוי חדש'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-bold">שם חברה</Label>
              {companyOptions.length > 0 ? (
                <Select value={form.company_name} onValueChange={v => setForm(f => ({ ...f, company_name: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="בחר חברה" /></SelectTrigger>
                  <SelectContent>
                    {companyOptions.map(c => (
                      <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input className="mt-1" value={form.company_name} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))} />
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-bold">שם חבילה</Label>
                <Select value={form.plan_name} onValueChange={v => setForm(f => ({ ...f, plan_name: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="בסיסי">בסיסי</SelectItem>
                    <SelectItem value="מתקדם">מתקדם</SelectItem>
                    <SelectItem value="פרימיום">פרימיום</SelectItem>
                    <SelectItem value="מותאם אישית">מותאם אישית</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-bold">מחיר חודשי (₪)</Label>
                <Input className="mt-1" type="number" min={0} value={form.monthly_price} onChange={e => setForm(f => ({ ...f, monthly_price: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-bold">יום חיוב בחודש</Label>
                <Input className="mt-1" type="number" min={1} max={28} value={form.billing_day} onChange={e => setForm(f => ({ ...f, billing_day: Number(e.target.value) }))} />
              </div>
              <div>
                <Label className="text-sm font-bold">סטטוס</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">פעיל</SelectItem>
                    <SelectItem value="frozen">מוקפא</SelectItem>
                    <SelectItem value="cancelled">בוטל</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-sm font-bold">אמצעי תשלום</Label>
              <Input className="mt-1" value={form.payment_method} onChange={e => setForm(f => ({ ...f, payment_method: e.target.value }))} placeholder="PayPal / העברה / כרטיס" />
            </div>
            <div>
              <Label className="text-sm font-bold">הערות</Label>
              <Textarea className="mt-1" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button variant="outline" onClick={() => setModalOpen(false)}>ביטול</Button>
              <Button onClick={handleSave} disabled={saving} className="min-w-[100px]">
                {saving ? <Loader2 size={16} className="animate-spin" /> : editingSub ? 'עדכן' : 'צור מנוי'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>🗑️ מחיקת מנוי</AlertDialogTitle>
            <AlertDialogDescription>האם אתה בטוח שברצונך למחוק את המנוי? פעולה זו אינה ניתנת לביטול.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">מחק</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
