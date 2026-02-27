import { Settings as SettingsIcon } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="animate-fade-in">
      <h1 className="page-header flex items-center gap-3">
        <SettingsIcon size={28} />
        הגדרות
      </h1>
      <div className="card-elevated">
        <p className="text-muted-foreground text-lg">עמוד הגדרות - בקרוב</p>
      </div>
    </div>
  );
}
