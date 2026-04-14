import { useState, useEffect, useRef } from 'react';
import { FileText, Pencil, Check, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast, Toaster } from 'sonner';
import { useSearchParams } from 'react-router-dom';

const DECLARATION_TEXT = `אני החתום מטה, בעל תעודת זהות מספר ______,
מצהיר בזה כי לא נתגלו אצלי, לפי מיטב ידיעתי, מגבלות במערכת העצבים, העצמות,
הראיה או השמיעה ומצב בריאותי הנוכחי כשיר לנהיגה.

1. לא נפסלתי מלהחזיק ברישיון נהיגה מ: בית משפט, רשות הרישוי או קצין משטרה,
ולחלופין רישיון הנהיגה אשר ברשותי לא הותלה על ידי גורמים כאמור.
2. אין לי כל מגבלה בריאותית או רפואית המונעת ממני מלהחזיק ברישיון הנהיגה.
3. איננו צורך סמים.
4. איננו צורך אלכוהול מעבר לכמות המותרת על פי דין.
5. אני מצהיר כי לא חל כל שינוי במצב בריאותי במשך חמש השנים האחרונות.

אני מתחייב כי במידה ויבוטלו הגבלות איזה שהן על רישיון הנהיגה אשר ברשותי,
ולחלופין במידה ויחול שינוי במצב בריאותי באופן המונע ממני מלהמשיך ולנהוג,
אדווח על כך מיידית לקצין הבטיחות.

ידוע לי כי בהתאם לתקנות 585א׳ – 585כ׳ יבדקו פרטי רישיון הנהיגה/מידע העבודות שלי
ע״י קצין הבטיחות המעניק שרותי בטיחות בחברה.

אני מצהיר בזה כי הצהרתי הנ״ל אמת`;

interface Declaration {
  id: string;
  driver_name: string;
  id_number: string | null;
  license_number: string | null;
  status: string;
  signed_at: string | null;
  signature_url: string | null;
}

export default function SignDeclaration() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [declaration, setDeclaration] = useState<Declaration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [signed, setSigned] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!token) { setError('קישור לא תקין'); setLoading(false); return; }
    supabase.from('driver_declarations').select('*').eq('token', token).single()
      .then(({ data, error: err }) => {
        if (err || !data) { setError('תצהיר לא נמצא'); }
        else if (data.status === 'signed') { setDeclaration(data as Declaration); setSigned(true); }
        else { setDeclaration(data as Declaration); }
        setLoading(false);
      });
  }, [token]);

  useEffect(() => {
    if (declaration && !signed) {
      setTimeout(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
      }, 100);
    }
  }, [declaration, signed]);

  const getPos = (e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  };

  const startDraw = (e: React.TouchEvent | React.MouseEvent) => { e.preventDefault(); setIsDrawing(true); const ctx = canvasRef.current?.getContext('2d'); if (!ctx) return; const pos = getPos(e); ctx.beginPath(); ctx.moveTo(pos.x, pos.y); };
  const draw = (e: React.TouchEvent | React.MouseEvent) => { if (!isDrawing) return; e.preventDefault(); const ctx = canvasRef.current?.getContext('2d'); if (!ctx) return; const pos = getPos(e); ctx.lineTo(pos.x, pos.y); ctx.stroke(); };
  const endDraw = () => setIsDrawing(false);
  const clearCanvas = () => { const ctx = canvasRef.current?.getContext('2d'); if (!ctx) return; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvasRef.current!.width, canvasRef.current!.height); };

  const handleSign = async () => {
    if (!declaration || !canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const blob = await (await fetch(dataUrl)).blob();
    const path = `declarations/sig_${declaration.id}_${Date.now()}.png`;
    const { error: uploadErr } = await supabase.storage.from('documents').upload(path, blob);
    if (uploadErr) { toast.error('שגיאה בשמירת החתימה'); return; }
    const { data: urlData } = supabase.storage.from('documents').getPublicUrl(path);

    const signedAt = new Date().toISOString();
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 5);

    const { error: updateErr } = await supabase.from('driver_declarations').update({
      status: 'signed',
      signed_at: signedAt,
      signature_url: urlData.publicUrl,
      expires_at: expiresAt.toISOString(),
    } as any).eq('token', token);

    if (updateErr) { toast.error('שגיאה בעדכון התצהיר'); return; }
    setSigned(true);
    toast.success('התצהיר נחתם בהצלחה!');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><p className="text-lg text-muted-foreground">טוען...</p></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-background"><p className="text-lg text-destructive">{error}</p></div>;
  if (!declaration) return null;

  return (
    <div className="min-h-screen bg-background p-4 max-w-lg mx-auto" dir="rtl">
      <Toaster />
      <div className="flex items-center gap-3 mb-6">
        <FileText size={28} className="text-primary" />
        <h1 className="text-2xl font-bold">תצהיר בעל רישיון נהיגה</h1>
      </div>

      {signed ? (
        <div className="text-center py-12 space-y-4">
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto">
            <Check size={40} className="text-success" />
          </div>
          <h2 className="text-xl font-bold">התצהיר נחתם בהצלחה!</h2>
          <p className="text-muted-foreground">תודה, {declaration.driver_name}. התצהיר נשמר במערכת.</p>
          {declaration.signature_url && <img src={declaration.signature_url} alt="חתימה" className="h-16 mx-auto rounded border" />}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-muted/30 border border-border">
            <p className="font-bold text-lg mb-1">{declaration.driver_name}</p>
            <p className="text-sm text-muted-foreground">ת.ז: {declaration.id_number || '—'} | רישיון: {declaration.license_number || '—'}</p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card text-sm leading-7 whitespace-pre-line">
            {DECLARATION_TEXT.replace('______', declaration.id_number || '______')}
          </div>

          <div>
            <p className="text-lg font-medium mb-2">חתימה דיגיטלית:</p>
            <div className="border-2 border-input rounded-xl overflow-hidden bg-white">
              <canvas ref={canvasRef} width={350} height={150} className="w-full touch-none"
                onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
                onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw} />
            </div>
            <button onClick={clearCanvas} className="text-sm text-muted-foreground mt-1 underline">נקה חתימה</button>
          </div>

          <button onClick={handleSign} className="w-full py-4 rounded-xl bg-primary text-primary-foreground text-lg font-bold flex items-center justify-center gap-2">
            <Pencil size={20} /> חתום ואשר
          </button>
        </div>
      )}
    </div>
  );
}
