import { useState, useEffect } from 'react';
import { CreditCard, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCompanyFilter } from '@/hooks/useCompanyFilter';

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

const statusLabels: Record<string, { text: string; cls: string }> = {
  active: { text: 'פעיל', cls: 'bg-green-500/10 text-green-600' },
  frozen: { text: 'מוקפא', cls: 'bg-warning/10 text-warning' },
  cancelled: { text: 'בוטל', cls: 'bg-destructive/10 text-destructive' },
};

export default function Subscriptions() {
  const { user } = useAuth();
  const companyFilter = useCompanyFilter();
  const [subs, setSubs] = useState<Subscription[]>([]);
  const isSuperAdmin = user?.role === 'super_admin';

  useEffect(() => {
    let q = supabase.from('company_subscriptions').select('*').order('company_name');
    if (companyFilter) q = q.eq('company_name', companyFilter);
    q.then(({ data }) => { if (data) setSubs(data as Subscription[]); });
  }, [companyFilter]);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-header !mb-0 flex items-center gap-3"><CreditCard size={28} /> מנויים וחיוב</h1>
        {isSuperAdmin && (
          <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-lg font-bold">
            <Plus size={22} /> מנוי חדש
          </button>
        )}
      </div>
      {subs.length === 0 ? (
        <div className="card-elevated text-center py-12">
          <CreditCard size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-xl text-muted-foreground">אין מנויים</p>
          <p className="text-sm text-muted-foreground mt-2">כשיוגדרו חשבונות PayPal, המנויים יופיעו כאן</p>
        </div>
      ) : (
        <div className="space-y-4">
          {subs.map(s => {
            const st = statusLabels[s.status] || statusLabels.active;
            return (
              <div key={s.id} className="card-elevated">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-bold">{s.company_name}</h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${st.cls}`}>{st.text}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div><span className="text-muted-foreground">חבילה</span><p className="font-bold">{s.plan_name}</p></div>
                  <div><span className="text-muted-foreground">מחיר חודשי</span><p className="font-bold">₪{s.monthly_price}</p></div>
                  <div><span className="text-muted-foreground">יום חיוב</span><p className="font-bold">{s.billing_day} בחודש</p></div>
                  <div><span className="text-muted-foreground">חיוב הבא</span><p className="font-bold">{s.next_payment_date ? new Date(s.next_payment_date).toLocaleDateString('he-IL') : '—'}</p></div>
                </div>
                {s.notes && <p className="mt-2 text-sm text-muted-foreground">{s.notes}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
