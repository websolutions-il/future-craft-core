import { useState, useEffect } from 'react';
import { BarChart3, Car, Users, FileText, Wrench, AlertTriangle, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ReportStats {
  vehicles: { total: number; active: number; inService: number };
  drivers: { total: number; active: number };
  faults: { total: number; open: number; urgent: number };
  accidents: { total: number; open: number; cost: number };
  expenses: { total: number; count: number; avg: number };
}

export default function Reports() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    const [vRes, dRes, fRes, aRes, eRes] = await Promise.all([
      supabase.from('vehicles').select('id, status'),
      supabase.from('drivers').select('id, status'),
      supabase.from('faults').select('id, status, urgency'),
      supabase.from('accidents').select('id, status, estimated_cost'),
      supabase.from('expenses').select('id, amount'),
    ]);

    const vehicles = vRes.data || [];
    const drivers = dRes.data || [];
    const faults = fRes.data || [];
    const accidents = aRes.data || [];
    const expenses = eRes.data || [];

    const totalExpenses = expenses.reduce((s, e: any) => s + (e.amount || 0), 0);

    setStats({
      vehicles: { total: vehicles.length, active: vehicles.filter((v: any) => v.status === 'active').length, inService: vehicles.filter((v: any) => v.status === 'in_service').length },
      drivers: { total: drivers.length, active: drivers.filter((d: any) => d.status === 'active').length },
      faults: { total: faults.length, open: faults.filter((f: any) => ['new', 'open', 'in_progress'].includes(f.status)).length, urgent: faults.filter((f: any) => ['urgent', 'critical'].includes(f.urgency)).length },
      accidents: { total: accidents.length, open: accidents.filter((a: any) => a.status !== 'closed').length, cost: accidents.reduce((s, a: any) => s + (a.estimated_cost || 0), 0) },
      expenses: { total: totalExpenses, count: expenses.length, avg: expenses.length > 0 ? Math.round(totalExpenses / expenses.length) : 0 },
    });
    setLoading(false);
  };

  const exportCSV = () => {
    if (!stats) return;
    const rows = [
      ['דוח', 'ערך'],
      ['רכבים פעילים', stats.vehicles.active.toString()],
      ['סה"כ רכבים', stats.vehicles.total.toString()],
      ['נהגים פעילים', stats.drivers.active.toString()],
      ['סה"כ נהגים', stats.drivers.total.toString()],
      ['תקלות פתוחות', stats.faults.open.toString()],
      ['תקלות דחופות', stats.faults.urgent.toString()],
      ['תאונות פתוחות', stats.accidents.open.toString()],
      ['עלות תאונות', stats.accidents.cost.toString()],
      ['סה"כ הוצאות', stats.expenses.total.toString()],
      ['מספר חשבוניות', stats.expenses.count.toString()],
    ];
    const csv = '\uFEFF' + rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `דוח_דליה_${new Date().toLocaleDateString('he-IL')}.csv`;
    link.click();
  };

  if (loading) {
    return <div className="animate-fade-in text-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" /></div>;
  }

  const s = stats!;

  const reportCards = [
    { title: 'דוח הוצאות', icon: FileText, color: 'bg-primary/10 text-primary', stats: [{ label: 'סה"כ הוצאות', value: `₪${s.expenses.total.toLocaleString()}` }, { label: 'חשבוניות', value: s.expenses.count.toString() }, { label: 'ממוצע', value: `₪${s.expenses.avg.toLocaleString()}` }] },
    { title: 'דוח רכבים', icon: Car, color: 'bg-primary/10 text-primary', stats: [{ label: 'פעילים', value: s.vehicles.active.toString() }, { label: 'בטיפול', value: s.vehicles.inService.toString() }, { label: 'סה"כ', value: s.vehicles.total.toString() }] },
    { title: 'דוח תקלות', icon: Wrench, color: 'bg-warning/10 text-warning', stats: [{ label: 'פתוחות', value: s.faults.open.toString() }, { label: 'דחופות', value: s.faults.urgent.toString() }, { label: 'סה"כ', value: s.faults.total.toString() }] },
    { title: 'דוח תאונות', icon: AlertTriangle, color: 'bg-destructive/10 text-destructive', stats: [{ label: 'פתוחות', value: s.accidents.open.toString() }, { label: 'עלות', value: `₪${s.accidents.cost.toLocaleString()}` }, { label: 'סה"כ', value: s.accidents.total.toString() }] },
    { title: 'דוח נהגים', icon: Users, color: 'bg-primary/10 text-primary', stats: [{ label: 'פעילים', value: s.drivers.active.toString() }, { label: 'סה"כ', value: s.drivers.total.toString() }] },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h1 className="page-header !mb-0 flex items-center gap-3"><BarChart3 size={28} /> דוחות</h1>
        <button onClick={exportCSV} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-lg font-bold min-h-[48px]">
          <Download size={22} /> ייצוא CSV
        </button>
      </div>
      <p className="text-muted-foreground mb-6">סקירה כללית מבוססת נתונים חיים</p>
      <div className="space-y-4">
        {reportCards.map(card => (
          <div key={card.title} className="card-elevated">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${card.color}`}><card.icon size={24} /></div>
              <h2 className="text-xl font-bold">{card.title}</h2>
            </div>
            <div className={`grid gap-4 ${card.stats.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
              {card.stats.map(stat => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl font-black">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
