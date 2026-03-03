import { Building2 } from 'lucide-react';

export default function Suppliers() {
  return (
    <div className="animate-fade-in">
      <h1 className="page-header flex items-center gap-3"><Building2 size={28} /> ניהול ספקים</h1>
      <div className="card-elevated text-center py-12">
        <Building2 size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
        <p className="text-xl text-muted-foreground">ניהול ספקים — בקרוב</p>
        <p className="text-sm text-muted-foreground mt-2">כאן תוכל לנהל ספקי שירות (מוסכים, גררים, פחחות), מחירונים וביצועים</p>
      </div>
    </div>
  );
}
