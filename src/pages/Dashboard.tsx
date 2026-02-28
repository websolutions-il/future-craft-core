import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  BarChart3,
  Building2,
  Car,
  ClipboardList,
  FilePlus2,
  Route,
  UserPlus,
  Users,
  Wrench,
  ArrowRightLeft,
  Bell,
} from 'lucide-react';
import { useAuth, type AppRole } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import DriverDashboard from '@/components/DriverDashboard';
import { toast } from '@/hooks/use-toast';

const OPEN_TREATMENT_STATUSES = ['new', 'open', 'in_progress', 'pending', 'חדש', 'פתוח', 'בטיפול'];
const MAINTENANCE_STATUSES = ['maintenance', 'in_service', 'בתחזוקה', 'בטיפול'];

interface SuperAdminStats {
  companiesCount: number;
  usersCount: number;
  emergencyOpenCount: number;
  vehiclesInTreatmentCount: number;
}

interface FleetVehiclePreview {
  id: string;
  manufacturer: string;
  model: string;
  year: number | null;
  odometer: number;
}

interface FleetStats {
  vehiclesCount: number;
  driversCount: number;
}

interface FleetAlertRow {
  key: string;
  label: string;
  count: number;
  link: string;
}

interface CreateUserFormState {
  email: string;
  password: string;
  fullName: string;
  companyName: string;
  role: AppRole;
}

const isOpenStatus = (status: string | null | undefined) =>
  OPEN_TREATMENT_STATUSES.includes((status || '').toLowerCase()) ||
  OPEN_TREATMENT_STATUSES.includes(status || '');

const isClosedAccident = (status: string | null | undefined) => {
  const normalized = (status || '').toLowerCase();
  return normalized === 'closed' || status === 'סגור';
};

const daysUntil = (dateValue: string | null | undefined) => {
  if (!dateValue) return null;
  const diff = new Date(dateValue).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
};

export default function Dashboard() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  if (!user) return null;

  if (user.role === 'driver') {
    return <DriverDashboard />;
  }

  if (user.role === 'super_admin') {
    const isFleetMode = searchParams.get('mode') === 'fleet';

    if (isFleetMode) {
      return <FleetManagerDashboard isActingAsFleetManager />;
    }

    return <SuperAdminDashboard onEnterFleetMode={() => setSearchParams({ mode: 'fleet' })} />;
  }

  return <FleetManagerDashboard isActingAsFleetManager={false} />;
}

function SuperAdminDashboard({ onEnterFleetMode }: { onEnterFleetMode: () => void }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [creatingUser, setCreatingUser] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [stats, setStats] = useState<SuperAdminStats>({
    companiesCount: 0,
    usersCount: 0,
    emergencyOpenCount: 0,
    vehiclesInTreatmentCount: 0,
  });
  const [form, setForm] = useState<CreateUserFormState>({
    email: '',
    password: '',
    fullName: '',
    companyName: '',
    role: 'fleet_manager',
  });

  const loadSuperAdminStats = async () => {
    setLoading(true);

    const [profilesRes, usersCountRes, emergencyRes, treatmentVehiclesRes] = await Promise.all([
      supabase.from('profiles').select('company_name'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase
        .from('service_orders')
        .select('id', { count: 'exact', head: true })
        .ilike('vendor_name', '%דליה%')
        .in('treatment_status', OPEN_TREATMENT_STATUSES)
        .or('service_category.ilike.%חירום%,description.ilike.%חירום%'),
      supabase
        .from('service_orders')
        .select('vehicle_plate')
        .ilike('vendor_name', '%דליה%')
        .in('treatment_status', OPEN_TREATMENT_STATUSES),
    ]);

    if (profilesRes.error || usersCountRes.error || emergencyRes.error || treatmentVehiclesRes.error) {
      toast({
        title: 'שגיאה בטעינת נתונים',
        description: 'לא הצלחנו לטעון את נתוני הדשבורד כרגע.',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    const companies = new Set(
      (profilesRes.data || [])
        .map((row) => row.company_name?.trim())
        .filter((company): company is string => Boolean(company))
    );

    const vehiclesInTreatment = new Set(
      (treatmentVehiclesRes.data || [])
        .map((row) => row.vehicle_plate?.trim())
        .filter((plate): plate is string => Boolean(plate))
    );

    setStats({
      companiesCount: companies.size,
      usersCount: usersCountRes.count || 0,
      emergencyOpenCount: emergencyRes.count || 0,
      vehiclesInTreatmentCount: vehiclesInTreatment.size,
    });

    setLoading(false);
  };

  useEffect(() => {
    loadSuperAdminStats();
  }, []);

  const submitCreateUser = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.email || !form.password || !form.fullName || !form.companyName) {
      toast({
        title: 'חסרים פרטים',
        description: 'יש למלא את כל השדות לפני יצירת המשתמש.',
        variant: 'destructive',
      });
      return;
    }

    setCreatingUser(true);
    const { data, error } = await supabase.functions.invoke('create-admin-user', {
      body: {
        email: form.email,
        password: form.password,
        full_name: form.fullName,
        company_name: form.companyName,
        role: form.role,
      },
    });
    setCreatingUser(false);

    if (error || data?.error) {
      toast({
        title: 'יצירת משתמש נכשלה',
        description: data?.error || error?.message || 'אירעה שגיאה לא צפויה.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'המשתמש נוצר בהצלחה',
      description: 'ניתן להתחבר עם הפרטים החדשים מיד.',
    });

    setForm({ email: '', password: '', fullName: '', companyName: '', role: 'fleet_manager' });
    setShowCreateUserModal(false);
    loadSuperAdminStats();
  };

  const superAdminActions = [
    { label: 'פתיחת משתמש חדש', icon: UserPlus, action: () => setShowCreateUserModal(true), type: 'button' as const },
    { label: 'כניסה למנהל צי רכב', icon: ArrowRightLeft, action: onEnterFleetMode, type: 'button' as const },
    { label: 'דוחות כל החברות', icon: BarChart3, href: '/reports', type: 'link' as const },
    { label: 'ניהול הזמנות לקוחות', icon: ClipboardList, href: '/service-orders', type: 'link' as const },
    { label: 'ניהול חירום כל החברות', icon: AlertTriangle, href: '/emergency', type: 'link' as const },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-black text-foreground">דשבורד מנהל על</h1>
        <p className="text-muted-foreground text-base">{user?.full_name}</p>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'חברות', value: stats.companiesCount, icon: Building2 },
          { label: 'משתמשים', value: stats.usersCount, icon: Users },
          { label: 'חירום פתוח (דליה)', value: stats.emergencyOpenCount, icon: AlertTriangle },
          { label: 'רכבים בטיפול בדליה', value: stats.vehiclesInTreatmentCount, icon: Wrench },
        ].map((card) => (
          <div key={card.label} className="card-elevated p-4">
            <div className="flex items-center justify-between">
              <card.icon size={18} className="text-primary" />
              <span className="text-2xl font-black text-foreground">{loading ? '...' : card.value}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{card.label}</p>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        {superAdminActions.map((item) =>
          item.type === 'link' ? (
            <Link key={item.label} to={item.href!} className="big-action-btn bg-card text-foreground border border-border">
              <item.icon size={26} />
              <span>{item.label}</span>
            </Link>
          ) : (
            <button
              key={item.label}
              type="button"
              onClick={item.action}
              className="w-full big-action-btn bg-card text-foreground border border-border"
            >
              <item.icon size={26} />
              <span>{item.label}</span>
            </button>
          )
        )}
      </section>

      {showCreateUserModal && (
        <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg p-5">
            <h2 className="text-xl font-bold mb-4">פתיחת משתמש חדש</h2>
            <form onSubmit={submitCreateUser} className="space-y-3">
              <input
                value={form.fullName}
                onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
                placeholder="שם מלא"
                className="w-full p-3 rounded-xl border border-input bg-background"
                required
              />
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                placeholder="אימייל"
                className="w-full p-3 rounded-xl border border-input bg-background"
                dir="ltr"
                required
              />
              <input
                type="password"
                value={form.password}
                onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                placeholder="סיסמה"
                className="w-full p-3 rounded-xl border border-input bg-background"
                required
              />
              <input
                value={form.companyName}
                onChange={(event) => setForm((prev) => ({ ...prev, companyName: event.target.value }))}
                placeholder="שם חברה"
                className="w-full p-3 rounded-xl border border-input bg-background"
                required
              />
              <select
                value={form.role}
                onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value as AppRole }))}
                className="w-full p-3 rounded-xl border border-input bg-background"
              >
                <option value="fleet_manager">מנהל צי</option>
                <option value="driver">נהג</option>
                <option value="super_admin">מנהל על</option>
              </select>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCreateUserModal(false)}
                  className="flex-1 py-3 rounded-xl border border-input bg-background"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  disabled={creatingUser}
                  className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-bold disabled:opacity-60"
                >
                  {creatingUser ? 'יוצר...' : 'צור משתמש'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function FleetManagerDashboard({
  isActingAsFleetManager,
}: {
  isActingAsFleetManager: boolean;
}) {
  const { user } = useAuth();
  const isSuperAdminView = user?.role === 'super_admin' && isActingAsFleetManager;

  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState(user?.company_name || '');
  const [companyOptions, setCompanyOptions] = useState<string[]>([]);
  const [stats, setStats] = useState<FleetStats>({ vehiclesCount: 0, driversCount: 0 });
  const [vehiclePreview, setVehiclePreview] = useState<FleetVehiclePreview[]>([]);
  const [alerts, setAlerts] = useState<FleetAlertRow[]>([]);

  useEffect(() => {
    if (!isSuperAdminView) {
      setSelectedCompany(user?.company_name || '');
      return;
    }

    const loadCompanies = async () => {
      const { data } = await supabase.from('profiles').select('company_name');
      const companies = Array.from(
        new Set(
          (data || [])
            .map((row) => row.company_name?.trim())
            .filter((company): company is string => Boolean(company))
        )
      );
      setCompanyOptions(companies);
      if (!selectedCompany && companies.length > 0) {
        setSelectedCompany(companies[0]);
      }
    };

    loadCompanies();
  }, [isSuperAdminView, user?.company_name]);

  useEffect(() => {
    if (!user) return;
    if (isSuperAdminView && !selectedCompany) return;

    const loadFleetDashboard = async () => {
      setLoading(true);

      const withCompanyScope = (query: any) =>
        isSuperAdminView ? query.eq('company_name', selectedCompany) : query;

      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

      const [
        vehiclesRes,
        driversCountRes,
        faultsRes,
        accidentsRes,
        serviceOrdersRes,
        expensesRes,
      ] = await Promise.all([
        withCompanyScope(
          supabase
            .from('vehicles')
            .select('id, manufacturer, model, year, odometer, status, test_expiry, insurance_expiry')
        ),
        withCompanyScope(supabase.from('drivers').select('*', { count: 'exact', head: true })),
        withCompanyScope(supabase.from('faults').select('id, status')),
        withCompanyScope(supabase.from('accidents').select('id, status')),
        withCompanyScope(
          supabase
            .from('service_orders')
            .select('id, service_category, treatment_status, service_date, vehicle_plate')
        ),
        withCompanyScope(supabase.from('expenses').select('id, amount').gte('date', monthStart)),
      ]);

      if (
        vehiclesRes.error ||
        driversCountRes.error ||
        faultsRes.error ||
        accidentsRes.error ||
        serviceOrdersRes.error ||
        expensesRes.error
      ) {
        toast({
          title: 'שגיאה בטעינת נתונים',
          description: 'לא הצלחנו לטעון את נתוני דשבורד מנהל הצי.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      const vehicles = vehiclesRes.data || [];
      const faults = faultsRes.data || [];
      const accidents = accidentsRes.data || [];
      const serviceOrders = serviceOrdersRes.data || [];
      const expenses = expensesRes.data || [];

      const insuranceDue = vehicles.filter((vehicle) => {
        const days = daysUntil(vehicle.insurance_expiry);
        return days !== null && days <= 30;
      }).length;

      const testDue = vehicles.filter((vehicle) => {
        const days = daysUntil(vehicle.test_expiry);
        return days !== null && days <= 30;
      }).length;

      const periodicServiceDue = serviceOrders.filter(
        (order) =>
          isOpenStatus(order.treatment_status) &&
          (order.service_category || '').toLowerCase().includes('תקופ')
      ).length;

      const vehiclesInGarage = vehicles.filter((vehicle) =>
        MAINTENANCE_STATUSES.includes((vehicle.status || '').toLowerCase()) ||
        MAINTENANCE_STATUSES.includes(vehicle.status || '')
      ).length;

      const openFaults = faults.filter((fault) => isOpenStatus(fault.status)).length;
      const openAccidents = accidents.filter((accident) => !isClosedAccident(accident.status)).length;

      const expenseAmounts = expenses.map((item) => Number(item.amount) || 0).filter((value) => value > 0);
      const averageExpense = expenseAmounts.length
        ? expenseAmounts.reduce((sum, value) => sum + value, 0) / expenseAmounts.length
        : 0;
      const unusualExpenses = expenseAmounts.filter(
        (value) => value > Math.max(averageExpense * 1.8, 3000)
      ).length;

      setStats({
        vehiclesCount: vehicles.length,
        driversCount: driversCountRes.count || 0,
      });

      setVehiclePreview(
        vehicles.slice(0, 8).map((vehicle) => ({
          id: vehicle.id,
          manufacturer: vehicle.manufacturer || '-',
          model: vehicle.model || '-',
          year: vehicle.year,
          odometer: Number(vehicle.odometer) || 0,
        }))
      );

      setAlerts([
        { key: 'insurance', label: 'ביטוח מתקרב', count: insuranceDue, link: '/alerts' },
        { key: 'test', label: 'טסט מתקרב', count: testDue, link: '/alerts' },
        { key: 'periodic', label: 'טיפול תקופתי מתקרב', count: periodicServiceDue, link: '/service-orders' },
        { key: 'garage', label: 'רכב שנמצא כרגע במוסך', count: vehiclesInGarage, link: '/vehicles' },
        { key: 'faults', label: 'תקלות פתוחות', count: openFaults, link: '/faults' },
        { key: 'accidents', label: 'תאונות פתוחות', count: openAccidents, link: '/accidents' },
        { key: 'expenses', label: 'הוצאות חריגות', count: unusualExpenses, link: '/expenses' },
      ]);

      setLoading(false);
    };

    loadFleetDashboard();
  }, [user?.id, isSuperAdminView, selectedCompany]);

  const fleetActions = useMemo(
    () => [
      { label: 'הצמדת נהג לרכב', icon: ArrowRightLeft, href: '/attach-car' },
      { label: 'הזמנת שירותים / השוואת מחירים', icon: ClipboardList, href: '/service-orders' },
      { label: 'דיווח תאונה', icon: AlertTriangle, href: '/accidents' },
      { label: 'היסטוריה – כל הרכבים בחברה', icon: Car, href: '/history' },
      { label: 'דוחות – של החברה בלבד', icon: BarChart3, href: '/reports' },
      { label: 'ניהול מסלול וסידור עבודה לנהגים', icon: Route, href: '/routes' },
      { label: 'צירוף לקוח חדש', icon: FilePlus2, href: '/customers' },
      { label: 'הצמדת נהג ללקוח בתוך סידור עבודה', icon: Users, href: '/work-orders' },
      { label: 'כניסה לדשבורד נהג', icon: Users, href: '/driver-view' },
    ],
    []
  );

  return (
    <div className="animate-fade-in space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-black text-foreground">דשבורד מנהל צי רכב</h1>
        <p className="text-muted-foreground text-base">{user?.full_name}</p>
        <p className="text-muted-foreground text-sm">
          חברה: {isSuperAdminView ? selectedCompany || 'בחר חברה' : user?.company_name || '-'}
        </p>
      </header>

      {isSuperAdminView && (
        <section className="card-elevated p-4">
          <label className="text-sm font-semibold text-muted-foreground block mb-2">בחירת חברה להצגת נתונים</label>
          <select
            value={selectedCompany}
            onChange={(event) => setSelectedCompany(event.target.value)}
            className="w-full p-3 rounded-xl border border-input bg-background"
          >
            {companyOptions.map((company) => (
              <option key={company} value={company}>
                {company}
              </option>
            ))}
          </select>
        </section>
      )}

      <section className="card-elevated overflow-x-auto">
        <h2 className="text-lg font-bold mb-3">פרטי רכבים בצי</h2>
        <table className="w-full text-sm min-w-[560px]">
          <thead>
            <tr className="text-muted-foreground border-b border-border">
              <th className="py-2 text-right">יצרן</th>
              <th className="py-2 text-right">דגם</th>
              <th className="py-2 text-right">מודל</th>
              <th className="py-2 text-right">קילומטראז'</th>
            </tr>
          </thead>
          <tbody>
            {vehiclePreview.length > 0 ? (
              vehiclePreview.map((vehicle) => (
                <tr key={vehicle.id} className="border-b border-border/60 last:border-0">
                  <td className="py-2">{vehicle.manufacturer}</td>
                  <td className="py-2">{vehicle.model}</td>
                  <td className="py-2">{vehicle.year || '-'}</td>
                  <td className="py-2">{vehicle.odometer.toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-4 text-center text-muted-foreground">
                  {loading ? 'טוען נתוני צי...' : 'אין נתוני רכבים להצגה'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="card-elevated p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">כמות רכבים</p>
            <p className="text-3xl font-black">{loading ? '...' : stats.vehiclesCount}</p>
          </div>
          <Link to="/vehicles" className="px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold">
            הוספת רכב
          </Link>
        </div>
        <div className="card-elevated p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">כמות נהגים</p>
            <p className="text-3xl font-black">{loading ? '...' : stats.driversCount}</p>
          </div>
          <Link to="/drivers" className="px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold">
            הוספת נהג
          </Link>
        </div>
      </section>

      <section className="card-elevated p-4">
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Bell size={18} className="text-primary" />
          התראות דשבורד
        </h2>
        <div className="space-y-2">
          {alerts.map((alert) => (
            <Link
              key={alert.key}
              to={alert.link}
              className="flex items-center justify-between rounded-xl border border-border p-3 hover:bg-muted/50 transition-colors"
            >
              <span className="font-medium">{alert.label}</span>
              <span className={`text-sm font-bold ${alert.count > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {alert.count}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {fleetActions.map((action) => (
          <Link key={action.label} to={action.href} className="big-action-btn bg-card text-foreground border border-border">
            <action.icon size={24} />
            <span>{action.label}</span>
          </Link>
        ))}
      </section>
    </div>
  );
}
