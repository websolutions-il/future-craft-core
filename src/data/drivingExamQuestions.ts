// Question bank for driver competency exam
// Source: HTML file provided by user

export interface ExamQuestion {
  id: number;
  category: string;
  question: string;
  answers: string[];
  correct: number;
  explanation: string;
}

export interface FrozenQuestion {
  id: number;
  category: string;
  question: string;
  answers: string[];
  correct: number; // index after shuffle
  explanation: string;
}

export const QUESTION_BANK: ExamQuestion[] = [
  // תנאי דרך ומזג אוויר
  { id: 1, category: "תנאי דרך ומזג אוויר", question: "אתה נוסע בגשם חזק והראות מוגבלת. מה הפעולה הנכונה ביותר?", answers: ["להמשיך באותה מהירות", "להאט, להדליק אורות ולשמור מרחק", "לעצור בנתיב הנסיעה", "להדליק אורות גבוהים ולנסוע רגיל"], correct: 1, explanation: "בתנאי ראות לקויים ובכביש חלק יש להאט, להדליק אורות מתאימים ולשמור מרחק." },
  { id: 2, category: "תנאי דרך ומזג אוויר", question: "בעת נהיגה בערפל כבד, מה נכון לעשות?", answers: ["להאיץ כדי לצאת מהערפל מהר", "להאט ולהדליק אורות מתאימים", "לנסוע צמוד לרכב מלפנים", "להפעיל אורות גבוהים"], correct: 1, explanation: "בערפל יש להאט ולהשתמש באורות מתאימים. אורות גבוהים עלולים להחמיר את הראות." },
  { id: 3, category: "תנאי דרך ומזג אוויר", question: "למה הגשם הראשון נחשב מסוכן במיוחד?", answers: ["כי הכביש תמיד נהיה מחוספס יותר", "כי נוצרת שכבה חלקה של מים, שמן ולכלוך", "כי הבלמים עובדים חזק יותר", "כי הצמיגים מתנפחים"], correct: 1, explanation: "בגשם הראשון מצטברים שמן ולכלוך על פני הכביש והאחיזה יורדת." },
  { id: 4, category: "תנאי דרך ומזג אוויר", question: "השמש מסנוורת אותך בזמן נהיגה.