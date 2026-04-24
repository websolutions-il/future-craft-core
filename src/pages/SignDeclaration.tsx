import { useState, useEffect, useRef } from 'react';
import { FileText, Pencil, Check, Printer } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast, Toaster } from 'sonner';
import { useSearchParams } from 'react-router-dom';
import { printDeclaration } from '@/utils/printDeclaration';

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
  company_name: string | null;
  status: string;
  signed_at: string | null;
  signature_url: string | null;
  expires_at: string | null;
  created_at: string;
}

export default function SignDeclaration() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [declaration, setDeclaration] = useState<Declaration | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [signed, setSigned] = useState(false);
  const [hasStrokes, setHasStrokes] = useState(false);
  const isDrawingRef = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!token) { setError('קישור לא תקין'); setLoading(false); return; }
    supabase.from('driver_declarations').select('*').eq('token', token).maybeSingle()
      .then(({ data, error: err }) => {
        if (err || !data) { setError('תצהיר לא נמצא'); }
        else {
          setDeclaration(data as Declaration);
          if (data.status === 'signed') setSigned(true);
        }
        setLoading(false);
      });
  }, [token]);

  // Initialize canvas with proper device-pixel-ratio scaling — fixes
  // hairline / invisible signatures on mobile and Retina screens.
  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const cssWidth = canvas.clientWidth;
    const cssHeight = canvas.clientHeight;
    canvas.width = Math.floor(cssWidth * ratio);
    canvas.height = Math.floor(cssHeight * ratio);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(ratio, ratio);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, cssWidth, cssHeight);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setHasStrokes(false);
  };

  useEffect(() => {
    if (declaration && !signed) {
      // Wait for layout so clientWidth is correct
      const t = setTimeout(initCanvas, 80);
      const onResize = () => initCanvas();
      window.addEventListener('resize', onResize);
      return () => { clearTimeout(t); window.removeEventListener('resize', onResize); };
    }
  }, [declaration, signed]);

  const getPos = (e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  };

  const startDraw = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    isDrawingRef.current = true;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };
  const draw = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDrawingRef.current) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    if (!hasStrokes) setHasStrokes(true);
  };
  const endDraw = () => { isDrawingRef.current = false; };
  const clearCanvas = () => initCanvas();

  const handleSign = async () => {
    if (!declaration || !canvasRef.current) return;
    if (!hasStrokes) { toast.error('יש לחתום בתוך המסגרת לפני אישור'); return; }
    setSubmitting(true);
    try {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const blob = await (await fetch(dataUrl)).blob();
      const path = `declarations/sig_${declaration.id}_${Date.now()}.png`;
      const { error: uploadErr } = await supabase.storage
        .from('documents')
        .upload(path, blob, { contentType: 'image/png', upsert: false, cacheControl: '3600' });
      if (uploadErr) {
        console.error('Signature upload error:', uploadErr);
        toast.error('שגיאה בשמירת החתימה: ' + uploadErr.message);
        setSubmitting(false);
        return;
      }
      const { data: urlData } = supabase.storage.from('documents').getPublicUrl(path);

      const signedAt = new Date().toISOString();
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 5);

      const { error: updateErr, data: updated } = await supabase
        .from('driver_declarations')
        .update({
          status: 'signed',
          signed_at: signedAt,
          signature_url: urlData.publicUrl,
          expires_at: expiresAt.toISOString(),
        })
        .eq('token', token)
        .select()
        .maybeSingle();

      if (updateErr) {
        console.error('Update error:', updateErr);
        toast.error('שגיאה בעדכון התצהיר: ' + updateErr.message);
        setSubmitting(false);
        return;
      }
      if (updated) setDeclaration(updated as Declaration);
      setSigned(true);
      toast.success('התצהיר נחתם בהצלחה!');
    } catch (e: any) {
      console.error(e);
      toast.error('שגיאה בלתי צפויה');
    } finally {
      setSubmitting(false);
    }
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
          {declaration.signature_url && (
            <img src={declaration.signature_url} alt="חתימה" className="h-20 mx-auto rounded border bg-white p-2" />
          )}
          <button
            onClick={() => printDeclaration({ ...declaration, declaration_text: DECLARATION_TEXT })}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-base font-bold mt-4"
          >
            <Printer size={18} /> הדפס / שמור כ-PDF
          </button>
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
            <div className="border-2 border-input rounded-xl overflow-hidden bg-white" style={{ height: 180 }}>
              <canvas
                ref={canvasRef}
                className="w-full h-full touch-none block"
                onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
                onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}
              />
            </div>
            <button onClick={clearCanvas} className="text-sm text-muted-foreground mt-1 underline">נקה חתימה</button>
          </div>

          <button
            onClick={handleSign}
            disabled={submitting}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground text-lg font-bold flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <Pencil size={20} /> {submitting ? 'שומר...' : 'חתום ואשר'}
          </button>
        </div>
      )}
    </div>
  );
}
