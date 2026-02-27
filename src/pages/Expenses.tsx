import { FileText } from 'lucide-react';

export default function Expenses() {
  return (
    <div className="animate-fade-in">
      <h1 className="page-header flex items-center gap-3">
        <FileText size={28} />
        דלק וחשבוניות
      </h1>
      <div className="card-elevated">
        <p className="text-muted-foreground text-lg">עמוד דלק וחשבוניות - בקרוב</p>
      </div>
    </div>
  );
}
