import { Mail } from 'lucide-react';

export default function EmailTemplates() {
  return (
    <div className="animate-fade-in">
      <h1 className="page-header flex items-center gap-3"><Mail size={28} /> תבניות מייל והודעות</h1>
      <div className="card-elevated text-center py-12">
        <Mail size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
        <p className="text-xl text-muted-foreground">תבניות מייל והודעות — בקרוב</p>
        <p className="text-sm text-muted-foreground mt-2">כאן תוכל לנהל תבניות מייל, SMS והודעות אוטומטיות</p>
      </div>
    </div>
  );
}
