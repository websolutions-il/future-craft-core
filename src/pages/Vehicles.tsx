import { useState, useEffect, useCallback } from 'react';
import { Car, Search, Plus, ArrowRight, Edit2, Phone, Trash2, Truck, Download, PlusCircle, X } from 'lucide-react';
import { exportToCsv } from '@/utils/exportCsv';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCompanyFilter, applyCompanyScope } from '@/hooks/useCompanyFilter';
import { toast } from 'sonner';
import ImageUpload from '@/components/ImageUpload';

interface VehicleRow {
  id: string;
  license_plate: string;
  manufacturer: string;
  model: string;
  year: number;
  vehicle_type: string;
  status: string;
  odometer: number;
  assigned_driver_id: string | null;
  company_name: string;
  test_expiry: string | null;
  insurance_expiry: string | null;
  insurance_start: string | null;
  comprehensive_insurance_expiry: string | null;
  comprehensive_insurance_start: string | null;
  next_service_date: string | null;
  last_service_date: string | null;
  needs_transport: boolean;
  approval_status: string;
  license_doc_url: string;
  insurance_doc_url: string;
  comprehensive_insurance_doc_url: string;
  notes: string;
  management_type: string;
  monthly_leasing_cost: number | null;
  leasing_end_date: string | null;
  vehicle_return_date: string | null;
  monthly_loan_payment: number | null;
  loan_end_date: string | null;
  planned_replacement_date: string | null;
  has_loan: boolean;
  is_leasing: boolean;
}

interface InsuranceHistoryRow {
  id?: string;
  vehicle_id?: string;
  year: number;
  has_no_claims: boolean;
  insurer_name: string;
  mandatory_insurance_cost: number;
  comprehensive_insurance_cost: number;
  company_name?: string;
}

interface DriverRow { id: string; full_name: string; phone: string | null; }

type ViewMode = 'list' | 'detail' | 'form';

export default function Vehicles() {
  const { user } = useAuth();
  const companyFilter = useCompanyFilter();
  const [vehicles, setVehicles] = useState<VehicleRow[]>([]);
  const [drivers, setDrivers] = useState<DriverRow[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [filterCompany, setFilterCompany] = useState('');
  const [filterDriver, setFilterDriver] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleRow | null>(null);
  const [editVehicle, setEditVehicle] = useState<VehicleRow | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const [vRes, dRes] = await Promise.all([
      applyCompanyScope(supabase.from('vehicles').select('*'), companyFilter).order('created_at', { ascending: false }),
      applyCompanyScope(supabase.from('drivers').select('id, full_name, phone'), companyFilter),
    ]);
    if (vRes.data) setVehicles(vRes.data as VehicleRow[]);
    if (dRes.data) setDrivers(dRes.data as DriverRow[]);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const getDriverName = (id: string | null) => {
    if (!id) return 'לא משויך';
    return drivers.find(d => d.id === id)?.full_name || 'לא ידוע';
  };

  const companies = [...new Set(vehicles.map(v => v.company_name).filter(Boolean))];

  const filtered = vehicles.filter(v => {
    const matchSearch = !search || v.license_plate.includes(search) || v.manufacturer?.includes(search) || v.model?.includes(search);
    const matchStatus = statusFilter === 'all' || v.status === statusFilter;
    const matchCompany = !filterCompany || v.company_name === filterCompany;
    const matchDriver = !filterDriver || v.assigned_driver_id === filterDriver;
    return matchSearch && matchStatus && matchCompany && matchDriver;
  });

  const statusLabel = (s: string) => {
    switch (s) {
      case 'active': return { text: 'פעיל', cls: 'status-active' };
      case 'in_service': return { text: 'בטיפול', cls: 'status-pending' };
      case 'out_of_service': return { text: 'לא פעיל', cls: 'status-inactive' };
      default: return { text: s || 'לא ידוע', cls: '' };
    }
  };

  const isManager = user?.role === 'fleet_manager' || user?.role === 'super_admin';

  const handleOpenForm = (vehicle?: VehicleRow) => {
    setEditVehicle(vehicle || null);
    setViewMode('form');
  };

  const handleViewDetail = (v: VehicleRow) => {
    setSelectedVehicle(v);
    setViewMode('detail');
  };

  const handleBack = () => {
    setViewMode('list');
    setSelectedVehicle(null);
    setEditVehicle(null);
  };

  const handleFormDone = () => {
    handleBack();
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק רכב זה?')) return;
    const { error } = await supabase.from('vehicles').delete().eq('id', id);
    if (error) {
      toast.error('שגיאה במחיקת הרכב');
    } else {
      toast.success('הרכב נמחק בהצלחה');
      handleFormDone();
    }
  };

  // === FORM VIEW ===
  if (viewMode === 'form') {
    return <VehicleForm vehicle={editVehicle} drivers={drivers} onDone={handleFormDone} onBack={handleBack} user={user} />;
  }

  // === DETAIL VIEW ===
  if (viewMode === 'detail' && selectedVehicle) {
    const v = selectedVehicle;
    const sl = statusLabel(v.status);
    const driver = drivers.find(d => d.id === v.assigned_driver_id);
    const daysUntil = (dateStr: string | null) => {
      if (!dateStr) return null;
      return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
    };
    const testDays = daysUntil(v.test_expiry);
    const insDays = daysUntil(v.insurance_expiry);
    const compDays = daysUntil(v.comprehensive_insurance_expiry);
    const expiryColor = (days: number | null) => {
      if (days === null) return '';
      if (days <= 0) return 'text-destructive font-bold';
      if (days <= 14) return 'text-warning font-bold';
      return '';
    };

    return (
      <div className="animate-fade-in">
        <button onClick={handleBack} className="flex items-center gap-2 text-primary text-lg font-medium mb-4 min-h-[48px]">
          <ArrowRight size={20} /> חזרה לרשימה
        </button>

        <div className="card-elevated mb-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">{v.manufacturer} {v.model}</h1>
              <p className="text-lg text-muted-foreground mt-1">{v.license_plate} • {v.year || ''}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`status-badge ${sl.cls}`}>{sl.text}</span>
              {isManager && (
                <button onClick={() => handleOpenForm(v)} className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                  <Edit2 size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-y-5 gap-x-4 text-lg">
            <InfoField label="סוג רכב" value={v.vehicle_type || '—'} />
            <InfoField label='ק"מ' value={`${(v.odometer || 0).toLocaleString()}`} />
            <InfoField label="חברה" value={v.company_name || '—'} />
            <InfoField label="נהג משויך" value={getDriverName(v.assigned_driver_id)} />
          </div>

          {/* Driver quick actions */}
          {driver && (
            <div className="flex gap-2 mt-4">
              {driver.phone && (
                <a href={`tel:${driver.phone}`} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 text-primary font-medium text-sm">
                  <Phone size={16} /> {driver.phone}
                </a>
              )}
            </div>
          )}
        </div>

        {/* Expiry Dates */}
        <div className="card-elevated mb-4">
          <h2 className="text-lg font-bold mb-4">תוקף מסמכים</h2>
          <div className="space-y-3">
            <ExpiryRow label="טסט" date={v.test_expiry} daysLeft={testDays} colorCls={expiryColor(testDays)} />
            <ExpiryRow label="ביטוח חובה" date={v.insurance_expiry} daysLeft={insDays} colorCls={expiryColor(insDays)} />
            <ExpiryRow label="ביטוח מקיף" date={v.comprehensive_insurance_expiry} daysLeft={compDays} colorCls={expiryColor(compDays)} />
            {v.next_service_date && (() => {
              const svcDays = daysUntil(v.next_service_date);
              return <ExpiryRow label="טיפול הבא" date={v.next_service_date} daysLeft={svcDays} colorCls={expiryColor(svcDays)} />;
            })()}
          </div>
        </div>

        {/* Documents */}
        <div className="card-elevated mb-4">
          <h2 className="text-lg font-bold mb-4">מסמכים</h2>
          <div className="space-y-2">
            {v.license_doc_url && <DocLink label="רישיון רכב" url={v.license_doc_url} />}
            {v.insurance_doc_url && <DocLink label="פוליסת ביטוח חובה" url={v.insurance_doc_url} />}
            {v.comprehensive_insurance_doc_url && <DocLink label="פוליסת ביטוח מקיף" url={v.comprehensive_insurance_doc_url} />}
            {!v.license_doc_url && !v.insurance_doc_url && !v.comprehensive_insurance_doc_url && (
              <p className="text-muted-foreground text-sm">אין מסמכים מצורפים</p>
            )}
          </div>
        </div>

        {/* Transport */}
        {v.needs_transport && (
          <div className="card-elevated mb-4">
            <div className="flex items-center gap-2 text-primary font-bold">
              <Truck size={20} /> נדרש שינוע
            </div>
          </div>
        )}

        {/* Notes */}
        {v.notes && (
          <div className="card-elevated">
            <h2 className="text-lg font-bold mb-2">הערות</h2>
            <p className="text-muted-foreground">{v.notes}</p>
          </div>
        )}

        {/* Delete */}
        {isManager && (
          <button onClick={() => handleDelete(v.id)} className="w-full mt-4 py-4 rounded-xl border-2 border-destructive/30 text-destructive font-bold text-lg flex items-center justify-center gap-2 hover:bg-destructive/5 transition-colors">
            <Trash2 size={20} /> מחק רכב
          </button>
        )}
      </div>
    );
  }

  // === LIST VIEW ===
  const statusCounts = {
    all: vehicles.length,
    active: vehicles.filter(v => v.status === 'active').length,
    in_service: vehicles.filter(v => v.status === 'in_service').length,
    out_of_service: vehicles.filter(v => v.status === 'out_of_service').length,
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h1 className="page-header !mb-0 flex items-center gap-3"><Car size={28} /> ניהול רכבים</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => exportToCsv('vehicles', [
            { key: 'license_plate', label: 'מספר רכב' },
            { key: 'manufacturer', label: 'יצרן' },
            { key: 'model', label: 'דגם' },
            { key: 'year', label: 'שנה' },
            { key: 'vehicle_type', label: 'סוג' },
            { key: 'status', label: 'סטטוס' },
            { key: 'odometer', label: 'קילומטראז׳' },
            { key: 'test_expiry', label: 'תוקף טסט' },
            { key: 'insurance_expiry', label: 'תוקף ביטוח' },
            { key: 'company_name', label: 'חברה' },
            { key: 'notes', label: 'הערות' },
          ], filtered)} className="flex items-center gap-2 px-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm font-bold min-h-[48px] hover:bg-muted transition-colors">
            <Download size={18} /> ייצוא
          </button>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="חיפוש לפי מספר, יצרן או דגם..."
          className="w-full pr-12 p-4 text-lg rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none" />
      </div>

      {/* Advanced Filters */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {user?.role === 'super_admin' && companies.length > 1 && (
          <select value={filterCompany} onChange={e => setFilterCompany(e.target.value)}
            className="p-3 text-base rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none col-span-2">
            <option value="">כל החברות</option>
            {companies.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
        <select value={filterDriver} onChange={e => setFilterDriver(e.target.value)}
          className="p-3 text-base rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none col-span-2">
          <option value="">כל הנהגים</option>
          {drivers.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
        </select>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {([
          { key: 'all', label: 'הכל' },
          { key: 'active', label: 'פעיל' },
          { key: 'in_service', label: 'בטיפול' },
          { key: 'out_of_service', label: 'לא פעיל' },
        ] as const).map(f => (
          <button key={f.key} onClick={() => setStatusFilter(f.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${statusFilter === f.key ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
            {f.label} ({statusCounts[f.key]})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">טוען רכבים...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Car size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-xl">אין רכבים</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(v => {
            const sl = statusLabel(v.status);
            return (
              <button key={v.id} onClick={() => handleViewDetail(v)} className="card-elevated w-full text-right hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Car size={28} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xl font-bold">{v.manufacturer} {v.model}</p>
                    <p className="text-muted-foreground text-lg">{v.license_plate} • {v.year}</p>
                    <p className="text-sm text-muted-foreground">נהג: {getDriverName(v.assigned_driver_id)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`status-badge ${sl.cls}`}>{sl.text}</span>
                    <span className="text-sm text-muted-foreground">{(v.odometer || 0).toLocaleString()} ק"מ</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Floating + button */}
      {isManager && (
        <button
          onClick={() => handleOpenForm()}
          className="fixed bottom-24 left-6 z-40 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-xl hover:shadow-2xl transition-all flex items-center justify-center hover:scale-110"
          title="רכב חדש"
        >
          <Plus size={28} />
        </button>
      )}
    </div>
  );
}

// === Helper Components ===
function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-muted-foreground text-sm">{label}</span>
      <p className="font-bold">{value}</p>
    </div>
  );
}

function DocLink({ label, url }: { label: string; url: string }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-2 py-2 px-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors text-sm font-medium text-primary">
      📄 {label}
    </a>
  );
}

function ExpiryRow({ label, date, daysLeft, colorCls }: { label: string; date: string | null; daysLeft: number | null; colorCls: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="font-medium">{label}</span>
      {date ? (
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{new Date(date).toLocaleDateString('he-IL')}</span>
          <span className={`text-sm ${colorCls}`}>
            {daysLeft !== null && (daysLeft <= 0 ? 'פג תוקף!' : `${daysLeft} ימים`)}
          </span>
        </div>
      ) : (
        <span className="text-sm text-muted-foreground">לא הוגדר</span>
      )}
    </div>
  );
}

// === Vehicle Form (Add / Edit) ===
type ManagementType = 'operational_leasing' | 'financial_leasing' | 'self_maintained';

function VehicleForm({ vehicle, drivers, onDone, onBack, user }: {
  vehicle: VehicleRow | null;
  drivers: DriverRow[];
  onDone: () => void;
  onBack: () => void;
  user: any;
}) {
  const isEdit = !!vehicle;
  const [licensePlate, setLicensePlate] = useState(vehicle?.license_plate || '');
  const [manufacturer, setManufacturer] = useState(vehicle?.manufacturer || '');
  const [model, setModel] = useState(vehicle?.model || '');
  const [year, setYear] = useState(vehicle?.year?.toString() || new Date().getFullYear().toString());
  const [vehicleType, setVehicleType] = useState(vehicle?.vehicle_type || '');
  const [status, setStatus] = useState(vehicle?.status || 'active');
  const [odometer, setOdometer] = useState(vehicle?.odometer?.toString() || '');
  const [assignedDriver, setAssignedDriver] = useState(vehicle?.assigned_driver_id || '');
  const [testExpiry, setTestExpiry] = useState(vehicle?.test_expiry || '');
  const [insuranceStart, setInsuranceStart] = useState(vehicle?.insurance_start || '');
  const [insuranceExpiry, setInsuranceExpiry] = useState(vehicle?.insurance_expiry || '');
  const [compInsStart, setCompInsStart] = useState(vehicle?.comprehensive_insurance_start || '');
  const [compInsExpiry, setCompInsExpiry] = useState(vehicle?.comprehensive_insurance_expiry || '');
  const [lastServiceDate, setLastServiceDate] = useState(vehicle?.last_service_date || '');
  const [nextServiceDate, setNextServiceDate] = useState(vehicle?.next_service_date || '');
  const [needsTransport, setNeedsTransport] = useState(vehicle?.needs_transport || false);
  const [notes, setNotes] = useState(vehicle?.notes || '');
  const [loading, setLoading] = useState(false);

  // Management type
  const [managementType, setManagementType] = useState<ManagementType>(
    (vehicle?.management_type as ManagementType) || 'operational_leasing'
  );

  // Operational leasing fields
  const [monthlyLeasingCost, setMonthlyLeasingCost] = useState(vehicle?.monthly_leasing_cost?.toString() || '');
  const [leasingEndDate, setLeasingEndDate] = useState(vehicle?.leasing_end_date || '');
  const [vehicleReturnDate, setVehicleReturnDate] = useState(vehicle?.vehicle_return_date || '');

  // Financial leasing / self-maintained fields
  const [monthlyLoanPayment, setMonthlyLoanPayment] = useState(vehicle?.monthly_loan_payment?.toString() || '');
  const [loanEndDate, setLoanEndDate] = useState(vehicle?.loan_end_date || '');
  const [plannedReplacementDate, setPlannedReplacementDate] = useState(vehicle?.planned_replacement_date || '');
  const [hasLoan, setHasLoan] = useState(vehicle?.has_loan || false);

  // Insurance history
  const [insuranceHistory, setInsuranceHistory] = useState<InsuranceHistoryRow[]>([]);

  // Document uploads
  const [licenseDocUrl, setLicenseDocUrl] = useState(vehicle?.license_doc_url || '');
  const [insuranceDocUrl, setInsuranceDocUrl] = useState(vehicle?.insurance_doc_url || '');
  const [compInsDocUrl, setCompInsDocUrl] = useState(vehicle?.comprehensive_insurance_doc_url || '');

  // Company setting: is driver assignment required?
  const [driverRequired, setDriverRequired] = useState(true);

  // Show insurance section for financial_leasing or self_maintained
  const showInsuranceSection = managementType === 'financial_leasing' || managementType === 'self_maintained';

  useEffect(() => {
    const checkSetting = async () => {
      const companyName = user?.company_name || '';
      const { data: settings } = await supabase
        .from('company_settings')
        .select('require_driver_assignment, max_vehicles_without_assignment')
        .eq('company_name', companyName)
        .maybeSingle();
      
      if (settings && settings.require_driver_assignment === false) {
        const maxExempt = settings.max_vehicles_without_assignment || 0;
        if (maxExempt === 0) {
          setDriverRequired(false);
        } else {
          const { count } = await supabase
            .from('vehicles')
            .select('id', { count: 'exact', head: true })
            .eq('company_name', companyName)
            .is('assigned_driver_id', null);
          const currentExempt = count || 0;
          const isEditingExempt = isEdit && !vehicle?.assigned_driver_id;
          const effectiveCount = isEditingExempt ? currentExempt - 1 : currentExempt;
          if (effectiveCount < maxExempt) {
            setDriverRequired(false);
          }
        }
      }
    };
    checkSetting();
  }, [user?.company_name]);

  // Load insurance history for edit mode
  useEffect(() => {
    if (isEdit && vehicle?.id) {
      supabase
        .from('vehicle_insurance_history')
        .select('*')
        .eq('vehicle_id', vehicle.id)
        .order('year', { ascending: false })
        .then(({ data }) => {
          if (data && data.length > 0) {
            setInsuranceHistory(data as InsuranceHistoryRow[]);
          }
        });
    }
  }, [isEdit, vehicle?.id]);

  const addInsuranceYear = () => {
    const currentYear = new Date().getFullYear();
    const existingYears = insuranceHistory.map(r => r.year);
    let newYear = currentYear;
    while (existingYears.includes(newYear)) newYear--;
    setInsuranceHistory(prev => [
      { year: newYear, has_no_claims: false, insurer_name: '', mandatory_insurance_cost: 0, comprehensive_insurance_cost: 0 },
      ...prev,
    ]);
  };

  const updateInsuranceRow = (index: number, field: keyof InsuranceHistoryRow, value: any) => {
    setInsuranceHistory(prev => prev.map((row, i) => i === index ? { ...row, [field]: value } : row));
  };

  const removeInsuranceRow = (index: number) => {
    setInsuranceHistory(prev => prev.filter((_, i) => i !== index));
  };

  // Validation
  const basicFieldsFilled = licensePlate && manufacturer && model && year && vehicleType && odometer && (driverRequired ? assignedDriver : true);
  
  let typeFieldsFilled = true;
  if (managementType === 'operational_leasing') {
    typeFieldsFilled = !!leasingEndDate && !!monthlyLeasingCost && !!vehicleReturnDate;
  } else if (managementType === 'financial_leasing') {
    typeFieldsFilled = !!monthlyLoanPayment && !!loanEndDate && !!plannedReplacementDate;
  } else if (managementType === 'self_maintained') {
    // Loan fields are optional but if hasLoan then they're required
    if (hasLoan) {
      typeFieldsFilled = !!monthlyLoanPayment && !!loanEndDate;
    }
  }

  const allDocsFilled = isEdit || (licenseDocUrl && insuranceDocUrl && compInsDocUrl);
  const isValid = basicFieldsFilled && typeFieldsFilled && allDocsFilled;

  const inputClass = "w-full p-4 text-lg rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none";

  const handleSubmit = async () => {
    if (!isValid) {
      toast.error('יש למלא את כל השדות ולצרף מסמכים');
      return;
    }
    setLoading(true);

    // Check if company requires approval
    let approvalStatus = 'approved';
    if (!isEdit) {
      const { data: settings } = await supabase
        .from('company_settings')
        .select('vehicle_approval_required')
        .eq('company_name', user?.company_name || '')
        .maybeSingle();
      if (settings?.vehicle_approval_required) {
        approvalStatus = 'pending_approval';
      }
    }

    const payload: any = {
      license_plate: licensePlate,
      manufacturer,
      model,
      year: parseInt(year) || null,
      vehicle_type: vehicleType,
      status: approvalStatus === 'pending_approval' ? 'out_of_service' : status,
      odometer: parseInt(odometer) || 0,
      assigned_driver_id: assignedDriver || null,
      test_expiry: testExpiry || null,
      insurance_start: insuranceStart || null,
      insurance_expiry: insuranceExpiry || null,
      comprehensive_insurance_start: compInsStart || null,
      comprehensive_insurance_expiry: compInsExpiry || null,
      last_service_date: lastServiceDate || null,
      next_service_date: nextServiceDate || null,
      needs_transport: needsTransport,
      approval_status: isEdit ? vehicle!.approval_status : approvalStatus,
      license_doc_url: licenseDocUrl,
      insurance_doc_url: insuranceDocUrl,
      comprehensive_insurance_doc_url: compInsDocUrl,
      management_type: managementType,
      monthly_leasing_cost: managementType === 'operational_leasing' ? (parseFloat(monthlyLeasingCost) || null) : null,
      leasing_end_date: managementType === 'operational_leasing' ? (leasingEndDate || null) : null,
      vehicle_return_date: managementType === 'operational_leasing' ? (vehicleReturnDate || null) : null,
      monthly_loan_payment: (managementType === 'financial_leasing' || (managementType === 'self_maintained' && hasLoan)) ? (parseFloat(monthlyLoanPayment) || null) : null,
      loan_end_date: (managementType === 'financial_leasing' || (managementType === 'self_maintained' && hasLoan)) ? (loanEndDate || null) : null,
      planned_replacement_date: (managementType !== 'operational_leasing') ? (plannedReplacementDate || null) : null,
      has_loan: managementType === 'self_maintained' ? hasLoan : managementType === 'financial_leasing',
      is_leasing: managementType === 'operational_leasing' || managementType === 'financial_leasing',
      notes,
    };

    let error;
    let vehicleId = vehicle?.id;
    if (isEdit) {
      ({ error } = await supabase.from('vehicles').update(payload).eq('id', vehicle!.id));
    } else {
      const res = await supabase.from('vehicles').insert({
        ...payload,
        company_name: user?.company_name || '',
        created_by: user?.id,
      }).select('id').single();
      error = res.error;
      vehicleId = res.data?.id;
    }

    // Save insurance history
    if (!error && vehicleId && showInsuranceSection && insuranceHistory.length > 0) {
      // Delete existing and re-insert
      await supabase.from('vehicle_insurance_history').delete().eq('vehicle_id', vehicleId);
      const historyPayload = insuranceHistory.map(row => ({
        vehicle_id: vehicleId!,
        year: row.year,
        has_no_claims: row.has_no_claims,
        insurer_name: row.insurer_name,
        mandatory_insurance_cost: row.mandatory_insurance_cost,
        comprehensive_insurance_cost: row.comprehensive_insurance_cost,
        company_name: user?.company_name || '',
      }));
      await supabase.from('vehicle_insurance_history').insert(historyPayload);
    }

    // Generate alerts for expiring documents
    if (!error && !isEdit) {
      await generateVehicleAlerts(licensePlate, user);
    }

    setLoading(false);
    if (error) {
      toast.error(isEdit ? 'שגיאה בעדכון הרכב' : 'שגיאה בהוספת הרכב');
      console.error(error);
    } else {
      const msg = approvalStatus === 'pending_approval'
        ? 'הרכב נוסף וממתין לאישור מנהל על'
        : isEdit ? 'הרכב עודכן בהצלחה' : 'הרכב נוסף בהצלחה';
      toast.success(msg);
      onDone();
    }
  };

  const managementTypeLabels: Record<ManagementType, string> = {
    operational_leasing: 'ליסינג תפעולי',
    financial_leasing: 'ליסינג מימוני',
    self_maintained: 'תחזוקה עצמאית',
  };

  return (
    <div className="animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-primary text-lg font-medium mb-4 min-h-[48px]">
        <ArrowRight size={20} /> חזרה
      </button>
      <h1 className="text-2xl font-bold mb-6">{isEdit ? 'עריכת רכב' : 'הוספת רכב חדש'}</h1>
      <div className="space-y-5">
        {/* Basic info */}
        <div>
          <label className="block text-lg font-medium mb-2">מספר רכב *</label>
          <input value={licensePlate} onChange={e => setLicensePlate(e.target.value)} placeholder="12-345-67" className={inputClass} dir="ltr" style={{ textAlign: 'right' }} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-lg font-medium mb-2">יצרן *</label>
            <input value={manufacturer} onChange={e => setManufacturer(e.target.value)} placeholder="יצרן..." className={inputClass} />
          </div>
          <div>
            <label className="block text-lg font-medium mb-2">דגם *</label>
            <input value={model} onChange={e => setModel(e.target.value)} placeholder="דגם..." className={inputClass} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-lg font-medium mb-2">שנה *</label>
            <input type="number" value={year} onChange={e => setYear(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-lg font-medium mb-2">סוג רכב *</label>
            <select value={vehicleType} onChange={e => setVehicleType(e.target.value)} className={inputClass}>
              <option value="">בחר סוג...</option>
              <option value="רכב פרטי">רכב פרטי</option>
              <option value="רכב מסחרי">רכב מסחרי</option>
              <option value="משאית">משאית</option>
              <option value="אוטובוס">אוטובוס</option>
              <option value="מיניבוס">מיניבוס</option>
              <option value="אופנוע">אופנוע</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {isEdit && (
            <div>
              <label className="block text-lg font-medium mb-2">סטטוס</label>
              <select value={status} onChange={e => setStatus(e.target.value)} className={inputClass}>
                <option value="active">פעיל</option>
                <option value="in_service">בטיפול</option>
                <option value="out_of_service">לא פעיל</option>
              </select>
            </div>
          )}
          <div>
            <label className="block text-lg font-medium mb-2">ק"מ נוכחי *</label>
            <input type="number" value={odometer} onChange={e => setOdometer(e.target.value)} placeholder="0" className={inputClass} />
          </div>
        </div>
        <div>
          <label className="block text-lg font-medium mb-2">נהג משויך {driverRequired && '*'}</label>
          <select value={assignedDriver} onChange={e => setAssignedDriver(e.target.value)} className={inputClass}>
            <option value="">{driverRequired ? 'בחר נהג...' : 'ללא נהג'}</option>
            {drivers.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
          </select>
        </div>

        {/* === Management Type Selection === */}
        <div className="border-t border-border pt-5">
          <h2 className="text-xl font-bold mb-4">📋 סוג ניהול רכב *</h2>
          <div className="grid grid-cols-1 gap-3">
            {(Object.keys(managementTypeLabels) as ManagementType[]).map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setManagementType(type)}
                className={`w-full py-4 px-5 rounded-xl text-lg font-medium text-right transition-all border-2 ${
                  managementType === type
                    ? 'border-primary bg-primary/10 text-primary shadow-md'
                    : 'border-border bg-card text-foreground hover:border-primary/40'
                }`}
              >
                {managementType === type && <span className="ml-2">✓</span>}
                {managementTypeLabels[type]}
              </button>
            ))}
          </div>
        </div>

        {/* === Conditional Fields by Management Type === */}
        {managementType === 'operational_leasing' && (
          <div className="border border-primary/20 rounded-xl p-5 space-y-4 bg-primary/5">
            <h3 className="font-bold text-lg text-primary">🏢 פרטי ליסינג תפעולי</h3>
            <div>
              <label className="block text-sm font-medium mb-1">עלות חודשית (₪) *</label>
              <input type="number" value={monthlyLeasingCost} onChange={e => setMonthlyLeasingCost(e.target.value)} placeholder="עלות חודשית..." className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">מועד סיום הליסינג *</label>
              <input type="date" value={leasingEndDate} onChange={e => setLeasingEndDate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">מועד החזרת הרכב *</label>
              <input type="date" value={vehicleReturnDate} onChange={e => setVehicleReturnDate(e.target.value)} className={inputClass} />
            </div>
          </div>
        )}

        {managementType === 'financial_leasing' && (
          <div className="border border-primary/20 rounded-xl p-5 space-y-4 bg-primary/5">
            <h3 className="font-bold text-lg text-primary">💳 פרטי ליסינג מימוני</h3>
            <div>
              <label className="block text-sm font-medium mb-1">גובה החזר חודשי (₪) *</label>
              <input type="number" value={monthlyLoanPayment} onChange={e => setMonthlyLoanPayment(e.target.value)} placeholder="החזר חודשי..." className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">תאריך סיום ההלוואה *</label>
              <input type="date" value={loanEndDate} onChange={e => setLoanEndDate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">מועד מתוכנן להחלפת הרכב *</label>
              <input type="date" value={plannedReplacementDate} onChange={e => setPlannedReplacementDate(e.target.value)} className={inputClass} />
            </div>
          </div>
        )}

        {managementType === 'self_maintained' && (
          <div className="border border-primary/20 rounded-xl p-5 space-y-4 bg-primary/5">
            <h3 className="font-bold text-lg text-primary">🔧 תחזוקה עצמאית</h3>
            <div className="flex gap-3 mb-2">
              <button type="button" onClick={() => setHasLoan(false)}
                className={`flex-1 py-3 rounded-xl text-base font-medium transition-colors ${!hasLoan ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                ללא הלוואה
              </button>
              <button type="button" onClick={() => setHasLoan(true)}
                className={`flex-1 py-3 rounded-xl text-base font-medium transition-colors ${hasLoan ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                יש הלוואה על הרכב
              </button>
            </div>
            {hasLoan && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">גובה החזר חודשי (₪) *</label>
                  <input type="number" value={monthlyLoanPayment} onChange={e => setMonthlyLoanPayment(e.target.value)} placeholder="החזר חודשי..." className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">תאריך סיום ההלוואה *</label>
                  <input type="date" value={loanEndDate} onChange={e => setLoanEndDate(e.target.value)} className={inputClass} />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">מועד מתוכנן להחלפת הרכב</label>
              <input type="date" value={plannedReplacementDate} onChange={e => setPlannedReplacementDate(e.target.value)} className={inputClass} />
            </div>
          </div>
        )}

        {/* === Expiry & Insurance Section === */}
        <div className="border-t border-border pt-5">
          <h2 className="text-xl font-bold mb-4">📋 תוקף מסמכים</h2>
          <div>
            <label className="block text-lg font-medium mb-2">תוקף טסט</label>
            <input type="date" value={testExpiry} onChange={e => setTestExpiry(e.target.value)} className={inputClass} />
          </div>
        </div>

        {/* Insurance */}
        <div className="border border-border rounded-xl p-4 space-y-4">
          <h3 className="font-bold text-lg">ביטוח חובה</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">תאריך התחלה</label>
              <input type="date" value={insuranceStart} onChange={e => setInsuranceStart(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">תאריך תוקף</label>
              <input type="date" value={insuranceExpiry} onChange={e => setInsuranceExpiry(e.target.value)} className={inputClass} />
            </div>
          </div>
        </div>

        <div className="border border-border rounded-xl p-4 space-y-4">
          <h3 className="font-bold text-lg">ביטוח מקיף</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">תאריך התחלה</label>
              <input type="date" value={compInsStart} onChange={e => setCompInsStart(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">תאריך תוקף</label>
              <input type="date" value={compInsExpiry} onChange={e => setCompInsExpiry(e.target.value)} className={inputClass} />
            </div>
          </div>
        </div>

        <div className="border border-border rounded-xl p-4 space-y-4">
          <h3 className="font-bold text-lg">🔧 טיפול</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">טיפול אחרון</label>
              <input type="date" value={lastServiceDate} onChange={e => setLastServiceDate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">טיפול הבא</label>
              <input type="date" value={nextServiceDate} onChange={e => setNextServiceDate(e.target.value)} className={inputClass} />
            </div>
          </div>
        </div>

        {/* === Insurance History Table (for financial_leasing and self_maintained) === */}
        {showInsuranceSection && (
          <div className="border-t border-border pt-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">📊 היסטוריית ביטוחים והדר תביעות</h2>
              <button type="button" onClick={addInsuranceYear}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors">
                <PlusCircle size={16} /> הוסף שנה
              </button>
            </div>

            {insuranceHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-xl">
                <p>אין נתוני ביטוח עדיין</p>
                <p className="text-sm mt-1">לחץ "הוסף שנה" כדי להתחיל</p>
              </div>
            ) : (
              <div className="space-y-4">
                {insuranceHistory.map((row, index) => (
                  <div key={index} className="border border-border rounded-xl p-4 space-y-3 relative">
                    <button
                      type="button"
                      onClick={() => removeInsuranceRow(index)}
                      className="absolute top-2 left-2 w-7 h-7 rounded-full border border-border bg-card flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <X size={14} />
                    </button>
                    <div className="flex items-center gap-3">
                      <label className="font-bold text-lg">שנת</label>
                      <input
                        type="number"
                        value={row.year}
                        onChange={e => updateInsuranceRow(index, 'year', parseInt(e.target.value) || 0)}
                        className="w-24 p-2 text-lg font-bold rounded-lg border-2 border-input bg-background focus:border-primary focus:outline-none text-center"
                      />
                      <button
                        type="button"
                        onClick={() => updateInsuranceRow(index, 'has_no_claims', !row.has_no_claims)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          row.has_no_claims ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {row.has_no_claims ? '✅ הדר תביעות' : 'ללא הדר'}
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">חברת ביטוח</label>
                      <input
                        value={row.insurer_name}
                        onChange={e => updateInsuranceRow(index, 'insurer_name', e.target.value)}
                        placeholder="שם חברת ביטוח..."
                        className={inputClass}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">עלות ביטוח חובה (₪)</label>
                        <input
                          type="number"
                          value={row.mandatory_insurance_cost || ''}
                          onChange={e => updateInsuranceRow(index, 'mandatory_insurance_cost', parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">עלות ביטוח מקיף (₪)</label>
                        <input
                          type="number"
                          value={row.comprehensive_insurance_cost || ''}
                          onChange={e => updateInsuranceRow(index, 'comprehensive_insurance_cost', parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* === Document Uploads === */}
        <div className="border-t border-border pt-5">
          <h2 className="text-xl font-bold mb-4">📎 מסמכים {!isEdit && <span className="text-destructive text-sm">(חובה)</span>}</h2>
          <div className="space-y-4">
            <ImageUpload
              label="צילום רישיון רכב"
              required={!isEdit}
              imageUrl={licenseDocUrl || null}
              onImageUploaded={(url) => setLicenseDocUrl(url || '')}
              folder="vehicle-docs"
              acceptPdf
            />
            <ImageUpload
              label="פוליסת ביטוח חובה"
              required={!isEdit}
              imageUrl={insuranceDocUrl || null}
              onImageUploaded={(url) => setInsuranceDocUrl(url || '')}
              folder="vehicle-docs"
              acceptPdf
            />
            <ImageUpload
              label="פוליסת ביטוח מקיף"
              required={!isEdit}
              imageUrl={compInsDocUrl || null}
              onImageUploaded={(url) => setCompInsDocUrl(url || '')}
              folder="vehicle-docs"
              acceptPdf
            />
          </div>
        </div>

        {/* Transport */}
        <div className="border-t border-border pt-5">
          <h2 className="text-xl font-bold mb-4">🚛 שינוע</h2>
          <div className="flex gap-3">
            <button type="button" onClick={() => setNeedsTransport(false)}
              className={`flex-1 py-3 rounded-xl text-lg font-medium transition-colors ${!needsTransport ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              לא צריך שינוע
            </button>
            <button type="button" onClick={() => setNeedsTransport(true)}
              className={`flex-1 py-3 rounded-xl text-lg font-medium transition-colors ${needsTransport ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              צריך שינוע
            </button>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-lg font-medium mb-2">הערות</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="הערות..." className={`${inputClass} resize-none`} />
        </div>

        {/* Validation summary */}
        {!isValid && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive space-y-1">
            {!basicFieldsFilled && <p>• יש למלא את כל שדות החובה (מסומנים ב-*)</p>}
            {!typeFieldsFilled && <p>• יש למלא את כל שדות סוג ניהול הרכב</p>}
            {!allDocsFilled && <p>• יש לצרף את כל המסמכים הנדרשים (רישיון רכב, ביטוח חובה, ביטוח מקיף)</p>}
          </div>
        )}

        <button onClick={handleSubmit} disabled={!isValid || loading}
          className={`w-full py-5 rounded-xl text-xl font-bold transition-colors ${isValid && !loading ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}>
          {loading ? 'שומר...' : isEdit ? '💾 עדכן רכב' : '💾 שמור רכב'}
        </button>
      </div>
    </div>
  );
}

// Generate in-app alerts for vehicle document expiry
async function generateVehicleAlerts(plate: string, user: any) {
  try {
    const { data: managers } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'fleet_manager');

    if (managers) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, company_name')
        .in('id', managers.map(m => m.user_id))
        .eq('company_name', user?.company_name || '');

      if (profiles) {
        for (const p of profiles) {
          await supabase.from('driver_notifications').insert({
            user_id: p.id,
            type: 'vehicle',
            title: 'רכב חדש נוסף',
            message: `רכב ${plate} נוסף למערכת`,
            link: '/vehicles',
          });
        }
      }
    }
  } catch (e) {
    console.error('Alert generation error:', e);
  }
}