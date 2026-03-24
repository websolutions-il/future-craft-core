import { useState, useRef } from 'react';
import { Upload, ArrowRight, FileSpreadsheet, CheckCircle2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ImportRow {
  internal_number?: string;
  license_plate?: string;
  department?: string;
  manufacturer?: string;
  year?: string;
  last_inspection_date?: string;
  next_inspection_date?: string;
  license_expiry?: string;
  insurance_expiry?: string;
  engineer_report?: string;
  notes?: string;
}

export default function VehicleImport() {
  const { user } = useAuth();
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const parseCSV = (text: string): ImportRow[] => {
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const row: any = {};
      headers.forEach((h, i) => {
        const key = mapHeader(h);
        if (key) row[key] = values[i] || '';
      });
      return row as ImportRow;
    });
  };

  const mapHeader = (header: string): string | null => {
    const map: Record<string, string> = {
      'מספר פנימי': 'internal_number',
      'internal_number': 'internal_number',
      'מספר רישוי': 'license_plate',
      'license_plate': 'license_plate',
      'מחלקה': 'department',
      'ענף': 'department',
      'יצרן': 'manufacturer',
      'manufacturer': 'manufacturer',
      'שנת ייצור': 'year',
      'year': 'year',
      'תאריך ביקורת אחרונה': 'last_inspection_date',
      'תאריך ביקורת הבאה': 'next_inspection_date',
      'תוקף רישוי': 'license_expiry',
      'תוקף ביטוח': 'insurance_expiry',
      'תסקיר מהנדס': 'engineer_report',
      'הערות': 'notes',
      'notes': 'notes',
    };
    return map[header] || null;
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    if (file.name.endsWith('.csv')) {
      const text = await file.text();
      const parsed = parseCSV(text);
      setRows(parsed);
      toast.success(`נקראו ${parsed.length} שורות`);
    } else {
      toast.error('נא להעלות קובץ CSV. לייצוא מאקסל: שמור כ-CSV (UTF-8)');
    }
  };

  const handleImport = async () => {
    if (rows.length === 0) return;
    setImporting(true);
    let success = 0;
    let failed = 0;

    for (const row of rows) {
      if (!row.license_plate) { failed++; continue; }

      const payload: any = {
        license_plate: row.license_plate,
        internal_number: row.internal_number || '',
        manufacturer: row.manufacturer || '',
        year: row.year ? parseInt(row.year) : null,
        vehicle_type: row.department || '',
        test_expiry: row.license_expiry || null,
        insurance_expiry: row.insurance_expiry || null,
        last_service_date: row.last_inspection_date || null,
        next_service_date: row.next_inspection_date || null,
        notes: [row.engineer_report, row.notes].filter(Boolean).join(' | '),
        company_name: user?.company_name || '',
        created_by: user?.id,
        status: 'active',
        management_type: 'operational_leasing',
        odometer: 0,
      };

      const { error } = await supabase.from('vehicles').insert(payload);
      if (error) {
        console.error('Import error for', row.license_plate, error);
        failed++;
      } else {
        success++;
      }
    }

    setImporting(false);
    setImportResult({ success, failed });
    if (success > 0) toast.success(`${success} רכבים יובאו בהצלחה`);
    if (failed > 0) toast.error(`${failed} רכבים נכשלו`);
  };

  return (
    <div className="animate-fade-in">
      <h1 className="page-header flex items-center gap-3"><FileSpreadsheet size={28} /> יבוא רכבים מקובץ</h1>

      <div className="card-elevated mb-6">
        <h2 className="text-lg font-bold mb-3">הנחיות</h2>
        <ul className="text-muted-foreground text-sm space-y-1 list-disc list-inside">
          <li>שמור את קובץ האקסל כ-CSV (UTF-8)</li>
          <li>השורה הראשונה חייבת לכלול כותרות עמודות</li>
          <li>כותרות נתמכות: מספר פנימי, מספר רישוי, מחלקה/ענף, יצרן, שנת ייצור, תאריך ביקורת אחרונה, תאריך ביקורת הבאה, תוקף רישוי, תוקף ביטוח, תסקיר מהנדס, הערות</li>
          <li>שדה חובה: מספר רישוי</li>
        </ul>
      </div>

      <button onClick={() => fileRef.current?.click()}
        className="w-full flex items-center justify-center gap-3 py-6 rounded-xl border-2 border-dashed border-input bg-muted/50 text-xl font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors mb-6">
        <Upload size={28} /> 📁 בחר קובץ CSV
      </button>
      <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} className="hidden" />

      {rows.length > 0 && !importResult && (
        <div className="space-y-4">
          <div className="card-elevated">
            <h2 className="text-lg font-bold mb-3">תצוגה מקדימה ({rows.length} שורות)</h2>
            <div className="overflow-x-auto">
              <table className="text-sm w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-right p-2">מס' פנימי</th>
                    <th className="text-right p-2">מס' רישוי</th>
                    <th className="text-right p-2">יצרן</th>
                    <th className="text-right p-2">שנה</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 10).map((r, i) => (
                    <tr key={i} className="border-b border-border">
                      <td className="p-2">{r.internal_number || '—'}</td>
                      <td className="p-2 font-bold">{r.license_plate || '—'}</td>
                      <td className="p-2">{r.manufacturer || '—'}</td>
                      <td className="p-2">{r.year || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length > 10 && <p className="text-sm text-muted-foreground mt-2 text-center">...ועוד {rows.length - 10} שורות</p>}
            </div>
          </div>

          <button onClick={handleImport} disabled={importing}
            className="w-full py-5 rounded-xl text-xl font-bold bg-primary text-primary-foreground disabled:opacity-50">
            {importing ? 'מייבא...' : `📥 ייבא ${rows.length} רכבים`}
          </button>
        </div>
      )}

      {importResult && (
        <div className="card-elevated text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-2xl font-bold">
            {importResult.failed === 0 ? <CheckCircle2 size={32} className="text-success" /> : <AlertTriangle size={32} className="text-warning" />}
            היבוא הושלם
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-success/10">
              <p className="text-3xl font-bold text-success">{importResult.success}</p>
              <p className="text-sm text-muted-foreground">יובאו בהצלחה</p>
            </div>
            <div className="p-4 rounded-xl bg-destructive/10">
              <p className="text-3xl font-bold text-destructive">{importResult.failed}</p>
              <p className="text-sm text-muted-foreground">נכשלו</p>
            </div>
          </div>
          <button onClick={() => { setRows([]); setImportResult(null); }}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg">
            ייבוא נוסף
          </button>
        </div>
      )}
    </div>
  );
}
