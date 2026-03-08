import { useState, useEffect } from 'react';
import { CreditCard, Plus, Pencil, Trash2, Zap, TestTube, Loader2 } from 'lucide-react';
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

const statusLabels: Record<string, { text: string; cls: string }> = {
  active: { text: 'פעיל', cls: 'bg-green-500/10 text-green-600' },
  frozen: { text: 'מוקפא', cls: 'bg-warning/10 text-warning' },
  cancelled: { text: 'בוטל', cls: 'bg-destructive/10 text-destructive' },
};

export default function Subscriptions() {
  const { user } = useAuth();
  const companyFilter = useCompanyFilter();
  const { companyOptions } = useCompanyScope();
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [chargingId, setChargingId] = useState<string | null>(null);
  const [testingConnection, setTestingConnection] = useState(false);
  const isSuperAdmin = user?.role === 'super_admin';

  const loadSubs = async () => {
    let q = supabase.from('company_subscriptions').select('*').order('company_name');
    if (companyFilter) q = q.eq('company_name', companyFilter);
    const { data } = await q;
    if (data) setSubs(data as Subscription[]);
  };

  useEffect(() => { loadSubs(); }, [companyFilter]);

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
      const { error } = await supabase
        .from('company_subscriptions')
        .update(payload)
        .eq('id', editingSub.id);
      if (error) toast.error('שגיאה בעדכון: ' + error.message);
      else toast.success('מנוי עודכן בהצלחה');
    } else {
      const { error } = await supabase
        .from('company_subscriptions')
        .insert(payload);
      if (error) toast.error('שגיאה ביצירה: ' + error.message);
      else toast.success('מנוי נוצר בהצלחה');
    }

    setSaving(false);
    setModalOpen(false);
    loadSubs();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase
      .from('company_subscriptions')
      .delete()
      .eq('id', deleteId);
    if (error) toast.error('שגיאה במחיקה: ' + error.message);
    else toast.success('מנוי נמחק');
    setDeleteId(null);
    loadSubs();
  };

  const testPayPalConnection = async () => {
    setTestingConnection(true);
    try {
      const { data, error } = await supabase.functions.invoke('paypal-charge', {
        body: { action: 'test_connection' },
      });
      if (error) throw error;
      if (data?.success) {
        toast.success('חיבור PayPal תקין ✓');
      } else {
        toast.error('בעיה בחיבור PayPal: ' + (data?.error || 'שגיאה לא ידועה'));
      }
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
        // Auto-capture (no user approval needed for merchant-initiated)
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
      const { data, error } = await supabase.functions.invoke('paypal-charge', {
        body: { action: 'charge_all_due' },
      });
      if (error) throw error;
      toast.success(`חויבו ${data?.charged || 0} מנויים`);
      if (data?.results) {
        data.results.forEach((r: any) => {
          if (r.status === 'error') {
            toast.error(`שגיאה ב-${r.company}: ${r.error}`);
          }
        });
      }
      loadSubs();
    } catch (err: any) {
      toast.error('שגיאה בחיוב כולל: ' + (err.message || 'שגיאה'));
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-header !mb-0 flex items-center gap-3"><CreditCard size={28} /> מנויים וחיוב</h1>
        {isSuperAdmin && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={testPayPalConnection} disabled={testingConnection}>
              {testingConnection ? <Loader2 size={16} className="animate-spin" /> : <TestTube size={16} />}
              <span className="mr-1">בדוק PayPal</span>
            </Button>
            <Button variant="outline" size="sm" onClick={chargeAllDue}>
              <Zap size={16} />
              <span className="mr-1">חייב היום</span>
            </Button>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-lg font-bold"
            >
              <Plus size={22} /> מנוי חדש
            </button>
          </div>
        )}
      </div>

      {subs.length === 0 ? (
        <div className="card-elevated text-center py-12">
          <CreditCard size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-xl text-muted-foreground">אין מנויים</p>
          <p className="text-sm text-muted-foreground mt-2">לחץ על "מנוי חדש" כדי ליצור מנוי ראשון</p>
        </div>
      ) : (
        <div className="space-y-4">
          {subs.map(s => {
            const st = statusLabels[s.status] || statusLabels.active;
            return (
              <div key={s.id} className="card-elevated">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-bold">{s.company_name}</h2>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${st.cls}`}>{st.text}</span>
                    {isSuperAdmin && (
                      <>
                        <button
                          onClick={() => chargeSubscription(s)}
                          disabled={chargingId === s.id || s.status !== 'active'}
                          className="p-2 rounded-lg hover:bg-green-500/10 transition-colors disabled:opacity-40"
                          title="חייב עכשיו"
                        >
                          {chargingId === s.id ? (
                            <Loader2 size={16} className="animate-spin text-green-600" />
                          ) : (
                            <Zap size={16} className="text-green-600" />
                          )}
                        </button>
                        <button onClick={() => openEdit(s)} className="p-2 rounded-lg hover:bg-muted transition-colors">
                          <Pencil size={16} className="text-muted-foreground" />
                        </button>
                        <button onClick={() => setDeleteId(s.id)} className="p-2 rounded-lg hover:bg-destructive/10 transition-colors">
                          <Trash2 size={16} className="text-destructive" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div><span className="text-muted-foreground">חבילה</span><p className="font-bold">{s.plan_name}</p></div>
                  <div><span className="text-muted-foreground">מחיר חודשי</span><p className="font-bold">₪{s.monthly_price}</p></div>
                  <div><span className="text-muted-foreground">יום חיוב</span><p className="font-bold">{s.billing_day} בחודש</p></div>
                  <div><span className="text-muted-foreground">חיוב אחרון</span><p className="font-bold">{s.last_payment_date ? new Date(s.last_payment_date).toLocaleDateString('he-IL') : '—'}</p></div>
                  <div><span className="text-muted-foreground">חיוב הבא</span><p className="font-bold">{s.next_payment_date ? new Date(s.next_payment_date).toLocaleDateString('he-IL') : '—'}</p></div>
                </div>
                {s.payment_method && (
                  <p className="mt-2 text-sm"><span className="text-muted-foreground">אמצעי תשלום: </span>{s.payment_method}</p>
                )}
                {s.notes && <p className="mt-1 text-sm text-muted-foreground">{s.notes}</p>}
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editingSub ? 'עריכת מנוי' : 'מנוי חדש'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>שם חברה</Label>
              {companyOptions.length > 0 ? (
                <Select value={form.company_name} onValueChange={v => setForm(f => ({ ...f, company_name: v }))}>
                  <SelectTrigger><SelectValue placeholder="בחר חברה" /></SelectTrigger>
                  <SelectContent>
                    {companyOptions.map(c => (
                      <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input value={form.company_name} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))} />
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>שם חבילה</Label>
                <Select value={form.plan_name} onValueChange={v => setForm(f => ({ ...f, plan_name: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="בסיסי">בסיסי</SelectItem>
                    <SelectItem value="מתקדם">מתקדם</SelectItem>
                    <SelectItem value="פרימיום">פרימיום</SelectItem>
                    <SelectItem value="מותאם אישית">מותאם אישית</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>מחיר חודשי (₪)</Label>
                <Input type="number" min={0} value={form.monthly_price} onChange={e => setForm(f => ({ ...f, monthly_price: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>יום חיוב בחודש</Label>
                <Input type="number" min={1} max={28} value={form.billing_day} onChange={e => setForm(f => ({ ...f, billing_day: Number(e.target.value) }))} />
              </div>
              <div>
                <Label>סטטוס</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">פעיל</SelectItem>
                    <SelectItem value="frozen">מוקפא</SelectItem>
                    <SelectItem value="cancelled">בוטל</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>אמצעי תשלום</Label>
              <Input value={form.payment_method} onChange={e => setForm(f => ({ ...f, payment_method: e.target.value }))} placeholder="PayPal / העברה / כרטיס" />
            </div>
            <div>
              <Label>הערות</Label>
              <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button variant="outline" onClick={() => setModalOpen(false)}>ביטול</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'שומר...' : editingSub ? 'עדכן' : 'צור מנוי'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>מחיקת מנוי</AlertDialogTitle>
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
