import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Bell, Check, CheckCheck, Wrench, ClipboardList, Shield, AlertTriangle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  link: string;
  created_at: string;
}

const typeConfig: Record<string, { icon: any; color: string }> = {
  fault_update: { icon: Wrench, color: 'bg-warning/10 text-warning' },
  new_task: { icon: ClipboardList, color: 'bg-primary/10 text-primary' },
  expiry: { icon: Shield, color: 'bg-destructive/10 text-destructive' },
  info: { icon: Bell, color: 'bg-muted text-muted-foreground' },
};

export default function DriverNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadNotifications();
  }, [user]);

  const loadNotifications = async () => {
    const { data } = await supabase
      .from('driver_notifications')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(50);
    setNotifications((data as Notification[]) || []);
    setLoading(false);
  };

  const markAsRead = async (id: string) => {
    await supabase.from('driver_notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length === 0) return;
    await supabase.from('driver_notifications').update({ is_read: true }).in('id', unreadIds);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'עכשיו';
    if (diffMin < 60) return `לפני ${diffMin} דקות`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `לפני ${diffHours} שעות`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `לפני ${diffDays} ימים`;
    return date.toLocaleDateString('he-IL');
  };

  if (loading) {
    return (
      <div className="animate-fade-in text-center py-12">
        <Clock size={32} className="mx-auto mb-4 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">טוען התראות...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
          <Bell size={24} className="text-primary" />
          התראות
          {unreadCount > 0 && (
            <span className="bg-destructive text-destructive-foreground text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </h1>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm text-primary font-semibold flex items-center gap-1 hover:underline"
          >
            <CheckCheck size={16} />
            סמן הכל כנקרא
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card-elevated text-center py-12">
          <Bell size={48} className="mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-lg text-muted-foreground">אין התראות</p>
          <p className="text-sm text-muted-foreground">התראות חדשות יופיעו כאן</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(notif => {
            const config = typeConfig[notif.type] || typeConfig.info;
            const Icon = config.icon;
            const content = (
              <div
                className={`card-elevated flex items-start gap-3 transition-all ${
                  !notif.is_read ? 'border-2 border-primary/30 bg-primary/5' : 'opacity-75'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${config.color}`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`font-bold text-foreground ${!notif.is_read ? '' : 'font-semibold'}`}>
                      {notif.title}
                    </p>
                    {!notif.is_read && (
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); markAsRead(notif.id); }}
                        className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
                        title="סמן כנקרא"
                      >
                        <Check size={14} />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{notif.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatTime(notif.created_at)}</p>
                </div>
              </div>
            );

            return notif.link ? (
              <Link key={notif.id} to={notif.link} onClick={() => !notif.is_read && markAsRead(notif.id)}>
                {content}
              </Link>
            ) : (
              <div key={notif.id}>{content}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
