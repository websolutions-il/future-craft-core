import { useState, useEffect } from 'react';
import { FileText, Search, Plus, Upload, Download, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function Documents() {
  const { user } = useAuth();

  return (
    <div className="animate-fade-in">
      <h1 className="page-header flex items-center gap-3"><FileText size={28} /> מסמכים</h1>

      <div className="card-elevated mb-4">
        <h2 className="text-lg font-bold mb-3">מסמכי רכב</h2>
        <p className="text-muted-foreground mb-4">ניהול מסמכים ואישורים לרכבי הצי - טסט, ביטוח, רישיון רכב</p>
        <div className="grid grid-cols-2 gap-3">
          <DocCategory label="רישיונות רכב" icon="🚗" count={0} />
          <DocCategory label="ביטוח חובה" icon="🛡️" count={0} />
          <DocCategory label="ביטוח מקיף" icon="📋" count={0} />
          <DocCategory label="טסט" icon="✅" count={0} />
        </div>
      </div>

      <div className="card-elevated mb-4">
        <h2 className="text-lg font-bold mb-3">מסמכי נהגים</h2>
        <p className="text-muted-foreground mb-4">רישיונות נהיגה, תעודות, אישורים</p>
        <div className="grid grid-cols-2 gap-3">
          <DocCategory label="רישיונות נהיגה" icon="🪪" count={0} />
          <DocCategory label="אישורי בריאות" icon="🏥" count={0} />
          <DocCategory label="הסכמי עבודה" icon="📝" count={0} />
          <DocCategory label="אחר" icon="📎" count={0} />
        </div>
      </div>

      <div className="card-elevated">
        <h2 className="text-lg font-bold mb-3">חשבוניות והוצאות</h2>
        <p className="text-muted-foreground mb-4">חשבוניות דלק, תחזוקה וספקים</p>
        <div className="grid grid-cols-2 gap-3">
          <DocCategory label="חשבוניות דלק" icon="⛽" count={0} />
          <DocCategory label="חשבוניות תחזוקה" icon="🔧" count={0} />
          <DocCategory label="חשבוניות ספקים" icon="🏪" count={0} />
          <DocCategory label="קבלות" icon="🧾" count={0} />
        </div>
      </div>

      <p className="text-center text-muted-foreground mt-8 text-sm">
        📌 העלאת מסמכים תהיה זמינה בשלב הבא
      </p>
    </div>
  );
}

function DocCategory({ label, icon, count }: { label: string; icon: string; count: number }) {
  return (
    <div className="p-4 rounded-xl bg-muted/50 border border-border flex items-center gap-3">
      <span className="text-2xl">{icon}</span>
      <div className="flex-1">
        <p className="font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{count} מסמכים</p>
      </div>
    </div>
  );
}
