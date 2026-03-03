import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCompanyFilter } from '@/hooks/useCompanyFilter';

interface UserOption { id: string; full_name: string; company_name: string; }
interface Message { id: string; sender_id: string; sender_name: string; recipient_id: string; message: string; created_at: string; is_read: boolean; }

export default function InternalChat() {
  const { user } = useAuth();
  const companyFilter = useCompanyFilter();
  const [users, setUsers] = useState<UserOption[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [search, setSearch] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load users (same company only, or all for super_admin)
  useEffect(() => {
    const q = supabase.from('profiles').select('id, full_name, company_name').neq('id', user?.id || '');
    if (companyFilter) q.eq('company_name', companyFilter);
    q.then(({ data }) => { if (data) setUsers(data); });
  }, [companyFilter, user?.id]);

  // Load messages for selected conversation
  const loadMessages = async () => {
    if (!selectedUser || !user) return;
    const { data } = await supabase
      .from('internal_messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},recipient_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},recipient_id.eq.${user.id})`)
      .order('created_at', { ascending: true });
    if (data) setMessages(data as Message[]);
    // Mark as read
    await supabase.from('internal_messages').update({ is_read: true }).eq('recipient_id', user.id).eq('sender_id', selectedUser.id);
  };

  useEffect(() => { loadMessages(); }, [selectedUser?.id]);

  // Realtime
  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel('internal-chat')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'internal_messages' }, (payload) => {
        const msg = payload.new as Message;
        if ((msg.sender_id === user.id || msg.recipient_id === user.id) &&
            (msg.sender_id === selectedUser?.id || msg.recipient_id === selectedUser?.id)) {
          setMessages(prev => [...prev, msg]);
        }
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id, selectedUser?.id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async () => {
    if (!newMsg.trim() || !selectedUser || !user) return;
    await supabase.from('internal_messages').insert({
      sender_id: user.id,
      sender_name: user.full_name || '',
      recipient_id: selectedUser.id,
      message: newMsg.trim(),
      company_name: user.company_name || '',
    });
    setNewMsg('');
  };

  const filteredUsers = users.filter(u => u.full_name.includes(search) || u.company_name?.includes(search));

  return (
    <div className="animate-fade-in">
      <h1 className="page-header flex items-center gap-3"><MessageCircle size={28} /> צ'אט פנימי</h1>
      <div className="flex gap-4 h-[calc(100vh-200px)]">
        {/* User list */}
        <div className="w-64 flex-shrink-0 card-elevated flex flex-col">
          <div className="relative mb-3">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="חיפוש..." className="w-full pr-9 p-2 text-sm rounded-xl border border-input bg-background focus:border-primary focus:outline-none" />
          </div>
          <div className="flex-1 overflow-y-auto space-y-1">
            {filteredUsers.map(u => (
              <button key={u.id} onClick={() => setSelectedUser(u)}
                className={`w-full text-right p-3 rounded-xl transition-colors ${selectedUser?.id === u.id ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-muted'}`}>
                <p className="font-medium text-sm">{u.full_name}</p>
                <p className="text-xs text-muted-foreground">{u.company_name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 card-elevated flex flex-col">
          {!selectedUser ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <p className="text-lg">בחר משתמש כדי להתחיל שיחה</p>
            </div>
          ) : (
            <>
              <div className="border-b border-border pb-3 mb-3">
                <p className="font-bold text-lg">{selectedUser.full_name}</p>
                <p className="text-xs text-muted-foreground">{selectedUser.company_name}</p>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 mb-3">
                {messages.map(m => {
                  const isMe = m.sender_id === user?.id;
                  return (
                    <div key={m.id} className={`flex ${isMe ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${isMe ? 'bg-primary/10' : 'bg-accent'}`}>
                        <p>{m.message}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {new Date(m.created_at).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
              <div className="flex gap-2">
                <input value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="כתוב הודעה..." className="flex-1 p-3 text-sm rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none" />
                <button onClick={handleSend} disabled={!newMsg.trim()} className="p-3 rounded-xl bg-primary text-primary-foreground disabled:opacity-50"><Send size={18} /></button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
