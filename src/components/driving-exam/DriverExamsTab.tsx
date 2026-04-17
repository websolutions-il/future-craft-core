import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus, Send, MessageCircle, Link as LinkIcon, FileText, Trash2 } from 'lucide-react';
import { generateExam } from '@/data/drivingExamQuestions';

interface Props {
  driverId: string;
  driverName: string;
  driverPhone?: string;
  companyName?: string;
  vehiclePlate?: string;
}

export default function DriverExamsTab({ driverId, driverName, driverPhone, companyName, vehiclePlate }: Props) {
  const { user } = useAuth();
  const [exams, setExams] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [note, setNote] = useState('');

  const isManager = user?.role === 'fleet_manager' || user?.role === 'super_admin';

  const load = async () => {
    const { data } = await supabase.from('driving_exams').select('*').eq('driver_id', driverId).order('created_at', { ascending: false });
    setExams(data || []);
  };
  useEffect(() => { load(); }, [driverId]);

  const createExam = async (sentVia: 'app' | 'sms' | 'whatsapp' | 'link') => {
    setCreating(true);
    const questions = generateExam();
    const { data, error } = await supabase.from('driving_exams').insert({
      driver_id: driverId,
      driver_name: driverName,
      driver_phone: driverPhone || '',
      company_name: companyName || '',
      vehicle_plate: vehiclePlate || '',
      sent_via: sentVia,
      sent_at: new Date().toISOString(),
      sent_to: driverPhone || '',
      questions: questions as any,
      total_questions: questions.length,
      created_by: user?.id,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }).select().single();
    setCreating(false);
    if (error || !data) { toast.error('שגיאה ביצירת מבחן'); return; }

    const link = `${window.location.origin}/take-exam?t=${data.token}`;
    const msg = `שלום ${driverName}, נשלח אליך מבחן כשירות נהיגה. למילוי: ${link}`;

    if (sentVia === 'sms' && driverPhone) {
      window.location.href = `sms:${driverPhone}?body=${encodeURIComponent(msg)}`;
    } else if (sentVia === 'whatsapp' && driverPhone) {
      const phone = driverPhone.replace(/\D/g, '').replace(/^0/, '972');
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
    } else if (sentVia === 'link') {
      navigator.clipboard.writeText(link);
      toast.success('הקישור הועתק!');
    } else {
      toast.success('המבחן נשלח לאפליקציית הנהג');
    }
    load();
  };

  const deleteExam = async (id: string) => {
    if (!confirm('למחוק מבחן זה?')) return;
    await supabase.from('driving_exams').delete().eq('id', id);
    load();
  };

  const saveNote = async () => {
    if (!selected) return;
    await supabase.from('driving_exams').update({ manager_note: note }).eq('id', selected.id);
    toast.success('הערה נשמרה');
    load();
  };

  if (selected) {
    return (
      <div className="space-y-3">
        <Button variant="outline" onClick={() => setSelected(null)}>← חזרה</Button>
        <Card className="p-4">
          <h3 className="font-bold mb-2">פרטי מבחן</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>תאריך שליחה: {new Date(selected.created_at).toLocaleString('he-IL')}</div>
            <div>אופן שליחה: {selected.sent_via}</div>
            <div>סטטוס: {selected.status}</div>
            <div>ציון: {selected.score ?? '—'}</div>
            <div>תוצאה: {selected.passed === null ? '—' : selected.passed ? 'עבר ✓' : 'לא עבר ✗'}</div>
            <div>הושלם: {selected.completed_at ? new Date(selected.completed_at).toLocaleString('he-IL') : '—'}</div>
          </div>
          {selected.signature_url && (
            <div className="mt-3">
              <p className="text-sm font-medium mb-1">חתימה:</p>
              <img src={selected.signature_url} alt="חתימה" className="border rounded max-w-xs" />
            </div>
          )}
        </Card>
        {selected.category_breakdown && Object.keys(selected.category_breakdown).length > 0 && (
          <Card className="p-4">
            <h3 className="font-bold mb-2">פירוט קטגוריות</h3>
            {Object.entries(selected.category_breakdown as Record<string, any>).map(([cat, b]) => (
              <div key={cat} className="flex justify-between py-1 text-sm">
                <span>{cat}</span><span>{b.correct}/{b.total} ({b.percent}%)</span>
              </div>
            ))}
          </Card>
        )}
        {isManager && (
          <Card className="p-4">
            <h3 className="font-bold mb-2">הערת מנהל</h3>
            <Textarea value={note || selected.manager_note || ''} onChange={(e) => setNote(e.target.value)} rows={3} />
            <Button onClick={saveNote} className="mt-2" size="sm">שמור הערה</Button>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {isManager && (
        <Card className="p-4">
          <h3 className="font-bold mb-3">שליחת מבחן חדש</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={() => createExam('app')} disabled={creating} size="sm">
              <Plus size={14} /> שלח באפליקציה
            </Button>
            <Button onClick={() => createExam('sms')} disabled={creating || !driverPhone} variant="outline" size="sm">
              <Send size={14} /> SMS
            </Button>
            <Button onClick={() => createExam('whatsapp')} disabled={creating || !driverPhone} variant="outline" size="sm">
              <MessageCircle size={14} /> WhatsApp
            </Button>
            <Button onClick={() => createExam('link')} disabled={creating} variant="outline" size="sm">
              <LinkIcon size={14} /> קישור
            </Button>
          </div>
        </Card>
      )}

      <Card className="p-4">
        <h3 className="font-bold mb-3">היסטוריית מבחנים ({exams.length})</h3>
        {exams.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">אין מבחנים</p>
        ) : (
          <div className="space-y-2">
            {exams.map(ex => (
              <div key={ex.id} className="border rounded p-3 flex items-center justify-between gap-2">
                <div className="flex-1 cursor-pointer" onClick={() => { setSelected(ex); setNote(ex.manager_note || ''); }}>
                  <div className="flex items-center gap-2 text-sm">
                    <FileText size={14} />
                    <span>{new Date(ex.created_at).toLocaleDateString('he-IL')}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-muted">{ex.sent_via}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-muted">{ex.status}</span>
                    {ex.score !== null && (
                      <span className={`text-xs px-2 py-0.5 rounded font-bold ${ex.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {ex.score} - {ex.passed ? 'עבר' : 'נכשל'}
                      </span>
                    )}
                  </div>
                </div>
                {isManager && (
                  <Button size="sm" variant="ghost" onClick={() => deleteExam(ex.id)}>
                    <Trash2 size={14} className="text-destructive" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
