import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Truck } from 'lucide-react';

interface FaultTowingProps {
  faultId: string;
  towingRequired: boolean;
  towingApproved: boolean | null;
  towingApprovedBy: string;
  towingApprovedAt: string | null;
  towingCompleted: boolean | null;
  towingCompletedAt: string | null;
  isManager: boolean;
  onUpdate: () => void;
}

export default function FaultTowing({ faultId, towingRequired, towingApproved, towingApprovedBy, towingApprovedAt, towingCompleted, towingCompletedAt, isManager, onUpdate }: FaultTowingProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleToggleTowing = async (required: boolean) => {
    setLoading(true);
    await supabase.from('faults').update({ towing_required: required, towing_approved: null, towing_approved_by: '', towing_approved_at: null, towing_completed: null, towing_completed_at: null }).eq('id', faultId);
    toast.success(required ? 'סומן כנדרש שינוע' : 'שינוע בוטל');
    setLoading(false);
    onUpdate();
  };

  const handleApproveTowing = async (approve: boolean) => {
    setLoading(true);
    await supabase.from('faults').update({
      towing_approved: approve,
      towing_approved_by: user?.full_name || '',
      towing_approved_at: new Date().toISOString(),
    }).eq('id', faultId);
    toast.success(approve ? 'שינוע אושר' : 'שינוע נדחה');
    setLoading(false);
    onUpdate();
  };

  const handleCompleteTowing = async (completed: boolean) => {
    setLoading(true);
    await supabase.from('faults').update({
      towing_completed: completed,
      towing_completed_at: completed ? new Date().toISOString() : null,
    }).eq('id', faultId);
    toast.success(completed ? 'שינוע בוצע' : 'שינוע סומן כלא בוצע');
    setLoading(false);
    onUpdate();
  };

  return (
    <div className="card-elevated">
      <h3 className="text-lg font-bold mb-3 flex items-center gap-2"><Truck size={18} /> שינוע</h3>

      {/* Toggle required */}
      <div className="flex gap-2 mb-3">
        <button onClick={() => handleToggleTowing(true)} disabled={loading}
          className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors ${towingRequired ? 'bg-warning/20 text-warning border-2 border-warning/40' : 'bg-muted text-muted-foreground'}`}>
          נדרש שינוע
        </button>
        <button onClick={() => handleToggleTowing(false)} disabled={loading}
          className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors ${!towingRequired ? 'bg-green-500/20 text-green-600 border-2 border-green-500/40' : 'bg-muted text-muted-foreground'}`}>
          לא נדרש
        </button>
      </div>

      {towingRequired && (
        <div className="space-y-2 p-3 bg-muted/30 rounded-xl">
          {/* Approval */}
          {towingApproved === null && isManager && (
            <div className="flex gap-2">
              <button onClick={() => handleApproveTowing(true)} className="flex-1 py-2 rounded-lg bg-green-500/10 text-green-600 text-sm font-bold">✅ אשר שינוע</button>
              <button onClick={() => handleApproveTowing(false)} className="flex-1 py-2 rounded-lg bg-destructive/10 text-destructive text-sm font-bold">❌ דחה</button>
            </div>
          )}
          {towingApproved === null && !isManager && (
            <p className="text-sm text-warning text-center">⏳ ממתין לאישור שינוע</p>
          )}
          {towingApproved === true && (
            <p className="text-sm text-green-600">✅ שינוע אושר ע"י {towingApprovedBy} • {towingApprovedAt ? new Date(towingApprovedAt).toLocaleDateString('he-IL') : ''}</p>
          )}
          {towingApproved === false && (
            <p className="text-sm text-destructive">❌ שינוע נדחה ע"י {towingApprovedBy}</p>
          )}

          {/* Completion */}
          {towingApproved === true && towingCompleted === null && isManager && (
            <div className="flex gap-2">
              <button onClick={() => handleCompleteTowing(true)} className="flex-1 py-2 rounded-lg bg-green-500/10 text-green-600 text-sm font-bold">בוצע</button>
              <button onClick={() => handleCompleteTowing(false)} className="flex-1 py-2 rounded-lg bg-destructive/10 text-destructive text-sm font-bold">לא בוצע</button>
            </div>
          )}
          {towingCompleted === true && (
            <p className="text-sm text-green-600">🚛 שינוע בוצע • {towingCompletedAt ? new Date(towingCompletedAt).toLocaleDateString('he-IL') + ' ' + new Date(towingCompletedAt).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }) : ''}</p>
          )}
          {towingCompleted === false && (
            <p className="text-sm text-destructive">שינוע לא בוצע</p>
          )}
        </div>
      )}
    </div>
  );
}
