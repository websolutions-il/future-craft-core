import { History as HistoryIcon } from 'lucide-react';

export default function HistoryPage() {
  return (
    <div className="animate-fade-in">
      <h1 className="page-header flex items-center gap-3">
        <HistoryIcon size={28} />
        היסטוריה
      </h1>
      <div className="card-elevated">
        <p className="text-muted-foreground text-lg">עמוד היסטוריה טיפולים ורכבים - בקרוב</p>
      </div>
    </div>
  );
}
