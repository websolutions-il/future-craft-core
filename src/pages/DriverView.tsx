import { UserCheck } from 'lucide-react';

export default function DriverView() {
  return (
    <div className="animate-fade-in">
      <h1 className="page-header flex items-center gap-3">
        <UserCheck size={28} />
        כניסה לדשבורד נהג
      </h1>
      <div className="card-elevated">
        <p className="text-muted-foreground text-lg">עמוד כניסה לדשבורד נהג - בקרוב</p>
      </div>
    </div>
  );
}
