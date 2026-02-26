import { demoAccidents } from '@/data/demo-data';
import { AlertTriangle } from 'lucide-react';

const statusLabels: Record<string, { text: string; cls: string }> = {
  open: { text: 'פתוח', cls: 'status-urgent' },
  in_progress: { text: 'בטיפול', cls: 'status-pending' },
  closed: { text: 'סגור', cls: 'status-active' },
};

export default function Accidents() {
  return (
    <div className="animate-fade-in">
      <h1 className="page-header">תאונות ואירועים</h1>

      <div className="space-y-3">
        {demoAccidents.map(a => {
          const st = statusLabels[a.status] || statusLabels.open;
          return (
            <div key={a.id} className="card-elevated">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle size={28} className="text-destructive" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xl font-bold">תאונה - {a.vehiclePlate}</p>
                    <span className={`status-badge ${st.cls}`}>{st.text}</span>
                  </div>
                  <p className="text-lg">{a.description}</p>
                  <div className="grid grid-cols-2 gap-2 mt-3 text-muted-foreground">
                    <span>📅 {a.date}</span>
                    <span>👤 {a.driverName}</span>
                    <span>📍 {a.location}</span>
                    <span>💰 עלות משוערת: ₪{a.estimatedCost.toLocaleString()}</span>
                  </div>
                  <div className="flex gap-3 mt-3">
                    {a.hasInsurance && <span className="status-badge status-active">ביטוח ✓</span>}
                    {a.thirdParty && <span className="status-badge status-pending">צד ג׳</span>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {demoAccidents.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <AlertTriangle size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-xl">אין תאונות רשומות</p>
        </div>
      )}
    </div>
  );
}
