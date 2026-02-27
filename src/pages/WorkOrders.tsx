import { ClipboardList } from 'lucide-react';

export default function WorkOrders() {
  return (
    <div className="animate-fade-in">
      <h1 className="page-header flex items-center gap-3">
        <ClipboardList size={28} />
        סידור עבודה
      </h1>
      <div className="card-elevated">
        <p className="text-muted-foreground text-lg">עמוד סידור עבודה - בקרוב</p>
      </div>
    </div>
  );
}
