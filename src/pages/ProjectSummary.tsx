
import { CheckCircle, Clock, Plus } from 'lucide-react';

const completedItems = [
  { module: 'דף נחיתה / אודות', desc: 'דף נחיתה מקצועי עם Hero, תכונות, צילומי מסך, Footer – כולל ניווט ו-CTA' },
  { module: 'מערכת התחברות', desc: 'Login, Forgot Password, Reset Password, הרשמה עם אימייל + סיסמה' },
  { module: 'Multi-Tenancy', desc: 'הפרדת חברות מלאה, CompanyScope למנהל-על, סינון אוטומטי בכל המודולים' },
  { module: 'תפקידים והרשאות', desc: 'super_admin / fleet_manager / driver עם RLS, טבלת user_roles נפרדת' },
  { module: 'התחזות (Impersonation)', desc: 'מנהל-על יכול להתחזות למשתמש אחר ולראות את המערכת מנקודת מבטו' },
  { module: 'ניהול רכבים', desc: 'CRUD מלא, שיוך נהג, סטטוס, ביטוח, טסט, מסמכים, קילומטראז\'' },
  { module: 'ניהול נהגים', desc: 'CRUD מלא, פרטי רישיון, סוגי רישיון, סטטוס, שיוך לרכב' },
  { module: 'ניהול לקוחות', desc: 'CRUD, פרטי הסכם, ח.פ., סוג לקוח, מסמכי לקוח' },
  { module: 'מסירות רכב', desc: 'טופס מסירה מלא עם צ\'קליסט מצב, אישור נהג, נהג זמני, מיקום' },
  { module: 'תקלות', desc: 'דיווח + צ\'אט פנימי Realtime + לוג סטטוס + הפניה לספק + שינוע + אישור מנהל' },
  { module: 'תאונות', desc: 'דיווח תאונות, תמונות, צד שלישי, ביטוח, אימייל אוטומטי לדחופות' },
  { module: 'הזמנות שירות', desc: 'טופס מלא, דשבורד ניהולי עם מונים, צ\'אט Realtime, שינוי סטטוס, שינוע' },
  { module: 'היסטוריית הזמנות שירות', desc: 'סינון מתקדם (חברה, רכב, תאריך), ייצוא CSV, דוח חודשי סטטיסטי' },
  { module: 'הוצאות', desc: 'דיווח הוצאה עם קטגוריה, ספק, חשבונית, צילום קבלה' },
  { module: 'מסלולים', desc: 'ניהול מסלולים עם ימי פעילות, מוצא/יעד, תחנות ביניים, שיוך נהג/רכב/לקוח' },
  { module: 'סידורי עבודה', desc: 'יצירה + שיוך + אישור נהג + אישור מנהל + אישור לקוח + צ\'אט + לוג סטטוס' },
  { module: 'התראות', desc: 'מעקב תפוגת טסט, ביטוח, רישיונות עם תזכורות 1/7/30 יום' },
  { module: 'התראות פנימיות', desc: 'DB Triggers אוטומטיים, Toasts בזמן אמת, תיבת התראות לנהג' },
  { module: 'אימייל אוטומטי', desc: 'Edge Functions עם Resend לתאונות, תקלות דחופות, הזמנות שירות' },
  { module: 'צ\'אט פנימי', desc: 'הודעות Realtime בין משתמשי אותה חברה' },
  { module: 'בקשות אישור', desc: 'מנגנון אישורים עם תזכורות אוטומטיות כל 48 שעות' },
  { module: 'דוחות', desc: 'דוחות מתרחבים Inline עם ייצוא CSV, WhatsApp, אימייל' },
  { module: 'ספקים', desc: 'ניהול ספקים עם סוג, טלפון, הערות' },
  { module: 'מלווים', desc: 'ניהול מלווים עם ת.ז., טלפון, שיוך לסידורי עבודה' },
  { module: 'שינוע', desc: 'מעקב בקשות שינוע מתוך תקלות והזמנות שירות' },
  { module: 'מנויים', desc: 'ניהול מנויי חברות, תוכנית, מחיר, סטטוס תשלום' },
  { module: 'מבצעים', desc: 'ניהול מבצעים ממוקדי חברה עם תאריכים ותמונה' },
  { module: 'תבניות אימייל', desc: 'עמוד ניהול תבניות אימייל' },
  { module: 'ניהול משתמשים', desc: 'יצירת משתמשים, שינוי תפקיד, ביטול, Edge Function ליצירת admin' },
  { module: 'יומן מערכת (System Logs)', desc: 'לוג פעולות בלתי ניתן למחיקה עם סינון' },
  { module: 'הגדרות חברה', desc: 'WhatsApp, תזכורות, אישורים' },
  { module: 'הגדרות חירום', desc: 'קטגוריות חירום מותאמות לחברה עם יעד (טלפון/WhatsApp)' },
  { module: 'דשבורד נהג', desc: 'תצוגת נהג עם הרכב שלו, מסלולים, סידורי עבודה, התראות' },
  { module: 'מסמכים', desc: 'העלאת מסמכים ל-Storage עם קטגוריה, שיוך לרכב/נהג' },
  { module: 'Dark Mode', desc: 'מעבר בין ערכת צבעים בהירה לכהה' },
  { module: 'רספונסיבי', desc: 'תמיכה מלאה במובייל כולל ניווט תחתון' },
  { module: 'RTL', desc: 'תמיכה מלאה בעברית מימין לשמאל' },
  { module: 'איפוס סיסמה', desc: 'Edge Function לשליחת קישור איפוס באימייל' },
];

const additions = [
  { feature: 'מערכת Multi-Tenancy מלאה', hours: 12, desc: 'הפרדת חברות, CompanyScope, סינון גלובלי בכל המודולים, RLS policies' },
  { feature: 'התחזות (Impersonation)', hours: 4, desc: 'מנהל-על מתחזה למשתמש, שמירת realUser, חזרה' },
  { feature: 'מודול תקלות מורחב', hours: 10, desc: 'צ\'אט Realtime, לוג סטטוס, הפניה לספק, שינוע, אישורי מנהל' },
  { feature: 'הזמנות שירות (מודול שלם)', hours: 16, desc: 'טופס, דשבורד ניהולי, צ\'אט Realtime, סטטוסים, שינוע, היסטוריה, CSV, דוח חודשי' },
  { feature: 'מערכת התראות אוטומטית', hours: 8, desc: 'DB Triggers, Toasts בזמן אמת, תיבת התראות, אימייל אוטומטי (3 Edge Functions)' },
  { feature: 'סידורי עבודה', hours: 10, desc: 'יצירה, אישור 3-שלבי (נהג+מנהל+לקוח), צ\'אט, לוג סטטוס, שיוך מלווה' },
  { feature: 'מסירות רכב מורחב', hours: 6, desc: 'צ\'קליסט מצב, אישור נהג, נהג זמני, מיקום GPS' },
  { feature: 'בקשות אישור + תזכורות', hours: 5, desc: 'מנגנון אישורים, תזכורות 48 שעות, היסטוריה' },
  { feature: 'דוחות מתקדמים', hours: 6, desc: 'דוחות Inline מתרחבים, ייצוא CSV/WhatsApp/אימייל, דוח חודשי' },
  { feature: 'צ\'אט פנימי Realtime', hours: 5, desc: 'הודעות בזמן אמת, סינון חברה, סימון נקרא' },
  { feature: 'ניהול ספקים', hours: 2, desc: 'CRUD ספקים עם סוג וטלפון' },
  { feature: 'ניהול מלווים', hours: 2, desc: 'CRUD מלווים עם שיוך לסידורי עבודה' },
  { feature: 'מנויים וחיוב', hours: 3, desc: 'ניהול מנויי חברות, תוכנית, סטטוס תשלום' },
  { feature: 'מבצעים', hours: 2, desc: 'ניהול מבצעים ממוקדי חברה' },
  { feature: 'הגדרות חירום', hours: 4, desc: 'קטגוריות חירום מותאמות, יעדים, תבניות הודעה' },
  { feature: 'יומן מערכת', hours: 3, desc: 'לוג בלתי ניתן למחיקה עם סינון מתקדם' },
  { feature: 'ניהול משתמשים + Edge Function', hours: 5, desc: 'יצירת משתמשים, שינוי תפקידים, Edge Function ליצירת admin' },
  { feature: 'דשבורד נהג', hours: 4, desc: 'תצוגה ייעודית לנהג עם הרכב, מסלולים, סידורים' },
  { feature: 'מסמכים + Storage', hours: 4, desc: 'העלאה ל-Storage, קטגוריות, שיוך לרכב/נהג' },
  { feature: 'איפוס סיסמה באימייל', hours: 3, desc: 'Edge Function עם Resend לשליחת קישור איפוס' },
  { feature: 'RLS Policies מלאות', hours: 6, desc: 'מדיניות אבטחה לכל הטבלאות, has_role, get_user_company' },
];

const totalAdditionHours = additions.reduce((sum, a) => sum + a.hours, 0);
const withQA = Math.round(totalAdditionHours * 1.3);

const ProjectSummary = () => {
  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">סיכום פרויקט דליה – מערכת ניהול צי רכב</h1>
          <p className="text-primary-foreground/80">סיכום מלא של מה שבוצע, תוספות מעבר לתוכנית, והערכות זמן</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">

        {/* Section: Original Plan */}
        <section>
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <CheckCircle className="text-green-500 h-6 w-6" />
            תוכנית מקורית – דף נחיתה / אודות
          </h2>
          <p className="text-muted-foreground mb-4">כפי שהוגדר ב-plan.md – בוצע במלואו ✅</p>
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-start gap-2"><CheckCircle className="text-green-500 h-4 w-4 mt-1 shrink-0" /><span>Header עם לוגו + ניווט + כפתור כניסה</span></div>
            <div className="flex items-start gap-2"><CheckCircle className="text-green-500 h-4 w-4 mt-1 shrink-0" /><span>Hero Section עם CTA</span></div>
            <div className="flex items-start gap-2"><CheckCircle className="text-green-500 h-4 w-4 mt-1 shrink-0" /><span>בעיות שאנחנו פותרים – 6 כרטיסים</span></div>
            <div className="flex items-start gap-2"><CheckCircle className="text-green-500 h-4 w-4 mt-1 shrink-0" /><span>איך זה עובד – 4 שלבים</span></div>
            <div className="flex items-start gap-2"><CheckCircle className="text-green-500 h-4 w-4 mt-1 shrink-0" /><span>תכונות המערכת – רשימה מלאה</span></div>
            <div className="flex items-start gap-2"><CheckCircle className="text-green-500 h-4 w-4 mt-1 shrink-0" /><span>צילומי מסך</span></div>
            <div className="flex items-start gap-2"><CheckCircle className="text-green-500 h-4 w-4 mt-1 shrink-0" /><span>Footer עם MAO.CO.IL + twaek-soft.com</span></div>
            <div className="flex items-start gap-2"><CheckCircle className="text-green-500 h-4 w-4 mt-1 shrink-0" /><span>RTL + רספונסיבי + גופן Heebo + צבעי מיתוג</span></div>
          </div>
        </section>

        {/* Section: All completed modules */}
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <CheckCircle className="text-green-500 h-6 w-6" />
            כל המודולים שבוצעו ({completedItems.length})
          </h2>
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted">
                  <th className="text-right p-3 font-semibold w-8">#</th>
                  <th className="text-right p-3 font-semibold">מודול</th>
                  <th className="text-right p-3 font-semibold">תיאור</th>
                  <th className="text-center p-3 font-semibold w-16">סטטוס</th>
                </tr>
              </thead>
              <tbody>
                {completedItems.map((item, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                    <td className="p-3 text-muted-foreground">{i + 1}</td>
                    <td className="p-3 font-medium">{item.module}</td>
                    <td className="p-3 text-muted-foreground">{item.desc}</td>
                    <td className="p-3 text-center"><CheckCircle className="text-green-500 h-4 w-4 mx-auto" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section: Additions beyond plan */}
        <section>
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Plus className="text-blue-500 h-6 w-6" />
            תוספות מעבר לתוכנית המקורית
          </h2>
          <p className="text-muted-foreground mb-4">
            כל הפיצ'רים הבאים לא היו חלק מהתוכנית המקורית (שכללה רק דף נחיתה).
            <br />
            הערכת זמן כוללת תוספת של 30% עבור ניסוח, בדיקות, QA, שליחה ללקוח ותיקונים.
          </p>

          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted">
                  <th className="text-right p-3 font-semibold w-8">#</th>
                  <th className="text-right p-3 font-semibold">תוספת</th>
                  <th className="text-right p-3 font-semibold">פירוט</th>
                  <th className="text-center p-3 font-semibold w-24">
                    <div>שעות</div>
                    <div className="text-xs font-normal text-muted-foreground">פיתוח</div>
                  </th>
                  <th className="text-center p-3 font-semibold w-24">
                    <div>שעות</div>
                    <div className="text-xs font-normal text-muted-foreground">כולל 30%</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {additions.map((item, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                    <td className="p-3 text-muted-foreground">{i + 1}</td>
                    <td className="p-3 font-medium">{item.feature}</td>
                    <td className="p-3 text-muted-foreground">{item.desc}</td>
                    <td className="p-3 text-center font-mono">{item.hours}</td>
                    <td className="p-3 text-center font-mono font-bold">{Math.round(item.hours * 1.3)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-muted font-bold">
                  <td className="p-3" colSpan={3}>סה"כ</td>
                  <td className="p-3 text-center font-mono">{totalAdditionHours}</td>
                  <td className="p-3 text-center font-mono">{withQA}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* Summary box */}
        <section className="bg-muted/50 border border-border rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" />
            סיכום שעות
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-background rounded-lg p-4 text-center border border-border">
              <div className="text-3xl font-bold text-green-600">{totalAdditionHours}</div>
              <div className="text-sm text-muted-foreground mt-1">שעות פיתוח נטו</div>
            </div>
            <div className="bg-background rounded-lg p-4 text-center border border-border">
              <div className="text-3xl font-bold text-orange-500">30%</div>
              <div className="text-sm text-muted-foreground mt-1">תוספת QA + ניהול</div>
            </div>
            <div className="bg-background rounded-lg p-4 text-center border border-border">
              <div className="text-3xl font-bold text-primary">{withQA}</div>
              <div className="text-sm text-muted-foreground mt-1">סה"כ שעות כולל</div>
            </div>
          </div>
        </section>

        <footer className="text-center text-muted-foreground text-sm py-8 border-t border-border">
          מסמך זה נוצר אוטומטית | {new Date().toLocaleDateString('he-IL')}
        </footer>
      </div>
    </div>
  );
};

export default ProjectSummary;
