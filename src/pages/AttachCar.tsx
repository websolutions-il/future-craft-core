import { useState, useEffect } from 'react';
import { UserCheck, Car, Save, UserPlus, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface VehicleRow { id: string; license_plate: string; manufacturer: string; model: string; assigned_driver_id: string | null; }
interface DriverRow { id: string; full_name: string; email: string; phone: string; }
interface ProfileRow { id: string; full_name: string; phone: string; company_name: string; }

export default function AttachCar() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<VehicleRow[]>([]);
  const [drivers, setDrivers] = useState<DriverRow[]>([]);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [loading, setLoading] = useState(false);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [requestName, setRequestName] = useState('');
  const [requestPhone, setRequestPhone] = useState('');
  const [requestNote, setRequestNote] = useState('');
  const [sendingRequest, setSendingRequest] = useState(false);

  const isSuperAdmin = user?.role === 'super_admin';

  const loadData = async () => {
    const [vRes, dRes, pRes] = await Promise.all([
      supabase.from('vehicles').select('id, license_plate, manufacturer, model, assigned_driver_id'),
      supabase.from('drivers').select('id, full_name, email, phone'),
      supabase.from('profiles').select('id, full_name, phone, company_name'),
    ]);
    if (vRes.data) setVehicles(vRes.data as VehicleRow[]);
    if (dRes.data) setDrivers(dRes.data as DriverRow[]);
    if (pRes.data) setProfiles(pRes.data as ProfileRow[]);
  };

  useEffect(() => { loadData(); }, []);

  const handleAssign = async () => {
    if (!selectedVehicle || !selectedDriver) return;
    setLoading(true);
    const { error } = await supabase
      .from('vehicles')
      .update({ assigned_driver_id: selectedUser || selectedDriver })
      .eq('id', selectedVehicle);
    setLoading(false);
    if (error) {
      toast.error('שגיאה בהצמדת הרכב');
      console.error(error);
    } else {
      toast.success('הרכב הוצמד בהצלחה');
      loadData();
    }
  };

  const handleSendRequest = async () => {
    if (!requestName) return;
    setSendingRequest(true);

    // Find super admin users and send them a notification
    const { data: admins } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'super_admin');

    if (admins && admins.length > 0) {
      const notifications = admins.map((a: any) => ({
        user_id: a.user_id,
        type: 'request',
        title: '📋 בקשה לפתיחת משתמש חדש',
        message: `מנהל צי ${user?.full_name || ''} מבקש לפתוח משתמש חדש: ${requestName}, טלפון: ${requestPhone}. ${requestNote ? 'הערה: ' + requestNote : ''}`,
        link: '/user-management',
      }));
      await supabase.from('driver_notifications').insert(notifications);
    }

    setSendingRequest(false);
    setRequestDialogOpen(false);
    setRequestName('');
    setRequestPhone('');
    setRequestNote('');
    toast.success('הבקשה נשלחה למנהל העל');
  };

  const getDriverName = (driverId: string | null) => {
    if (!driverId) return 'לא משויך';
    const profile = profiles.find(p => p.id === driverId);
    if (profile) return profile.full_name;
    return drivers.find(d => d.id === driverId)?.full_name || 'לא ידוע';
  };

  const inputClass = "w-full p-4 text-lg rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none";

  return (
    <div className="animate-fade-in">
      <h1 className="page-header flex items-center gap-3">
        <UserCheck size={28} />
        הצמדת רכב לנהג
      </h1>

      {/* Assignment Form */}
      <div className="card-elevated mb-6">
        <h2 className="text-lg font-bold mb-4 text-primary">הצמדה חדשה</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-lg font-medium mb-2">בחר רכב</label>
            <select value={selectedVehicle} onChange={e => setSelectedVehicle(e.target.value)} className={inputClass}>
              <option value="">בחר רכב...</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.license_plate} - {v.manufacturer} {v.model}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-lg font-medium mb-2">בחר נהג</label>
            <select value={selectedDriver} onChange={e => setSelectedDriver(e.target.value)} className={inputClass}>
              <option value="">בחר נהג...</option>
              {drivers.map(d => (
                <option key={d.id} value={d.id}>{d.full_name} - {d.phone}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-lg font-medium mb-2">בחר משתמש (לגישה לאפליקציה)</label>
            <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)} className={inputClass}>
              <option value="">בחר משתמש...</option>
              {profiles.map(p => (
                <option key={p.id} value={p.id}>{p.full_name} {p.phone ? `- ${p.phone}` : ''}</option>
              ))}
            </select>
            {/* Request new user button */}
            {!isSuperAdmin && (
              <button onClick={() => setRequestDialogOpen(true)}
                className="mt-2 flex items-center gap-2 text-sm text-primary font-medium hover:underline">
                <UserPlus size={16} /> משתמש לא קיים? שלח בקשה לפתיחת משתמש
              </button>
            )}
            {isSuperAdmin && (
              <a href="/user-management" className="mt-2 flex items-center gap-2 text-sm text-primary font-medium hover:underline">
                <UserPlus size={16} /> פתח משתמש חדש
              </a>
            )}
          </div>
          <button
            onClick={handleAssign}
            disabled={!selectedVehicle || !selectedDriver || loading}
            className={`w-full py-5 rounded-xl text-xl font-bold transition-colors ${selectedVehicle && selectedDriver && !loading ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}
          >
            <Save size={24} className="inline ml-2" />
            {loading ? 'שומר...' : 'שמור הצמדה'}
          </button>
        </div>
      </div>

      {/* Current Assignments */}
      <h2 className="text-xl font-bold mb-4">הצמדות נוכחיות</h2>
      <div className="space-y-3">
        {vehicles.map(v => (
          <div key={v.id} className="card-elevated flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Car size={28} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold">{v.license_plate}</p>
              <p className="text-muted-foreground">{v.manufacturer} {v.model}</p>
            </div>
            <div className="text-left">
              <p className={`text-sm font-medium ${v.assigned_driver_id ? 'text-success' : 'text-muted-foreground'}`}>
                {v.assigned_driver_id ? '✅' : '❌'} {getDriverName(v.assigned_driver_id)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {vehicles.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Car size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-xl">אין רכבים במערכת</p>
        </div>
      )}

      {/* Request New User Dialog */}
      <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl">בקשה לפתיחת משתמש חדש</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm mb-2">הבקשה תישלח למנהל העל לאישור ופתיחת המשתמש.</p>
          <div className="space-y-4">
            <div>
              <label className="block font-medium mb-1">שם מלא *</label>
              <input value={requestName} onChange={e => setRequestName(e.target.value)} className={inputClass} placeholder="שם הנהג/משתמש" />
            </div>
            <div>
              <label className="block font-medium mb-1">טלפון</label>
              <input value={requestPhone} onChange={e => setRequestPhone(e.target.value)} className={inputClass} dir="ltr" style={{ textAlign: 'right' }} placeholder="050-0000000" />
            </div>
            <div>
              <label className="block font-medium mb-1">הערה</label>
              <textarea value={requestNote} onChange={e => setRequestNote(e.target.value)} rows={2} className={`${inputClass} resize-none`} placeholder="פרטים נוספים..." />
            </div>
            <button onClick={handleSendRequest} disabled={!requestName || sendingRequest}
              className={`w-full py-4 rounded-xl text-lg font-bold transition-colors ${requestName && !sendingRequest ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}>
              <Send size={20} className="inline ml-2" />
              {sendingRequest ? 'שולח...' : 'שלח בקשה למנהל על'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
