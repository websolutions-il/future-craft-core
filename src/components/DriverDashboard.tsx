import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Wrench, AlertTriangle, RefreshCw, FileText, ClipboardList,
  BookOpen, Phone, MessageCircle, Car, Bell
} from 'lucide-react';

const actionTiles = [
  {
    label: 'דיווח תקלה',
    subtitle: 'צילום ופירוט',
    icon: Wrench,
    link: '/faults',
    color: 'bg-card border border-border',
  },
  {
    label: 'תאונה וחירום',
    subtitle: 'גרירה וסיוע',
    icon: AlertTriangle,
    link: '/accidents',
    color: 'bg-destructive/5 border border-destructive/20',
  },
  {
    label: 'החלפת נהג',
    subtitle: 'עדכון נהג וק"מ',
    icon: RefreshCw,
    link: '/handover',
    color: 'bg-card border border-border',
  },
  {
    label: 'דלק וחשבוניות',
    subtitle: 'קבלות והוצאות',
    icon: FileText,
    link: '/expenses',
    color: 'bg-card border border-border',
  },
];

const fullWidthTiles = [
  {
    label: 'סידור עבודה',
    subtitle: 'משימות שעות ויעדים',
    icon: ClipboardList,
    link: '/work-orders',
    color: 'bg-card border border-border',
  },
  {
    label: 'היסטוריה טיפולים',
    subtitle: 'טיפולים ותיקונים שבוצעו',
    icon: BookOpen,
    link: '/history',
    color: 'bg-card border border-border',
  },
];

export default function DriverDashboard() {
  const { user } = useAuth();

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header / Greeting */}
      <div>
        <p className="text-primary text-lg font-semibold">שלום</p>
        <h1 className="text-3xl font-black text-foreground">{user?.full_name || 'נהג'}</h1>
      </div>

      {/* User & Vehicle Info */}
      <div className="card-elevated space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold">{user?.full_name}</p>
            <p className="text-muted-foreground text-sm">{user?.company_name || 'חברה לא ידועה'}</p>
          </div>
          <Link
            to="/settings"
            className="text-sm px-4 py-2 rounded-xl bg-muted text-muted-foreground font-medium"
          >
            חשבון
          </Link>
        </div>
        <div className="flex items-center gap-3 text-foreground">
          <Car size={20} className="text-primary" />
          <span className="font-bold">רכב מוצמד</span>
          <span className="text-muted-foreground text-sm">טוען נתוני נהג ורכב</span>
        </div>
      </div>

      {/* Alerts */}
      <div>
        <h2 className="text-xl font-bold text-primary mb-3 flex items-center gap-2">
          <Bell size={20} />
          ההתראות שלך
        </h2>
        <div className="card-elevated text-center py-6">
          <p className="text-muted-foreground text-lg">כרגע אין התראות</p>
        </div>
      </div>

      {/* Action Tiles - 2 column grid */}
      <div className="grid grid-cols-2 gap-3">
        {actionTiles.map(tile => (
          <Link
            key={tile.label}
            to={tile.link}
            className={`flex items-center gap-3 p-5 rounded-2xl shadow-sm transition-all active:scale-95 ${tile.color}`}
          >
            <div className="flex-1 text-right">
              <p className="text-lg font-bold leading-tight">{tile.label}</p>
              <p className="text-sm text-muted-foreground">{tile.subtitle}</p>
            </div>
            <tile.icon size={28} className="text-primary flex-shrink-0" />
          </Link>
        ))}
      </div>

      {/* Full-width tiles */}
      <div className="space-y-3">
        {fullWidthTiles.map(tile => (
          <Link
            key={tile.label}
            to={tile.link}
            className={`flex items-center gap-4 p-5 rounded-2xl shadow-sm transition-all active:scale-95 ${tile.color}`}
          >
            <div className="flex-1 text-right">
              <p className="text-lg font-bold">{tile.label}</p>
              <p className="text-sm text-muted-foreground">{tile.subtitle}</p>
            </div>
            <tile.icon size={28} className="text-primary flex-shrink-0" />
          </Link>
        ))}
      </div>

      {/* Emergency 24/7 */}
      <Link
        to="/emergency"
        className="flex items-center gap-4 p-6 rounded-2xl bg-destructive/10 border-2 border-destructive/30 shadow-sm transition-all active:scale-95"
      >
        <div className="flex-1 text-right">
          <p className="text-xl font-black text-destructive">שירותי חירום 24/7</p>
          <p className="text-sm text-muted-foreground">פתיחת קריאת שירות מיידית</p>
        </div>
        <Phone size={32} className="text-destructive flex-shrink-0" />
      </Link>

      {/* WhatsApp to dispatch */}
      <a
        href="https://wa.me/972000000000"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-4 p-5 rounded-2xl bg-success/10 border border-success/30 shadow-sm transition-all active:scale-95"
      >
        <div className="flex-1 text-right">
          <p className="text-lg font-bold text-success">וואטסאפ למוקד</p>
          <p className="text-sm text-muted-foreground">שיחה מהירה עם המוקד</p>
        </div>
        <MessageCircle size={28} className="text-success flex-shrink-0" />
      </a>
    </div>
  );
}
