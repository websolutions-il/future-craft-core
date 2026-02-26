import { useState, useRef } from 'react';
import { demoVehicles, demoDrivers, FaultAttachment } from '@/data/demo-data';
import { ArrowRight, Camera, MapPin, Navigation, X, Plus, Car, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

type ActionType = 'pickup' | 'return';

interface VehicleConditionItem {
  label: string;
  status: 'ok' | 'damaged' | 'missing';
}

const conditionItems: string[] = [
  'מצב חיצוני - שריטות/מכות',
  'צמיגים',
  'אורות',
  'מראות',
  'ניקיון פנימי',
  'דלק',
  'מיזוג אוויר',
  'רדיו / מולטימדיה',
  'חגורות בטיחות',
  'גלגל רזרבי',
  'משולש אזהרה',
  'מטף כיבוי',
];

const conditionStatusLabels: Record<string, { text: string; cls: string }> = {
  ok: { text: 'תקין', cls: 'bg-success/15 text-success border-success/30' },
  damaged: { text: 'פגום', cls: 'bg-warning/15 text-warning border-warning/30' },
  missing: { text: 'חסר', cls: 'bg-destructive/15 text-destructive border-destructive/30' },
};

export default function VehicleHandover() {
  const [action, setAction] = useState<ActionType>('pickup');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [odometer, setOdometer] = useState('');
  const [vehicleNotes, setVehicleNotes] = useState('');
  
  const [fromDriver, setFromDriver] = useState('');
  const [fromDriverPhone, setFromDriverPhone] = useState('');
  const [toDriver, setToDriver] = useState('');
  const [toDriverPhone, setToDriverPhone] = useState('');
  
  const [pickupDate, setPickupDate] = useState(new Date().toISOString().split('T')[0]);
  const [pickupTime, setPickupTime] = useState(new Date().toTimeString().slice(0, 5));
  const [locationName, setLocationName] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  
  const [conditions, setConditions] = useState<VehicleConditionItem[]>(
    conditionItems.map(label => ({ label, status: 'ok' }))
  );
  const [conditionNotes, setConditionNotes] = useState('');
  const [photos, setPhotos] = useState<FaultAttachment[]>([]);
  const cameraRef = useRef<HTMLInputElement>(null);

  const selectedVehicle = demoVehicles.find(v => v.licensePlate === vehiclePlate);

  // Auto-fill driver phone when selected
  const handleFromDriverChange = (name: string) => {
    setFromDriver(name);
    const driver = demoDrivers.find(d => d.fullName === name);
    if (driver) setFromDriverPhone(driver.phone);
  };

  const handleToDriverChange = (name: string) => {
    setToDriver(name);
    const driver = demoDrivers.find(d => d.fullName === name);
    if (driver) setToDriverPhone(driver.phone);
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      toast.error('הדפדפן לא תומך במיקום');
      return;
    }
    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=he`);
          const data = await res.json();
          setLocationAddress(data.display_name || `${latitude}, ${longitude}`);
          setLocationName(data.address?.city || data.address?.town || data.address?.village || '');
        } catch {
          setLocationAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        }
        setIsLoadingLocation(false);
        toast.success('המיקום נקלט בהצלחה');
      },
      () => {
        setIsLoadingLocation(false);
        toast.error('לא הצלחנו לקבל מיקום, אנא אשר גישה למיקום');
      },
      { enableHighAccuracy: true }
    );
  };

  const openInMap = () => {
    if (locationAddress) {
      window.open(`https://www.google.com/maps/search/${encodeURIComponent(locationAddress)}`, '_blank');
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newPhotos: FaultAttachment[] = Array.from(files).map(file => ({
      id: crypto.randomUUID(),
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file),
    }));
    setPhotos(prev => [...prev, ...newPhotos]);
    e.target.value = '';
  };

  const removePhoto = (id: string) => {
    setPhotos(prev => {
      const p = prev.find(a => a.id === id);
      if (p) URL.revokeObjectURL(p.url);
      return prev.filter(a => a.id !== id);
    });
  };

  const updateCondition = (index: number, status: 'ok' | 'damaged' | 'missing') => {
    setConditions(prev => prev.map((c, i) => i === index ? { ...c, status } : c));
  };

  const isValid = vehiclePlate && fromDriver && toDriver && pickupDate && pickupTime;

  const handleSubmit = () => {
    if (!isValid) return;
    toast.success('טופס החלפת רכב נשלח בהצלחה');
    // Reset form or navigate away
  };

  const inputClass = "w-full p-4 text-lg rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none";

  return (
    <div className="animate-fade-in">
      <h1 className="page-header">טופס החלפת רכב</h1>

      {/* Action Type */}
      <div className="card-elevated mb-5">
        <h2 className="text-lg font-bold mb-3 text-primary">פעולת רכב</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setAction('pickup')}
            className={`flex-1 py-4 rounded-xl text-lg font-bold border-2 transition-colors ${action === 'pickup' ? 'border-primary bg-primary/10 text-primary' : 'bg-muted text-muted-foreground border-transparent'}`}
          >
            🔑 לקיחה
          </button>
          <button
            onClick={() => setAction('return')}
            className={`flex-1 py-4 rounded-xl text-lg font-bold border-2 transition-colors ${action === 'return' ? 'border-primary bg-primary/10 text-primary' : 'bg-muted text-muted-foreground border-transparent'}`}
          >
            🔄 החזרה
          </button>
        </div>
      </div>

      {/* Vehicle Details */}
      <div className="card-elevated mb-5">
        <h2 className="text-lg font-bold mb-4 text-primary">פרטי רכב</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-lg font-medium mb-2">מספר רכב</label>
            <select value={vehiclePlate} onChange={e => setVehiclePlate(e.target.value)} className={inputClass}>
              <option value="">בחר רכב...</option>
              {demoVehicles.map(v => (
                <option key={v.id} value={v.licensePlate}>{v.licensePlate} - {v.manufacturer} {v.model}</option>
              ))}
            </select>
          </div>
          {selectedVehicle && (
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-muted">
              <div><span className="text-sm text-muted-foreground">סוג רכב</span><p className="font-bold">{selectedVehicle.vehicleType}</p></div>
              <div><span className="text-sm text-muted-foreground">יצרן</span><p className="font-bold">{selectedVehicle.manufacturer}</p></div>
              <div><span className="text-sm text-muted-foreground">דגם</span><p className="font-bold">{selectedVehicle.model}</p></div>
              <div><span className="text-sm text-muted-foreground">שנה</span><p className="font-bold">{selectedVehicle.year}</p></div>
            </div>
          )}
          <div>
            <label className="block text-lg font-medium mb-2">קילומטראז' נוכחי</label>
            <input type="number" value={odometer} onChange={e => setOdometer(e.target.value)} placeholder="הכנס קילומטראז'..." className={inputClass} />
          </div>
          <div>
            <label className="block text-lg font-medium mb-2">הערות רכב (אופציונלי)</label>
            <textarea value={vehicleNotes} onChange={e => setVehicleNotes(e.target.value)} rows={2} placeholder="הערות על הרכב..." className={`${inputClass} resize-none`} />
          </div>
        </div>
      </div>

      {/* Driver Exchange */}
      <div className="card-elevated mb-5">
        <h2 className="text-lg font-bold mb-4 text-primary">טופס {action === 'pickup' ? 'לקיחה' : 'החזרה'}</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-lg font-medium mb-2">נהג מוסר</label>
            <select value={fromDriver} onChange={e => handleFromDriverChange(e.target.value)} className={inputClass}>
              <option value="">בחר נהג...</option>
              {demoDrivers.map(d => (
                <option key={d.id} value={d.fullName}>{d.fullName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-lg font-medium mb-2">טלפון נהג מוסר</label>
            <input type="tel" value={fromDriverPhone} onChange={e => setFromDriverPhone(e.target.value)} placeholder="מספר טלפון..." className={inputClass} />
          </div>
          <div>
            <label className="block text-lg font-medium mb-2">נהג מקבל</label>
            <select value={toDriver} onChange={e => handleToDriverChange(e.target.value)} className={inputClass}>
              <option value="">בחר נהג...</option>
              {demoDrivers.filter(d => d.fullName !== fromDriver).map(d => (
                <option key={d.id} value={d.fullName}>{d.fullName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-lg font-medium mb-2">טלפון נהג מקבל (לוואטסאפ)</label>
            <input type="tel" value={toDriverPhone} onChange={e => setToDriverPhone(e.target.value)} placeholder="מספר טלפון..." className={inputClass} />
          </div>
        </div>
      </div>

      {/* Date, Time & Location */}
      <div className="card-elevated mb-5">
        <h2 className="text-lg font-bold mb-4 text-primary">תאריך, שעה ומיקום</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-lg font-medium mb-2">תאריך {action === 'pickup' ? 'לקיחה' : 'החזרה'}</label>
              <input type="date" value={pickupDate} onChange={e => setPickupDate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-lg font-medium mb-2">שעת {action === 'pickup' ? 'לקיחה' : 'החזרה'}</label>
              <input type="time" value={pickupTime} onChange={e => setPickupTime(e.target.value)} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-lg font-medium mb-2">מיקום</label>
            <input type="text" value={locationName} onChange={e => setLocationName(e.target.value)} placeholder="שם המיקום..." className={inputClass} />
          </div>
          <div>
            <label className="block text-lg font-medium mb-2">כתובת / נקודת ציון</label>
            <input type="text" value={locationAddress} onChange={e => setLocationAddress(e.target.value)} placeholder="כתובת מלאה..." className={inputClass} />
          </div>
          <div className="flex gap-3">
            <button
              onClick={getLocation}
              disabled={isLoadingLocation}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-primary/30 bg-primary/5 text-lg font-medium text-primary hover:bg-primary/10 transition-colors"
            >
              <Navigation size={22} className={isLoadingLocation ? 'animate-spin' : ''} />
              {isLoadingLocation ? 'מאתר...' : 'קח מיקום מהטלפון'}
            </button>
            <button
              onClick={openInMap}
              disabled={!locationAddress}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-input bg-muted/50 text-lg font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
            >
              <MapPin size={22} />
              פתח במפה
            </button>
          </div>
        </div>
      </div>

      {/* Vehicle Condition */}
      <div className="card-elevated mb-5">
        <h2 className="text-lg font-bold mb-4 text-primary">מצב הרכב בעת {action === 'pickup' ? 'לקיחה' : 'החזרה'}</h2>
        <div className="space-y-3">
          {conditions.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
              <span className="text-base font-medium flex-1">{item.label}</span>
              <div className="flex gap-1">
                {(['ok', 'damaged', 'missing'] as const).map(status => {
                  const sl = conditionStatusLabels[status];
                  return (
                    <button
                      key={status}
                      onClick={() => updateCondition(idx, status)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${item.status === status ? sl.cls + ' border-current' : 'bg-background text-muted-foreground border-transparent'}`}
                    >
                      {sl.text}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <label className="block text-lg font-medium mb-2">הערות מצב רכב</label>
          <textarea value={conditionNotes} onChange={e => setConditionNotes(e.target.value)} rows={2} placeholder="פירוט נזקים או הערות..." className={`${inputClass} resize-none`} />
        </div>
      </div>

      {/* Photos */}
      <div className="card-elevated mb-5">
        <h2 className="text-lg font-bold mb-4 text-primary">תמונות רכב</h2>
        <button
          onClick={() => cameraRef.current?.click()}
          className="w-full flex items-center justify-center gap-3 py-5 rounded-xl border-2 border-dashed border-input bg-muted/50 text-xl font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors"
        >
          <Camera size={28} />
          📸 צלם תמונה
        </button>
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" multiple onChange={handlePhotoChange} className="hidden" />
        
        {photos.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-3">
            {photos.map(p => (
              <div key={p.id} className="relative">
                <img src={p.url} alt={p.name} className="w-full h-24 rounded-xl object-cover" />
                <button onClick={() => removePhoto(p.id)} className="absolute top-1 left-1 p-1 rounded-full bg-destructive text-destructive-foreground">
                  <X size={14} />
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
        className={`w-full py-5 rounded-xl text-xl font-bold transition-colors mb-6 ${isValid ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}
      >
        <RefreshCw size={24} className="inline ml-2" />
        שלח טופס {action === 'pickup' ? 'לקיחה' : 'החזרה'}
      </button>
    </div>
  );
}
