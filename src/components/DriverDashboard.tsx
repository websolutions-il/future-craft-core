import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Car,
  ClipboardList,
  FileText,
  Phone,
  Shield,
  Wrench,
  Bell,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AssignedVehicle {
  id: string;
  manufacturer: string;
  model: string;
  year: number | null;
  license_plate: string;
  odometer: number;
  test_expiry: string | null;
  insurance_expiry: string | null;
}

interface DriverAlert {
  key: string;
  title: string;
  count?: number;
  severity: 'critical' | 'warning' | 'info';
  link: string;
}

const OPEN_TREATMENT_STATUSES = ['new', 'open', 'in_progress', 'pending', 'חדש', 'פתוח', 'בטיפול'];

const daysUntil = (dateValue: string | null | undefined) => {
  if (!dateValue) return null;
  const diff = new Date(dateValue).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
};

const isOpenStatus = (status: string | null | undefined) =>
  OPEN_TREATMENT_STATUSES.includes((status || '').toLowerCase()) ||
  OPEN_TREATMENT_STATUSES.includes(status || '');

const driverActions = [
  { label: 'דיווח תקלה', icon: Wrench, link: '/faults' },
  { label: 'דיווח תאונה', icon: AlertTriangle, link: '/accidents' },
  { label: 'הזמנת שירות', icon: ClipboardList, link: '/service-orders' },
  { label: 'העלאת חשבונית דלק / הוצאה', icon: FileText, link: '/expenses' },
  { label: 'היסטוריית טיפולים לרכב', icon: Car, link: '/history' },
  { label: 'סידור עבודה שלי', icon: ClipboardList, link: '/driver-schedule' },
  { label: 'יצירת קשר עם מוקד', icon: Phone, link: '/emergency' },
];

export default function DriverDashboard() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [vehicle, setVehicle] = useState<AssignedVehicle | null>(null);
  const [alerts, setAlerts] = useState<DriverAlert[]>([]);

  useEffect(() => {
    if (!user) return;

    const loadDriverDashboard = async () => {
      setLoading(true);

      const [vehicleRes, serviceOrdersRes] = await Promise.all([
        supabase
          .from('vehicles')
          .select('id, manufacturer, model, year, license_plate, odometer, test_expiry, insurance_expiry')
          .eq('assigned_driver_id', user.id)
          .limit(1),
        supabase
          .from('service_orders')
          .select('id, service_category, treatment_status, vehicle_plate')
          .eq('driver_name', user.full_name),
      ]);

      if (vehicleRes.error || serviceOrdersRes.error) {
        toast({
          title: 'שגיאה בטעינת נתוני הדשבורד',
          description: 'לא הצלחנו לטעון נתונים כרגע.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      const assignedVehicle = vehicleRes.data?.[0] || null;
      setVehicle(
        assignedVehicle
          ? {
              id: assignedVehicle.id,
              manufacturer: assignedVehicle.manufacturer || '-',
              model: assignedVehicle.model || '-',
              year: assignedVehicle.year,
              license_plate: assignedVehicle.license_plate,
              odometer: Number(assignedVehicle.odometer) || 0,
              test_expiry: assignedVehicle.test_expiry,
              insurance_expiry: assignedVehicle.insurance_expiry,
            }
          : null
      );

      const allOrders = serviceOrdersRes.data || [];
      const openOrders = allOrders.filter((order) => isOpenStatus(order.treatment_status));
      const scopedOpenOrders = assignedVehicle
        ? openOrders.filter(
            (order) => !order.vehicle_plate || order.vehicle_plate === assignedVehicle.license_plate
          )
        : openOrders;
      const periodicServiceOpen = scopedOpenOrders.filter((order) =>
        (order.service_category || '').toLowerCase().includes('תקופ')
      );

      const newAlerts: DriverAlert[] = [];
      const testDays = daysUntil(assignedVehicle?.test_expiry);
      const insuranceDays = daysUntil(assignedVehicle?.insurance_expiry);

      if (testDays !== null && testDays <= 30) {
        newAlerts.push({
          key: 'test',
          title: testDays <= 0 ? 'טסט פג תוקף' : `טסט מתקרב (${testDays} ימים)`,
          severity: testDays <= 0 ? 'critical' : 'warning',
          link: '/alerts',
        });
      }

      if (insuranceDays !== null && insuranceDays <= 30) {
        newAlerts.push({
          key: 'insurance',
          title: insuranceDays <= 0 ? 'ביטוח פג תוקף' : `ביטוח מתקרב (${insuranceDays} ימים)`,
          severity: insuranceDays <= 0 ? 'critical' : 'warning',
          link: '/alerts',
        });
      }

      if (periodicServiceOpen.length > 0) {
        newAlerts.push({
          key: 'periodic_service',
          title: 'טיפול תקופתי מתקרב',
          count: periodicServiceOpen.length,
          severity: 'warning',
          link: '/service-orders',
        });
      }

      if (scopedOpenOrders.length > 0) {
        newAlerts.push({
          key: 'open_service_order',
          title: 'הזמנת שירות פתוחה לרכב',
          count: scopedOpenOrders.length,
          severity: 'info',
          link: '/service-orders',
        });
      }

      setAlerts(newAlerts);
      setLoading(false);
    };

    loadDriverDashboard();
  }, [user?.id, user?.full_name]);

  return (
    <div className="animate-fade-in space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-black text-foreground">דשבורד נהג</h1>
        <p className="text-muted-foreground">{user?.full_name}</p>
        <p className="text-muted-foreground text-sm">{user?.company_name}</p>
      </header>

      <section className="card-elevated p-4">
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Car size={18} className="text-primary" />
          הרכב המשויך
        </h2>
        {vehicle ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
            <div className="rounded-xl bg-muted p-3">
              <p className="text-xs text-muted-foreground">יצרן</p>
              <p className="font-bold">{vehicle.manufacturer}</p>
            </div>
            <div className="rounded-xl bg-muted p-3">
              <p className="text-xs text-muted-foreground">דגם</p>
              <p className="font-bold">{vehicle.model}</p>
            </div>
            <div className="rounded-xl bg-muted p-3">
              <p className="text-xs text-muted-foreground">מודל</p>
              <p className="font-bold">{vehicle.year || '-'}</p>
            </div>
            <div className="rounded-xl bg-muted p-3">
              <p className="text-xs text-muted-foreground">מספר רכב</p>
              <p className="font-bold">{vehicle.license_plate}</p>
            </div>
            <div className="rounded-xl bg-muted p-3">
              <p className="text-xs text-muted-foreground">קילומטראז'</p>
              <p className="font-bold">{vehicle.odometer.toLocaleString()}</p>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">לא הוצמד רכב לנהג זה.</p>
        )}
      </section>

      <section className="card-elevated p-4">
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Bell size={18} className="text-primary" />
          התראות נהג
        </h2>
        {loading ? (
          <p className="text-muted-foreground">טוען התראות...</p>
        ) : alerts.length > 0 ? (
          <div className="space-y-2">
            {alerts.map((alert) => (
              <Link
                key={alert.key}
                to={alert.link}
                className="flex items-center justify-between rounded-xl border border-border p-3 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {alert.severity === 'critical' ? (
                    <AlertTriangle size={16} className="text-destructive" />
                  ) : (
                    <Shield size={16} className={alert.severity === 'warning' ? 'text-warning' : 'text-primary'} />
                  )}
                  <span className="font-medium">{alert.title}</span>
                </div>
                {typeof alert.count === 'number' && (
                  <span className="text-sm font-bold text-destructive">{alert.count}</span>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">אין התראות פתוחות כרגע.</p>
        )}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {driverActions.map((action) => (
          <Link key={action.label} to={action.link} className="big-action-btn bg-card text-foreground border border-border">
            <action.icon size={24} />
            <span>{action.label}</span>
          </Link>
        ))}
      </section>
    </div>
  );
}
