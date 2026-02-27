import { useState, useEffect } from 'react';
import { Car, Users, Wrench, AlertTriangle, Route, FileText, ClipboardList, Clock, TrendingUp, Calendar, Shield, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import DriverDashboard from '@/components/DriverDashboard';

interface DashboardStats {
  vehiclesActive: number;
  vehiclesTotal: number;
  driversActive: number;
  driversTotal: number;
  faultsOpen: number;
  faultsTotal: number;
  accidentsOpen: number;
  accidentsTotal: number;
  todayTasks: number;
  expensesMonth: number;
}

interface RecentFault {
  id: string;
  fault_type: string;
  vehicle_plate: string;
  driver_name: string;
  urgency: string;
  status: string;
  created_at: string;
}

interface UpcomingTask {
  id: string;
  service_category: string;
  vehicle_plate: string;
  driver_name: string;
  service_date: string;
  service_time: string;
  treatment_status: string;
}

interface ExpiryAlert {
  type: 'test' | 'insurance' | 'license';
  label: string;
  entity: string;
  date: string;
  daysLeft: number;
}

export default function Dashboard() {
  const { user } = useAuth();

  if (user?.role === 'driver') {
    return <DriverDashboard />;
  }

  return <ManagerDashboard />;
}

function ManagerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    vehiclesActive: 0, vehiclesTotal: 0, driversActive: 0, driversTotal: 0,
    faultsOpen: 0, faultsTotal: 0, accidentsOpen: 0, accidentsTotal: 0,
    todayTasks: 0, expensesMonth: 0,
  });
  const [recentFaults, setRecentFaults] = useState<RecentFault[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<UpcomingTask[]>([]);
  const [alerts, setAlerts] = useState<ExpiryAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    const today = new Date().toISOString().split('T')[0];
    const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString();

    const [vehiclesRes, driversRes, faultsRes, accidentsRes, tasksRes, expensesRes] = await Promise.all([
      supabase.from('vehicles').select('id, status, test_expiry, insurance_expiry, license_plate, manufacturer, model'),
      supabase.from('drivers').select('id, status, license_expiry, full_name'),
      supabase.from('faults').select('id, fault_type, vehicle_plate, driver_name, urgency, status, created_at').order('created_at', { ascending: false }).limit(5),
      supabase.from('accidents').select('id, status'),
      supabase.from('service_orders').select('id, service_category, vehicle_plate, driver_name, service_date, service_time, treatment_status').order('service_date', { ascending: true }),
      supabase.from('expenses').select('amount').gte('created_at', monthAgo),
    ]);

    const vehicles = vehiclesRes.data || [];
    const drivers = driversRes.data || [];
    const faults = faultsRes.data || [];
    const accidents = accidentsRes.data || [];
    const tasks = tasksRes.data || [];
    const expenses = expensesRes.data || [];

    // Stats
    setStats({
      vehiclesActive: vehicles.filter((v: any) => v.status === 'active').length,
      vehiclesTotal: vehicles.length,
      driversActive: drivers.filter((d: any) => d.status === 'active').length,
      driversTotal: drivers.length,
      faultsOpen: faults.filter((f: any) => f.status === 'new' || f.status === 'in_progress').length,
      faultsTotal: faults.length,
      accidentsOpen: accidents.filter((a: any) => a.status !== 'closed').length,
      accidentsTotal: accidents.length,
      todayTasks: tasks.filter((t: any) => t.service_date === today).length,
      expensesMonth: expenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0),
    });

    setRecentFaults(faults as RecentFault[]);

    // Upcoming tasks (today + future, not completed)
    setUpcomingTasks(
      tasks.filter((t: any) => t.service_date >= today && t.treatment_status !== 'completed').slice(0, 5) as UpcomingTask[]
    );

    // Expiry alerts (next 30 days)
    const thirtyDays = new Date(Date.now() + 30 * 86400000);
    const expiryAlerts: ExpiryAlert[] = [];

    vehicles.forEach((v: any) => {
      if (v.test_expiry && new Date(v.test_expiry) <= thirtyDays) {
        const daysLeft = Math.ceil((new Date(v.test_expiry).getTime() - Date.now()) / 86400000);
        expiryAlerts.push({ type: 'test', label: 'טסט', entity: `${v.license_plate} ${v.manufacturer || ''}`, date: v.test_expiry, daysLeft });
      }
      if (v.insurance_expiry && new Date(v.insurance_expiry) <= thirtyDays) {
        const daysLeft = Math.ceil((new Date(v.insurance_expiry).getTime() - Date.now()) / 86400000);
        expiryAlerts.push({ type: 'insurance', label: 'ביטוח', entity: `${v.license_plate} ${v.manufacturer || ''}`, date: v.insurance_expiry, daysLeft });
      }
    });

    drivers.forEach((d: any) => {
      if (d.license_expiry && new Date(d.license_expiry) <= thirtyDays) {
        const daysLeft = Math.ceil((new Date(d.license_expiry).getTime() - Date.now()) / 86400000);
        expiryAlerts.push({ type: 'license', label: 'רישיון', entity: d.full_name, date: d.license_expiry, daysLeft });
      }
    });

    expiryAlerts.sort((a, b) => a.daysLeft - b.daysLeft);
    setAlerts(expiryAlerts);
    setLoading(false);
  };

  const roleLabels: Record<string, string> = { driver: 'נהג', fleet_manager: 'מנהל צי', super_admin: 'מנהל על' };

  const statCards = [
    { label: 'רכבים פעילים', value: stats.vehiclesActive, sub: `מתוך ${stats.vehiclesTotal}`, icon: Car, colorCls: 'bg-primary text-primary-foreground', link: '/vehicles' },
    { label: 'נהגים פעילים', value: stats.driversActive, sub: `מתוך ${stats.driversTotal}`, icon: Users, colorCls: 'bg-primary/80 text-primary-foreground', link: '/drivers' },
    { label: 'תקלות פתוחות', value: stats.faultsOpen, sub: `סה"כ ${stats.faultsTotal}`, icon: Wrench, colorCls: 'bg-warning/15 text-warning border border-warning/30', link: '/faults' },
    { label: 'תאונות פתוחות', value: stats.accidentsOpen, sub: `סה"כ ${stats.accidentsTotal}`, icon: AlertTriangle, colorCls: 'bg-destructive/15 text-destructive border border-destructive/30', link: '/accidents' },
  ];

  const quickActions = [
    { label: 'דיווח תקלה', icon: Wrench, link: '/faults', colorCls: 'border-2 border-warning/40' },
    { label: 'דיווח תאונה', icon: AlertTriangle, link: '/accidents', colorCls: 'border-2 border-destructive/40' },
    { label: 'הזמנת שירות', icon: ClipboardList, link: '/service-orders', colorCls: 'border-2 border-primary/40' },
    { label: 'הצמדת רכב', icon: Car, link: '/attach-car', colorCls: 'border-2 border-primary/40' },
  ];

  if (loading) {
    return (
      <div className="animate-fade-in text-center py-12">
        <Clock size={32} className="mx-auto mb-4 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">טוען דשבורד...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="page-header">שלום, {user?.full_name} 👋</h1>
        <p className="text-lg text-muted-foreground">
          {roleLabels[user?.role || '']} • {user?.company_name}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {statCards.map(s => (
          <Link key={s.label} to={s.link} className={`stat-card ${s.colorCls} hover:scale-[1.02] transition-transform`}>
            <s.icon size={28} />
            <span className="text-3xl font-black">{s.value}</span>
            <span className="text-sm font-medium opacity-90">{s.label}</span>
            <span className="text-xs opacity-70">{s.sub}</span>
          </Link>
        ))}
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card-elevated flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Calendar size={20} className="text-primary" />
          </div>
          <div>
            <p className="text-2xl font-black">{stats.todayTasks}</p>
            <p className="text-sm text-muted-foreground">משימות להיום</p>
          </div>
        </div>
        <div className="card-elevated flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <TrendingUp size={20} className="text-primary" />
          </div>
          <div>
            <p className="text-2xl font-black">₪{stats.expensesMonth.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">הוצאות החודש</p>
          </div>
        </div>
      </div>

      {/* Expiry Alerts */}
      {alerts.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
            <Shield size={20} className="text-warning" />
            התראות תוקף ({alerts.length})
          </h2>
          <div className="space-y-2">
            {alerts.slice(0, 4).map((a, i) => (
              <div key={i} className={`card-elevated flex items-center gap-3 ${a.daysLeft <= 0 ? 'border-2 border-destructive/40' : a.daysLeft <= 7 ? 'border-2 border-warning/40' : ''}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${a.daysLeft <= 0 ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning'}`}>
                  {a.type === 'test' ? <Car size={20} /> : a.type === 'insurance' ? <Shield size={20} /> : <Users size={20} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold">{a.label} - {a.entity}</p>
                  <p className="text-sm text-muted-foreground">{new Date(a.date).toLocaleDateString('he-IL')}</p>
                </div>
                <span className={`text-sm font-bold ${a.daysLeft <= 0 ? 'text-destructive' : a.daysLeft <= 7 ? 'text-warning' : 'text-muted-foreground'}`}>
                  {a.daysLeft <= 0 ? 'פג תוקף!' : `${a.daysLeft} ימים`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <h2 className="text-xl font-bold mb-3">פעולות מהירות</h2>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {quickActions.map(a => (
          <Link key={a.label} to={a.link} className={`big-action-btn bg-card text-foreground ${a.colorCls}`}>
            <a.icon size={32} />
            <span>{a.label}</span>
          </Link>
        ))}
      </div>

      {/* Upcoming tasks */}
      {upcomingTasks.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ClipboardList size={20} />
              משימות קרובות
            </h2>
            <Link to="/work-orders" className="text-primary text-sm font-medium flex items-center gap-1">
              הכל <ChevronLeft size={14} />
            </Link>
          </div>
          <div className="space-y-2">
            {upcomingTasks.map(t => (
              <div key={t.id} className="card-elevated">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-bold text-lg">{t.service_category}</p>
                  <span className="text-sm text-muted-foreground">
                    {t.service_date ? new Date(t.service_date).toLocaleDateString('he-IL', { day: 'numeric', month: 'short' }) : ''} {t.service_time || ''}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  {t.vehicle_plate && <span>🚗 {t.vehicle_plate}</span>}
                  {t.driver_name && <span>👤 {t.driver_name}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Faults */}
      {recentFaults.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Wrench size={20} />
              תקלות אחרונות
            </h2>
            <Link to="/faults" className="text-primary text-sm font-medium flex items-center gap-1">
              הכל <ChevronLeft size={14} />
            </Link>
          </div>
          <div className="space-y-2">
            {recentFaults.map(f => (
              <div key={f.id} className="card-elevated flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${f.urgency === 'critical' ? 'bg-destructive' : f.urgency === 'urgent' ? 'bg-warning' : 'bg-info'}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate">{f.fault_type} - {f.vehicle_plate}</p>
                  <p className="text-sm text-muted-foreground">{f.driver_name}</p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(f.created_at).toLocaleDateString('he-IL', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
