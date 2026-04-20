// Question bank for driver competency exam

export interface ExamQuestion {
  id: number;
  category: string;
  question: string;
  answers: string[];
  correct: number;
  explanation: string;
}

export interface FrozenQuestion extends ExamQuestion {}

// Exam type definitions
export const EXAM_TYPES = [
  { value: 'general', label: 'כללי' },
  { value: 'theory', label: 'תיאוריה' },
  { value: 'safety', label: 'בטיחות' },
  { value: 'periodic', label: 'תקופתי' },
] as const;

export type ExamType = typeof EXAM_TYPES[number]['value'];

export const QUESTION_BANK: ExamQuestion[] = [
  { id: 1, category: "תנאי דרך ומזג אוויר", question: "אתה נוסע בגשם חזק והראות מוגבלת. מה הפעולה הנכונה ביותר?", answers: ["להמשיך באותה מהירות", "להאט, להדליק אורות ולשמור מרחק", "לעצור בנתיב הנסיעה", "להדליק אורות גבוהים ולנסוע רגיל"], correct: 1, explanation: "בתנאי ראות לקויים ובכביש חלק יש להאט, להדליק אורות מתאימים ולשמור מרחק." },
  { id: 2, category: "תנאי דרך ומזג אוויר", question: "בעת נהיגה בערפל כבד, מה נכון לעשות?", answers: ["להאיץ כדי לצאת מהערפל מהר", "להאט ולהדליק אורות מתאימים", "לנסוע צמוד לרכב מלפנים", "להפעיל אורות גבוהים"], correct: 1, explanation: "בערפל יש להאט ולהשתמש באורות מתאימים. אורות גבוהים עלולים להחמיר את הראות." },
  { id: 3, category: "תנאי דרך ומזג אוויר", question: "למה הגשם הראשון נחשב מסוכן במיוחד?", answers: ["כי הכביש תמיד נהיה מחוספס יותר", "כי נוצרת שכבה חלקה של מים, שמן ולכלוך", "כי הבלמים עובדים חזק יותר", "כי הצמיגים מתנפחים"], correct: 1, explanation: "בגשם הראשון מצטברים שמן ולכלוך על פני הכביש והאחיזה יורדת." },
  { id: 4, category: "תנאי דרך ומזג אוויר", question: "השמש מסנוורת אותך בזמן נהיגה. מה נכון לעשות?", answers: ["להמשיך רגיל", "להאט, לשמור ריכוז ולוודא שהשמשה נקייה", "להביט הצידה מהכביש", "להאיץ כדי לצאת מהאזור"], correct: 1, explanation: "במצב של סינוור יש להאט ולשמור את העיניים על הכביש." },
  { id: 5, category: "תנאי דרך ומזג אוויר", question: "מה נכון לגבי נהיגה בלילה?", answers: ["אפשר לשמור פחות מרחק", "יש להגביר ערנות ולהתאים מהירות לראות", "אין הבדל מיום", "עדיף לנסוע עם אורות גבוהים תמיד"], correct: 1, explanation: "בלילה הראות מצומצמת ולכן יש להתאים מהירות ולהגביר ערנות." },
  { id: 6, category: "תנאי דרך ומזג אוויר", question: "כשכביש מוצף או מכוסה מים, מה נכון לעשות?", answers: ["להיכנס מהר כדי לעבור", "להאט מאוד או להימנע ממעבר אם יש סכנה", "לעצור באמצע המים", "לבלום חזק בתוך השלולית"], correct: 1, explanation: "כביש מוצף עלול לגרום להחלקה או לאיבוד שליטה ויש לנהוג בזהירות רבה." },
  { id: 7, category: "בטיחות ושליטה ברכב", question: "מה המרחק הבטוח שיש לשמור מהרכב מלפנים בתנאים רגילים?", answers: ["פחות משנייה", "לפחות 2 שניות", "רק 1 מטר", "רק בעיר"], correct: 1, explanation: "כלל שתי השניות הוא כלל בטיחות בסיסי." },
  { id: 8, category: "בטיחות ושליטה ברכב", question: "בזמן בלימת חירום ברכב עם ABS, מה נכון לעשות?", answers: ["ללחוץ חזק על הבלם ולהמשיך לשלוט בהגה", "לשחרר וללחוץ שוב ושוב", "למשוך בלם יד", "לכבות מנוע"], correct: 0, explanation: "במערכת ABS יש ללחוץ חזק ורציף על הבלם ולשלוט בהגה." },
  { id: 9, category: "בטיחות ושליטה ברכב", question: "הרכב מתחיל להחליק על כביש רטוב. מה נכון לעשות?", answers: ["לסובב בחדות את ההגה", "ללחוץ חזק מאוד על הבלם", "להגיב בעדינות, לייצב את ההגה ולהימנע מפעולות חדות", "להאיץ"], correct: 2, explanation: "במצב החלקה יש להימנע מפעולות חדות ולייצב את הרכב בעדינות." },
  { id: 10, category: "בטיחות ושליטה ברכב", question: "בירידה ארוכה ותלולה, מה נכון לעשות?", answers: ["לנסוע בניוטרל", "להשתמש בהילוך מתאים ולשלוט במהירות", "לכבות מנוע", "ללחוץ כל הזמן חזק על הבלם בלבד"], correct: 1, explanation: "בירידה יש להשתמש בהילוך מתאים ולא להסתמך רק על בלמים." },
  { id: 11, category: "בטיחות ושליטה ברכב", question: "לפני עקיפה, מה חובה לוודא?", answers: ["שהרדיו כבוי", "שהדרך פנויה והעקיפה בטוחה ומותרת", "שרק הרכב מאחור רחוק", "שאין הולכי רגל על המדרכה"], correct: 1, explanation: "עקיפה מותרת רק כאשר הדרך פנויה והפעולה בטוחה וחוקית." },
  { id: 12, category: "בטיחות ושליטה ברכב", question: "כשהכביש חלק, איך נכון לבצע פניות?", answers: ["במהירות גבוהה", "בעדינות ובמהירות מותאמת", "עם בלימה חזקה בתוך הפנייה", "עם סיבוב חד של ההגה"], correct: 1, explanation: "פנייה על כביש חלק צריכה להיות עדינה ובמהירות נמוכה יותר." },
  { id: 13, category: "מצבי חירום", question: "הרכב נתקע בשול הדרך. מה הפעולה הראשונה?", answers: ["לצאת מיד לכביש לבדוק מה קרה", "להדליק אורות מצוקה ולעמוד במקום בטוח", "להשאיר את הרכב וללכת", "להמשיך לנסוע עם התקלה"], correct: 1, explanation: "במקרה תקלה יש להתריע, להגן על עצמך ולעמוד במקום בטוח." },
  { id: 14, category: "מצבי חירום", question: "בעת עצירה בגלל תקלה בשול, מה נכון לעשות בנוסף?", answers: ["ללבוש אפוד זוהר ולהציב משולש אזהרה במקום בטוח", "לעמוד ליד הרכב על הכביש", "לכבות אורות חירום כדי לחסוך מצבר", "להשאיר את הרכב פתוח וללכת"], correct: 0, explanation: "יש להשתמש באמצעי אזהרה כדי לצמצם סכנה לרכב תקוע." },
  { id: 15, category: "מצבי חירום", question: "לאחר תאונה קלה ללא נפגעים, מה נכון לעשות קודם?", answers: ["לעזוב את המקום", "לצלם, להחליף פרטים ולדווח לפי הנהלים", "להתווכח עם הנהג השני", "לחכות ולראות אם מישהו מתקשר"], correct: 1, explanation: "יש לתעד, להחליף פרטים ולדווח לפי הנהלים." },
  { id: 16, category: "מצבי חירום", question: "מתי נכון להשתמש במשולש אזהרה?", answers: ["רק בטסט", "במקרה תקלה או עצירה מסוכנת", "רק בלילה", "רק בכביש עירוני"], correct: 1, explanation: "משולש אזהרה מיועד להתריע למשתמשי הדרך בעת תקלה או עצירה מסוכנת." },
  { id: 17, category: "מצבי חירום", question: "אתה מזהה עשן מהמנוע בזמן נסיעה. מה נכון לעשות?", answers: ["להמשיך עוד קצת", "לעצור במקום בטוח ולהפסיק נסיעה", "להאיץ כדי להגיע מהר", "לפתוח מכסה מנוע תוך כדי נסיעה"], correct: 1, explanation: "עשן מהמנוע מצביע על תקלה שעלולה להיות מסוכנת מאוד." },
  { id: 18, category: "מצבי חירום", question: "הולך רגל מתקרב למעבר חציה. מה על הנהג לעשות?", answers: ["להאיץ ולעבור לפניו", "להאט ולהיות מוכן לעצירה מלאה", "לצפור ולהמשיך", "לעקוף רכב אחר לפני המעבר"], correct: 1, explanation: "יש להתקרב למעבר חציה בזהירות ולהיות מוכנים לעצירה מלאה." },
  { id: 19, category: "התנהגות נהג ותשומת לב", question: "מה נכון לגבי שימוש בטלפון בזמן נהיגה?", answers: ["מותר אם זה רק לשנייה", "מותר כל עוד עומדים ברמזור", "אסור, אלא אם השימוש נעשה באופן חוקי וללא אחיזה וללא פגיעה בריכוז", "מותר אם הנהג מנוסה"], correct: 2, explanation: "היסח דעת בזמן נהיגה מסכן חיים." },
  { id: 20, category: "התנהגות נהג ותשומת לב", question: "נהג מרגיש עייפות בזמן נסיעה ארוכה. מה הפעולה הנכונה?", answers: ["לפתוח חלון ולהמשיך", "להגביר מוזיקה ולהמשיך", "לעצור במקום בטוח ולהתרענן", "לנסוע מהר יותר כדי להגיע מהר"], correct: 2, explanation: "עייפות פוגעת בזמן התגובה ובריכוז." },
  { id: 21, category: "התנהגות נהג ותשומת לב", question: "מה נחשב היסח דעת מסוכן בזמן נהיגה?", answers: ["שליחת הודעה בטלפון", "כיוון ארוך של מערכת מולטימדיה", "חיפוש חפץ ברכב תוך כדי נהיגה", "כל התשובות נכונות"], correct: 3, explanation: "כל פעולה שמסיטה את תשומת הלב מהדרך היא היסח דעת." },
  { id: 22, category: "התנהגות נהג ותשומת לב", question: "נהג עצבני לאחר ויכוח טלפוני צריך:", answers: ["להמשיך כרגיל", "לנהוג מהר כדי להירגע", "לעצור ולהמשיך רק לאחר שחזר לריכוז", "להתעלם מהמצב"], correct: 2, explanation: "מצב רגשי לא יציב עלול לפגוע בשיקול הדעת של הנהג." },
  { id: 23, category: "התנהגות נהג ותשומת לב", question: "מה נכון לגבי אכילה בזמן נהיגה?", answers: ["אין בכך בעיה", "זה עלול להסיח את הדעת מהכביש", "מותר רק בעיר", "זה מסוכן רק לנהג חדש"], correct: 1, explanation: "אכילה או שתייה בזמן נהיגה עלולות להסיח את הדעת." },
  { id: 24, category: "התנהגות נהג ותשומת לב", question: "כאשר נוסעים עם ילדים או נוסעים שמדברים הרבה, הנהג צריך:", answers: ["להתעסק איתם תוך כדי נסיעה", "להישאר מרוכז בדרך ולא לאבד קשב", "להסתובב אליהם בזמן נהיגה", "להניח שהכול בסדר"], correct: 1, explanation: "הנהג חייב להישאר מרוכז בדרך בכל זמן הנהיגה." },
  { id: 25, category: "תחזוקת רכב ואחריות נהג", question: "איזו בדיקה בסיסית נכון לבצע לפני נסיעה?", answers: ["רק לבדוק דלק", "לבדוק צמיגים, אורות, נזילות וסימני אזהרה", "רק מזגן", "אין צורך לבדוק דבר"], correct: 1, explanation: "בדיקה בסיסית לפני נסיעה משפרת בטיחות ומפחיתה תקלות." },
  { id: 26, category: "תחזוקת רכב ואחריות נהג", question: "כמה פעמים מומלץ לבדוק לחץ אוויר בצמיגים?", answers: ["אחת לשבועיים או לפי הנחיות היצרן", "רק לפני טסט", "פעם בשנה", "רק אם יש פנצ׳ר"], correct: 0, explanation: "לחץ אוויר יש לבדוק באופן קבוע." },
  { id: 27, category: "תחזוקת רכב ואחריות נהג", question: "נדלקה נורת אזהרה אדומה בלוח השעונים. מה נכון לעשות?", answers: ["להתעלם ולהמשיך", "לעצור בהקדם במקום בטוח ולבדוק לפי נהלים", "לצלם ולהמשיך לנסוע", "להגביר מהירות עד ההגעה"], correct: 1, explanation: "נורה אדומה עשויה להעיד על תקלה בטיחותית משמעותית." },
  { id: 28, category: "תחזוקת רכב ואחריות נהג", question: "מה עלול לקרות אם לחץ האוויר בצמיגים אינו תקין?", answers: ["אין לכך השפעה", "פגיעה ביציבות ושחיקה לא תקינה", "רק המזגן יעבוד פחות טוב", "רק צריכת הדלק תשתפר"], correct: 1, explanation: "לחץ אוויר לא תקין משפיע על בטיחות, אחיזה ושחיקה." },
  { id: 29, category: "תחזוקת רכב ואחריות נהג", question: "נהג שומע רעש חריג מהבלמים. מה עליו לעשות?", answers: ["להגביר מוזיקה", "להמשיך עד הטיפול הבא", "לדווח ולבדוק את הרכב בהקדם", "לחכות שזה ייעלם לבד"], correct: 2, explanation: "רעש חריג בבלמים עלול להעיד על בעיית בטיחות." },
  { id: 30, category: "תחזוקת רכב ואחריות נהג", question: "מה נכון לגבי נסיעה עם נורת שמן דולקת?", answers: ["אפשר להמשיך עוד יום", "יש לעצור בהקדם ולבדוק", "זה לא קשור למנוע", "צריך רק למלא דלק"], correct: 1, explanation: "נורת שמן עלולה להצביע על סכנה למנוע ויש לטפל מיד." },
  { id: 31, category: "נהלי חברה ודיווח", question: "נהג זיהה נזק חדש ברכב בתחילת יום העבודה. מה נכון לעשות?", answers: ["להתעלם", "לדווח מיד לפי נוהל החברה", "לחכות לסוף החודש", "רק לצלם לעצמו"], correct: 1, explanation: "דיווח מיידי מונע מחלוקות ושומר על בקרה תקינה." },
  { id: 32, category: "נהלי חברה ודיווח", question: "לאחר קבלת דוח תנועה, הנהג צריך:", answers: ["להסתיר את זה", "לדווח לפי הנהלים הפנימיים של החברה", "להמתין עד שיפנו אליו", "לא לומר כלום"], correct: 1, explanation: "בחברה מסודרת יש נוהל דיווח גם לעבירות וגם לאירועים חריגים." },
  { id: 33, category: "נהלי חברה ודיווח", question: "אם נהג מרגיש שהרכב אינו בטיחותי לנסיעה, עליו:", answers: ["לצאת לדרך בכל מקרה", "לדווח ולהימנע משימוש עד בדיקה", "לשאול חבר", "להמשיך עד שיהיה זמן"], correct: 1, explanation: "אין להשתמש ברכב לא בטיחותי לפני בדיקה ואישור." },
  { id: 34, category: "נהלי חברה ודיווח", question: "מה נכון לגבי תיעוד טיפולים ותקלות ברכב חברה?", answers: ["לא צריך תיעוד", "יש לשמור דיווח מסודר במערכת או לפי נוהל", "מספיק לזכור בעל פה", "רק המוסך צריך לדעת"], correct: 1, explanation: "תיעוד מסודר חשוב למעקב, בטיחות ואחריות." },
  { id: 35, category: "נהלי חברה ודיווח", question: "נהג קיבל רכב ומצא שחסר מסמך חשוב. מה נכון לעשות?", answers: ["להמשיך לנהוג רגיל", "לדווח מיד לגורם האחראי", "לחכות לשוטר שיעצור", "לשים מסמך אחר במקום"], correct: 1, explanation: "חוסר במסמכים או ציוד חובה צריך להיות מדווח מיד." },
  { id: 36, category: "נהלי חברה ודיווח", question: "מה המטרה של נוהל דיווח מסודר לנהגים?", answers: ["לסבך את הנהג", "לשמור על בטיחות, בקרה ואחריות", "להוסיף ניירת", "רק לביקורת חיצונית"], correct: 1, explanation: "נוהל דיווח עוזר לשליטה, תיעוד ובטיחות בצי הרכב." },
];

export const CATEGORY_CONFIG: Record<string, number> = {
  "תנאי דרך ומזג אוויר": 3,
  "בטיחות ושליטה ברכב": 3,
  "מצבי חירום": 3,
  "התנהגות נהג ותשומת לב": 3,
  "תחזוקת רכב ואחריות נהג": 4,
  "נהלי חברה ודיווח": 4,
};

// Category filter configs per exam type
export const EXAM_TYPE_CATEGORIES: Record<ExamType, string[] | null> = {
  general: null, // all categories
  theory: ["תנאי דרך ומזג אוויר", "בטיחות ושליטה ברכב"],
  safety: ["בטיחות ושליטה ברכב", "מצבי חירום", "תחזוקת רכב ואחריות נהג"],
  periodic: null, // all categories
};

export const PASSING_SCORE = 70;

function shuffle<T>(arr: T[]): T[] {
  const c = [...arr];
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]];
  }
  return c;
}

export function generateExam(examType: ExamType = 'general'): ExamQuestion[] {
  const allowedCategories = EXAM_TYPE_CATEGORIES[examType];
  const selected: ExamQuestion[] = [];
  Object.entries(CATEGORY_CONFIG).forEach(([cat, count]) => {
    if (allowedCategories && !allowedCategories.includes(cat)) return;
    const pool = QUESTION_BANK.filter((q) => q.category === cat);
    const picked = shuffle(pool).slice(0, count);
    picked.forEach((q) => {
      const withMeta = q.answers.map((text, i) => ({ text, isCorrect: i === q.correct }));
      const shuffled = shuffle(withMeta);
      selected.push({
        ...q,
        answers: shuffled.map((a) => a.text),
        correct: shuffled.findIndex((a) => a.isCorrect),
      });
    });
  });
  return shuffle(selected);
}

export interface ExamAnswer {
  question_id: number;
  selected_index: number | null;
  is_correct: boolean;
}

export interface ExamResult {
  answers: ExamAnswer[];
  correct_count: number;
  total: number;
  score: number;
  passed: boolean;
  category_breakdown: Record<string, { total: number; correct: number; percent: number }>;
}

export function gradeExam(questions: ExamQuestion[], answers: Record<number, number | null>): ExamResult {
  const examAnswers: ExamAnswer[] = [];
  const breakdown: Record<string, { total: number; correct: number; percent: number }> = {};
  let correct = 0;

  questions.forEach((q) => {
    const sel = answers[q.id] ?? null;
    const isCorrect = sel !== null && sel === q.correct;
    if (isCorrect) correct++;

    if (!breakdown[q.category]) breakdown[q.category] = { total: 0, correct: 0, percent: 0 };
    breakdown[q.category].total++;
    if (isCorrect) breakdown[q.category].correct++;

    examAnswers.push({ question_id: q.id, selected_index: sel, is_correct: isCorrect });
  });

  Object.keys(breakdown).forEach((k) => {
    const b = breakdown[k];
    b.percent = Math.round((b.correct / b.total) * 100);
  });

  const score = Math.round((correct / questions.length) * 100);
  return {
    answers: examAnswers,
    correct_count: correct,
    total: questions.length,
    score,
    passed: score >= PASSING_SCORE,
    category_breakdown: breakdown,
  };
}
