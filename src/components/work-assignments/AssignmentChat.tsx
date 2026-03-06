import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

interface Message {
  id: string;
  user_id: string;
  user_name: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function AssignmentChat({ assignmentId, companyName }: { assignmentId: string; companyName: string }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadMessages = async () => {
    const { data } = await supabase
      .from('work_assignment_messages')
      .select('*')
      .eq('assignment_id', assignmentId)
      .order('created_at', { ascending: true });
    if (data) setMessages(data as Message[]);
  };

  useEffect(() => {
    loadMessages();
    const channel = supabase
      .channel(`assignment-chat-${assignmentId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'work_assignment_messages', filter: `assignment_id=eq.${assignmentId}` },
        (payload) => setMessages(prev => [...prev, payload.new as Message])
      ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [assignmentId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !user) return;
    setSending(true);
    await supabase.from('work_assignment_messages').insert({
      assignment_id: assignmentId,
      user_id: user.id,
      user_name: user.full_name,
      message: newMessage.trim(),
      company_name: companyName,
    });
    setNewMessage('');
    setSending(false);
  };

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="bg-muted px-4 py-2 text-sm font-bold">💬 צ׳אט עבודה</div>
      <div ref={scrollRef} className="h-64 overflow-y-auto p-3 space-y-2 bg-background">
        {messages.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">אין הודעות עדיין</p>}
        {messages.map(msg => {
          const isMine = msg.user_id === user?.id;
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[80%] rounded-xl px-3 py-2 ${isMine ? 'bg-primary/10 text-foreground' : 'bg-muted text-foreground'}`}>
                <p className="text-xs font-bold text-muted-foreground mb-0.5">{msg.user_name}</p>
                <p className="text-sm">{msg.message}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {format(new Date(msg.created_at), 'dd/MM HH:mm', { locale: he })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-2 p-2 border-t border-border bg-muted/30">
        <input
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="הקלד הודעה..."
          className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:border-primary"
        />
        <button onClick={handleSend} disabled={!newMessage.trim() || sending}
          className="p-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50">
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
