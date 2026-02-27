import { useState, useEffect } from 'react';
import { UserCheck, Car, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface VehicleRow { id: string; license_plate: string; manufacturer: string; model: string; assigned_driver_id: string | null; }
interface DriverRow { id: string; full_name: string; email: string; phone: string; }

export default function AttachCar() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<VehicleRow[]>([]);
  const [drivers, setDrivers] = useState<DriverRow[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.from('vehicles').select('id, license_plate, manufacturer, model, assigned_driver_id').then(({ data }) => {
      if (data) setVehicles(data as VehicleRow[]);
    });
    supabase.from('drivers').select('id, full_name, email, phone').then(({ data }) => {
      if (data) setDrivers(data as DriverRow[]);
    });
  }, []);

  const handleAssign = async () => {
    if (!selectedVehicle || !selectedDriver) return;
    setLoading(true);
    const { error } = await supabase
      .from('vehicles')
      .update({ assigned_driver_id: selectedDriver })
      .eq('id', selectedVehicle);
    setLoading(false);
    if (error) {
      toast.error('שגיאה בהצמדת הרכב');
      console.error(error);
    } else {
      toast.success('הרכב הוצמד לנהג בהצלחה');
      // Refresh
      const { data } = await supabase.from('vehicles').select('id, license_plate, manufacturer, model, assigned_driver_id');
      if (data) setVehicles(data as VehicleRow[]);
    }
  };

  const getDriverName = (driverId: string | null) => {
    if (!driverId) return 'לא משויך';
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
    </div>
  );
}
