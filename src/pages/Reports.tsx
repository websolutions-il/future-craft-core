import { useState, useEffect, useMemo } from 'react';
import { BarChart3, Car, Users, FileText, Wrench, AlertTriangle, Download, Filter, ChevronDown, ChevronUp, ShoppingCart, TrendingUp, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface RawData {
  vehicles: any[];
  drivers: any[];
  faults: any[];
  accidents: any[];
  expenses: any[];
  serviceOrders: any[];
}


const reportTypes = [
  { value: 'vehicles', label: 'סיכום רכבים' },
  { value: 'drivers', label: 'סיכום נהגים' },
  { value: 'expenses', label: 'הוצאות לפי תקופה' },
  { value: 'profit_loss', label: 'רווח והפסד' },
  { value: 'faults', label: 'טיפולים' },
  { value: 'accidents', label: 'תאונות' },
  { value: 'service_orders', label: 'הזמנות' },
  { value: 'vendors', label: 'סיכום לפי ספקים' },
];

export default function Reports() {
  const { user } = useAuth();
  const [raw, setRaw] = useState<RawData>({ vehicles: [], drivers: [], faults: [], accidents: [], expenses: [], serviceOrders: [] });
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [expandedReport, setExpandedReport] = useState<string | null>(null);

  // Filter state
  const [filterCompany, setFilterCompany] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState<Date | undefined>();
  const [filterDateTo, setFilterDateTo] = useState<Date | undefined>();
  const [filterReportTypes, setFilterReportTypes] = useState<string[]>([]);
  const [filterVendor, setFilterVendor] = useState('');
  
  const [filterVehicle, setFilterVehicle] = useState('');
  const [filterDriver, setFilterDriver] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [vRes, dRes, fRes, aRes, eRes, soRes] = await Promise.all([
      supabase.from('vehicles').select('*'),
      supabase.from('drivers').select('*'),
      supabase.from('faults').select('*'),
      supabase.from('accidents').select('*'),
      supabase.from('expenses').select('*'),
      supabase.from('service_orders').select('*'),
    ]);
    setRaw({
      vehicles: vRes.data || [],
      drivers: dRes.data || [],
      faults: fRes.data || [],
      accidents: aRes.data || [],
      expenses: eRes.data || [],
      serviceOrders: soRes.data || [],
    });
    setLoading(false);
  };

  // Derived unique values for filters
  const companies = useMemo(() => [...new Set(raw.vehicles.map(v => v.company_name).filter(Boolean))], [raw]);
  const vendors = useMemo(() => [...new Set([...raw.expenses.map(e => e.vendor), ...raw.serviceOrders.map(s => s.vendor_name)].filter(Boolean))], [raw]);
  const vehiclePlates = useMemo(() => [...new Set(raw.vehicles.map(v => v.license_plate).filter(Boolean))], [raw]);
  const driverNames = useMemo(() => [...new Set(raw.drivers.map(d => d.full_name).filter(Boolean))], [raw]);

  // Apply filters
  const filtered = useMemo(() => {
    const inDateRange = (dateStr: string | null) => {
      if (!dateStr) return true;
      const d = new Date(dateStr);
      if (filterDateFrom && d < filterDateFrom) return false;
      if (filterDateTo) {
        const to = new Date(filterDateTo);
        to.setHours(23, 59, 59, 999);
        if (d > to) return false;
      }
      return true;
    };
    const matchCompany = (c: string | null) => !filterCompany || c === filterCompany;
    const matchVehicle = (v: string | null) => !filterVehicle || v === filterVehicle;
    const matchDriver = (d: string | null) => !filterDriver || d === filterDriver;

    return {
      vehicles: raw.vehicles.filter(v => matchCompany(v.company_name) && matchVehicle(v.license_plate)),
      drivers: raw.drivers.filter(d => matchCompany(d.company_name) && matchDriver(d.full_name)),
      faults: raw.faults.filter(f => matchCompany(f.company_name) && matchVehicle(f.vehicle_plate) && matchDriver(f.driver_name) && inDateRange(f.date)),
      accidents: raw.accidents.filter(a => matchCompany(a.company_name) && matchVehicle(a.vehicle_plate) && matchDriver(a.driver_name) && inDateRange(a.date)),
      expenses: raw.expenses.filter(e => matchCompany(e.company_name) && matchVehicle(e.vehicle_plate) && matchDriver(e.driver_name) && inDateRange(e.date) && (!filterVendor || e.vendor === filterVendor)),
      serviceOrders: raw.serviceOrders.filter(s => matchCompany(s.company_name) && matchVehicle(s.vehicle_plate) && matchDriver(s.driver_name) && inDateRange(s.created_at) && (!filterVendor || s.vendor_name === filterVendor)),
    };
  }, [raw, filterCompany, filterDateFrom, filterDateTo, filterVendor, filterVehicle, filterDriver]);

  const showReport = (type: string) => filterReportTypes.length === 0 || filterReportTypes.includes(type);
  const toggleReportType = (type: string) => setFilterReportTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);

  const clearFilters = () => {
    setFilterCompany('');
    setFilterDateFrom(undefined);
    setFilterDateTo(undefined);
    setFilterReportTypes([]);
    setFilterVendor('');
    setFilterVehicle('');
    setFilterDriver('');
  };

  const hasActiveFilters = filterCompany || filterDateFrom || filterDateTo || filterReportTypes.length > 0 || filterVendor || filterVehicle || filterDriver;

  // Stats
  const totalExpenses = filtered.expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const totalAccidentCost = filtered.accidents.reduce((s, a) => s + (a.estimated_cost || 0), 0);

  // Vendor summary
  const vendorSummary = useMemo(() => {
    const map: Record<string, { count: number; total: number }> = {};
    filtered.expenses.forEach(e => {
      if (!e.vendor) return;
      if (!map[e.vendor]) map[e.vendor] = { count: 0, total: 0 };
      map[e.vendor].count++;
      map[e.vendor].total += e.amount || 0;
    });
    filtered.serviceOrders.forEach(s => {
      if (!s.vendor_name) return;
      if (!map[s.vendor_name]) map[s.vendor_name] = { count: 0, total: 0 };
      map[s.vendor_name].count++;
    });
    return Object.entries(map).sort((a, b) => b[1].total - a[1].total);
  }, [filtered]);

  if (loading) {
    return <div className="animate-fade-in text-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" /></div>;
  }

  const selectClass = "w-full p-3 text-base rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none";

  const exportCSV = () => {
    const rows: string[][] = [];

    if (showReport('expenses') && filtered.expenses.length > 0) {
      rows.push(['--- הוצאות ---']);
      rows.push(['תאריך', 'קטגוריה', 'ספק', 'רכב', 'נהג', 'סכום', 'חשבונית']);
      filtered.expenses.forEach(e => rows.push([
        e.date ? new Date(e.date).toLocaleDateString('he-IL') : '',
        e.category || '', e.vendor || '', e.vehicle_plate || '', e.driver_name || '',
        (e.amount || 0).toString(), e.invoice_number || '',
      ]));
      rows.push([]);
    }
    if (showReport('faults') && filtered.faults.length > 0) {
      rows.push(['--- תקלות ---']);
      rows.push(['תאריך', 'סוג', 'תיאור', 'רכב', 'נהג', 'סטטוס', 'דחיפות']);
      filtered.faults.forEach(f => rows.push([
        f.date ? new Date(f.date).toLocaleDateString('he-IL') : '',
        f.fault_type || '', f.description || '', f.vehicle_plate || '', f.driver_name || '',
        f.status || '', f.urgency || '',
      ]));
      rows.push([]);
    }
    if (showReport('accidents') && filtered.accidents.length > 0) {
      rows.push(['--- תאונות ---']);
      rows.push(['תאריך', 'תיאור', 'רכב', 'נהג', 'מיקום', 'סטטוס', 'עלות']);
      filtered.accidents.forEach(a => rows.push([
        a.date ? new Date(a.date).toLocaleDateString('he-IL') : '',
        a.description || '', a.vehicle_plate || '', a.driver_name || '',
        a.location || '', a.status || '', (a.estimated_cost || 0).toString(),
      ]));
      rows.push([]);
    }
    if (showReport('service_orders') && filtered.serviceOrders.length > 0) {
      rows.push(['--- הזמנות שירות ---']);
      rows.push(['תאריך', 'קטגוריה', 'תיאור', 'רכב', 'נהג', 'ספק', 'סטטוס']);
      filtered.serviceOrders.forEach(s => rows.push([
        s.service_date ? new Date(s.service_date).toLocaleDateString('he-IL') : '',
        s.service_category || '', s.description || '', s.vehicle_plate || '',
        s.driver_name || '', s.vendor_name || '', s.treatment_status || '',
      ]));
      rows.push([]);
    }
    if (showReport('vehicles')) {
      rows.push(['--- רכבים ---']);
      rows.push(['לוחית', 'יצרן', 'דגם', 'שנה', 'סטטוס', 'קמ']);
      filtered.vehicles.forEach(v => rows.push([
        v.license_plate || '', v.manufacturer || '', v.model || '',
        (v.year || '').toString(), v.status || '', (v.odometer || 0).toString(),
      ]));
      rows.push([]);
    }
    if (showReport('drivers')) {
      rows.push(['--- נהגים ---']);
      rows.push(['שם', 'טלפון', 'רישיון', 'תוקף רישיון', 'סטטוס']);
      filtered.drivers.forEach(d => rows.push([
        d.full_name || '', d.phone || '', d.license_number || '',
        d.license_expiry || '', d.status || '',
      ]));
    }

    if (rows.length === 0) {
      rows.push(['אין נתונים להצגה']);
    }

    const csv = '\uFEFF' + rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `דוח_דליה_${new Date().toLocaleDateString('he-IL')}.csv`;
    link.click();
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h1 className="page-header !mb-0 flex items-center gap-3"><BarChart3 size={28} /> דוחות כספיים ותפעוליים</h1>
        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-base font-bold min-h-[48px]">
          <Download size={20} /> ייצוא
        </button>
      </div>
      <p className="text-muted-foreground mb-4">
        {hasActiveFilters ? 'מציג נתונים מסוננים — ייצוא CSV יכלול רק את הנתונים המוצגים' : 'סקירה כללית מבוססת נתונים חיים — סנן לצפייה ממוקדת'}
      </p>

      {/* Filter Toggle Button */}
      <button
        onClick={() => setFiltersOpen(!filtersOpen)}
        className={cn(
          "w-full flex items-center justify-between p-4 rounded-xl mb-4 text-lg font-bold transition-colors",
          hasActiveFilters ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
        )}
      >
        <span className="flex items-center gap-2">
          <Filter size={20} />
          סינון מתקדם
          {hasActiveFilters && <span className="bg-primary-foreground/20 text-primary-foreground text-xs px-2 py-0.5 rounded-full">פעיל</span>}
        </span>
        {filtersOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      {/* Filter Panel */}
      {filtersOpen && (
        <div className="card-elevated mb-6 space-y-4 animate-fade-in">
          {/* Company */}
          {user?.role === 'super_admin' && (
            <div>
              <label className="block text-sm font-medium mb-1">חברה</label>
              <select value={filterCompany} onChange={e => setFilterCompany(e.target.value)} className={selectClass}>
                <option value="">הכל</option>
                {companies.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">מתאריך</label>
              <Popover>
                <PopoverTrigger asChild>
                  <button className={cn(selectClass, "text-right", !filterDateFrom && "text-muted-foreground")}>
                    {filterDateFrom ? format(filterDateFrom, 'dd/MM/yyyy') : 'בחר...'}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={filterDateFrom} onSelect={setFilterDateFrom} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">עד תאריך</label>
              <Popover>
                <PopoverTrigger asChild>
                  <button className={cn(selectClass, "text-right", !filterDateTo && "text-muted-foreground")}>
                    {filterDateTo ? format(filterDateTo, 'dd/MM/yyyy') : 'בחר...'}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={filterDateTo} onSelect={setFilterDateTo} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Report Types */}
          <div>
            <label className="block text-sm font-medium mb-2">סוג דוח</label>
            <div className="flex flex-wrap gap-2">
              {reportTypes.map(rt => (
                <button key={rt.value} onClick={() => toggleReportType(rt.value)}
                  className={cn(
                    "px-3 py-2 rounded-xl text-sm font-medium border-2 transition-all",
                    filterReportTypes.includes(rt.value) ? "border-primary bg-primary/10 text-primary" : "border-transparent bg-muted text-muted-foreground"
                  )}>{rt.label}</button>
              ))}
            </div>
          </div>

          {/* Vendor */}
          <div>
            <label className="block text-sm font-medium mb-1">ספק</label>
            <select value={filterVendor} onChange={e => setFilterVendor(e.target.value)} className={selectClass}>
              <option value="">הכל</option>
              {vendors.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>


          {/* Vehicle & Driver */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">רכב</label>
              <select value={filterVehicle} onChange={e => setFilterVehicle(e.target.value)} className={selectClass}>
                <option value="">הכל</option>
                {vehiclePlates.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">נהג</label>
              <select value={filterDriver} onChange={e => setFilterDriver(e.target.value)} className={selectClass}>
                <option value="">הכל</option>
                {driverNames.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {hasActiveFilters && (
            <button onClick={clearFilters} className="w-full py-3 rounded-xl bg-destructive/10 text-destructive font-bold text-base">
              ✕ נקה סינון
            </button>
          )}
        </div>
      )}

      {/* Report Cards */}
      <div className="space-y-4">
        {showReport('expenses') && (
          <div onClick={() => setExpandedReport(expandedReport === 'expenses' ? null : 'expenses')} className="cursor-pointer">
          <ReportCard title="דוח הוצאות כולל" icon={FileText} color="bg-primary/10 text-primary"
            stats={[
              { label: 'סה"כ הוצאות', value: `₪${totalExpenses.toLocaleString()}` },
              { label: 'מספר חשבוניות', value: filtered.expenses.length.toString() },
              { label: 'ממוצע לחשבונית', value: `₪${filtered.expenses.length > 0 ? Math.round(totalExpenses / filtered.expenses.length).toLocaleString() : 0}` },
            ]}
          />
          </div>
        )}

        {/* Vehicles */}
        {showReport('vehicles') && (
          <ReportCard title="דוח רכבים" icon={Car} color="bg-primary/10 text-primary"
            stats={[
              { label: 'רכבים פעילים', value: filtered.vehicles.filter(v => v.status === 'active').length.toString() },
              { label: 'בטיפול', value: filtered.vehicles.filter(v => v.status === 'in_service').length.toString() },
              { label: 'סה"כ רכבים', value: filtered.vehicles.length.toString() },
            ]}
          />
        )}

        {/* Faults / Treatments */}
        {showReport('faults') && (
          <ReportCard title="דוח טיפולים / תקלות" icon={Wrench} color="bg-warning/10 text-warning"
            stats={[
              { label: 'פתוחות', value: filtered.faults.filter(f => ['new', 'open', 'in_progress'].includes(f.status)).length.toString() },
              { label: 'דחופות', value: filtered.faults.filter(f => ['urgent', 'critical'].includes(f.urgency)).length.toString() },
              { label: 'סה"כ', value: filtered.faults.length.toString() },
            ]}
          />
        )}

        {showReport('expenses') && filtered.expenses.length > 0 && expandedReport === 'expenses' && (
          <DetailTable headers={['תאריך', 'קטגוריה', 'ספק', 'רכב', 'סכום']}
            rows={filtered.expenses.map(e => [
              e.date ? new Date(e.date).toLocaleDateString('he-IL') : '-',
              e.category || '-', e.vendor || '-', e.vehicle_plate || '-',
              `₪${(e.amount || 0).toLocaleString()}`,
            ])} />
        )}

        {/* Vehicles */}
        {showReport('vehicles') && (
          <div onClick={() => setExpandedReport(expandedReport === 'vehicles' ? null : 'vehicles')} className="cursor-pointer">
          <ReportCard title="דוח רכבים" icon={Car} color="bg-primary/10 text-primary"
            stats={[
              { label: 'רכבים פעילים', value: filtered.vehicles.filter(v => v.status === 'active').length.toString() },
              { label: 'בטיפול', value: filtered.vehicles.filter(v => v.status === 'in_service').length.toString() },
              { label: 'סה"כ רכבים', value: filtered.vehicles.length.toString() },
            ]}
          />
          </div>
        )}
        {showReport('vehicles') && filtered.vehicles.length > 0 && expandedReport === 'vehicles' && (
          <DetailTable headers={['לוחית', 'יצרן', 'דגם', 'שנה', 'סטטוס', 'ק"מ']}
            rows={filtered.vehicles.map(v => [
              v.license_plate || '-', v.manufacturer || '-', v.model || '-',
              (v.year || '-').toString(), v.status === 'active' ? 'פעיל' : v.status || '-',
              (v.odometer || 0).toLocaleString(),
            ])} />
        )}

        {/* Faults / Treatments */}
        {showReport('faults') && (
          <div onClick={() => setExpandedReport(expandedReport === 'faults' ? null : 'faults')} className="cursor-pointer">
          <ReportCard title="דוח טיפולים / תקלות" icon={Wrench} color="bg-warning/10 text-warning"
            stats={[
              { label: 'פתוחות', value: filtered.faults.filter(f => ['new', 'open', 'in_progress'].includes(f.status)).length.toString() },
              { label: 'דחופות', value: filtered.faults.filter(f => ['urgent', 'critical'].includes(f.urgency)).length.toString() },
              { label: 'סה"כ', value: filtered.faults.length.toString() },
            ]}
          />
          </div>
        )}
        {showReport('faults') && filtered.faults.length > 0 && expandedReport === 'faults' && (
          <DetailTable headers={['תאריך', 'סוג', 'רכב', 'נהג', 'סטטוס']}
            rows={filtered.faults.map(f => [
              f.date ? new Date(f.date).toLocaleDateString('he-IL') : '-',
              f.fault_type || '-', f.vehicle_plate || '-', f.driver_name || '-', f.status || '-',
            ])} />
        )}

        {/* Accidents */}
        {showReport('accidents') && (
          <div onClick={() => setExpandedReport(expandedReport === 'accidents' ? null : 'accidents')} className="cursor-pointer">
          <ReportCard title="דוח תאונות" icon={AlertTriangle} color="bg-destructive/10 text-destructive"
            stats={[
              { label: 'פתוחות', value: filtered.accidents.filter(a => a.status !== 'closed').length.toString() },
              { label: 'עלות משוערת', value: `₪${totalAccidentCost.toLocaleString()}` },
              { label: 'סה"כ', value: filtered.accidents.length.toString() },
            ]}
          />
          </div>
        )}
        {showReport('accidents') && filtered.accidents.length > 0 && expandedReport === 'accidents' && (
          <DetailTable headers={['תאריך', 'תיאור', 'רכב', 'נהג', 'עלות']}
            rows={filtered.accidents.map(a => [
              a.date ? new Date(a.date).toLocaleDateString('he-IL') : '-',
              a.description || '-', a.vehicle_plate || '-', a.driver_name || '-',
              `₪${(a.estimated_cost || 0).toLocaleString()}`,
            ])} />
        )}

        {/* Drivers */}
        {showReport('drivers') && (
          <div onClick={() => setExpandedReport(expandedReport === 'drivers' ? null : 'drivers')} className="cursor-pointer">
          <ReportCard title="דוח נהגים" icon={Users} color="bg-primary/10 text-primary"
            stats={[
              { label: 'פעילים', value: filtered.drivers.filter(d => d.status === 'active').length.toString() },
              { label: 'לא פעילים', value: filtered.drivers.filter(d => d.status !== 'active').length.toString() },
              { label: 'סה"כ', value: filtered.drivers.length.toString() },
            ]}
          />
          </div>
        )}
        {showReport('drivers') && filtered.drivers.length > 0 && expandedReport === 'drivers' && (
          <DetailTable headers={['שם', 'טלפון', 'רישיון', 'תוקף', 'סטטוס']}
            rows={filtered.drivers.map(d => [
              d.full_name || '-', d.phone || '-', d.license_number || '-',
              d.license_expiry || '-', d.status === 'active' ? 'פעיל' : 'לא פעיל',
            ])} />
        )}

        {/* Service Orders */}
        {showReport('service_orders') && (
          <div onClick={() => setExpandedReport(expandedReport === 'service_orders' ? null : 'service_orders')} className="cursor-pointer">
          <ReportCard title="דוח הזמנות שירות" icon={ShoppingCart} color="bg-primary/10 text-primary"
            stats={[
              { label: 'חדשות', value: filtered.serviceOrders.filter(s => s.treatment_status === 'new').length.toString() },
              { label: 'בטיפול', value: filtered.serviceOrders.filter(s => s.treatment_status === 'in_progress').length.toString() },
              { label: 'סה"כ', value: filtered.serviceOrders.length.toString() },
            ]}
          />
          </div>
        )}
        {showReport('service_orders') && filtered.serviceOrders.length > 0 && expandedReport === 'service_orders' && (
          <DetailTable headers={['תאריך', 'קטגוריה', 'רכב', 'נהג', 'ספק', 'סטטוס']}
            rows={filtered.serviceOrders.map(s => [
              s.service_date ? new Date(s.service_date).toLocaleDateString('he-IL') : '-',
              s.service_category || '-', s.vehicle_plate || '-', s.driver_name || '-',
              s.vendor_name || '-', s.treatment_status || '-',
            ])} />
        )}

        {/* Profit & Loss */}
        {showReport('profit_loss') && (
          <ReportCard title="רווח והפסד" icon={TrendingUp} color="bg-primary/10 text-primary"
            stats={[
              { label: 'הוצאות', value: `₪${totalExpenses.toLocaleString()}` },
              { label: 'עלות תאונות', value: `₪${totalAccidentCost.toLocaleString()}` },
              { label: 'סה"כ עלויות', value: `₪${(totalExpenses + totalAccidentCost).toLocaleString()}` },
            ]}
          />
        )}

        {/* Vendor Summary */}
        {showReport('vendors') && (
          <div className="card-elevated">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-primary/10 text-primary"><Package size={24} /></div>
              <h2 className="text-xl font-bold">סיכום לפי ספקים</h2>
            </div>
            {vendorSummary.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">אין נתונים</p>
            ) : (
              <div className="space-y-3">
                {vendorSummary.map(([name, data]) => (
                  <div key={name} className="flex items-center justify-between bg-muted rounded-xl p-3">
                    <span className="font-bold">{name}</span>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">{data.count} פריטים</span>
                      {data.total > 0 && <span className="font-bold text-primary">₪{data.total.toLocaleString()}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ReportCard({ title, icon: Icon, color, stats }: {
  title: string;
  icon: any;
  color: string;
  stats: { label: string; value: string }[];
}) {
  return (
    <div className="card-elevated hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-3 mb-4">
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", color)}><Icon size={24} /></div>
        <h2 className="text-xl font-bold flex-1">{title}</h2>
        <ChevronDown size={18} className="text-muted-foreground" />
      </div>
      <div className={cn("grid gap-4", stats.length === 2 ? "grid-cols-2" : "grid-cols-3")}>
        {stats.map(stat => (
          <div key={stat.label} className="text-center">
            <p className="text-2xl font-black">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="card-elevated overflow-x-auto animate-fade-in -mt-2">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {headers.map(h => <th key={h} className="py-2 px-3 text-right font-bold text-muted-foreground">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border/50 last:border-0">
              {row.map((cell, j) => <td key={j} className="py-2 px-3">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
