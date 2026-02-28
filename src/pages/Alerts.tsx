import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Bell, ShieldAlert, Car, IdCard, Wrench, Clock, CheckCircle2 } from 'lucide-react';

type AlertSeverity = 'critical' | 'warning' | 'info';
type AlertCategory = 'test' | 'insurance' | 'comprehensive_insurance' | 'license' | 'fault';

interface AlertItem {
  id: string;
  category: AlertCategory;
  severity: AlertSeverity;
  title: string;
  subtitle: string;
  daysLeft: number | null;
  date: string | null;
  meta?: string;
}

const categoryLabels: Record<AlertCategory, string> = {
  test: 'טסט',
  insurance: 'ביטוח חובה',
  comprehensive_insurance: 'ביטוח מקיף',
  license: 'רישיון נהיגה',
  fault: 'תקלה דחופה',
};

const categoryIcons: Record<AlertCategory, typeof Car> = {
  test: Car,
  insurance: ShieldAlert,
  comprehensive_insurance: ShieldAlert,
  license: IdCard,
  fault: Wrench,
};

const severityStyles: Record<AlertSeverity, string> = {
  critical: 'bg-destructive/10 border-destructive/40 text-destructive',
  warning: 'bg-amber-500/10 border-amber-500/40 text-amber-700 dark:text-amber-400',
  info: 'bg-blue-500/10 border-blue-500/40 text-blue-700 dark:text-blue-400',
};

const severityBadge: Record<AlertSeverity, string> = {
  critical: 'bg-destructive text-destructive-foreground',
  warning: 'bg-amber-500 text-white',
  info: 'bg-blue-500 text-white',
};

function getDaysLeft(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getSeverity(daysLeft: number | null): AlertSeverity {
  if (daysLeft === null) return 'info';
  if (daysLeft <= 0) return 'critical';
  if (daysLeft <= 14) return 'warning';
  return 'info';
}

export default function Alerts() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<AlertCategory | 'all'>('all');

  useEffect(() => {
    if (user) loadAlerts();
  }, [user]);

  const loadAlerts = async () => {
    setLoading(true);
    const allAlerts: AlertItem[] = [];

    // 1. Vehicle expiries (test, insurance, comprehensive)
    const { data: vehicles } = await supabase.from('vehicles').select('*');
    if (vehicles) {
      for (const v of vehicles) {
        const plate = v.license_plate;
        const label = `${v.manufacturer || ''} ${v.model || ''} - ${plate}`.trim();

        // Test expiry
        const testDays = getDaysLeft(v.test_expiry);
        if (testDays !== null && testDays <= 30) {
          allAlerts.push({
            id: `test-${v.id}`,
            category: 'test',
            severity: getSeverity(testDays),
            title: testDays <= 0 ? `טסט פג תוקף!` : `טסט עומד לפוג`,
            subtitle: label,
            daysLeft: testDays,
            date: v.test_expiry,
          });
        }

        // Insurance expiry
        const insDays = getDaysLeft(v.insurance_expiry);
        if (insDays !== null && insDays <= 30) {
          allAlerts.push({
            id: `ins-${v.id}`,
            category: 'insurance',
            severity: getSeverity(insDays),
            title: insDays <= 0 ? `ביטוח חובה פג!` : `ביטוח חובה עומד לפוג`,
            subtitle: label,
            daysLeft: insDays,
            date: v.insurance_expiry,
          });
        }

        // Comprehensive insurance expiry
        const compDays = getDaysLeft(v.comprehensive_insurance_expiry);
        if (compDays !== null && compDays <= 30) {
          allAlerts.push({
            id: `comp-${v.id}`,
            category: 'comprehensive_insurance',
            severity: getSeverity(compDays),
            title: compDays <= 0 ? `ביטוח מקיף פג!` : `ביטוח מקיף עומד לפוג`,
            subtitle: label,
            daysLeft: compDays,
            date: v.comprehensive_insurance_expiry,
          });
        }
      }
    }

    // 2. Driver license expiries
    const { data: drivers } = await supabase.from('drivers').select('*');
    if (drivers) {
      for (const d of drivers) {
        const licDays = getDaysLeft(d.license_expiry);
        if (licDays !== null && licDays <= 30) {
          allAlerts.push({
            id: `lic-${d.id}`,
            category: 'license',
            severity: getSeverity(licDays),
            title: licDays <= 0 ? `רישיון נהיגה פג!` : `רישיון עומד לפוג`,
            subtitle: d.full_name,
            daysLeft: licDays,
            date: d.license_expiry,
            meta: d.phone || undefined,
          });
        }
      }
    }

    // 3. Urgent faults
    const { data: faults } = await supabase
      .from('faults')
      .select('*')
      .in('urgency', ['urgent', 'high', 'דחוף', 'גבוהה'])
      .in('status', ['new', 'open', 'חדש', 'פתוח', 'בטיפול']);
    if (faults) {
      for (const f of faults) {
        allAlerts.push({
          id: `fault-${f.id}`,
          category: 'fault',
          severity: 'critical',
          title: `תקלה דחופה - ${f.fault_type || 'כללי'}`,
          subtitle: `${f.vehicle_plate || 'ללא רכב'} • ${f.driver_name || 'ללא נהג'}`,
          daysLeft: null,
          date: f.date ? new Date(f.date).toISOString().split('T')[0] : null,
          meta: f.description || undefined,
        });
      }
    }

    // Sort: critical first, then warning, then info. Within same severity, by daysLeft ascending
    allAlerts.sort((a, b) => {
      const severityOrder: Record<AlertSeverity, number> = { critical: 0, warning: 1, info: 2 };
      const diff = severityOrder[a.severity] - severityOrder[b.severity];
      if (diff !== 0) return diff;
      return (a.daysLeft ?? 999) - (b.daysLeft ?? 999);
    });

    setAlerts(allAlerts);
    setLoading(false);
  };

  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.category === filter);

  const counts = {
    all: alerts.length,
    critical: alerts.filter(a => a.severity === 'critical').length,
    warning: alerts.filter(a => a.severity === 'warning').length,
  };

  const categories: (AlertCategory | 'all')[] = ['all', 'test', 'insurance', 'comprehensive_insurance', 'license', 'fault'];

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="page-header flex items-center gap-3 !mb-0">
          <Bell size={28} />
          התראות
        </h1>
        <div className="flex items-center gap-3">
          {counts.critical > 0 && (
            <span className="px-3 py-1.5 rounded-full bg-destructive text-destructive-foreground text-sm font-bold animate-pulse">
              {counts.critical} קריטי
            </span>
          )}
          {counts.warning > 0 && (
            <span className="px-3 py-1.5 rounded-full bg-amber-500 text-white text-sm font-bold">
              {counts.warning} אזהרה
            </span>
          )}
          <span className="px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-sm font-medium">
            {counts.all} סה״כ
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(cat => {
          const count = cat === 'all' ? alerts.length : alerts.filter(a => a.category === cat).length;
          if (cat !== 'all' && count === 0) return null;
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === cat
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {cat === 'all' ? 'הכל' : categoryLabels[cat]} ({count})
            </button>
          );
        })}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filtered.length === 0 && (
        <div className="card-elevated text-center py-16">
          <CheckCircle2 className="mx-auto mb-4 text-green-500" size={48} />
          <p className="text-xl font-bold text-foreground">הכל תקין! 🎉</p>
          <p className="text-muted-foreground mt-2">אין התראות פעילות כרגע</p>
        </div>
      )}

      {/* Alerts List */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map(alert => {
            const Icon = categoryIcons[alert.category];
            return (
              <div
                key={alert.id}
                className={`rounded-2xl border-2 p-5 transition-all hover:shadow-md ${severityStyles[alert.severity]}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${severityBadge[alert.severity]}`}>
                    <Icon size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-lg">{alert.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${severityBadge[alert.severity]}`}>
                        {categoryLabels[alert.category]}
                      </span>
                    </div>
                    <p className="text-sm opacity-80 font-medium">{alert.subtitle}</p>
                    {alert.meta && (
                      <p className="text-sm opacity-60 mt-1 line-clamp-2">{alert.meta}</p>
                    )}
                  </div>
                  <div className="text-left shrink-0">
                    {alert.daysLeft !== null && (
                      <div className="flex items-center gap-1.5">
                        <Clock size={16} />
                        <span className="font-bold text-lg">
                          {alert.daysLeft <= 0 ? 'פג!' : `${alert.daysLeft} ימים`}
                        </span>
                      </div>
                    )}
                    {alert.date && (
                      <p className="text-xs opacity-60 mt-1">
                        {new Date(alert.date).toLocaleDateString('he-IL')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
