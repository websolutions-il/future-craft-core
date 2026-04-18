import { useState, useCallback, useEffect } from 'react';
import { useConversation } from '@elevenlabs/react';
import { Mic, PhoneOff, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface VoiceAgentDialerProps {
  customerName?: string;
  vehiclePlate?: string;
  flowType?: string;
  onClose?: () => void;
}

export default function VoiceAgentDialer({ customerName, vehiclePlate, onClose }: VoiceAgentDialerProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [agentId, setAgentId] = useState<string>(() => localStorage.getItem('elevenlabs_agent_id') || '');
  const [duration, setDuration] = useState(0);

  const conversation = useConversation({
    onConnect: () => toast.success('🎙️ מחובר לסוכן הקולי'),
    onDisconnect: () => { toast.info('השיחה הסתיימה'); setDuration(0); },
    onError: (err) => { console.error('Voice error:', err); toast.error('שגיאה בשיחה'); },
  });

  const isActive = conversation.status === 'connected';

  useEffect(() => {
    if (!isActive) return;
    const t = setInterval(() => setDuration(d => d + 1), 1000);
    return () => clearInterval(t);
  }, [isActive]);

  const start = useCallback(async () => {
    if (!agentId) return toast.error('יש להזין Agent ID של ElevenLabs');
    setIsConnecting(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const { data, error } = await supabase.functions.invoke('elevenlabs-conversation-token', {
        body: { agentId },
      });
      if (error || !data?.token) throw new Error(error?.message || 'לא התקבל token');

      await conversation.startSession({
        conversationToken: data.token,
        connectionType: 'webrtc',
        overrides: {
          agent: {
            firstMessage: customerName
              ? `שלום ${customerName}, מתקשר בנושא רכב ${vehiclePlate || ''}`
              : undefined,
          },
        },
      });
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'נכשל בהפעלת השיחה');
    } finally {
      setIsConnecting(false);
    }
  }, [agentId, conversation, customerName, vehiclePlate]);

  const stop = useCallback(() => conversation.endSession(), [conversation]);

  const saveAgentId = (val: string) => {
    setAgentId(val);
    localStorage.setItem('elevenlabs_agent_id', val);
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="card-elevated space-y-4 max-w-md mx-auto">
      <div className="text-center">
        <h3 className="font-bold text-lg">🎙️ Voice AI - שיחה חיה</h3>
        {customerName && <p className="text-sm text-muted-foreground mt-1">{customerName} · {vehiclePlate}</p>}
      </div>

      {!agentId && (
        <div className="space-y-2">
          <label className="text-sm font-medium">ElevenLabs Agent ID</label>
          <input
            placeholder="agent_xxxxxxxxxxxx"
            onBlur={(e) => saveAgentId(e.target.value.trim())}
            className="w-full p-3 rounded-xl border-2 border-input bg-background"
          />
          <p className="text-xs text-muted-foreground">
            צור Agent ב-elevenlabs.io → Conversational AI → Agents, והעתק כאן את ה-ID.
          </p>
        </div>
      )}

      {isActive && (
        <div className="text-center py-6 bg-primary/10 rounded-xl">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive/70"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
            </span>
            <span className="font-bold">LIVE</span>
            <span className="text-muted-foreground">· {fmt(duration)}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {conversation.isSpeaking ? '🗣️ הסוכן מדבר' : '👂 מקשיב לך'}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {!isActive ? (
          <button
            onClick={start}
            disabled={isConnecting || !agentId}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-bold disabled:opacity-50"
          >
            {isConnecting ? <Loader2 className="animate-spin" size={18} /> : <Mic size={18} />}
            {isConnecting ? 'מתחבר...' : 'התחל שיחה'}
          </button>
        ) : (
          <button
            onClick={stop}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-destructive text-destructive-foreground font-bold"
          >
            <PhoneOff size={18} /> סיים שיחה
          </button>
        )}
        {onClose && (
          <button onClick={onClose} className="px-4 py-3 rounded-xl border border-border">סגור</button>
        )}
      </div>

      {agentId && (
        <button
          onClick={() => { localStorage.removeItem('elevenlabs_agent_id'); setAgentId(''); }}
          className="text-xs text-muted-foreground underline w-full text-center"
        >
          החלף Agent ID
        </button>
      )}
    </div>
  );
}
