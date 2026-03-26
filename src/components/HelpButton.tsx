import { useState, useEffect } from 'react';
import { HelpCircle, X, Car, AlertTriangle, RefreshCw, FileText, Phone, Shield, Users, BarChart3, Truck, ClipboardList, MapPin, Settings, Bell, UserCheck, Building2, UserPlus, Wrench, Scale, Upload, Search, HeartPulse, CheckSquare, MessageCircle, CalendarDays, Receipt, Megaphone, ShieldAlert, History, BookOpen, Briefcase } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface HelpSection {
  icon: React.ReactNode;
  title: string;
  content: string[];
}

interface HelpCategory {
  label: string;
  sections: HelpSection[];
}

function getDriverHelp(): HelpCategory[] {
  return [
    {
      label: 'נהיגה ודיווחים',
      sections: [
        {
          icon: <Car className="h-5 w-5 text-primary" />,
          title: 'נהיגה יומית',
          content: [
            'וודא שהרכב תקין לפני כל נסיעה',
            'בדוק שמנים, צמיגים ומראות לפני יציאה',
            'דווח על כל תקלה מיד דרך המערכת',
            'עדכן קריאת מד-אוץ בכל תדלוק',
          ],
        },
        {
          icon: <AlertTriangle className="h-5 w-5 text-destructive" />,
          title: 'דיווח תאונה',
          content: [
            'עצור במקום בטוח והפעל אורות חירום',
            'וודא שאין נפגעים – אם יש, התקשר למד"א 101',
            'צלם את הנזק, לוחיות הרכב והסביבה',
            'דווח במערכת דרך "דיווח תאונה" עם כל הפרטים',
            'אל תודה באשמה בשום שלב',
            'קבל פרטי ביטוח מהצד השני',
          ],
        },
        {
          icon: <RefreshCw className="h-5 w-5 text-info" />,
          title: 'החלפת רכב (מסירה/קבלה)',
          content: [
            'שני הנהגים חייבים לבצע את תהליך ההחלפה במערכת',
            'הנהג המוסר: מתעד את מצב הרכב, קריאת מד-אוץ וצילומים',
            'הנהג המקבל: בודק את הרכב ומאשר את קבלתו',
            'דווח על כל נזק קיים לפני קבלת הרכב',
            'וודא שכל המסמכים (רישיון רכב, ביטוח) נמצאים ברכב',
          ],
        },
        {
          icon: <FileText className="h-5 w-5 text-warning" />,
          title: 'דיווח תקלות',
          content: [
            'דווח על כל תקלה מיד – גם אם נראית קטנה',
            'תאר את התקלה בצורה ברורה',
            'צרף תמונות במידת האפשר',
            'סמן דחיפות: נמוכה / בינונית / גבוהה / קריטית',
            'ניתן לבקש גרירה דרך המערכת',
            'עקוב אחרי עדכוני סטטוס בצ\'אט התקלה',
          ],
        },
        {
          icon: <HeartPulse className="h-5 w-5 text-destructive" />,
          title: 'הצהרת בריאות',
          content: [
            'מלא הצהרת בריאות דרך תפריט "הצהרת בריאות"',
            'ההצהרה כוללת: שם, ת.ז, מספר רישיון, תאריך',
            'ניתן לצרף צילום רישיון נהיגה',
            'חתום דיגיטלית על ההצהרה',
          ],
        },
      ],
    },
    {
      label: 'סידור עבודה ומסלולים',
      sections: [
        {
          icon: <CalendarDays className="h-5 w-5 text-primary" />,
          title: 'סידור עבודה שבועי',
          content: [
            'צפה בסידור העבודה השבועי שלך',
            'אשר או דחה שיבוצים שהוקצו לך',
            'צפה בפרטי המסלול, השעות והרכב המשויך',
            'קבל התראות על שיבוצים חדשים',
          ],
        },
        {
          icon: <MapPin className="h-5 w-5 text-success" />,
          title: 'מסלולים ונסיעות',
          content: [
            'בדוק את המסלול המתוכנן לפני יציאה',
            'התחל ועצור נסיעה דרך המערכת',
            'דווח על עיכובים או שינויים במסלול',
            'צפה בתחנות ביניים לאורך המסלול',
          ],
        },
        {
          icon: <Phone className="h-5 w-5 text-destructive" />,
          title: 'מצב חירום',
          content: [
            'לחץ על "חירום" בתפריט לגישה מהירה',
            'משטרה: 100 | מד"א: 101 | כיבוי אש: 102',
            'השתמש בכפתורי החיוג המהיר המוגדרים לחברה שלך',
            'דווח למנהל הצי מיד לאחר הטיפול הראשוני',
          ],
        },
        {
          icon: <CheckSquare className="h-5 w-5 text-info" />,
          title: 'בדיקת רכב תקופתית',
          content: [
            'בצע בדיקת רכב תלת/חצי שנתית דרך המערכת',
            'עבור על 19 סעיפי הבדיקה וסמן תקין/לא תקין',
            'הוסף הערות לכל סעיף במידת הצורך',
            'ליקויים שנמצאו ייפתחו כמשימות טיפול אוטומטית',
          ],
        },
        {
          icon: <MessageCircle className="h-5 w-5 text-primary" />,
          title: 'הודעות והתראות',
          content: [
            'צפה בהודעות מהמנהל ב"התראות"',
            'קבל עדכונים על שיבוצים, תקלות ומשימות',
            'סמן הודעות כנקראו',
          ],
        },
      ],
    },
  ];
}

function getFleetManagerHelp(): HelpCategory[] {
  return [
    {
      label: 'ניהול צי',
      sections: [
        {
          icon: <Users className="h-5 w-5 text-primary" />,
          title: 'ניהול נהגים',
          content: [
            'הוסף וערוך פרטי נהגים מתפריט "נהגים"',
            'עקוב אחרי תוקף רישיונות ועדכן בהתאם',
            'שייך נהגים לרכבים ולמסלולים',
            'צפה בהתראות על רישיונות שעומדים לפוג',
            'נהגים שהוסרו עוברים לארכיון (לא נמחקים)',
          ],
        },
        {
          icon: <Truck className="h-5 w-5 text-info" />,
          title: 'ניהול רכבים',
          content: [
            'נהל את צי הרכבים מתפריט "רכבים"',
            'בחר סוג ניהול: ליסינג תפעולי, ליסינג מימוני או תחזוקה עצמאית',
            'עקוב אחרי טסטים, ביטוחים ותוקפי רישוי',
            'עדכן קריאות מד-אוץ ומצב הרכב',
            'שייך רכבים לנהגים דרך "הצמדת רכב"',
            'רכבים שהוסרו עוברים לארכיון ולא נמחקים',
            'הגדר מספר פנימי לכל רכב לזיהוי ארגוני',
          ],
        },
        {
          icon: <Upload className="h-5 w-5 text-success" />,
          title: 'יבוא רכבים',
          content: [
            'ייבא רכבים מקובץ CSV דרך "יבוא רכבים"',
            'הורד תבנית CSV לדוגמה והשלם את הנתונים',
            'המערכת מזהה כפילויות לפי מספר רכב',
            'ניתן לייבא עשרות רכבים בפעולה אחת',
          ],
        },
        {
          icon: <Search className="h-5 w-5 text-primary" />,
          title: 'בדיקת רכב ממשלתי',
          content: [
            'בדוק פרטי רכב מול מאגר משרד התחבורה',
            'הזן מספר רכב וקבל: יצרן, דגם, שנה, בעלות, דלק, צבע',
            'הנתונים נשמרים במטמון ל-24 שעות',
            'גישה דרך "בדיקת רכב ממשלתי" בתפריט',
          ],
        },
        {
          icon: <CheckSquare className="h-5 w-5 text-warning" />,
          title: 'ביקורות רכב ומשימות טיפול',
          content: [
            'בצע ביקורות תקופתיות עם Checklist של 14 סעיפים',
            'ליקויים שנמצאו נפתחים כמשימות ב"מרכז ליקויים"',
            'עקוב אחרי סטטוס ליקויים: פתוח 🔴, בטיפול 🟡, טופל 🟢',
            'בדיקות תלת/חצי שנתיות כוללות 19 סעיפים',
          ],
        },
        {
          icon: <ClipboardList className="h-5 w-5 text-warning" />,
          title: 'הוראות שירות',
          content: [
            'צור הוראות שירות לטיפולים ותיקונים',
            'עקוב אחרי סטטוס הטיפולים',
            'אשר או דחה בקשות מנהגים',
            'צפה בהיסטוריית הזמנות שירות',
          ],
        },
      ],
    },
    {
      label: 'לקוחות ומסלולים',
      sections: [
        {
          icon: <Building2 className="h-5 w-5 text-primary" />,
          title: 'ניהול לקוחות והסכמים',
          content: [
            'צור לקוחות חדשים מתפריט "לקוחות"',
            'הוסף מספר הסכמים לכל לקוח בלחיצה על "+"',
            'כל הסכם כולל: מספר סידורי, פירוט, סכום לפני ואחרי מע"מ',
            'ניתן לערוך ולמחוק הסכמים בכל עת',
            'הדפס הסכם בודד בלחיצה על כפתור ההדפסה',
          ],
        },
        {
          icon: <Briefcase className="h-5 w-5 text-success" />,
          title: 'עסקאות וסיכומי עבודה',
          content: [
            'צור עסקאות מדף הלקוח – כפתור "עסקאות"',
            'כל עסקה מקבלת מספור אוטומטי (DL-00001)',
            'עקוב אחרי סטטוס: בביצוע, הושלם, בוטל',
            'הגדר סכומים, תאריכי יעד וסוג עבודה',
          ],
        },
        {
          icon: <MapPin className="h-5 w-5 text-info" />,
          title: 'ניהול מסלולים',
          content: [
            'צור מסלולים עם מספר מסלול, מוצא ויעד',
            'הגדר תמחור שונה לכל סוג רכב (פרטי, מסחרי, מונית, מיניבוס, אוטובוס)',
            'קבע טווח תאריכי תוקף (valid from/to) למסלול',
            'שייך לקוח, נהג ורכב לכל מסלול',
            'הוסף תחנות ביניים וימי פעילות',
            'לאחר תאריך ביצוע – לא ניתן לשנות/למחוק מסלול',
          ],
        },
        {
          icon: <CalendarDays className="h-5 w-5 text-primary" />,
          title: 'סידור עבודה',
          content: [
            'צור שיבוצים לנהגים מ"סידור עבודה"',
            'שייך נהג, רכב, מסלול ולקוח לכל שיבוץ',
            'נהל אישורים: אישור מנהל ואישור נהג',
            'עקוב אחרי סטטוס: ממתין, מאושר, בביצוע, הושלם',
            'צפה בצ\'אט שיבוץ לתקשורת עם נהג',
          ],
        },
      ],
    },
    {
      label: 'דוחות ומעקב',
      sections: [
        {
          icon: <AlertTriangle className="h-5 w-5 text-destructive" />,
          title: 'טיפול בתאונות ותקלות',
          content: [
            'צפה בדיווחי תאונות ותקלות מנהגים',
            'עדכן סטטוס ותיעוד לכל אירוע',
            'נהל גרירות והפניות לספקים בתוך התקלה',
            'צפה בצ\'אט תקלה וביומן שינויי סטטוס',
            'הפק דוחות לפי תקופה',
          ],
        },
        {
          icon: <BarChart3 className="h-5 w-5 text-success" />,
          title: 'דוחות וניתוח',
          content: [
            'צפה בדוחות הוצאות וניתוחי עלויות',
            'דוחות זמינים: כספיים, רכבים, טיפולים, נהגים, הפסד/רווח',
            'הפק דוחות לפי נהג, רכב או תקופה',
            'ייצא נתונים ל-CSV',
          ],
        },
        {
          icon: <Bell className="h-5 w-5 text-primary" />,
          title: 'התראות',
          content: [
            'המערכת מייצרת התראות אוטומטיות על: טסט, ביטוח חובה, ביטוח מקיף, רישיון',
            'הגדר התראות מותאמות אישית (חד-פעמיות או חוזרות)',
            'קבל התראות על דיווחים חדשים מנהגים',
            'עקוב אחרי משימות פתוחות',
          ],
        },
        {
          icon: <Receipt className="h-5 w-5 text-warning" />,
          title: 'הוצאות',
          content: [
            'רשום הוצאות לפי רכב: דלק, חניה, שטיפה, קנסות ועוד',
            'צרף צילום חשבונית לכל הוצאה',
            'עקוב אחרי הוצאות לפי קטגוריה ותקופה',
          ],
        },
        {
          icon: <RefreshCw className="h-5 w-5 text-info" />,
          title: 'מסירות וקבלות רכב',
          content: [
            'תעד מסירת/קבלת רכב עם Checklist מצב',
            'צרף צילומים ותיאור נזקים',
            'הנהג המקבל מאשר דיגיטלית',
            'צפה בהיסטוריית מסירות לכל רכב',
          ],
        },
      ],
    },
  ];
}

function getSuperAdminHelp(): HelpCategory[] {
  return [
    {
      label: 'ניהול כללי',
      sections: [
        {
          icon: <Shield className="h-5 w-5 text-primary" />,
          title: 'סקירה כללית',
          content: [
            'מסך הדשבורד מציג סיכום של כל הפעילות במערכת',
            'ניתן לנווט בין כל המסכים דרך התפריט הצדדי',
            'כמנהל על יש לך גישה מלאה לכל הנתונים',
            'ניתן לסנן נתונים לפי חברה מבורר החברות בתפריט',
          ],
        },
        {
          icon: <Users className="h-5 w-5 text-info" />,
          title: 'ניהול משתמשים',
          content: [
            'צור משתמשים חדשים מתפריט "ניהול משתמשים"',
            'הגדר תפקידים: נהג, מנהל צי, מנהל על או לקוח פרטי',
            'שייך משתמשים לחברות',
            'הפעל או השבת משתמשים לפי הצורך',
            'שנה סיסמא למשתמש קיים',
          ],
        },
        {
          icon: <Settings className="h-5 w-5 text-muted-foreground" />,
          title: 'הגדרות מערכת',
          content: [
            'נהל הגדרות כלליות מ"הגדרות חברות"',
            'הגדר לכל חברה בנפרד: חובת הצמדת נהג, מכסת רכבים פטורים',
            'שלוט בנראות כפתורי התפריט (Navigation) לכל חברה',
            'הגדר חובת העלאת מסמכי ביטוח והדר תביעות',
            'נהל תבניות מייל אוטומטיות מ"תבניות מייל"',
            'הגדר הרשאות ותפקידים מ"הרשאות"',
          ],
        },
        {
          icon: <ShieldAlert className="h-5 w-5 text-destructive" />,
          title: 'הגדרות אישורים',
          content: [
            'הגדר אילו פעולות דורשות אישור מנהל',
            'צפה בבקשות אישור ממתינות',
            'אשר או דחה בקשות עם הערות',
          ],
        },
        {
          icon: <BarChart3 className="h-5 w-5 text-success" />,
          title: 'דוחות ונתונים',
          content: [
            'צפה בדוחות מקיפים על כל הפעילות',
            'סוגי דוחות: כספיים, רכבים, טיפולים, נהגים, הפסד/רווח',
            'נתח ביצועים לפי חברה, נהג או רכב',
            'ייצא נתונים ל-CSV בלחיצת כפתור',
          ],
        },
        {
          icon: <History className="h-5 w-5 text-muted-foreground" />,
          title: 'לוג מערכת',
          content: [
            'צפה ביומן פעולות המערכת מ"לוג מערכת"',
            'סנן לפי סוג פעולה, משתמש או תאריך',
            'כל שינוי סטטוס, יצירה ומחיקה מתועדים אוטומטית',
          ],
        },
      ],
    },
    {
      label: 'ניהול רכבים וביטוחים',
      sections: [
        {
          icon: <Truck className="h-5 w-5 text-primary" />,
          title: 'פתיחת רכב חדש',
          content: [
            'לך ל"רכבים" → לחץ "רכב חדש"',
            'בחר סוג ניהול: ליסינג תפעולי / ליסינג מימוני / תחזוקה עצמאית',
            'ליסינג תפעולי: מועד סיום, עלות חודשית, מועד החזרה',
            'ליסינג מימוני: החזר חודשי, תאריך סיום הלוואה, מועד החלפה',
            'תחזוקה עצמאית: אפשרות לציין הלוואה, החזר חודשי, מועד החלפה',
            'כל השדות אופציונליים – ניתן להשלים מאוחר יותר',
          ],
        },
        {
          icon: <Shield className="h-5 w-5 text-info" />,
          title: 'ביטוחים והדר תביעות',
          content: [
            'בליסינג מימוני ותחזוקה עצמאית – נפתח אזור ביטוחים',
            'טבלת ביטוחים לפי שנים: חברת ביטוח, עלות חובה, עלות מקיף',
            'סימון הדר תביעות לכל שנה',
            'הוספת שנים חדשות בלחיצה על "הוסף שנה"',
            'התראות אוטומטיות על: טסט, ביטוח חובה, ביטוח מקיף',
          ],
        },
        {
          icon: <Upload className="h-5 w-5 text-success" />,
          title: 'יבוא רכבים',
          content: [
            'ייבא רכבים מקובץ CSV דרך "יבוא רכבים" בתפריט',
            'הורד תבנית CSV לדוגמה והשלם את הנתונים',
            'המערכת מזהה כפילויות לפי מספר לוחית',
            'ניתן לייבא עשרות רכבים בפעולה אחת',
          ],
        },
        {
          icon: <Search className="h-5 w-5 text-primary" />,
          title: 'בדיקת רכב ממשלתי',
          content: [
            'בדוק פרטי רכב מול מאגר משרד התחבורה',
            'הזן מספר רכב וקבל: יצרן, דגם, שנה, בעלות, דלק, צבע, תוקף רישוי',
            'הנתונים נשמרים במטמון ל-24 שעות',
            'גישה דרך "בדיקת רכב ממשלתי" בתפריט ניהול צי',
          ],
        },
        {
          icon: <CheckSquare className="h-5 w-5 text-warning" />,
          title: 'ביקורות רכב ומשימות טיפול',
          content: [
            'ביקורת תקופתית: Checklist של 14 סעיפים',
            'בדיקה תלת/חצי שנתית: 19 סעיפים (לרכב פרטי)',
            'ליקויים שנמצאו נפתחים אוטומטית כמשימות ב"מרכז ליקויים"',
            '3 סטטוסים: פתוח 🔴, בטיפול 🟡, טופל 🟢',
            'ניתן לסנן ולחפש ליקויים לפי רכב',
          ],
        },
        {
          icon: <HeartPulse className="h-5 w-5 text-destructive" />,
          title: 'הצהרות בריאות',
          content: [
            'צפה בהצהרות בריאות שמילאו הנהגים',
            'ההצהרה כוללת: שם, ת.ז, רישיון, חתימה דיגיטלית',
            'צרף צילום רישיון נהיגה',
            'גישה דרך "הצהרת בריאות" בתפריט',
          ],
        },
      ],
    },
    {
      label: 'לקוחות, הסכמים ומסלולים',
      sections: [
        {
          icon: <Building2 className="h-5 w-5 text-primary" />,
          title: 'ניהול לקוחות',
          content: [
            'צור לקוח חדש מתפריט "לקוחות"',
            'מלא פרטי לקוח: שם, טלפון, מייל, כתובת, ח.פ',
            'בחר סוג לקוח: עסקי או פרטי',
            'ניתן לנהל מסמכי לקוח מדף "מסמכי לקוח"',
          ],
        },
        {
          icon: <FileText className="h-5 w-5 text-success" />,
          title: 'הסכמים',
          content: [
            'בתוך דף עריכת/הקמת לקוח – לחץ "+ הוסף הסכם"',
            'כל הסכם כולל: מספר סידורי, פירוט, סכום לפני ואחרי מע"מ',
            'ניתן להוסיף מספר בלתי מוגבל של הסכמים לכל לקוח',
            'מחק הסכם בלחיצה על X, הדפס הסכם בודד בלחיצה על אייקון ההדפסה',
          ],
        },
        {
          icon: <Briefcase className="h-5 w-5 text-warning" />,
          title: 'עסקאות וסיכומי עבודה',
          content: [
            'צור עסקאות מדף הלקוח – כפתור "עסקאות"',
            'כל עסקה מקבלת מספור אוטומטי ייחודי (DL-00001)',
            'סטטוסים: בביצוע, הושלם, מבוטל',
            'הגדר סכום, תאריך יעד וסוג עבודה',
            'סנן עסקאות בדוחות הכנסות',
          ],
        },
        {
          icon: <MapPin className="h-5 w-5 text-info" />,
          title: 'ניהול מסלולים',
          content: [
            'צור מסלולים עם מספר מסלול, מוצא ויעד',
            'הגדר תמחור דינמי שונה לכל סוג רכב (פרטי, מסחרי, מונית, מיניבוס, אוטובוס, אחר)',
            'קבע טווח תאריכי תוקף למסלול',
            'שייך לקוח, נהג ורכב לכל מסלול',
            'הוסף תחנות ביניים וימי פעילות',
            'לאחר תאריך ביצוע – לא ניתן לשנות/למחוק',
          ],
        },
        {
          icon: <UserPlus className="h-5 w-5 text-primary" />,
          title: 'יצירת לקוח פרטי',
          content: [
            'לך ל"ניהול משתמשים" ולחץ "משתמש חדש"',
            'בחר תפקיד "לקוח פרטי"',
            'לקוח פרטי לא חייב להיות משויך לחברה',
            'ניתן ליצור לקוח עם טלפון בלבד (ללא אימייל)',
          ],
        },
        {
          icon: <UserCheck className="h-5 w-5 text-success" />,
          title: 'שיוך רכב ללקוח פרטי',
          content: [
            'לך לדף "הצמדת רכב" (בתפריט)',
            'בחר רכב מהרשימה',
            'בחר את הלקוח מרשימת "בחר משתמש" (לא מרשימת הנהגים!)',
            'לחץ "שמור הצמדה"',
            'הרכב יופיע בדשבורד של הלקוח הפרטי',
          ],
        },
        {
          icon: <Car className="h-5 w-5 text-info" />,
          title: 'מה הלקוח הפרטי רואה?',
          content: [
            'דשבורד עם פרטי הרכב המשויך',
            'דיווח תקלות ותאונות',
            'הזמנת טיפולים ושירותים',
            'שינוע רכב, חידוש ביטוח והשוואת מחירים',
            'היסטוריית טיפולים ומבצעים',
          ],
        },
      ],
    },
    {
      label: 'הצמדת נהגים ורכבים',
      sections: [
        {
          icon: <UserCheck className="h-5 w-5 text-primary" />,
          title: 'הצמדת רכב לנהג',
          content: [
            'לך לדף "הצמדת רכב"',
            'בחר רכב → בחר נהג מרשימת הנהגים',
            'לחץ "שמור הצמדה"',
            'ניתן לשנות או להסיר הצמדה מהרשימה בתחתית הדף',
          ],
        },
        {
          icon: <Building2 className="h-5 w-5 text-warning" />,
          title: 'הגדרת חובת הצמדה לחברה',
          content: [
            'לך ל"הגדרות חברות"',
            'בחר את החברה הרלוונטית מהבורר',
            'סמן "חובה להצמיד נהג/משתמש לרכב" → כל רכב חדש יחייב הצמדה',
            'בטל סימון → ניתן להוסיף רכבים ללא הצמדה, עד למכסה שנקבעה',
            'מכסה 0 = ללא הגבלה (כל הרכבים פטורים)',
          ],
        },
        {
          icon: <Users className="h-5 w-5 text-success" />,
          title: 'ניהול מלווים',
          content: [
            'הוסף מלווים מתפריט "מלווים"',
            'שייך מלווים לרכבים',
            'ניתן לבקש מלווה בשיבוץ עבודה',
          ],
        },
      ],
    },
    {
      label: 'תפעול ושירות',
      sections: [
        {
          icon: <Wrench className="h-5 w-5 text-primary" />,
          title: 'הזמנות שירות',
          content: [
            'צור הזמנת שירות חדשה מ"הוראות שירות"',
            'מלא פרטי רכב, נהג, ספק וסוג טיפול',
            'הזמנות דחופות מקבלות התראה אוטומטית למנהלים',
            'עקוב אחרי סטטוס הטיפול עד לסגירה',
            'צפה בהיסטוריית הזמנות שירות',
          ],
        },
        {
          icon: <Scale className="h-5 w-5 text-info" />,
          title: 'ניהול ספקים',
          content: [
            'הוסף ספקים קבועים או חד-פעמיים מ"ספקים"',
            'כל ספק מקבל מספר ספק אוטומטי',
            'צור הזמנות עבודה לספקים וקבל אישור',
            'שלח הזמנות עבודה במייל ישירות מהמערכת',
          ],
        },
        {
          icon: <CalendarDays className="h-5 w-5 text-success" />,
          title: 'סידור עבודה',
          content: [
            'צור שיבוצים לנהגים מ"סידור עבודה"',
            'שייך נהג, רכב, מסלול ולקוח לכל שיבוץ',
            'נהל אישורים: אישור מנהל ואישור נהג',
            'סטטוסים: ממתין, מאושר מנהל, מאושר נהג, בביצוע, הושלם, נדחה',
            'צ\'אט פנימי בכל שיבוץ לתקשורת עם נהג',
            'יומן שינויי סטטוס מלא',
          ],
        },
        {
          icon: <RefreshCw className="h-5 w-5 text-warning" />,
          title: 'שינועים ומסירות',
          content: [
            'צור טופס מסירה/קבלה מ"שינועים"',
            'תעד מצב הרכב עם Checklist ותמונות',
            'הנהג המקבל מאשר דיגיטלית',
            'הגדר נהג זמני (חד-פעמי) לשינוע',
          ],
        },
        {
          icon: <Phone className="h-5 w-5 text-destructive" />,
          title: 'מספרי חירום',
          content: [
            'הגדר מספרי חירום לכל חברה מ"מספרי חירום"',
            'צור קטגוריות חירום עם אייקונים וכפתורי חיוג/WhatsApp',
            'הגדר הודעת WhatsApp אוטומטית לכל קטגוריה',
            'צפה ביומן פניות חירום',
          ],
        },
        {
          icon: <Megaphone className="h-5 w-5 text-primary" />,
          title: 'מבצעים',
          content: [
            'צור מבצעים ופרסומים מ"מבצעים"',
            'הגדר תאריכי התחלה וסיום',
            'בחר חברות יעד למבצע',
            'צרף תמונה ותיאור',
          ],
        },
        {
          icon: <MessageCircle className="h-5 w-5 text-info" />,
          title: 'צ\'אט פנימי',
          content: [
            'שלח הודעות ישירות למשתמשים מ"צ\'אט פנימי"',
            'בחר נמען מרשימת המשתמשים',
            'צפה בהיסטוריית הודעות',
          ],
        },
        {
          icon: <BookOpen className="h-5 w-5 text-muted-foreground" />,
          title: 'משימות פיתוח תוכנה',
          content: [
            'נהל משימות פיתוח מ"משימות פיתוח תוכנה"',
            'כל משימה כוללת: מספור אוטומטי, דחיפות, גודל (S/M/L)',
            'S = 1-2 שעות, M = 3-5 שעות, L = יום+',
            'ניתן לערוך משימות קיימות (מסומנות ✏️)',
            'אשר ביצוע משימות כמנהל על',
          ],
        },
        {
          icon: <Receipt className="h-5 w-5 text-warning" />,
          title: 'מנויים וחיוב',
          content: [
            'נהל מנויי חברות מ"מנויים וחיוב"',
            'הגדר תוכנית, מחיר חודשי ואמצעי תשלום',
            'עקוב אחרי תאריכי חיוב ותשלומים',
          ],
        },
      ],
    },
  ];
}

function getPrivateCustomerHelp(): HelpCategory[] {
  return [
    {
      label: 'שירותים',
      sections: [
        {
          icon: <Car className="h-5 w-5 text-primary" />,
          title: 'הרכב שלי',
          content: [
            'פרטי הרכב מופיעים בדשבורד הראשי',
            'אם לא מופיע רכב, פנה למנהל לשיוך הרכב',
            'ניתן לצפות בקריאת מד-אוץ ומצב הרכב',
            'צפה בפרטי ביטוח וטסט',
          ],
        },
        {
          icon: <AlertTriangle className="h-5 w-5 text-destructive" />,
          title: 'דיווח תקלה / תאונה',
          content: [
            'לחץ על "דיווח תקלה / תאונה" בדשבורד',
            'מלא את הפרטים וצרף תמונות',
            'הדיווח יישלח אוטומטית למנהל',
            'עקוב אחרי עדכוני סטטוס',
          ],
        },
        {
          icon: <Wrench className="h-5 w-5 text-info" />,
          title: 'הזמנת טיפול',
          content: [
            'לחץ "הזמנת טיפול" בדשבורד',
            'בחר סוג שירות: טיפול שוטף, חידוש ביטוח, שינוע לטסט ועוד',
            'ניתן לבקש השוואת מחירים לביטוח',
            'עקוב אחרי סטטוס הטיפול בפעילות אחרונה',
          ],
        },
        {
          icon: <CheckSquare className="h-5 w-5 text-success" />,
          title: 'בדיקת רכב תלת/חצי שנתית',
          content: [
            'בצע בדיקה תקופתית לרכב שלך',
            'עבור על סעיפי הבדיקה וסמן תקין/לא תקין',
            'ליקויים שנמצאו ידווחו אוטומטית למנהל',
          ],
        },
      ],
    },
    {
      label: 'חירום ומידע',
      sections: [
        {
          icon: <Phone className="h-5 w-5 text-destructive" />,
          title: 'מצב חירום',
          content: [
            'משטרה: 100',
            'מד"א: 101',
            'כיבוי אש: 102',
            'פנה למנהל דרך כפתור חירום בדשבורד',
          ],
        },
        {
          icon: <FileText className="h-5 w-5 text-muted-foreground" />,
          title: 'היסטוריה ומסמכים',
          content: [
            'צפה בהיסטוריית טיפולים ואירועים',
            'העלה חשבוניות דלק והוצאות',
            'צפה במבצעים והטבות ייחודיות',
          ],
        },
      ],
    },
  ];
}

export default function HelpButton() {
  const [open, setOpen] = useState(false);
  const [showPulse, setShowPulse] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const key = `help_seen_${user?.id || 'guest'}`;
    if (!localStorage.getItem(key)) {
      setShowPulse(true);
    }
  }, [user?.id]);

  const handleOpen = () => {
    setOpen(true);
    if (showPulse) {
      setShowPulse(false);
      const key = `help_seen_${user?.id || 'guest'}`;
      localStorage.setItem(key, 'true');
    }
  };

  const role = user?.role || 'driver';

  let categories: HelpCategory[];
  let roleLabel: string;

  switch (role) {
    case 'super_admin':
      categories = getSuperAdminHelp();
      roleLabel = 'מנהל על';
      break;
    case 'fleet_manager':
      categories = getFleetManagerHelp();
      roleLabel = 'מנהל צי';
      break;
    case 'private_customer':
      categories = getPrivateCustomerHelp();
      roleLabel = 'לקוח פרטי';
      break;
    default:
      categories = getDriverHelp();
      roleLabel = 'נהג';
  }

  return (
    <>
      {!dismissed && (
        <div className="fixed bottom-28 right-4 md:bottom-6 md:right-6 z-50">
          <button
            onClick={handleOpen}
            className={`relative h-10 w-10 rounded-full bg-primary text-primary-foreground shadow-lg ring-2 ring-primary/20 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform ${showPulse ? 'animate-[help-bounce_1.5s_ease-in-out_infinite]' : ''}`}
            aria-label="עזרה"
          >
            <HelpCircle className="h-5 w-5" />
            {showPulse && (
              <span className="absolute inset-0 rounded-full bg-primary/40 animate-ping" />
            )}
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-muted border-2 border-background text-muted-foreground shadow-md flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors"
            aria-label="הסתר עזרה"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[95vw] max-w-2xl h-[90vh] max-h-[90vh] p-0 overflow-visible [&>button:last-child]:hidden flex flex-col">
          {/* Close X circle */}
          <button
            onClick={() => setOpen(false)}
            className="absolute -top-3 -right-3 z-10 h-9 w-9 rounded-full bg-destructive text-destructive-foreground shadow-lg border-2 border-background flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
            aria-label="סגור"
          >
            <X className="h-4 w-4" />
          </button>
          <DialogHeader className="p-6 pb-2 bg-primary text-primary-foreground rounded-t-lg shrink-0">
            <DialogTitle className="text-xl text-primary-foreground">מרכז עזרה</DialogTitle>
            <DialogDescription className="text-primary-foreground/80">
              הדרכה עבור: <span className="font-bold text-primary-foreground">{roleLabel}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden rounded-b-lg min-h-0">
          <ScrollArea className="h-full p-4" dir="rtl">
            <div className="space-y-6">
              {categories.map((category, catIdx) => (
                <div key={catIdx}>
                  <h3 className="text-sm font-black text-primary mb-2 px-1">{category.label}</h3>
                  <Accordion type="multiple" className="space-y-2">
                    {category.sections.map((section, idx) => (
                      <AccordionItem key={idx} value={`cat-${catIdx}-section-${idx}`} className="border rounded-xl px-4 bg-card">
                        <AccordionTrigger className="hover:no-underline gap-3">
                          <div className="flex items-center gap-3">
                            {section.icon}
                            <span className="font-semibold text-sm">{section.title}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul className="space-y-2 pr-8">
                            {section.content.map((item, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
            </div>
          </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
