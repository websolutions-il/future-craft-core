import { useState, useEffect } from 'react';
import { HelpCircle, X, Car, AlertTriangle, RefreshCw, FileText, Phone, Shield, Users, BarChart3, Truck, ClipboardList, MapPin, Settings, Bell, UserCheck, Building2, UserPlus, Wrench, Scale } from 'lucide-react';
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
      ],
    },
    {
      label: 'חירום ומסלולים',
      sections: [
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
            'ייצא נתונים ל-CSV',
          ],
        },
        {
          icon: <Bell className="h-5 w-5 text-primary" />,
          title: 'התראות',
          content: [
            'המערכת מייצרת התראות אוטומטיות על: טסט, ביטוח חובה, ביטוח מקיף',
            'הגדר התראות מותאמות אישית',
            'קבל התראות על דיווחים חדשים מנהגים',
            'עקוב אחרי משימות פתוחות',
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
            'ניתן לסנן נתונים לפי חברה מהתפריט העליון',
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
          ],
        },
        {
          icon: <Settings className="h-5 w-5 text-muted-foreground" />,
          title: 'הגדרות מערכת',
          content: [
            'נהל הגדרות כלליות מתפריט "הגדרות"',
            'צפה בנתונים של כל החברות במערכת',
            'הגדר הרשאות ותפקידים',
            'נהל תבניות מייל אוטומטיות מ"תבניות מייל"',
          ],
        },
        {
          icon: <BarChart3 className="h-5 w-5 text-success" />,
          title: 'דוחות ונתונים',
          content: [
            'צפה בדוחות מקיפים על כל הפעילות',
            'נתח ביצועים לפי חברה, נהג או רכב',
            'הפק דוחות מותאמים אישית',
            'ייצא נתונים ל-CSV בלחיצת כפתור',
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
      ],
    },
    {
      label: 'לקוחות והסכמים',
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
            'לך ל"הגדרות חברות" (Alert Settings)',
            'מצא את החברה הרלוונטית',
            'סמן "חובה להצמיד נהג/משתמש לרכב" → כל רכב חדש יחייב הצמדה',
            'בטל סימון → ניתן להוסיף רכבים ללא הצמדה, עד למכסה שנקבעה',
            'מכסה 0 = ללא הגבלה (כל הרכבים פטורים)',
          ],
        },
      ],
    },
    {
      label: 'הזמנות שירות וספקים',
      sections: [
        {
          icon: <Wrench className="h-5 w-5 text-primary" />,
          title: 'הזמנות שירות',
          content: [
            'צור הזמנת שירות חדשה מ"הוראות שירות"',
            'מלא פרטי רכב, נהג, ספק וסוג טיפול',
            'הזמנות דחופות מקבלות התראה אוטומטית למנהלים',
            'עקוב אחרי סטטוס הטיפול עד לסגירה',
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
          ],
        },
        {
          icon: <AlertTriangle className="h-5 w-5 text-destructive" />,
          title: 'דיווח תקלה / תאונה',
          content: [
            'לחץ על "דיווח תקלה / תאונה" בדשבורד',
            'מלא את הפרטים וצרף תמונות',
            'הדיווח יישלח אוטומטית למנהל',
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
