import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import ExamRunner from '@/components/driving-exam/ExamRunner';
import { Card } from '@/components/ui/card';
import type { ExamQuestion } from '@/data/drivingExamQuestions';

export default function TakeDrivingExam() {
  const { id } = useParams();
  const [search] = useSearchParams();
  const token = search.get('t');
  const [exam, setExam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      let q = supabase.from('driving_exams').select('*');
      if (id) q = q.eq('id', id);
      else if (token) q = q.eq('token', token);
      else { setError('קישור לא תקין'); setLoading(false); return; }
      const { data, error: e } = await q.maybeSingle();
      if (e || !data) { setError('המבחן לא נמצא'); setLoading(false); return; }
      if (data.status === 'completed') { setError('המבחן כבר הושלם'); setLoading(false); return; }
      // Mark started
      if (data.status === 'sent') {
        await supabase.from('driving_exams').update({ status: 'in_progress', started_at: new Date().toISOString() }).eq('id', data.id);
      }
      setExam(data);
      setLoading(false);
    })();
  }, [id, token]);

  if (loading) return <div className="p-6 text-center">טוען...</div>;
  if (error) return <div className="p-6"><Card className="p-6 text-center text-destructive">{error}</Card></div>;
  if (!exam) return null;

  return (
    <div className="max-w-2xl mx-auto p-4" dir="rtl">
      <h1 className="text-2xl font-bold mb-4 text-center">מבחן כשירות נהיגה</h1>
      <ExamRunner
        examId={exam.id}
        questions={exam.questions as ExamQuestion[]}
        driverName={exam.driver_name}
        companyName={exam.company_name}
        vehiclePlate={exam.vehicle_plate}
      />
    </div>
  );
}
