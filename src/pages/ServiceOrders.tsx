import { Briefcase } from 'lucide-react';

export default function ServiceOrders() {
  return (
    <div className="animate-fade-in">
      <h1 className="page-header flex items-center gap-3">
        <Briefcase size={28} />
        הזמנת שירותים
      </h1>
      <div className="card-elevated">
        <p className="text-muted-foreground text-lg">עמוד הזמנת שירותים - בקרוב</p>
      </div>
    </div>
  );
}
