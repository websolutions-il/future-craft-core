import { Map, CheckCircle2, Clock, Calendar, Rocket } from 'lucide-react';

const currentVersion = '1.0.0-beta';
const releaseDate = '2026-02-26';

interface RoadmapPhase {
  phase: string;
  title: string;
  status: 'done' | 'current' | 'planned';
  items: { name: string; done: boolean }[];
}

const roadmap: RoadmapPhase[] = [
  {
    phase: 'שלב 1',
    title: 'תשתית ותצוגה בסיסית (MVP)',
    status: 'current',
    items: [
      { name: 'מסך התחברות עם הפרדת הרשאות', done: true },
      { name: 'דשבורד ראשי עם סטטיסטיקות', done: true },
      { name: 'ניהול רכבים - רשימה + כרטיס', done: true },
      { name: 'ניהול נהגים - רשימה + כרטיס', done: true },
      { name: 'ניהול לקוחות - רשימה + כרטיס', done: true },
      { name: 'ניהול מסלולי נסיעה', done: true },
      { name: 'דיווח ומעקב תקלות', done: true },
      { name: 'מסמכים והוצאות', done: true },
      { name: 'תאונות ואירועים', done: true },
      { name: 'דוחות כספיים ותפעוליים', done: true },
      { name: 'עיצוב Mobile-First לנהגים', done: true },
      { name: 'ניווט תחתון מאסיבי למובייל', done: true },
      { name: 'RTL מלא + עברית', done: true },
      { name: 'Roadmap מסודר', done: true },
    ],
  },
  {
    phase: 'שלב 2',
    title: 'בסיס נתונים ואימות',
    status: 'planned',
    items: [
      { name: 'חיבור Lovable Cloud (Supabase)', done: false },
      { name: 'מערכת אימות אמיתית עם הרשאות', done: false },
      { name: 'הפרדת נתונים לפי חברה (Multi-Tenant)', done: false },
      { name: 'CRUD מלא לכל המודולים', done: false },
      { name: 'שמירת היסטוריית שינויים', done: false },
      { name: 'מערכת הצמדת רכב-נהג עם אישורים', done: false },
    ],
  },
  {
    phase: 'שלב 3',
    title: 'מודולים מתקדמים',
    status: 'planned',
    items: [
      { name: 'יומן פעילות - תצוגה יומית/שבועית/חודשית', done: false },
      { name: 'מעקב נסיעות בזמן אמת (GPS)', done: false },
      { name: 'העלאת תמונות ומסמכים (Storage)', done: false },
      { name: 'מערכת הסכמים ותעריפים ללקוחות', done: false },
      { name: 'מעקב טיפולים ותחזוקה לרכבים', done: false },
      { name: 'התראות - תוקף טסט, ביטוח, טיפולים', done: false },
      { name: 'מערכת החלפת נהגים זמנית', done: false },
    ],
  },
  {
    phase: 'שלב 4',
    title: 'דוחות וייצוא',
    status: 'planned',
    items: [
      { name: 'דוח הוצאות לפי רכב/נהג/תקופה', done: false },
      { name: 'דוח תאונות מפורט', done: false },
      { name: 'דוח שימוש ברכב לפי קילומטראז\'', done: false },
      { name: 'דוח פעילות מסלולים', done: false },
      { name: 'ייצוא PDF', done: false },
      { name: 'שליחת דוח במייל', done: false },
      { name: 'פילטרים מתקדמים לכל דוח', done: false },
    ],
  },
  {
    phase: 'שלב 5',
    title: 'אינטגרציות ואופטימיזציה',
    status: 'planned',
    items: [
      { name: 'חיבור WhatsApp לנהגים', done: false },
      { name: 'PWA - התקנה על מכשיר הנהג', done: false },
      { name: 'עבודה אופליין + סנכרון', done: false },
      { name: 'חיבור למערכת הנהלת חשבונות', done: false },
      { name: 'חיבור CRM', done: false },
      { name: 'Audit Log מלא - תיעוד פעולות משתמשים', done: false },
      { name: 'פאנל מנהל על - ניהול חברות', done: false },
    ],
  },
];

export default function Roadmap() {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <Map size={32} className="text-primary" />
        <h1 className="page-header mb-0">תוכנית פיתוח - דליה</h1>
      </div>
      <div className="flex items-center gap-4 mb-8 text-muted-foreground">
        <span className="flex items-center gap-1"><Calendar size={16} /> {releaseDate}</span>
        <span className="flex items-center gap-1"><Rocket size={16} /> גרסה {currentVersion}</span>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-6 text-sm">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-success inline-block" /> הושלם</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-warning inline-block" /> בפיתוח</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-muted-foreground/30 inline-block" /> מתוכנן</span>
      </div>

      <div className="space-y-6">
        {roadmap.map((phase, idx) => {
          const doneCount = phase.items.filter(i => i.done).length;
          const progress = Math.round((doneCount / phase.items.length) * 100);
          const statusColor = phase.status === 'done' ? 'border-success' : phase.status === 'current' ? 'border-warning' : 'border-muted';

          return (
            <div key={idx} className={`card-elevated border-r-4 ${statusColor}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-sm text-muted-foreground font-medium">{phase.phase}</span>
                  <h2 className="text-xl font-bold">{phase.title}</h2>
                </div>
                <div className="text-left">
                  <span className={`status-badge ${phase.status === 'current' ? 'status-pending' : phase.status === 'done' ? 'status-active' : 'status-inactive'}`}>
                    {phase.status === 'current' ? 'בפיתוח' : phase.status === 'done' ? 'הושלם' : 'מתוכנן'}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-muted rounded-full h-3 mb-4">
                <div
                  className="bg-success h-3 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground mb-3">{doneCount} / {phase.items.length} משימות ({progress}%)</p>

              <div className="space-y-2">
                {phase.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 py-2">
                    {item.done ? (
                      <CheckCircle2 size={22} className="text-success flex-shrink-0" />
                    ) : (
                      <Clock size={22} className="text-muted-foreground/40 flex-shrink-0" />
                    )}
                    <span className={`text-lg ${item.done ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer with version */}
      <div className="mt-12 p-6 bg-primary text-primary-foreground rounded-2xl text-center">
        <p className="text-2xl font-bold mb-2">דליה - מערכת ניהול צי רכב</p>
        <p className="opacity-80">פתרונות מימון ותפעול לרכב</p>
        <div className="mt-4 flex justify-center gap-6 text-sm opacity-70">
          <span>גרסה {currentVersion}</span>
          <span>תאריך שחרור: {releaseDate}</span>
        </div>
      </div>
    </div>
  );
}
