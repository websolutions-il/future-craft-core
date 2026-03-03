import { FileText } from 'lucide-react';

export default function CustomerDocs() {
  return (
    <div className="animate-fade-in">
      <h1 className="page-header flex items-center gap-3"><FileText size={28} /> מסמכי לקוח</h1>
      <div className="card-elevated text-center py-12">
        <FileText size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
        <p className="text-xl text-muted-foreground">מסמכי לקוח — בקרוב</p>
        <p className="text-sm text-muted-foreground mt-2">כאן תוכל לנהל מסמכים והסכמים הקשורים ללקוחות</p>
      </div>
    </div>
  );
}
