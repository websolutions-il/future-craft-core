import { Truck } from 'lucide-react';

export default function Towing() {
  return (
    <div className="animate-fade-in">
      <h1 className="page-header flex items-center gap-3"><Truck size={28} /> שינועים</h1>
      <div className="card-elevated text-center py-12">
        <Truck size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
        <p className="text-xl text-muted-foreground">ניהול שינועים — בקרוב</p>
        <p className="text-sm text-muted-foreground mt-2">כאן תוכל לנהל בקשות שינוע, אישורים ומעקב ביצוע</p>
      </div>
    </div>
  );
}
