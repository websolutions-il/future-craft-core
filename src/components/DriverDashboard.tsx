import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
  Wrench, AlertTriangle, RefreshCw, FileText, ClipboardList,
  BookOpen, Phone, MessageCircle, Car, Bell, MapPin, Clock,
  Fuel, Calendar, Shield, ChevronLeft, Pencil, Check, X
} from 'lucide-react';

interface AssignedVehicle {
  id: string;
  license_plate: string;
  manufacturer: string;
  model: string;
  year: number | null;
  odometer: number;
  status: string;
  test_expiry: string | null;
  insurance_expiry: string | null;
}

interface DriverRoute {
  id: string;
  name: string;
  origin: string;
  destination: string;
  start_time: string;
  end_time: string;
  days_of_week: string[];
  status: string;
}

interface DriverAlert {
  type: 'fault' | 'expiry' | 'task';
  title: string;
  subtitle: string;
  severity: 'critical' | 'warning' | 'info';
  link?: string;
}

interface RecentFault {
  id: string;
  fault_type: string;
  status: string;
  created_at: string;
  vehicle_plate: string;
}

const DAY_LABELS: Record<string, string> = {
  sunday: 'א׳', monday: 'ב׳', tuesday: 'ג׳', wednesday: 'ד׳',
  thursday: 'ה׳', friday: 'ו׳', saturday: 'ש׳',
};

const actionTiles = [
  { label: 'דיווח תקלה', subtitle: 'צילום ופירוט', icon: Wrench, link: '/faults', color: 'bg-card border border-border' },
  { label: 'תאונה וחירום', subtitle: 'גרירה וסיוע', icon: AlertTriangle, link: '/accidents', color: 'bg-destructive/5 border border-destructive/20' },
  { label: 'החלפת נהג', subtitle: 'עדכון נהג וק"מ', icon: RefreshCw, link: '/handover', color: 'bg-card border border-border' },
  { label: 'דלק וחשבוניות', subtitle: 'קבלות והוצאות', icon: FileText, link: '/expenses', color: 'bg-card border border-border' },
];

export default function DriverDashboard() {
  const { user } = useAuth();
  const [vehicle, setVehicle] = useState<AssignedVehicle | null>(null);
  const [routes, setRoutes] = useState<DriverRoute[]>([]);
  const [alerts, setAlerts] = useState<DriverAlert[]>([]);
  const [recentFaults, setRecentFaults] = useState<RecentFault[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingOdometer, setEditingOdometer] = useState(false);
  const [odometerInput, setOdometerInput] = useState('');
  const [savingOdometer, setSavingOdometer] = useState(false);

  useEffect(() => {
    if (user) loadDriverData();
  }, [user]);

  // Realtime subscriptions for faults & service_orders
  useEffect(() => {
    if (!user) return;
    const driverName = user.full_name || '';

    const channel = supabase
      .channel('driver-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'faults' },
        async (payload) => {
          const row = payload.new as any;
          if (row?.driver_name !== driverName) return;

          if (payload.eventType === 'UPDATE') {
            const title = '🔔 עדכון תקלה';
            const message = `תקלה "${row.fault_type || 'ללא סוג'}" עודכנה לסטטוס: ${row.status}`;
            toast({ title, description: message });
            // Save to DB
            await supabase.from('driver_notifications').insert({
              user_id: user!.id, title, message, type: 'fault_update', link: '/faults',
            });
          }
          loadDriverData();
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'service_orders' },
        async (payload) => {
          const row = payload.new as any;
          if (row?.driver_name !== driverName) return;

          const title = '📋 משימה חדשה!';
          const message = `הזמנת שירות חדשה: ${row.service_category || row.description || 'משימה'}`;
          toast({ title, description: message });
          // Save to DB
          await supabase.from('driver_notifications').insert({
            user_id: user!.id, title, message, type: 'new_task', link: '/work-orders',
          });
          loadDriverData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const loadDriverData = async () => {
    const driverName = user?.full_name || '';

    const [vehicleRes, routesRes, faultsRes, tasksRes] = await Promise.all([
      // Find vehicle assigned to this driver (by assigned_driver_id or by matching driver name in recent handovers)
      supabase.from('vehicles').select('*').eq('assigned_driver_id', user!.id).limit(1),
      supabase.from('routes').select('*').eq('driver_name', driverName).eq('status', 'active'),
      supabase.from('faults').select('*').eq('driver_name', driverName).order('created_at', { ascending: false }).limit(5),
      supabase.from('service_orders').select('*').eq('driver_name', driverName).eq('treatment_status', 'new').limit(5),
    ]);

    // Vehicle
    const v = vehicleRes.data?.[0] || null;
    if (v) {
      setVehicle({
        id: v.id,
        license_plate: v.license_plate,
        manufacturer: v.manufacturer || '',
        model: v.model || '',
        year: v.year,
        odometer: v.odometer || 0,
        status: v.status || 'active',
        test_expiry: v.test_expiry,
        insurance_expiry: v.insurance_expiry,
      });
    }

    // Routes
    setRoutes((routesRes.data || []) as DriverRoute[]);

    // Faults
    setRecentFaults((faultsRes.data || []).map((f: any) => ({
      id: f.id, fault_type: f.fault_type, status: f.status,
      created_at: f.created_at, vehicle_plate: f.vehicle_plate,
    })));

    // Build alerts
    const newAlerts: DriverAlert[] = [];

    // Open faults
    const openFaults = (faultsRes.data || []).filter((f: any) =>
      ['new', 'open', 'חדש', 'פתוח', 'in_progress', 'בטיפול'].includes(f.status || '')
    );
    if (openFaults.length > 0) {
      newAlerts.push({
        type: 'fault', title: `${openFaults.length} תקלות פתוחות`,
        subtitle: 'יש תקלות שדורשות טיפול', severity: 'warning', link: '/faults',
      });
    }

    // Pending tasks
    const pendingTasks = tasksRes.data || [];
    if (pendingTasks.length > 0) {
      newAlerts.push({
        type: 'task', title: `${pendingTasks.length} משימות ממתינות`,
        subtitle: 'הזמנות שירות חדשות', severity: 'info', link: '/work-orders',
      });
    }

    // Vehicle expiry alerts
    if (v) {
      const now = Date.now();
      const thirtyDays = 30 * 86400000;
      if (v.test_expiry) {
        const daysLeft = Math.ceil((new Date(v.test_expiry).getTime() - now) / 86400000);
        if (daysLeft <= 30) {
          newAlerts.push({
            type: 'expiry',
            title: daysLeft <= 0 ? 'טסט פג תוקף!' : `טסט פג בעוד ${daysLeft} ימים`,
            subtitle: `${v.license_plate} - ${v.manufacturer} ${v.model}`,
            severity: daysLeft <= 0 ? 'critical' : 'warning',
          });
        }
      }
      if (v.insurance_expiry) {
        const daysLeft = Math.ceil((new Date(v.insurance_expiry).getTime() - now) / 86400000);
        if (daysLeft <= 30) {
          newAlerts.push({
            type: 'expiry',
            title: daysLeft <= 0 ? 'ביטוח פג תוקף!' : `ביטוח פג בעוד ${daysLeft} ימים`,
            subtitle: `${v.license_plate} - ${v.manufacturer} ${v.model}`,
            severity: daysLeft <= 0 ? 'critical' : 'warning',
          });
        }
      }
    }

    setAlerts(newAlerts);
    setLoading(false);
  };

  const handleSaveOdometer = async () => {
    const newValue = parseInt(odometerInput, 10);
    if (!vehicle || isNaN(newValue) || newValue < 0 || newValue > 9999999) {
      toast({ title: 'ערך לא תקין', description: 'הזן מספר ק"מ תקין (0-9,999,999)', variant: 'destructive' });
      return;
    }
    if (newValue < vehicle.odometer) {
      toast({ title: 'שגיאה', description: 'ק"מ חדש לא יכול להיות נמוך מהנוכחי', variant: 'destructive' });
      return;
    }
    setSavingOdometer(true);
    const { error } = await supabase.from('vehicles').update({ odometer: newValue }).eq('id', vehicle.id);
    setSavingOdometer(false);
    if (error) {
      toast({ title: 'שגיאה בעדכון', description: error.message, variant: 'destructive' });
    } else {
      setVehicle({ ...vehicle, odometer: newValue });
      setEditingOdometer(false);
      toast({ title: 'עודכן בהצלחה', description: `ק"מ עודכן ל-${newValue.toLocaleString()}` });
    }
  };

  const statusLabels: Record<string, string> = {
    active: 'פעיל', inactive: 'לא פעיל', maintenance: 'בתחזוקה', accident: 'בתאונה',
  };

  const faultStatusLabels: Record<string, string> = {
    new: 'חדש', open: 'פתוח', in_progress: 'בטיפול', resolved: 'טופל', closed: 'סגור',
    'חדש': 'חדש', 'פתוח': 'פתוח', 'בטיפול': 'בטיפול', 'טופל': 'טופל', 'סגור': 'סגור',
  };

  if (loading) {
    return (
      <div className="animate-fade-in text-center py-12">
        <Clock size={32} className="mx-auto mb-4 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">טוען דשבורד נהג...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-5">
      {/* Header */}
      <div>
        <p className="text-primary text-lg font-semibold">שלום</p>
        <h1 className="text-3xl font-black text-foreground">{user?.full_name || 'נהג'} 👋</h1>
        <p className="text-muted-foreground text-sm mt-1">{user?.company_name}</p>
      </div>

      {/* Assigned Vehicle Card */}
      <div className="card-elevated">
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Car size={20} className="text-primary" />
          הרכב שלי
        </h2>
        {vehicle ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-black text-foreground">{vehicle.license_plate}</p>
                <p className="text-muted-foreground">{vehicle.manufacturer} {vehicle.model} {vehicle.year || ''}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                vehicle.status === 'active' ? 'bg-success/15 text-success' :
                vehicle.status === 'maintenance' ? 'bg-warning/15 text-warning' :
                'bg-destructive/15 text-destructive'
              }`}>
                {statusLabels[vehicle.status] || vehicle.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted rounded-xl p-3 text-center relative">
                <Fuel size={18} className="mx-auto mb-1 text-primary" />
                {editingOdometer ? (
                  <div className="space-y-2">
                    <input
                      type="number"
                      value={odometerInput}
                      onChange={e => setOdometerInput(e.target.value)}
                      className="w-full text-center text-lg font-bold bg-background border border-border rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
                      autoFocus
                      min={vehicle.odometer}
                      max={9999999}
                    />
                    <div className="flex gap-1 justify-center">
                      <button
                        onClick={handleSaveOdometer}
                        disabled={savingOdometer}
                        className="p-1.5 rounded-lg bg-success/15 text-success hover:bg-success/25 transition-colors"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => setEditingOdometer(false)}
                        className="p-1.5 rounded-lg bg-destructive/15 text-destructive hover:bg-destructive/25 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => { setOdometerInput(String(vehicle.odometer)); setEditingOdometer(true); }}
                    className="w-full group"
                  >
                    <p className="text-xl font-bold group-hover:text-primary transition-colors">
                      {vehicle.odometer.toLocaleString()}
                      <Pencil size={12} className="inline mr-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </p>
                  </button>
                )}
                <p className="text-xs text-muted-foreground">ק"מ</p>
              </div>
              <div className="bg-muted rounded-xl p-3 text-center">
                <Shield size={18} className="mx-auto mb-1 text-primary" />
                <p className="text-sm font-bold">
                  {vehicle.test_expiry
                    ? new Date(vehicle.test_expiry).toLocaleDateString('he-IL')
                    : 'לא ידוע'}
                </p>
                <p className="text-xs text-muted-foreground">תוקף טסט</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <Car size={32} className="mx-auto mb-2 text-muted-foreground/40" />
            <p className="text-muted-foreground">לא הוצמד רכב</p>
            <p className="text-sm text-muted-foreground">פנה למנהל הצי להצמדת רכב</p>
          </div>
        )}
      </div>

      {/* Alerts */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-primary flex items-center gap-2">
            <Bell size={20} />
            ההתראות שלך
            {alerts.length > 0 && (
              <span className="bg-destructive text-destructive-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                {alerts.length}
              </span>
            )}
          </h2>
          <Link to="/driver-notifications" className="text-sm text-primary font-semibold hover:underline">
            היסטוריית התראות
          </Link>
        </div>
        {alerts.length > 0 ? (
          <div className="space-y-2">
            {alerts.map((alert, i) => (
              <Link
                key={i}
                to={alert.link || '#'}
                className={`card-elevated flex items-center gap-3 transition-all active:scale-[0.98] ${
                  alert.severity === 'critical' ? 'border-2 border-destructive/40' :
                  alert.severity === 'warning' ? 'border-2 border-warning/40' : ''
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  alert.severity === 'critical' ? 'bg-destructive/10 text-destructive' :
                  alert.severity === 'warning' ? 'bg-warning/10 text-warning' :
                  'bg-primary/10 text-primary'
                }`}>
                  {alert.type === 'fault' ? <Wrench size={20} /> :
                   alert.type === 'expiry' ? <Shield size={20} /> :
                   <ClipboardList size={20} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground">{alert.title}</p>
                  <p className="text-sm text-muted-foreground">{alert.subtitle}</p>
                </div>
                <ChevronLeft size={18} className="text-muted-foreground flex-shrink-0" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="card-elevated text-center py-6">
            <p className="text-muted-foreground text-lg">✅ אין התראות - הכל תקין!</p>
          </div>
        )}
      </div>

      {/* Action Tiles - 2 column grid */}
      <div className="grid grid-cols-2 gap-3">
        {actionTiles.map(tile => (
          <Link
            key={tile.label}
            to={tile.link}
            className={`flex items-center gap-3 p-5 rounded-2xl shadow-sm transition-all active:scale-95 ${tile.color}`}
          >
            <div className="flex-1 text-right">
              <p className="text-lg font-bold leading-tight">{tile.label}</p>
              <p className="text-sm text-muted-foreground">{tile.subtitle}</p>
            </div>
            <tile.icon size={28} className="text-primary flex-shrink-0" />
          </Link>
        ))}
      </div>

      {/* My Routes */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <MapPin size={20} className="text-primary" />
            המסלולים שלי
          </h2>
          <Link to="/driver-schedule" className="text-sm text-primary font-semibold hover:underline flex items-center gap-1">
            <Calendar size={14} />
            לוח שבועי
          </Link>
        </div>
        {routes.length > 0 ? (
          <div className="space-y-2">
            {routes.map(route => (
              <div key={route.id} className="card-elevated">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold text-foreground text-lg">{route.name}</p>
                  <div className="flex gap-1">
                    {(route.days_of_week || []).map(day => (
                      <span key={day} className="bg-primary/10 text-primary text-xs font-bold px-1.5 py-0.5 rounded">
                        {DAY_LABELS[day.toLowerCase()] || day}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin size={14} />
                  <span>{route.origin}</span>
                  <span>→</span>
                  <span>{route.destination}</span>
                </div>
                {(route.start_time || route.end_time) && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Clock size={14} />
                    <span>{route.start_time}{route.end_time ? ` - ${route.end_time}` : ''}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="card-elevated text-center py-4">
            <p className="text-muted-foreground">לא שובצו מסלולים</p>
          </div>
        )}
      </div>

      {/* Recent Faults */}
      {recentFaults.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
            <Wrench size={20} className="text-primary" />
            תקלות אחרונות
          </h2>
          <div className="space-y-2">
            {recentFaults.slice(0, 3).map(fault => (
              <Link key={fault.id} to="/faults" className="card-elevated flex items-center gap-3 active:scale-[0.98] transition-all">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  ['new', 'open', 'חדש', 'פתוח'].includes(fault.status) ? 'bg-warning/10 text-warning' :
                  ['in_progress', 'בטיפול'].includes(fault.status) ? 'bg-primary/10 text-primary' :
                  'bg-success/10 text-success'
                }`}>
                  <Wrench size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground">{fault.fault_type || 'תקלה'}</p>
                  <p className="text-sm text-muted-foreground">
                    {fault.vehicle_plate} • {new Date(fault.created_at).toLocaleDateString('he-IL')}
                  </p>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  ['new', 'open', 'חדש', 'פתוח'].includes(fault.status) ? 'bg-warning/15 text-warning' :
                  ['in_progress', 'בטיפול'].includes(fault.status) ? 'bg-primary/15 text-primary' :
                  'bg-success/15 text-success'
                }`}>
                  {faultStatusLabels[fault.status] || fault.status}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Work Orders & History */}
      <div className="space-y-3">
        <Link
          to="/work-orders"
          className="flex items-center gap-4 p-5 rounded-2xl shadow-sm transition-all active:scale-95 bg-card border border-border"
        >
          <div className="flex-1 text-right">
            <p className="text-lg font-bold">סידור עבודה</p>
            <p className="text-sm text-muted-foreground">משימות שעות ויעדים</p>
          </div>
          <ClipboardList size={28} className="text-primary flex-shrink-0" />
        </Link>
        <Link
          to="/history"
          className="flex items-center gap-4 p-5 rounded-2xl shadow-sm transition-all active:scale-95 bg-card border border-border"
        >
          <div className="flex-1 text-right">
            <p className="text-lg font-bold">היסטוריה טיפולים</p>
            <p className="text-sm text-muted-foreground">טיפולים ותיקונים שבוצעו</p>
          </div>
          <BookOpen size={28} className="text-primary flex-shrink-0" />
        </Link>
      </div>

      {/* Emergency 24/7 */}
      <Link
        to="/emergency"
        className="flex items-center gap-4 p-6 rounded-2xl bg-destructive/10 border-2 border-destructive/30 shadow-sm transition-all active:scale-95"
      >
        <div className="flex-1 text-right">
          <p className="text-xl font-black text-destructive">שירותי חירום 24/7</p>
          <p className="text-sm text-muted-foreground">פתיחת קריאת שירות מיידית</p>
        </div>
        <Phone size={32} className="text-destructive flex-shrink-0" />
      </Link>

      {/* WhatsApp */}
      <a
        href="https://wa.me/972000000000"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-4 p-5 rounded-2xl bg-success/10 border border-success/30 shadow-sm transition-all active:scale-95"
      >
        <div className="flex-1 text-right">
          <p className="text-lg font-bold text-success">וואטסאפ למוקד</p>
          <p className="text-sm text-muted-foreground">שיחה מהירה עם המוקד</p>
        </div>
        <MessageCircle size={28} className="text-success flex-shrink-0" />
      </a>
    </div>
  );
}
