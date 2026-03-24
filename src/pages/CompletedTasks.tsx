
import { CheckCircle, Calendar, Rocket, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface TaskEntry {
  date: string;
  summary: string;
}

const initialTasks: TaskEntry[] = [
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
  { date: '2026-03-12', summary: 'הזמנות עבודה לספקים – מודול שלם עם CRUD, מספור אוטומטי' },
  { date: '2026-03-13', summary: 'דשבורד אנליטי ספקים – גרפים, מגמות, סינון מתקדם' },
  { date: '2026-03-14', summary: 'דוחות ספקים מורחבים – ייצוא CSV, פילטרים' },
  { date: '2026-03-15', summary: 'כפתור + צף (FAB) בכל הדפים' },
  { date: '2026-03-16', summary: 'לקוח פרטי – תפקיד + דשבורד + Edge Function' },
  { date: '2026-03-17', summary: 'תיקוני באגים ושיפורי UX כלליים' },
  { date: '2026-03-18', summary: 'הצמדת נהג גמישה – הגדרה ברמת לקוח (חובה/לא חובה)' },
  { date: '2026-03-18', summary: 'מכסת רכבים פטורים מהצמדה – שדה כמותי ברמת חברה' },
  { date: '2026-03-18', summary: 'ולידציה דינמית בטופס רכבים לפי מכסה והגדרה' },
  { date: '2026-03-19', summary: 'ניהול הסכמי לקוח – מספר הסכמים ללקוח עם פרטים מלאים' },
  { date: '2026-03-20', summary: 'מרכז עזרה – עדכון מדריך, חלונית רחבה עם גלילה' },
  { date: '2026-03-20', summary: 'הגדרות גמישות – ביטול חובת ביטוח/העדר תביעות ברמת חברה' },
  { date: '2026-03-21', summary: 'שיפורי דף נחיתה – הסרת מימון, פישוט טקסטים' },
  { date: '2026-03-22', summary: 'ניהול משתמשים – הצגת אימיילים, איפוס סיסמה מרחוק, כניסה כמשתמש' },
  { date: '2026-03-22', summary: 'סינון תפקידים בטבלת משתמשים + העתקת אימייל' },
  { date: '2026-03-23', summary: 'הגדרות חירום – תיקון בורר חברות, תמיכה בלקוחות פרטיים, סנכרון מלא' },
  { date: '2026-03-23', summary: 'הצמדת נהג ללקוח – תיקון סדר שדות (רכב/נהג/לקוח), תמיכה במלווים מרובים' },
  { date: '2026-03-24', summary: 'דף משימות שבוצעו – סיכום כל הפעולות עם תאריכים' },
];

const CompletedTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskEntry[]>(initialTasks);
  const [newDate, setNewDate] = useState('');
  const [newSummary, setNewSummary] = useState('');

  if (!user || user.role !== 'super_admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleAddTask = () => {
    if (!newDate || !newSummary.trim()) {
      toast.error('יש למלא תאריך ותיאור');
      return;
    }
    setTasks(prev => [...prev, { date: newDate, summary: newSummary.trim() }]);
    setNewDate('');
    setNewSummary('');
    toast.success('המשימה נוספה בהצלחה');
  };

  const handleRemoveTask = (index: number) => {
    setTasks(prev => prev.filter((_, i) => i !== index));
    toast.success('המשימה הוסרה');
  };

  return (
    <div dir="rtl" className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
          <Rocket className="text-primary" size={28} />
          משימות פיתוח תוכנה
        </h1>
        <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
          {tasks.length} משימות
        </span>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="list" className="gap-1.5">
            <CheckCircle size={14} />
            רשימת משימות
          </TabsTrigger>
          <TabsTrigger value="add" className="gap-1.5">
            <Plus size={14} />
            הוספת משימה
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list">
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
                {tasks.map((task, i) => (
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
        </TabsContent>

        <TabsContent value="add">
          <div className="border border-border rounded-lg p-6 bg-card space-y-4 max-w-2xl">
            <h2 className="text-lg font-semibold">הוספת משימה חדשה</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">תאריך ביצוע</label>
                <Input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">תיאור המשימה</label>
                <Input
                  placeholder="לדוגמה: תיקון באג בדף הגדרות..."
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                />
              </div>
            </div>
            <Button onClick={handleAddTask} className="gap-1.5">
              <Plus size={16} />
              הוסף משימה
            </Button>

            {tasks.length > initialTasks.length && (
              <div className="mt-6 space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground">משימות שנוספו בהפעלה זו:</h3>
                {tasks.slice(initialTasks.length).map((task, i) => (
                  <div key={i} className="flex items-center justify-between bg-muted/50 rounded-md px-3 py-2 text-sm">
                    <span>
                      <span className="text-muted-foreground font-mono text-xs ml-2">{task.date}</span>
                      {task.summary}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => handleRemoveTask(initialTasks.length + i)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <footer className="text-center text-muted-foreground text-sm py-8 border-t border-border mt-8">
        מסמך זה נוצר אוטומטית | {new Date().toLocaleDateString('he-IL')}
      </footer>
    </div>
  );
};

export default CompletedTasks;
