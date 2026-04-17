import { useState } from 'react';
import { toast } from 'sonner';

export default function SettingsTab() {
  const [phone, setPhone] = useState(localStorage.getItem('voice_twilio_phone') || '');
  const [garage, setGarage] = useState(localStorage.getItem('voice_garage_name') || '');
  const [hours, setHours] = useState(localStorage.getItem('voice_working_hours') || '08:00-18:00');
  const [autoCall, setAutoCall] = useState(localStorage.getItem('voice_auto_call') === 'true');
  const [smsFallback, setSmsFallback] = useState(localStorage.getItem('voice_sms_fallback') !== 'false');

  const save = () => {
    localStorage.setItem('voice_twilio_phone', phone);
    localStorage.setItem('voice_garage_name', garage);
    localStorage.setItem('voice_working_hours', hours);
    localStorage.setItem('voice_auto_call', String(autoCall));
    localStorage.setItem('voice_sms_fallback', String(smsFallback));
    toast.success('ההגדרות נשמרו');
  };

  return (
    <div className="card-elevated space-y-4 max-w-xl">
      <div>
        <label className="text-sm font-medium">מספר טלפון Twilio</label>
        <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+972..."
          className="w-full mt-1 p-3 rounded-xl border-2 border-input bg-background" />
      </div>
      <div>
        <label className="text-sm font-medium">שם המוסך / חברה</label>
        <input value={garage} onChange={e => setGarage(e.target.value)}
          className="w-full mt-1 p-3 rounded-xl border-2 border-input bg-background" />
      </div>
      <div>
        <label className="text-sm font-medium">שעות פעילות</label>
        <input value={hours} onChange={e => setHours(e.target.value)}
          className="w-full mt-1 p-3 rounded-xl border-2 border-input bg-background" />
      </div>
      <label className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
        <span>חיוג אוטומטי כשרכב מוכן</span>
        <input type="checkbox" checked={autoCall} onChange={e => setAutoCall(e.target.checked)} className="w-5 h-5" />
      </label>
      <label className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
        <span>שליחת SMS חלופי במקרה כשל</span>
        <input type="checkbox" checked={smsFallback} onChange={e => setSmsFallback(e.target.checked)} className="w-5 h-5" />
      </label>
      <button onClick={save} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold">שמור הגדרות</button>
      <p className="text-xs text-muted-foreground text-center pt-2">
        🔒 לחיבור אמיתי ל-Twilio/Deepgram/ElevenLabs נדרש שלב אינטגרציה נוסף.
      </p>
    </div>
  );
}
