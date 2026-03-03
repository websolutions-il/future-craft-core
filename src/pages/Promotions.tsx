import { useState, useEffect } from 'react';
import { Tag, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Promotion {
  id: string;
  title: string;
  description: string;
  image_url: string;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
}

export default function Promotions() {
  const { user } = useAuth();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const isSuperAdmin = user?.role === 'super_admin';

  useEffect(() => {
    supabase.from('promotions').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setPromotions(data as Promotion[]);
    });
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-header !mb-0 flex items-center gap-3"><Tag size={28} /> מבצעים</h1>
        {isSuperAdmin && (
          <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-lg font-bold">
            <Plus size={22} /> מבצע חדש
          </button>
        )}
      </div>
      {promotions.length === 0 ? (
        <div className="card-elevated text-center py-12">
          <Tag size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-xl text-muted-foreground">אין מבצעים פעילים</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {promotions.map(p => (
            <div key={p.id} className="card-elevated">
              {p.image_url && <img src={p.image_url} alt={p.title} className="w-full h-40 object-cover rounded-xl mb-3" />}
              <h2 className="text-xl font-bold">{p.title}</h2>
              <p className="text-muted-foreground mt-1">{p.description}</p>
              {p.end_date && <p className="text-xs text-muted-foreground mt-2">עד {new Date(p.end_date).toLocaleDateString('he-IL')}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
