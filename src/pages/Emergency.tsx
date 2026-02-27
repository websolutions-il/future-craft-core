import { Phone } from 'lucide-react';

export default function Emergency() {
  return (
    <div className="animate-fade-in">
      <h1 className="page-header flex items-center gap-3">
        <Phone size={28} />
        שירותי חירום 24/7
      </h1>
      <div className="card-elevated">
        <p className="text-muted-foreground text-lg">עמוד הזמנת שירותי חירום - בקרוב</p>
      </div>
    </div>
  );
}
