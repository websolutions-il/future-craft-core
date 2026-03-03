import { Bell } from 'lucide-react';

export default function AlertSettings() {
  return (
    <div className="animate-fade-in">
      <h1 className="page-header flex items-center gap-3"><Bell size={28} /> הגדרות התראות</h1>
      <div className="card-elevated text-center py-12">
        <Bell size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
        <p className="text-xl text-muted-foreground">הגדרות התראות — בקרוב</p>
        <p className="text-sm text-muted-foreground mt-2">כאן תוכל להגדיר סוגי התראות, ערוצי שליחה וספים לכל חברה</p>
      </div>
    </div>
  );
}
