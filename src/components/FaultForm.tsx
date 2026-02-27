import { useState, useRef, useEffect } from 'react';
import { Fault, FaultAttachment, faultTypes } from '@/data/demo-data';
import { ArrowRight, Camera, Paperclip, X, Plus, AlertTriangle, Wrench } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface FaultFormProps {
  onSubmit: (fault: Fault) => void;
  onCancel: () => void;
}

export default function FaultForm({ onSubmit, onCancel }: FaultFormProps) {
  const [dbVehicles, setDbVehicles] = useState<{ license_plate: string; manufacturer: string; model: string }[]>([]);
  const [dbDrivers, setDbDrivers] = useState<{ full_name: string }[]>([]);

  useEffect(() => {
    supabase.from('vehicles').select('license_plate, manufacturer, model').then(({ data }) => {
      if (data) setDbVehicles(data);
    });
    supabase.from('drivers').select('full_name').then(({ data }) => {
      if (data) setDbDrivers(data);
    });
  }, []);
  const [driverName, setDriverName] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [faultType, setFaultType] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<'normal' | 'urgent' | 'critical'>('normal');
  const [notes, setNotes] = useState('');
  const [attachments, setAttachments] = useState<FaultAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const urgencyOptions = [
    { key: 'normal' as const, text: 'רגיל', icon: Wrench, color: 'border-info/40 bg-info/5' },
    { key: 'urgent' as const, text: 'דחוף', icon: AlertTriangle, color: 'border-warning/40 bg-warning/5' },
    { key: 'critical' as const, text: 'מיידי', icon: AlertTriangle, color: 'border-destructive/40 bg-destructive/5' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newAttachments: FaultAttachment[] = Array.from(files).map(file => ({
      id: crypto.randomUUID(),
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file),
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
    e.target.value = '';
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => {
      const att = prev.find(a => a.id === id);
      if (att) URL.revokeObjectURL(att.url);
      return prev.filter(a => a.id !== id);
    });
  };

  const handleSubmit = () => {
    if (!driverName || !vehiclePlate || !faultType || !description) return;
    const fault: Fault = {
      id: `ID-${Math.floor(Math.random() * 900000 + 100000)}`,
      date: new Date().toISOString().split('T')[0],
      driverName,
      vehiclePlate,
      faultType,
      description,
      urgency,
      status: 'new',
      notes: notes || undefined,
      attachments,
    };
    onSubmit(fault);
  };

  const isValid = driverName && vehiclePlate && faultType && description;

  return (
    <div className="animate-fade-in">
      <button onClick={onCancel} className="flex items-center gap-2 text-primary text-lg font-medium mb-4 min-h-[48px]">
        <ArrowRight size={20} />
        חזרה לרשימת תקלות
      </button>

      <h1 className="text-2xl font-bold mb-6">דיווח תקלה חדשה</h1>

      <div className="space-y-5">
        {/* Driver */}
        <div>
          <label className="block text-lg font-medium mb-2">שם נהג</label>
          <select
            value={driverName}
            onChange={e => setDriverName(e.target.value)}
            className="w-full p-4 text-lg rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none"
          >
            <option value="">בחר נהג...</option>
            {dbDrivers.map(d => (
              <option key={d.full_name} value={d.full_name}>{d.full_name}</option>
            ))}
          </select>
        </div>

        {/* Vehicle */}
        <div>
          <label className="block text-lg font-medium mb-2">מספר רכב</label>
          <select
            value={vehiclePlate}
            onChange={e => setVehiclePlate(e.target.value)}
            className="w-full p-4 text-lg rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none"
          >
            <option value="">בחר רכב...</option>
            {dbVehicles.map(v => (
              <option key={v.license_plate} value={v.license_plate}>{v.license_plate} - {v.manufacturer} {v.model}</option>
            ))}
          </select>
        </div>

        {/* Fault Type */}
        <div>
          <label className="block text-lg font-medium mb-2">סוג תקלה</label>
          <div className="flex flex-wrap gap-2">
            {faultTypes.map(ft => (
              <button
                key={ft}
                onClick={() => setFaultType(ft)}
                className={`px-5 py-3 rounded-xl text-lg font-medium transition-colors ${faultType === ft ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
              >
                {ft}
              </button>
            ))}
          </div>
        </div>

        {/* Urgency */}
        <div>
          <label className="block text-lg font-medium mb-2">דחיפות</label>
          <div className="flex gap-2">
            {urgencyOptions.map(opt => (
              <button
                key={opt.key}
                onClick={() => setUrgency(opt.key)}
                className={`flex-1 py-4 rounded-xl text-lg font-medium border-2 transition-colors ${urgency === opt.key ? opt.color + ' font-bold' : 'bg-muted text-muted-foreground border-transparent'}`}
              >
                {opt.text}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-lg font-medium mb-2">תיאור התקלה</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
            placeholder="תאר את התקלה בפירוט..."
            className="w-full p-4 text-lg rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none resize-none"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-lg font-medium mb-2">הערות</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            placeholder="הערות נוספות (אופציונלי)..."
            className="w-full p-4 text-lg rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none resize-none"
          />
        </div>

        {/* File Attachments */}
        <div>
          <label className="block text-lg font-medium mb-2">צרף קבצים / תמונות</label>
          <div className="flex gap-3 mb-3">
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-dashed border-input bg-muted/50 text-lg font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              <Camera size={24} />
              צלם תמונה
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-dashed border-input bg-muted/50 text-lg font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              <Paperclip size={24} />
              בחר קובץ
            </button>
          </div>
          <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf,.doc,.docx" onChange={handleFileChange} className="hidden" />
          <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />

          {attachments.length > 0 && (
            <div className="space-y-2">
              {attachments.map(att => (
                <div key={att.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted">
                  {att.type.startsWith('image/') ? (
                    <img src={att.url} alt={att.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Paperclip size={24} className="text-primary" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{att.name}</p>
                    <p className="text-sm text-muted-foreground">{(att.size / 1024).toFixed(0)} KB</p>
                  </div>
                  <button onClick={() => removeAttachment(att.id)} className="p-2 rounded-lg hover:bg-destructive/10">
                    <X size={20} className="text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className={`w-full py-5 rounded-xl text-xl font-bold transition-colors ${isValid ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}
        >
          <Plus size={24} className="inline ml-2" />
          שלח דיווח תקלה
        </button>
      </div>
    </div>
  );
}
