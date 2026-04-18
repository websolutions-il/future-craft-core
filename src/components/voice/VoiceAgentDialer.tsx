import { useState, useCallback, useEffect, useRef } from 'react';
import { useConversation } from '@elevenlabs/react';
import { Mic, PhoneOff, Loader2, Wrench, Calendar, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface VoiceAgentDialerProps {
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  vehiclePlate?: string;
  flowType?: string;
  onClose?: () => void;
}

interface ToolEvent {
  ts: string;
  tool: string;
  detail: string;
}

export default function VoiceAgentDialer({
  customerId,
  customerName,
  customerPhone,
  vehiclePlate,
  flowType = 'general',
  onClose,
}: VoiceAgentDialerProps) {
  const { user } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  const [agentId, setAgentId] = useState<string>(() => localStorage.getItem('elevenlabs_agent_id') || '');
  const [duration, setDuration] = useState(0);
  const [toolEvents, setToolEvents] = useState<ToolEvent[]>([]);
  const transcriptRef = useRef<string[]>([]);
  const callLogIdRef = useRef<string | null>(null);
  const startedAtRef = useRef<number>(0);

  const logTool = (tool: string, detail: string) =>
    setToolEvents(prev => [...prev, { ts: new Date().toLocaleTimeString('he-IL'), tool, detail }].slice(-10));

  const conversation = useConversation({
    onConnect: () => {
      toast.success('🎙️ מחובר לסוכן הקולי');
      startedAtRef.current = Date.now();
    },
    onDisconnect: async () => {
      toast.info('השיחה הסתיימה');
      const dur = Math.floor((Date.now() - startedAtRef.current) / 1000);
      // Update final duration + transcript
      if (callLogIdRef.current) {
        await supabase.from('call_logs').update({
          status: 'completed',
          duration_sec: dur,
          transcript: transcriptRef.current.join('\n'),
          updated_at: new Date().toISOString(),
        }).eq('id', callLogIdRef.current);
      }
      setDuration(0);
      transcriptRef.current = [];
      callLogIdRef.current = null;
    },
    onError: (err) => { console.error('Voice error:', err); toast.error('שגיאה בשיחה'); },
    onMessage: (msg: any) => {
      if (msg?.type === 'user_transcript' && msg.user_transcription_event?.user_transcript) {
        transcriptRef.current.push(`👤 ${msg.user_transcription_event.user_transcript}`);
      } else if (msg?.type === 'agent_response' && msg.agent_response_event?.agent_response) {
        transcriptRef.current.push(`🤖 ${msg.agent_response_event.agent_response}`);
      }
    },
    clientTools: {
      // Open a fault report in the system
      open_fault_report: async (params: { description?: string; urgency?: string }) => {
        try {
          const { data, error } = await supabase.from('faults').insert({
            company_name: user?.company_name || '',
            created_by: user?.id,
            customer_name: customerName || '',
            vehicle_plate: vehiclePlate || '',
            description: params.description || 'נפתחה מתוך שיחת Voice AI',
            urgency: params.urgency || 'normal',
            status: 'new',
            fault_type: 'voice_ai',
          } as any).select('id').single();
          if (error) throw error;
          logTool('open_fault_report', `תקלה נפתחה (${(data as any)?.id?.slice(0, 8)})`);
          toast.success('🔧 תקלה נפתחה במערכת');
          return `תקלה נפתחה בהצלחה, מזהה: ${(data as any)?.id}`;
        } catch (e: any) {
          logTool('open_fault_report', `שגיאה: ${e.message}`);
          return `שגיאה בפתיחת תקלה: ${e.message}`;
        }
      },
      // Schedule a service appointment
      schedule_appointment: async (params: { date?: string; description?: string }) => {
        try {
          const { data, error } = await supabase.from('service_orders').insert({
            company_name: user?.company_name || '',
            created_by: user?.id,
            driver_name: customerName || '',
            vehicle_plate: vehiclePlate || '',
            service_date: params.date || new Date().toISOString().split('T')[0],
            description: params.description || 'תור שנקבע בשיחת Voice AI',
            urgency: 'normal',
            treatment_status: 'pending',
            ordering_user: 'Voice AI',
          } as any).select('id').single();
          if (error) throw error;
          logTool('schedule_appointment', `תור נקבע ל-${params.date}`);
          toast.success('📅 תור נקבע');
          return `תור נקבע בהצלחה לתאריך ${params.date}`;
        } catch (e: any) {
          logTool('schedule_appointment', `שגיאה: ${e.message}`);
          return `שגיאה בקביעת תור: ${e.message}`;
        }
      },
      // Lookup vehicle status
      check_vehicle_status: async (params: { plate?: string }) => {
        try {
          const plate = params.plate || vehiclePlate;
          if (!plate) return 'לא צוין מספר רישוי';
          const { data: faults } = await supabase
            .from('faults')
            .select('description, status, urgency, created_at')
            .eq('vehicle_plate', plate)
            .neq('status', 'completed')
            .order('created_at', { ascending: false })
            .limit(3);
          logTool('check_vehicle_status', `נבדק רכב ${plate}`);
          if (!faults?.length) return `רכב ${plate} ללא תקלות פתוחות`;
          return `נמצאו ${faults.length} תקלות פתוחות לרכב ${plate}: ` +
            faults.map(f => `${f.description} (${f.status})`).join('; ');
        } catch (e: any) {
          logTool('check_vehicle_status', `שגיאה: ${e.message}`);
          return `שגיאה: ${e.message}`;
        }
      },
    },
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

      // Pre-create call log
      const { data: logRow, error: logErr } = await supabase.from('call_logs').insert({
        company_name: user?.company_name || '',
        created_by: user?.id,
        customer_id: customerId || null,
        customer_name: customerName || '',
        vehicle_plate: vehiclePlate || '',
        phone: customerPhone || '',
        direction: 'outbound',
        status: 'in_progress',
        flow_type: flowType,
      } as any).select('id').single();
      if (logErr) console.warn('Failed to create call log:', logErr);
      callLogIdRef.current = (logRow as any)?.id || null;

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
  }, [agentId, conversation, customerName, customerPhone, customerId, vehiclePlate, flowType, user]);

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

      {/* Available Tools indicator */}
      <div className="bg-muted/50 rounded-xl p-3 space-y-2">
        <div className="text-xs font-bold text-muted-foreground">🛠️ כלים זמינים לסוכן:</div>
        <div className="flex flex-wrap gap-1.5 text-xs">
          <span className="flex items-center gap-1 px-2 py-1 bg-background rounded-md"><Wrench size={12}/>פתיחת תקלה</span>
          <span className="flex items-center gap-1 px-2 py-1 bg-background rounded-md"><Calendar size={12}/>קביעת תור</span>
          <span className="flex items-center gap-1 px-2 py-1 bg-background rounded-md"><Search size={12}/>בדיקת רכב</span>
        </div>
      </div>

      {/* Tool events log */}
      {toolEvents.length > 0 && (
        <div className="bg-muted/30 rounded-xl p-3 space-y-1 max-h-32 overflow-auto">
          <div className="text-xs font-bold text-muted-foreground mb-1">פעולות שבוצעו:</div>
          {toolEvents.map((e, i) => (
            <div key={i} className="text-xs flex gap-2">
              <span className="text-muted-foreground">{e.ts}</span>
              <span className="font-medium">{e.tool}</span>
              <span className="text-muted-foreground truncate">→ {e.detail}</span>
            </div>
          ))}
        </div>
      )}

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
