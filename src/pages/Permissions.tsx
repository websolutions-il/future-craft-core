import { Shield } from 'lucide-react';

export default function Permissions() {
  return (
    <div className="animate-fade-in">
      <h1 className="page-header flex items-center gap-3"><Shield size={28} /> הרשאות</h1>
      <div className="card-elevated text-center py-12">
        <Shield size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
        <p className="text-xl text-muted-foreground">ניהול הרשאות — בקרוב</p>
        <p className="text-sm text-muted-foreground mt-2">כאן תוכל להגדיר הרשאות מותאמות לכל תפקיד וחברה</p>
      </div>
    </div>
  );
}
