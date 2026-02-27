import { UserCheck } from 'lucide-react';

export default function AttachCar() {
  return (
    <div className="animate-fade-in">
      <h1 className="page-header flex items-center gap-3">
        <UserCheck size={28} />
        הצמדת רכב לנהג
      </h1>
      <div className="card-elevated">
        <p className="text-muted-foreground text-lg">עמוד הצמדת רכב לנהג - בקרוב</p>
      </div>
    </div>
  );
}
