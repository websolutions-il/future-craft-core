
import { CheckCircle, Calendar, Rocket, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface TaskEntry {
  date: string;       // תאריך פרסום / ביצוע
  summary: string;    // תיאור קצר
}

const completedTasks: TaskEntry[] = [
  // תקופה ראשונה
  { date: '2026-03-01', summary: 'דף נחיתה מקצועי עם Hero, תכונות, צילומי מסך ו-Footer' },
  { date: '2026-03-02', summary: 'מערכת התחברות – Login, Forgot Password, Reset Password' },
  { date: '2026-03-02', summary: 'Multi-Tenancy – הפרדת חברות מלאה עם CompanyScope' },
  { date: '2026-03-03', summary: 'תפקידים והרשאות – super_admin / fleet_manager / driver עם RLS' },
  { date: '2026-03-03', summary: 'התחזות (Impersonation) – צפייה במערכת מנקודת מבט משתמש אחר' },
  { date: '2026-03-04', summary: 'ניהול רכבים – CRUD מלא, שיוך נהג, ביטוח, טסט, מסמכים' },
  { date: '2026-03-04', summary: 'ניהול נהגים – CRUD מלא, פרטי רישיון, סוגי רישיון' },
  { date: '2026-03-05', summary: 'ניהול לקוחות – CRUD, פרטי הסכם, סוג לקוח' },
  { date: '2026-03-05', summary: 'מסירות רכב – טופס מסירה עם צ\'קליסט מצב, אישור נהג, מיקום' },
  { date: '2026-03-06', summary: 'תקלות – דיווח + צ\'אט Realtime + לוג סטטוס + הפניה לספק + שינוע' },
  { date: '2026-03-06', summary: 'תאונות – דיווח עם תמונות, ביטוח, אימייל אוטומטי' },
  { date: '2026-03-07', summary: 'הזמנות שירות – טופס, דשבורד ניהולי, צ\'אט, סטטוסים, שינוע' },
  { date: '2026-03-07', summary: 'היסטוריית הזמנות שירות – סינון מתקדם, ייצוא CSV, דוח חודשי' },
  { date: '2026-03-08', summary: 'הוצאות – דיווח הוצאה עם קטגוריה, ספק, חשבונית' },
  { date: '2026-03-08', summary: 'מסלולים – ניהול מסלולים עם ימי פעילות, תחנות ביניים' },
  { date: '2026-03-08', summary: 'סידורי עבודה – אישור 3-שלבי, צ\'אט, לוג סטטוס, מלווה' },
  { date: '2026-03-09', summary: 'התראות – מעקב תפוגת טסט, ביטוח, רישיונות (1/7/30 יום)' },
  { date: '2026-03-09', summary: 'התראות פנימיות – DB Triggers, Toasts בזמן אמת' },
  { date: '2026-03-09', summary: 'אימייל אוטומטי – Edge Functions לתאונות, תקלות, הזמנות' },
  { date: '2026-03-10', summary: 'צ\'אט פנימי Realtime – הודעות בזמן אמת בין משתמשים' },
  { date: '2026-03-10', summary: 'בקשות אישור – מנגנון אישורים + תזכורות 48 שעות' },
  { date: '2026-03-10', summary: 'דוחות מתקדמים – Inline מתרחבים, ייצוא CSV/WhatsApp/אימייל' },
  { date: '2026-03-10', summary: 'ספקים, מלווים, מנויים, מבצעים, חירום, יומן מערכת' },
  { date: '2026-03-10', summary: 'ניהול משתמשים + Edge Function + דשבורד נהג + מסמכים + איפוס סיסמה' },

  // תקופה שנייה
  { date: '2026-03-12', summary: 'הזמנות עבודה לספקים – מודול שלם עם CRUD, מספור אוטומטי' },
  { date: '2026-03-13', summary: 'דשבורד אנליטי ספקים – גרפים, מגמות, סינון מתקדם' },
  { date: '2026-03-14', summary: 'דוחות ספקים מורחבים – ייצוא CSV, פילטרים' },
  { date: '2026-03-15', summary: 'כפתור + צף (FAB) בכל הדפים' },
  { date: '2026-03-16', summary: 'לקוח פרטי – תפקיד + דשבורד + Edge Function' },
  { date: '2026-03-17', summary: 'תיקוני באגים ושיפורי UX כלליים' },

  // תקופה שלישית
  { date: '2026-03-18', summary: 'הצמדת נהג גמישה – הגדרה ברמת לקוח (חובה/לא חובה)' },
  { date: '2026-03-18', summary: 'מכסת רכבים פטורים מהצמדה – שדה כמותי ברמת חברה' },
  { date: '2026-03-18', summary: 'ולידציה דינמית בטופס רכבים לפי מכסה והגדרה' },

  // תקופה רביעית
  { date: '2026-03-19', summary: 'ניהול הסכמי לקוח – מספר הסכמים ללקוח עם פרטים מלאים' },
  { date: '2026-03-20', summary: 'מרכז עזרה – עדכון מדריך, חלונית רחבה עם גלילה' },
  { date: '2026-03-20', summary: 'הגדרות גמישות – ביטול חובת ביטוח/העדר תביעות ברמת חברה' },
  { date: '2026-03-21', summary: 'שיפורי דף נחיתה – הסרת מימון, פישוט טקסטים' },

  // תקופה חמישית – עדכונים אחרונים
  { date: '2026-03-22', summary: 'ניהול משתמשים – הצגת אימיילים, איפוס סיסמה מרחוק, כניסה כמשתמש' },
  { date: '2026-03-22', summary: 'סינון תפקידים בטבלת משתמשים + העתקת אימייל' },
  { date: '2026-03-23', summary: 'הגדרות חירום – תיקון בורר חברות, תמיכה בלקוחות פרטיים, סנכרון מלא' },
  { date: '2026-03-23', summary: 'הצמדת נהג ללקוח – תיקון סדר שדות (רכב/נהג/לקוח), תמיכה במלווים מרובים' },
  { date: '2026-03-24', summary: 'דף משימות שבוצעו – סיכום כל הפעולות עם תאריכים' },
];

const CompletedTasks = () => {
  const { user } = useAuth();

  if (user?.role !== 'super_admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div dir="rtl" className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
          <Rocket className="text-primary" size={28} />
          משימות שבוצעו
        </h1>
        <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
          {completedTasks.length} משימות
        </span>
      </div>

      <div className="border border-border rounded-lg overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted">
              <th className="text-right p-3 font-semibold w-8">#</th>
              <th className="text-right p-3 font-semibold w-32">
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  תאריך
                </div>
              </th>
              <th className="text-right p-3 font-semibold">תיאור המשימה</th>
              <th className="text-center p-3 font-semibold w-16">סטטוס</th>
            </tr>
          </thead>
          <tbody>
            {completedTasks.map((task, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                <td className="p-3 text-muted-foreground">{i + 1}</td>
                <td className="p-3 text-muted-foreground font-mono text-xs">{task.date}</td>
                <td className="p-3">{task.summary}</td>
                <td className="p-3 text-center">
                  <CheckCircle className="text-green-500 h-4 w-4 mx-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className="text-center text-muted-foreground text-sm py-8 border-t border-border mt-8">
        מסמך זה נוצר אוטומטית | {new Date().toLocaleDateString('he-IL')}
      </footer>
    </div>
  );
};

export default CompletedTasks;
