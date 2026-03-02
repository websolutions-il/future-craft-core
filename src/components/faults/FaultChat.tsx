import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Send } from 'lucide-react';

interface Message {
  id: string;
  user_name: string;
  message: string;
  created_at: string;
}

export default function FaultChat({ faultId, companyName }: { faultId: string; companyName: string }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadMessages = async () => {
    const { data } = await supabase
      .from('fault_messages')
      .select('id, user_name, message, created_at')
      .eq('fault_id', faultId)
      .order('created_at', { ascending: true });
    if (data) setMessages(data);
  };

  useEffect(() => {
    loadMessages();
    const channel = supabase
      .channel(`fault-chat-${faultId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'fault_messages', filter: `fault_id=eq.${faultId}` }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [faultId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMsg.trim() || !user) return;
    setSending(true);
    await supabase.from('fault_messages').insert({
      fault_id: faultId,
      user_id: user.id,
      user_name: user.full_name || user.email || '',
      message: newMsg.trim(),
      company_name: companyName,
    });
    setNewMsg('');
    setSending(false);
  };

  return (
    <div className="card-elevated">
      <h3 className="text-lg font-bold mb-3">💬 צ'אט פנימי</h3>
      <div className="max-h-64 overflow-y-auto space-y-2 mb-3 p-2 bg-muted/30 rounded-xl">
        {messages.length === 0 && <p className="text-center text-muted-foreground text-sm py-4">אין הודעות עדיין</p>}
        {messages.map(m => {
          const isMe = m.user_name === (user?.full_name || user?.email);
          return (
            <div key={m.id} className={`flex flex-col ${isMe ? 'items-start' : 'items-end'}`}>
              <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${isMe ? 'bg-primary/10 text-foreground' : 'bg-accent text-accent-foreground'}`}>
                <p className="font-medium text-xs text-muted-foreground mb-0.5">{m.user_name}</p>
                <p>{m.message}</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {new Date(m.created_at).toLocaleDateString('he-IL')} {new Date(m.created_at).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2">
        <input
          value={newMsg}
          onChange={e => setNewMsg(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="כתוב הודעה..."
          className="flex-1 p-3 text-sm rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none"
        />
        <button onClick={handleSend} disabled={!newMsg.trim() || sending} className="p-3 rounded-xl bg-primary text-primary-foreground disabled:opacity-50">
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
