import { BarChart3, Car, Users, FileText, Wrench, AlertTriangle } from 'lucide-react';
import { demoVehicles, demoDrivers, demoFaults, demoExpenses, demoAccidents, demoRoutes } from '@/data/demo-data';

export default function Reports() {
  const totalExpenses = demoExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalAccidentCost = demoAccidents.reduce((sum, a) => sum + a.estimatedCost, 0);

  const reportCards = [
    {
      title: 'דוח הוצאות כולל',
      icon: FileText,
      color: 'bg-primary/10 text-primary',
      stats: [
        { label: 'סה"כ הוצאות', value: `₪${totalExpenses.toLocaleString()}` },
        { label: 'מספר חשבוניות', value: demoExpenses.length.toString() },
        { label: 'ממוצע לחשבונית', value: `₪${Math.round(totalExpenses / Math.max(demoExpenses.length, 1)).toLocaleString()}` },
      ],
    },
    {
      title: 'דוח רכבים',
      icon: Car,
      color: 'bg-info/10 text-info',
      stats: [
        { label: 'רכבים פעילים', value: demoVehicles.filter(v => v.status === 'active').length.toString() },
        { label: 'בטיפול', value: demoVehicles.filter(v => v.status === 'in_service').length.toString() },
        { label: 'סה"כ רכבים', value: demoVehicles.length.toString() },
      ],
    },
    {
      title: 'דוח תקלות',
      icon: Wrench,
      color: 'bg-warning/10 text-warning',
      stats: [
        { label: 'תקלות חדשות', value: demoFaults.filter(f => f.status === 'new').length.toString() },
        { label: 'דחופות', value: demoFaults.filter(f => f.urgency === 'urgent' || f.urgency === 'critical').length.toString() },
        { label: 'סה"כ תקלות', value: demoFaults.length.toString() },
      ],
    },
    {
      title: 'דוח תאונות',
      icon: AlertTriangle,
      color: 'bg-destructive/10 text-destructive',
      stats: [
        { label: 'תאונות פתוחות', value: demoAccidents.filter(a => a.status !== 'closed').length.toString() },
        { label: 'עלות משוערת', value: `₪${totalAccidentCost.toLocaleString()}` },
        { label: 'סה"כ תאונות', value: demoAccidents.length.toString() },
      ],
    },
    {
      title: 'דוח נהגים',
      icon: Users,
      color: 'bg-success/10 text-success',
      stats: [
        { label: 'נהגים פעילים', value: demoDrivers.filter(d => d.status === 'active').length.toString() },
        { label: 'סה"כ נהגים', value: demoDrivers.length.toString() },
      ],
    },
    {
      title: 'דוח מסלולים',
      icon: BarChart3,
      color: 'bg-accent/30 text-accent-foreground',
      stats: [
        { label: 'מסלולים פעילים', value: demoRoutes.filter(r => r.status === 'active').length.toString() },
        { label: 'סה"כ מסלולים', value: demoRoutes.length.toString() },
      ],
    },
  ];

  return (
    <div className="animate-fade-in">
      <h1 className="page-header">דוחות כספיים ותפעוליים</h1>
      <p className="text-lg text-muted-foreground mb-6">סקירה כללית של נתוני המערכת. בגרסה הבאה: יצוא PDF ושליחה במייל.</p>

      <div className="space-y-4">
        {reportCards.map(card => (
          <div key={card.title} className="card-elevated">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${card.color}`}>
                <card.icon size={24} />
              </div>
              <h2 className="text-xl font-bold">{card.title}</h2>
            </div>
            <div className="grid grid-cols-3 gap-4">
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
