import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Send } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

interface Message {
  id: string;
  user_id: string;
  user_name: string;
  message: string;
  created_at: string;
}

export default function ServiceOrderChat({ orderId, companyName }: { orderId: string; companyName: string }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadMessages = async () => {
    const { data } = await supabase
      .from('service_order_messages')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });
    if (data) setMessages(data as Message[]);
  };

  useEffect(() => {
    loadMessages();

    const channel = supabase
      .channel(`so-chat-${orderId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'service_order_messages',
        filter: `order_id=eq.${orderId}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [orderId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!text.trim() || !user) return;
    setSending(true);
    await supabase.from('service_order_messages').insert({
      order_id: orderId,
      user_id: user.id,
      user_name: user.full_name || '',
      message: text.trim(),
      company_name: companyName,
    });
    setText('');
    setSending(false);
  };

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="bg-muted px-4 py-2 text-sm font-bold">💬 התכתבות</div>
      <div className="max-h-64 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 && (
          <p className="text-center text-xs text-muted-foreground py-4">אין הודעות עדיין</p>
        )}
        {messages.map(m => {
          const isMe = m.user_id === user?.id;
          return (
            <div key={m.id} className={`flex ${isMe ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[80%] rounded-xl px-3 py-2 ${isMe ? 'bg-primary/10 text-foreground' : 'bg-muted text-foreground'}`}>
                <p className="text-xs font-bold text-muted-foreground mb-0.5">{m.user_name}</p>
                <p className="text-sm whitespace-pre-wrap">{m.message}</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {format(new Date(m.created_at), 'dd/MM HH:mm', { locale: he })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2 p-3 border-t border-border">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="כתוב הודעה..."
          className="flex-1 p-3 rounded-xl border-2 border-input bg-background text-sm focus:border-primary focus:outline-none"
        />
        <button
          onClick={send}
          disabled={!text.trim() || sending}
          className="p-3 rounded-xl bg-primary text-primary-foreground disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
