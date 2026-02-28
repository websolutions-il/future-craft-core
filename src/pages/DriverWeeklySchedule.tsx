import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Clock, MapPin, ChevronRight, ChevronLeft } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { he } from 'date-fns/locale';

interface RouteEntry {
  id: string;
  name: string;
  origin: string;
  destination: string;
  start_time: string;
  end_time: string;
  days_of_week: string[];
  status: string;
  customer_name: string;
  service_type: string;
}

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const DAY_LABELS_SHORT = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];
const DAY_LABELS_FULL = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

const ROUTE_COLORS = [
  'bg-primary/10 border-primary/30 text-primary',
  'bg-success/10 border-success/30 text-success',
  'bg-warning/10 border-warning/30 text-warning',
  'bg-destructive/10 border-destructive/30 text-destructive',
  'bg-accent text-accent-foreground border-accent',
];

export default function DriverWeeklySchedule() {
  const { user } = useAuth();
  const [routes, setRoutes] = useState<RouteEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay());

  useEffect(() => {
    if (user) loadRoutes();
  }, [user]);

  const loadRoutes = async () => {
    const { data } = await supabase
      .from('routes')
      .select('*')
      .eq('driver_name', user!.full_name || '')
      .eq('status', 'active');
    setRoutes((data as RouteEntry[]) || []);
    setLoading(false);
  };

  const weekStart = useMemo(() => {
    const base = startOfWeek(new Date(), { weekStartsOn: 0 });
    return addDays(base, weekOffset * 7);
  }, [weekOffset]);

  const weekDays = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const routesByDay = useMemo(() => {
    const map: Record<number, RouteEntry[]> = {};
    for (let i = 0; i < 7; i++) map[i] = [];
    routes.forEach(route => {
      (route.days_of_week || []).forEach(day => {
        const idx = DAY_KEYS.indexOf(day.toLowerCase());
        if (idx >= 0) map[idx].push(route);
      });
    });
    // Sort each day by start_time
    for (const key in map) {
      map[key].sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''));
    }
    return map;
  }, [routes]);

  const totalRoutesThisWeek = useMemo(() =>
    Object.values(routesByDay).reduce((sum, arr) => sum + arr.length, 0),
    [routesByDay]
  );

  const today = new Date();

  if (loading) {
    return (
      <div className="animate-fade-in text-center py-12">
        <Clock size={32} className="mx-auto mb-4 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">טוען לוח זמנים...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
          <Calendar size={24} className="text-primary" />
          לוח הזמנים שלי
        </h1>
        <span className="text-sm text-muted-foreground">{totalRoutesThisWeek} נסיעות השבוע</span>
      </div>

      {/* Week navigation */}
      <div className="flex items-center justify-between card-elevated">
        <button onClick={() => setWeekOffset(w => w + 1)} className="p-2 rounded-xl hover:bg-muted transition-colors">
          <ChevronRight size={20} />
        </button>
        <div className="text-center">
          <p className="font-bold text-foreground">
            {format(weekStart, 'd MMMM', { locale: he })} - {format(addDays(weekStart, 6), 'd MMMM yyyy', { locale: he })}
          </p>
          {weekOffset !== 0 && (
            <button onClick={() => setWeekOffset(0)} className="text-xs text-primary font-semibold hover:underline">
              חזור להשבוע הנוכחי
            </button>
          )}
        </div>
        <button onClick={() => setWeekOffset(w => w - 1)} className="p-2 rounded-xl hover:bg-muted transition-colors">
          <ChevronLeft size={20} />
        </button>
      </div>

      {/* Day selector strip */}
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((date, i) => {
          const isToday = isSameDay(date, today);
          const isSelected = selectedDay === i;
          const hasRoutes = routesByDay[i].length > 0;
          return (
            <button
              key={i}
              onClick={() => setSelectedDay(i)}
              className={`flex flex-col items-center py-2 px-1 rounded-xl transition-all ${
                isSelected
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : isToday
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-muted'
              }`}
            >
              <span className="text-xs font-semibold">{DAY_LABELS_SHORT[i]}</span>
              <span className={`text-lg font-bold ${isSelected ? '' : 'text-foreground'}`}>
                {format(date, 'd')}
              </span>
              {hasRoutes && (
                <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                  isSelected ? 'bg-primary-foreground' : 'bg-primary'
                }`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day detail */}
      <div>
        <h2 className="text-lg font-bold text-foreground mb-3">
          יום {DAY_LABELS_FULL[selectedDay]} • {format(weekDays[selectedDay], 'd/M', { locale: he })}
        </h2>

        {routesByDay[selectedDay].length === 0 ? (
          <div className="card-elevated text-center py-8">
            <Calendar size={40} className="mx-auto mb-2 text-muted-foreground/30" />
            <p className="text-muted-foreground">אין נסיעות ביום זה</p>
          </div>
        ) : (
          <div className="space-y-3 relative">
            {/* Timeline line */}
            <div className="absolute right-[19px] top-4 bottom-4 w-0.5 bg-border" />

            {routesByDay[selectedDay].map((route, idx) => {
              const colorClass = ROUTE_COLORS[idx % ROUTE_COLORS.length];
              return (
                <div key={route.id} className="flex gap-3 relative">
                  {/* Timeline dot */}
                  <div className="w-10 flex-shrink-0 flex items-start justify-center pt-4 z-10">
                    <div className="w-3 h-3 rounded-full bg-primary border-2 border-background" />
                  </div>

                  {/* Route card */}
                  <div className={`flex-1 rounded-2xl border-2 p-4 ${colorClass}`}>
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-bold text-foreground text-lg">{route.name}</p>
                      {(route.start_time || route.end_time) && (
                        <div className="flex items-center gap-1 text-sm font-semibold bg-background/80 px-2 py-0.5 rounded-lg">
                          <Clock size={12} />
                          <span>{route.start_time || '?'} - {route.end_time || '?'}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <MapPin size={14} className="flex-shrink-0" />
                      <span>{route.origin}</span>
                      <span>←</span>
                      <span>{route.destination}</span>
                    </div>

                    {route.customer_name && (
                      <p className="text-xs text-muted-foreground">לקוח: {route.customer_name}</p>
                    )}
                    {route.service_type && (
                      <p className="text-xs text-muted-foreground">סוג: {route.service_type}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Weekly overview mini grid */}
      <div className="card-elevated">
        <h3 className="font-bold text-foreground mb-3">סיכום שבועי</h3>
        <div className="grid grid-cols-7 gap-1">
          {DAY_LABELS_SHORT.map((label, i) => (
            <div key={i} className="text-center">
              <p className="text-xs text-muted-foreground mb-1">{label}</p>
              <div className={`h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                routesByDay[i].length > 0
                  ? 'bg-primary/15 text-primary'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {routesByDay[i].length || '-'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
