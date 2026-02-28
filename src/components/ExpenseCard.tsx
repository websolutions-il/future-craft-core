import { useState } from 'react';
import { Mail, Share2, Download, ExternalLink, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ExpenseRow {
  id: string;
  date: string;
  driver_name: string;
  vehicle_plate: string;
  category: string;
  vendor: string;
  invoice_number: string;
  amount: number;
  odometer: number;
  notes: string;
  image_url?: string;
}

export default function ExpenseCard({ expense: e }: { expense: ExpenseRow }) {
  const [showImage, setShowImage] = useState(false);
  const hasImage = !!e.image_url;

  const emailBody = `הוצאה: ${e.category}\nסכום: ₪${(e.amount || 0).toLocaleString()}\nרכב: ${e.vehicle_plate}\nנהג: ${e.driver_name}\nספק: ${e.vendor}\nתאריך: ${e.date ? new Date(e.date).toLocaleDateString('he-IL') : '—'}\n${e.invoice_number ? `חשבונית: ${e.invoice_number}\n` : ''}${e.notes ? `הערות: ${e.notes}\n` : ''}${hasImage ? `\nתמונת חשבונית:\n${e.image_url}` : ''}`;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: `הוצאה - ${e.category}`, text: emailBody }).catch(() => {});
    } else {
      navigator.clipboard.writeText(emailBody);
      toast.success('הועתק ללוח');
    }
  };

  return (
    <div className="card-elevated">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xl font-bold">{e.category}</p>
        <span className="text-xl font-black text-primary">₪{(e.amount || 0).toLocaleString()}</span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-muted-foreground text-sm">
        <span>🚗 {e.vehicle_plate}</span>
        <span>👤 {e.driver_name}</span>
        <span>📅 {e.date ? new Date(e.date).toLocaleDateString('he-IL') : ''}</span>
        <span>🏪 {e.vendor}</span>
        {e.invoice_number && <span>🧾 {e.invoice_number}</span>}
        {e.odometer > 0 && <span>📊 {e.odometer.toLocaleString()} ק"מ</span>}
      </div>

      {e.notes && <p className="text-sm text-muted-foreground mt-2 bg-muted p-2 rounded-lg">{e.notes}</p>}

      {/* Invoice image preview */}
      {hasImage && (
        <div className="mt-3">
          <button
            onClick={() => setShowImage(!showImage)}
            className="flex items-center gap-2 text-sm font-medium text-primary"
          >
            <ImageIcon size={16} /> {showImage ? 'הסתר תמונה' : 'הצג חשבונית'}
          </button>
          {showImage && (
            <div className="mt-2 rounded-xl overflow-hidden border border-border">
              <img src={e.image_url!} alt="חשבונית" className="w-full object-contain max-h-80" />
              <div className="flex gap-2 p-2 bg-muted">
                <a href={e.image_url!} download target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-background text-sm font-medium">
                  <Download size={16} /> הורד
                </a>
                <a href={e.image_url!} target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-background text-sm font-medium">
                  <ExternalLink size={16} /> פתח
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Share buttons */}
      <div className="mt-3 flex gap-2">
        <a
          href={`mailto:?subject=${encodeURIComponent(`הוצאה - ${e.category} - ₪${(e.amount || 0).toLocaleString()}`)}&body=${encodeURIComponent(emailBody)}`}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm min-h-[44px]"
        >
          <Mail size={18} /> אימייל
        </a>
        <button onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-muted text-foreground font-bold text-sm min-h-[44px]"
        >
          <Share2 size={18} /> שתף
        </button>
      </div>
    </div>
  );
}
