import { useEffect, useState } from 'react';
import { Radio, X, Minimize2, Maximize2 } from 'lucide-react';
import type { CallLog } from '@/hooks/useCallLogs';

export default function LiveCallWidget({ call }: { call: CallLog | null }) {
  const [minimized, setMinimized] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!call) return;
    const start = new Date(call.created_at).getTime();
    const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000));
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, [call]);

  if (!call) return null;
  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');

  return (
    <div className="fixed bottom-20 left-4 z-50 animate-fade-in">
      <div className="bg-card border-2 border-destructive/40 rounded-2xl shadow-elegant p-3 flex items-center gap-3 min-w-[220px]">
        <div className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
        </div>
        {!minimized && (
          <div className="flex-1">
            <div className="text-xs text-destructive font-bold flex items-center gap-1">
              <Radio size={12} /> LIVE · {call.direction === 'inbound' ? 'נכנסת' : 'יוצאת'}
            </div>
            <div className="text-sm font-bold truncate">{call.customer_name || call.phone}</div>
            <div className="text-xs text-muted-foreground tabular-nums">{mm}:{ss}</div>
          </div>
        )}
        <button onClick={() => setMinimized(!minimized)} className="p-1 hover:bg-muted rounded">
          {minimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
        </button>
      </div>
    </div>
  );
}
