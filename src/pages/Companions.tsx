import { Users, FileText } from 'lucide-react';

export default function Companions() {
  return (
    <div className="animate-fade-in">
      <h1 className="page-header flex items-center gap-3"><Users size={28} /> מלווים</h1>
      <div className="card-elevated text-center py-12">
        <Users size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
        <p className="text-xl text-muted-foreground">ניהול מלווים — בקרוב</p>
        <p className="text-sm text-muted-foreground mt-2">כאן תוכל לנהל מלווים, להצמיד אותם לנסיעות ולנהגים</p>
      </div>
    </div>
  );
}
