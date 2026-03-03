import { CheckSquare } from 'lucide-react';

export default function ApprovalSettings() {
  return (
    <div className="animate-fade-in">
      <h1 className="page-header flex items-center gap-3"><CheckSquare size={28} /> הגדרות אישורים</h1>
      <div className="card-elevated text-center py-12">
        <CheckSquare size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
        <p className="text-xl text-muted-foreground">הגדרות אישורים לפי חברה — בקרוב</p>
        <p className="text-sm text-muted-foreground mt-2">כאן תוכל להגדיר מי מאשר הפניות לספק, שינועים ופעולות נוספות</p>
      </div>
    </div>
  );
}
