import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Calendar, Clock, MapPin, ChevronRight, ChevronLeft, Play, Square, Loader2 } from 'lucide-react';
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

interface TripLog {
  id: string;
  route_id: string;
  trip_date: string;
  started_at: string | null;
  ended_at: string | null;
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

function getGeoLocation(): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

export default function DriverWeeklySchedule() {
  const { user } = useAuth();
  const [routes, setRoutes] = useState<RouteEntry[]>([]);
  const [tripLogs, setTripLogs] = useState<TripLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay());
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const weekStart = useMemo(() => {
    const base = startOfWeek(new Date(), { weekStartsOn: 0 });
    return addDays(base, weekOffset * 7);
  }, [weekOffset]);

  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const weekEnd = addDays(weekStart, 6);
    const startStr = format(weekStart, 'yyyy-MM-dd');
    const endStr = format(weekEnd, 'yyyy-MM-dd');

    const [routesRes, tripsRes] = await Promise.all([
      supabase
        .from('routes')
        .select('*')
        .eq('driver_name', user.full_name || '')
        .eq('status', 'active'),
      supabase
        .from('trip_logs')
        .select('id, route_id, trip_date, started_at, ended_at')
        .eq('driver_id', user.id)
        .gte('trip_date', startStr)
        .lte('trip_date', endStr),
    ]);

    setRoutes((routesRes.data as RouteEntry[]) || []);
    setTripLogs((tripsRes.data as TripLog[]) || []);
    setLoading(false);
  }, [user, weekStart]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const routesByDay = useMemo(() => {
    const map: Record<number, RouteEntry[]> = {};
    for (let i = 0; i < 7; i++) map[i] = [];
    routes.forEach((route) => {
      (route.days_of_week || []).forEach((day) => {
        const idx = DAY_KEYS.indexOf(day.toLowerCase());
        if (idx >= 0) map[idx].push(route);
      });
    });
    for (const key in map) {
      map[key].sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''));
    }
    return map;
  }, [routes]);

  const totalRoutesThisWeek = useMemo(
    () => Object.values(routesByDay).reduce((sum, arr) => sum + arr.length, 0),
    [routesByDay]
  );

  const getTripLog = useCallback(
    (routeId: string, dayIndex: number): TripLog | undefined => {
      const dateStr = format(weekDays[dayIndex], 'yyyy-MM-dd');
      return tripLogs.find((t) => t.route_id === routeId && t.trip_date === dateStr);
    },
    [tripLogs, weekDays]
  );

  const handleStartTrip = async (route: RouteEntry, dayIndex: number) => {
    if (!user) return;
    const actionKey = `start-${route.id}-${dayIndex}`;
    setActionLoading(actionKey);

    const location = await getGeoLocation();
    const dateStr = format(weekDays[dayIndex], 'yyyy-MM-dd');

    const { error } = await supabase.from('trip_logs').insert({
      route_id: route.id,
      driver_id: user.id,
      trip_date: dateStr,
      started_at: new Date().toISOString(),
      start_lat: location?.lat ?? null,
      start_lng: location?.lng ?? null,
      company_name: user.company_name || '',
    });

    setActionLoading(null);

    if (error) {
      toast({ title: 'שגיאה', description: 'לא הצלחנו לרשום תחילת נסיעה.', variant: 'destructive' });
      return;
    }

    toast({ title: '🚗 נסיעה התחילה', description: `${route.name} – ${route.origin} → ${route.destination}` });
    loadData();
  };

  const handleEndTrip = async (route: RouteEntry, dayIndex: number) => {
    const tripLog = getTripLog(route.id, dayIndex);
    if (!tripLog) return;

    const actionKey = `end-${route.id}-${dayIndex}`;
    setActionLoading(actionKey);

    const location = await getGeoLocation();

    const { error } = await supabase
      .from('trip_logs')
      .update({
        ended_at: new Date().toISOString(),
        end_lat: location?.lat ?? null,
        end_lng: location?.lng ?? null,
      })
      .eq('id', tripLog.id);

    setActionLoading(null);

    if (error) {
      toast({ title: 'שגיאה', description: 'לא הצלחנו לרשום סיום נסיעה.', variant: 'destructive' });
      return;
    }

    toast({ title: '✅ נסיעה הסתיימה', description: `${route.name} – סיום נרשם בהצלחה` });
    loadData();
  };

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
        <button onClick={() => setWeekOffset((w) => w + 1)} className="p-2 rounded-xl hover:bg-muted transition-colors">
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
        <button onClick={() => setWeekOffset((w) => w - 1)} className="p-2 rounded-xl hover:bg-muted transition-colors">
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
              <span className={`text-lg font-bold ${isSelected ? '' : 'text-foreground'}`}>{format(date, 'd')}</span>
              {hasRoutes && (
                <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isSelected ? 'bg-primary-foreground' : 'bg-primary'}`} />
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
              const tripLog = getTripLog(route.id, selectedDay);
              const isStarted = Boolean(tripLog?.started_at);
              const isEnded = Boolean(tripLog?.ended_at);
              const startLoading = actionLoading === `start-${route.id}-${selectedDay}`;
              const endLoading = actionLoading === `end-${route.id}-${selectedDay}`;

              return (
                <div key={route.id} className="flex gap-3 relative">
                  {/* Timeline dot */}
                  <div className="w-10 flex-shrink-0 flex items-start justify-center pt-4 z-10">
                    <div
                      className={`w-3 h-3 rounded-full border-2 border-background ${
                        isEnded ? 'bg-success' : isStarted ? 'bg-warning' : 'bg-primary'
                      }`}
                    />
                  </div>

                  {/* Route card */}
                  <div className={`flex-1 rounded-2xl border-2 p-4 ${colorClass}`}>
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-bold text-foreground text-lg">{route.name}</p>
                      {(route.start_time || route.end_time) && (
                        <div className="flex items-center gap-1 text-sm font-semibold bg-background/80 px-2 py-0.5 rounded-lg">
                          <Clock size={12} />
                          <span>
                            {route.start_time || '?'} - {route.end_time || '?'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <MapPin size={14} className="flex-shrink-0" />
                      <span>{route.origin}</span>
                      <span>←</span>
                      <span>{route.destination}</span>
                    </div>

                    {route.customer_name && <p className="text-xs text-muted-foreground">לקוח: {route.customer_name}</p>}
                    {route.service_type && <p className="text-xs text-muted-foreground">סוג: {route.service_type}</p>}

                    {/* Trip status + actions */}
                    <div className="mt-3 pt-3 border-t border-border/40">
                      {isEnded ? (
                        <div className="flex items-center gap-2 text-success text-sm font-bold">
                          <Square size={14} />
                          <span>הנסיעה הסתיימה</span>
                          {tripLog?.started_at && (
                            <span className="text-xs text-muted-foreground font-normal mr-auto">
                              {format(new Date(tripLog.started_at), 'HH:mm')} –{' '}
                              {tripLog.ended_at ? format(new Date(tripLog.ended_at), 'HH:mm') : ''}
                            </span>
                          )}
                        </div>
                      ) : isStarted ? (
                        <div className="flex items-center gap-2">
                          <span className="text-warning text-sm font-bold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
                            בנסיעה
                            {tripLog?.started_at && (
                              <span className="text-xs text-muted-foreground font-normal">
                                (מ-{format(new Date(tripLog.started_at), 'HH:mm')})
                              </span>
                            )}
                          </span>
                          <button
                            onClick={() => handleEndTrip(route, selectedDay)}
                            disabled={endLoading}
                            className="mr-auto flex items-center gap-1.5 px-4 py-2 rounded-xl bg-destructive text-destructive-foreground text-sm font-bold active:scale-95 transition-transform disabled:opacity-60"
                          >
                            {endLoading ? <Loader2 size={14} className="animate-spin" /> : <Square size={14} />}
                            סיום נסיעה
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartTrip(route, selectedDay)}
                          disabled={startLoading}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold active:scale-95 transition-transform disabled:opacity-60"
                        >
                          {startLoading ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                          התחל נסיעה
                        </button>
                      )}
                    </div>
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
              <div
                className={`h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                  routesByDay[i].length > 0 ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
                }`}
              >
                {routesByDay[i].length || '-'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
