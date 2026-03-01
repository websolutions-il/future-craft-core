import { useState, useEffect } from 'react';
import { HelpCircle, X, Car, AlertTriangle, RefreshCw, FileText, Phone, Shield, Users, BarChart3, Truck, ClipboardList, MapPin, Settings, Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface HelpSection {
  icon: React.ReactNode;
  title: string;
  content: string[];
}

function getDriverHelp(): HelpSection[] {
  return [
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
      title: 'החלפת רכב',
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
      ],
    },
    {
      icon: <Phone className="h-5 w-5 text-destructive" />,
      title: 'מצב חירום',
      content: [
        'משטרה: 100',
        'מד"א: 101',
        'כיבוי אש: 102',
        'עירייה: 106',
        'דווח למנהל הצי מיד לאחר הטיפול הראשוני',
      ],
    },
    {
      icon: <MapPin className="h-5 w-5 text-success" />,
      title: 'מסלולים ונסיעות',
      content: [
        'בדוק את המסלול המתוכנן לפני יציאה',
        'התחל ועצור נסיעה דרך המערכת',
        'דווח על עיכובים או שינויים במסלול',
      ],
    },
  ];
}

function getFleetManagerHelp(): HelpSection[] {
  return [
    {
      icon: <Users className="h-5 w-5 text-primary" />,
      title: 'ניהול נהגים',
      content: [
        'הוסף וערוך פרטי נהגים מתפריט "נהגים"',
        'עקוב אחרי תוקף רישיונות ועדכן בהתאם',
        'שייך נהגים לרכבים ולמסלולים',
        'צפה בהתראות על רישיונות שעומדים לפוג',
      ],
    },
    {
      icon: <Truck className="h-5 w-5 text-info" />,
      title: 'ניהול רכבים',
      content: [
        'נהל את צי הרכבים מתפריט "רכבים"',
        'עקוב אחרי טסטים, ביטוחים ותוקפי רישוי',
        'עדכן קריאות מד-אוץ ומצב הרכב',
        'שייך רכבים לנהגים',
      ],
    },
    {
      icon: <ClipboardList className="h-5 w-5 text-warning" />,
      title: 'הוראות שירות',
      content: [
        'צור הוראות שירות לטיפולים ותיקונים',
        'עקוב אחרי סטטוס הטיפולים',
        'אשר או דחה בקשות מנהגים',
      ],
    },
    {
      icon: <AlertTriangle className="h-5 w-5 text-destructive" />,
      title: 'טיפול בתאונות ותקלות',
      content: [
        'צפה בדיווחי תאונות ותקלות מנהגים',
        'עדכן סטטוס ותיעוד לכל אירוע',
        'נהל מעקב ביטוחי',
        'הפק דוחות לפי תקופה',
      ],
    },
    {
      icon: <BarChart3 className="h-5 w-5 text-success" />,
      title: 'דוחות וניתוח',
      content: [
        'צפה בדוחות הוצאות וניתוחי עלויות',
        'עקוב אחרי ביצועי הצי',
        'הפק דוחות לפי נהג, רכב או תקופה',
      ],
    },
    {
      icon: <Bell className="h-5 w-5 text-primary" />,
      title: 'התראות',
      content: [
        'הגדר התראות אוטומטיות לתוקפי מסמכים',
        'קבל התראות על דיווחים חדשים מנהגים',
        'עקוב אחרי משימות פתוחות',
      ],
    },
  ];
}

function getSuperAdminHelp(): HelpSection[] {
  return [
    {
      icon: <Shield className="h-5 w-5 text-primary" />,
      title: 'סקירה כללית',
      content: [
        'מסך הדשבורד מציג סיכום של כל הפעילות במערכת',
        'ניתן לנווט בין כל המסכים דרך התפריט הצדדי',
        'כמנהל על יש לך גישה מלאה לכל הנתונים',
      ],
    },
    {
      icon: <Users className="h-5 w-5 text-info" />,
      title: 'ניהול משתמשים',
      content: [
        'צור משתמשים חדשים מתפריט "ניהול משתמשים"',
        'הגדר תפקידים: נהג, מנהל צי או מנהל על',
        'שייך משתמשים לחברות',
        'הפעל או השבת משתמשים לפי הצורך',
      ],
    },
    {
      icon: <Settings className="h-5 w-5 text-muted-foreground" />,
      title: 'הגדרות מערכת',
      content: [
        'נהל הגדרות כלליות מתפריט "הגדרות"',
        'צפה בנתונים של כל החברות במערכת',
        'הגדר הרשאות ותפקידים',
      ],
    },
    {
      icon: <BarChart3 className="h-5 w-5 text-success" />,
      title: 'דוחות ונתונים',
      content: [
        'צפה בדוחות מקיפים על כל הפעילות',
        'נתח ביצועים לפי חברה, נהג או רכב',
        'הפק דוחות מותאמים אישית',
      ],
    },
  ];
}

export default function HelpButton() {
  const [open, setOpen] = useState(false);
  const [showPulse, setShowPulse] = useState(false);
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

  let sections: HelpSection[];
  let roleLabel: string;

  switch (role) {
    case 'super_admin':
      sections = getSuperAdminHelp();
      roleLabel = 'מנהל על';
      break;
    case 'fleet_manager':
      sections = getFleetManagerHelp();
      roleLabel = 'מנהל צי';
      break;
    default:
      sections = getDriverHelp();
      roleLabel = 'נהג';
  }

  return (
    <>
      <div className="fixed bottom-28 left-4 md:bottom-6 md:left-6 z-50">
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
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] p-0 overflow-hidden relative">
          {/* Close X circle */}
          <button
            onClick={() => setOpen(false)}
            className="absolute -top-3 -right-3 z-10 h-8 w-8 rounded-full bg-destructive text-destructive-foreground shadow-md flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
            aria-label="סגור"
          >
            <X className="h-4 w-4" />
          </button>
          <DialogHeader className="p-6 pb-2 bg-primary text-primary-foreground rounded-t-lg">
            <DialogTitle className="text-xl text-primary-foreground">מרכז עזרה</DialogTitle>
            <DialogDescription className="text-primary-foreground/80">
              הדרכה עבור: <span className="font-bold text-primary-foreground">{roleLabel}</span>
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[65vh] p-4">
            <Accordion type="multiple" className="space-y-2">
              {sections.map((section, idx) => (
                <AccordionItem key={idx} value={`section-${idx}`} className="border rounded-xl px-4 bg-card">
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
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
