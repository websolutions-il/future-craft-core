import { Bell } from 'lucide-react';

export default function Alerts() {
  return (
    <div className="animate-fade-in">
      <h1 className="page-header flex items-center gap-3">
        <Bell size={28} />
        התראות
      </h1>
      <div className="card-elevated">
        <p className="text-muted-foreground text-lg">עמוד התראות - בקרוב</p>
      </div>
    </div>
  );
}
