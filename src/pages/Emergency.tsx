import { useState } from 'react';
import { Phone, AlertTriangle, Car, MapPin, Fuel, Key, Battery, Shield, Clock, Navigation } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface EmergencyService {
  id: string;
  title: string;
  description: string;
  icon: typeof Car;
  phone: string;
  colorCls: string;
}

const emergencyServices: EmergencyService[] = [
  { id: 'tow', title: 'גרר', description: 'שירות גרירה לרכב תקוע', icon: Car, phone: '*8888', colorCls: 'bg-destructive/10 text-destructive' },
  { id: 'tire', title: 'פנצ׳ר / צמיגים', description: 'החלפת צמיג בדרך', icon: Shield, phone: '*8888', colorCls: 'bg-warning/10 text-warning' },
  { id: 'battery', title: 'מצבר / התנעה', description: 'שירות התנעה או החלפת מצבר', icon: Battery, phone: '*8888', colorCls: 'bg-info/10 text-info' },
  { id: 'fuel', title: 'דלק', description: 'מילוי דלק חירום בדרך', icon: Fuel, phone: '*8888', colorCls: 'bg-primary/10 text-primary' },
  { id: 'lockout', title: 'נעילת רכב', description: 'פתיחת רכב נעול / מפתח שבור', icon: Key, phone: '*8888', colorCls: 'bg-accent/10 text-accent-foreground' },
  { id: 'accident', title: 'תאונה', description: 'דיווח וסיוע בתאונת דרכים', icon: AlertTriangle, phone: '100', colorCls: 'bg-destructive/10 text-destructive' },
];

export default function Emergency() {
  const { user } = useAuth();
  const [selectedService, setSelectedService] = useState<EmergencyService | null>(null);
  const [location, setLocation] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [description, setDescription] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const getLocation = () => {
    if (!navigator.geolocation) {
      toast.error('הדפדפן לא תומך במיקום');
      return;
    }
    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation(`${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
        setLoadingLocation(false);
        toast.success('המיקום נקלט');
      },
      () => {
        setLoadingLocation(false);
        toast.error('לא ניתן לקבל מיקום');
      }
    );
  };

  const handleSubmit = async () => {
    if (!selectedService) return;
    setSending(true);

    // Log the emergency request in service_orders
    await supabase.from('service_orders').insert({
      service_category: `חירום - ${selectedService.title}`,
      description: description || selectedService.description,
      vehicle_plate: vehiclePlate,
      driver_name: user?.full_name || '',
      driver_phone: user?.phone || '',
      vendor_name: location,
      treatment_status: 'new',
      notes: `בקשת חירום: ${selectedService.title}. מיקום: ${location}`,
      company_name: user?.company_name || '',
      created_by: user?.id,
      ordering_user: user?.full_name || '',
    });

    setSending(false);
    setSent(true);
    toast.success('בקשת החירום נשלחה!');
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  if (sent) {
    return (
      <div className="animate-fade-in text-center py-12">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Clock size={40} className="text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-3">הבקשה נשלחה!</h1>
        <p className="text-lg text-muted-foreground mb-2">שירות {selectedService?.title} בדרך אליך</p>
        <p className="text-muted-foreground mb-8">מוקד השירות יחזור אליך בהקדם</p>

        <button onClick={() => handleCall(selectedService?.phone || '')}
          className="w-full py-5 rounded-xl bg-primary text-primary-foreground text-xl font-bold flex items-center justify-center gap-3 mb-4">
          <Phone size={24} />
          חייג למוקד
        </button>

        <button onClick={() => { setSelectedService(null); setSent(false); setDescription(''); setLocation(''); }}
          className="w-full py-4 rounded-xl bg-muted text-muted-foreground text-lg font-medium">
          חזרה לשירותי חירום
        </button>
      </div>
    );
  }

  if (selectedService) {
    const Icon = selectedService.icon;
    const inputClass = "w-full p-4 text-lg rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none";

    return (
      <div className="animate-fade-in">
        <button onClick={() => setSelectedService(null)} className="flex items-center gap-2 text-primary text-lg font-medium mb-4 min-h-[48px]">
          ← חזרה
        </button>

        <div className={`w-16 h-16 rounded-2xl ${selectedService.colorCls} flex items-center justify-center mx-auto mb-4`}>
          <Icon size={32} />
        </div>
        <h1 className="text-2xl font-bold text-center mb-1">{selectedService.title}</h1>
        <p className="text-center text-muted-foreground mb-6">{selectedService.description}</p>

        <div className="space-y-4">
          {/* Quick call */}
          <button onClick={() => handleCall(selectedService.phone)}
            className="w-full py-4 rounded-xl bg-destructive text-destructive-foreground text-lg font-bold flex items-center justify-center gap-3">
            <Phone size={22} />
            חייג עכשיו - {selectedService.phone}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center"><span className="bg-background px-4 text-muted-foreground text-sm">או שלח בקשה</span></div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-lg font-medium mb-2">מיקום</label>
            <div className="flex gap-2">
              <input value={location} onChange={e => setLocation(e.target.value)} placeholder="כתובת / צומת / כביש..." className={`flex-1 ${inputClass}`} />
              <button onClick={getLocation} disabled={loadingLocation}
                className="px-4 py-4 rounded-xl bg-primary text-primary-foreground flex-shrink-0">
                <Navigation size={22} className={loadingLocation ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-lg font-medium mb-2">מספר רכב</label>
            <input value={vehiclePlate} onChange={e => setVehiclePlate(e.target.value)} placeholder="12-345-67" className={inputClass} dir="ltr" style={{ textAlign: 'right' }} />
          </div>

          <div>
            <label className="block text-lg font-medium mb-2">פרטים נוספים</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="תאר את המצב..." className={`${inputClass} resize-none`} />
          </div>

          <button onClick={handleSubmit} disabled={sending}
            className="w-full py-5 rounded-xl bg-primary text-primary-foreground text-xl font-bold disabled:opacity-50">
            {sending ? 'שולח...' : '🚨 שלח בקשת חירום'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-3">
          <Phone size={32} className="text-destructive" />
        </div>
        <h1 className="text-2xl font-bold">שירותי חירום 24/7</h1>
        <p className="text-muted-foreground">בחר את סוג השירות הנדרש</p>
      </div>

      {/* Emergency services grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {emergencyServices.map(svc => {
          const Icon = svc.icon;
          return (
            <button key={svc.id} onClick={() => setSelectedService(svc)}
              className="card-elevated flex flex-col items-center text-center p-5 hover:shadow-lg transition-shadow min-h-[140px] justify-center">
              <div className={`w-14 h-14 rounded-2xl ${svc.colorCls} flex items-center justify-center mb-3`}>
                <Icon size={28} />
              </div>
              <p className="text-lg font-bold">{svc.title}</p>
              <p className="text-sm text-muted-foreground mt-1">{svc.description}</p>
            </button>
          );
        })}
      </div>

      {/* Quick call */}
      <button onClick={() => handleCall('*8888')}
        className="w-full py-5 rounded-xl bg-destructive text-destructive-foreground text-xl font-bold flex items-center justify-center gap-3">
        <Phone size={24} />
        חייג למוקד חירום
      </button>

      <p className="text-center text-sm text-muted-foreground mt-4">המוקד פעיל 24 שעות, 7 ימים בשבוע</p>
    </div>
  );
}
