import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User, Building2, Phone, Mail, Moon, Sun, LogOut, Shield, Save, ChevronLeft, Download, Database, FolderDown, BookOpen, Package } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [companyName, setCompanyName] = useState(user?.company_name || '');
  const [saving, setSaving] = useState(false);

  // Password change
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name);
      setPhone(user.phone);
      setCompanyName(user.company_name);
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, phone, company_name: companyName, updated_at: new Date().toISOString() })
      .eq('id', user.id);
    setSaving(false);
    if (error) {
      toast.error('שגיאה בעדכון הפרופיל');
      console.error(error);
    } else {
      toast.success('הפרופיל עודכן בהצלחה');
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast.error('הסיסמה חייבת להכיל לפחות 6 תווים');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('הסיסמאות לא תואמות');
      return;
    }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPassword(false);
    if (error) {
      toast.error('שגיאה בשינוי הסיסמה');
    } else {
      toast.success('הסיסמה שונתה בהצלחה');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordSection(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const roleLabels: Record<string, string> = {
    driver: 'נהג',
    fleet_manager: 'מנהל צי',
    super_admin: 'מנהל על',
  };

  const inputClass = "w-full p-4 text-lg rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none";

  return (
    <div className="animate-fade-in">
      <h1 className="page-header flex items-center gap-3">
        <SettingsIcon size={28} />
        הגדרות
      </h1>

      {/* Profile Section */}
      <div className="card-elevated mb-4">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <User size={24} className="text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">פרטים אישיים</h2>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>
          <span className="mr-auto status-badge status-active">{roleLabels[user?.role || 'driver']}</span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-base font-medium mb-1.5">שם מלא</label>
            <input value={fullName} onChange={e => setFullName(e.target.value)} className={inputClass} placeholder="השם שלך..." />
          </div>
          <div>
            <label className="block text-base font-medium mb-1.5">טלפון</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className={inputClass} placeholder="050-..." dir="ltr" style={{ textAlign: 'right' }} />
          </div>
          <div>
            <label className="block text-base font-medium mb-1.5">שם חברה</label>
            <input value={companyName} onChange={e => setCompanyName(e.target.value)} className={inputClass} placeholder="שם החברה..." />
          </div>
          <button onClick={handleSaveProfile} disabled={saving}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground text-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50">
            <Save size={20} />
            {saving ? 'שומר...' : 'שמור שינויים'}
          </button>
        </div>
      </div>

      {/* Theme */}
      <div className="card-elevated mb-4">
        <button onClick={toggleTheme} className="w-full flex items-center gap-4 min-h-[56px]">
          <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
            {theme === 'dark' ? <Moon size={24} className="text-accent-foreground" /> : <Sun size={24} className="text-accent-foreground" />}
          </div>
          <div className="flex-1 text-right">
            <p className="text-lg font-bold">מצב תצוגה</p>
            <p className="text-muted-foreground">{theme === 'dark' ? 'מצב כהה' : 'מצב בהיר'}</p>
          </div>
          <div className={`w-14 h-8 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-primary' : 'bg-muted'}`}>
            <div className={`absolute top-1 w-6 h-6 rounded-full bg-background shadow transition-all ${theme === 'dark' ? 'right-1' : 'left-1'}`} />
          </div>
        </button>
      </div>

      {/* Password */}
      <div className="card-elevated mb-4">
        <button onClick={() => setShowPasswordSection(!showPasswordSection)} className="w-full flex items-center gap-4 min-h-[56px]">
          <div className="w-12 h-12 rounded-2xl bg-warning/10 flex items-center justify-center">
            <Shield size={24} className="text-warning" />
          </div>
          <div className="flex-1 text-right">
            <p className="text-lg font-bold">שינוי סיסמה</p>
            <p className="text-muted-foreground">עדכן את סיסמת הכניסה שלך</p>
          </div>
          <ChevronLeft size={20} className={`text-muted-foreground transition-transform ${showPasswordSection ? 'rotate-90' : ''}`} />
        </button>

        {showPasswordSection && (
          <div className="mt-4 space-y-4 border-t border-border pt-4">
            <div>
              <label className="block text-base font-medium mb-1.5">סיסמה חדשה</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className={inputClass} placeholder="לפחות 6 תווים..." />
            </div>
            <div>
              <label className="block text-base font-medium mb-1.5">אימות סיסמה</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={inputClass} placeholder="הקלד שוב..." />
            </div>
            <button onClick={handleChangePassword} disabled={changingPassword || !newPassword}
              className="w-full py-4 rounded-xl bg-warning text-warning-foreground text-lg font-bold disabled:opacity-50">
              {changingPassword ? 'משנה...' : 'שנה סיסמה'}
            </button>
          </div>
        )}
      </div>

      {/* Backup section - super_admin only */}
      {(user?.role === 'super_admin') && (
        <div className="card-elevated space-y-3">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Download size={24} className="text-primary" />
            </div>
            <div>
              <p className="text-lg font-bold">גיבוי מערכת</p>
              <p className="text-sm text-muted-foreground">הורדת גיבוי מלא של הנתונים והקבצים</p>
            </div>
          </div>
          <BackupButton type="data" label="גיבוי נתונים (DATA)" icon={<Database size={20} />} description="כל הטבלאות בפורמט JSON" />
          <BackupButton type="files" label="גיבוי קבצים (FILES)" icon={<FolderDown size={20} />} description="רשימת קבצים + קישורי הורדה" />
          <FullExportButton />

          <div className="border-t border-border pt-3 mt-2">
            <RestoreGuideButton />
          </div>
        </div>
      )}

      {/* Logout */}
      <div className="card-elevated">
        <button onClick={handleLogout} className="w-full flex items-center gap-4 min-h-[56px] text-destructive">
          <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center">
            <LogOut size={24} />
          </div>
          <p className="text-lg font-bold">התנתקות</p>
        </button>
      </div>

      {/* App info */}
      <p className="text-center text-sm text-muted-foreground mt-8">דליה v1.0 • פתרונות מימון ותפעול לרכב</p>
    </div>
  );
}

function RestoreGuideButton() {
  const [open, setOpen] = useState(false);

  const guideContent = `
# 📘 מדריך שחזור גיבוי — דליה מערכת ניהול צי

## שלב 1: הקמת פרויקט Supabase חדש
1. היכנסו ל-supabase.com וצרו חשבון + פרויקט חדש
2. ב-SQL Editor, צרו את כל הטבלאות (ניתן לייצא Schema מהפרויקט הישן)
3. הגדירו את הפונקציות (handle_new_user, has_role, get_user_company)
4. צרו Storage Bucket בשם "documents" (Public)

## שלב 2: שחזור נתונים (DATA)
1. התקינו Node.js על המחשב
2. צרו קובץ restore-data.js:

\`\`\`javascript
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const supabase = createClient('https://YOUR_PROJECT.supabase.co', 'SERVICE_ROLE_KEY');

const TABLE_ORDER = [
  'profiles','user_roles','vehicles','drivers','customers','suppliers',
  'companions','company_settings','company_subscriptions','faults',
  'fault_messages','fault_status_log','fault_referrals','expenses',
  'accidents','service_orders','service_order_messages','vehicle_handovers',
  'vehicle_exchanges','vehicle_inspections','inspection_items','routes',
  'trip_logs','customer_deals','customer_agreements','vehicle_companions',
  'custom_alerts','document_metadata','driver_health_declarations',
  'driver_declarations','driver_notifications','internal_messages',
  'emergency_categories','emergency_logs','promotions','system_logs',
  'temporary_drivers','dev_tasks','approval_requests','work_assignments',
  'work_assignment_messages','work_assignment_status_log','supplier_work_orders'
];

async function restore() {
  const backup = JSON.parse(fs.readFileSync('backup_data_YYYY-MM-DD.json','utf8'));
  for (const table of TABLE_ORDER) {
    const rows = backup.tables[table];
    if (!rows?.length) continue;
    for (let i = 0; i < rows.length; i += 500) {
      const { error } = await supabase.from(table).upsert(rows.slice(i,i+500),{onConflict:'id'});
      if (error) console.error(table, error.message);
    }
    console.log(table + ': ' + rows.length + ' rows');
  }
}
restore();
\`\`\`

3. הריצו: npm install @supabase/supabase-js && node restore-data.js

## שלב 3: שחזור קבצים (FILES)
⚠️ קישורי ההורדה תקפים לשעה בלבד! הורידו מיד.

1. צרו קובץ restore-files.js בדומה לנ"ל
2. הסקריפט מוריד כל קובץ ומעלה ל-Storage החדש

## שלב 4: הגדרת שרת (VPS)
1. שרת VPS (Hostinger / DigitalOcean)
2. התקנת Nginx + Node.js + Certbot
3. שכפול הקוד מ-GitHub
4. עדכון .env עם פרטי Supabase החדש
5. npm install && npm run build
6. העתקת dist/ ל-/var/www/dalia/
7. הגדרת Nginx + SSL

## שלב 5: חיבור
1. ב-Supabase: הגדרת Site URL + Redirect URLs
2. פריסת Edge Functions: supabase functions deploy
3. הגדרת Secrets (RESEND_API_KEY וכו')

## שלב 6: בדיקות
✅ התחברות עם super_admin
✅ נתונים מופיעים (נהגים, רכבים, לקוחות)
✅ קבצים ותמונות נטענים
✅ התראות ואימיילים עובדים

⚠️ סיסמאות משתמשים: לא ניתנות לייצוא. שלחו "שכחתי סיסמה" או הגדירו חדשות.
`;

  const handleDownloadGuide = () => {
    const blob = new Blob([guideContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `restore_guide_${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-primary/30 hover:bg-primary/5 transition-colors"
      >
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <BookOpen size={20} className="text-primary" />
        </div>
        <div className="text-right flex-1">
          <p className="font-bold text-sm">📘 מדריך שחזור גיבוי</p>
          <p className="text-xs text-muted-foreground">איך להעביר את הגיבוי לשרת + Supabase פרטי</p>
        </div>
        <ChevronLeft size={18} className={`text-muted-foreground transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>

      {open && (
        <div className="mt-3 p-4 rounded-xl bg-muted/50 border border-border space-y-3 text-sm leading-relaxed">
          <div className="space-y-2">
            <h4 className="font-bold text-base">🔄 תהליך שחזור מלא:</h4>
            <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground">
              <li><strong>הקמת Supabase חדש</strong> — צרו פרויקט ב-supabase.com, צרו את הטבלאות והפונקציות</li>
              <li><strong>שחזור DATA</strong> — הריצו סקריפט Node.js שמכניס את כל הנתונים מקובץ הגיבוי</li>
              <li><strong>שחזור FILES</strong> — הורדת כל הקבצים והעלאתם ל-Storage החדש</li>
              <li><strong>הגדרת שרת</strong> — VPS עם Nginx, בנייה מ-GitHub, חיבור ל-Supabase החדש</li>
              <li><strong>Edge Functions</strong> — פריסה עם Supabase CLI + הגדרת Secrets</li>
              <li><strong>בדיקות</strong> — התחברות, נתונים, קבצים, התראות</li>
            </ol>
          </div>

          <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
            <p className="text-warning font-medium text-xs">⚠️ קישורי הורדת קבצים תקפים לשעה בלבד! הורידו מיד אחרי יצירת הגיבוי.</p>
          </div>
          
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-xs text-muted-foreground">💡 סיסמאות משתמשים לא ניתנות לייצוא. אחרי שחזור, שלחו "שכחתי סיסמה" לכל המשתמשים או הגדירו סיסמאות חדשות.</p>
          </div>

          <button
            onClick={handleDownloadGuide}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2"
          >
            <Download size={16} />
            הורד מדריך מלא (עם סקריפטים)
          </button>
        </div>
      )}
    </>
  );
}

function BackupButton({ type, label, icon, description }: { type: 'data' | 'files'; label: string; icon: React.ReactNode; description: string }) {
  const [loading, setLoading] = useState(false);

  const handleBackup = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('יש להתחבר מחדש');
        return;
      }

      const res = await supabase.functions.invoke('backup-data', {
        body: { type },
      });

      if (res.error) {
        toast.error('שגיאה בגיבוי: ' + res.error.message);
        return;
      }

      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_${type}_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      const tableCount = res.data?.table_counts
        ? Object.values(res.data.table_counts as Record<string, number>).reduce((a: number, b: number) => a + b, 0)
        : res.data?.total_files || 0;
      toast.success(`גיבוי הושלם! ${type === 'data' ? `${tableCount} רשומות` : `${tableCount} קבצים`}`);
    } catch (e) {
      toast.error('שגיאה בלתי צפויה');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleBackup}
      disabled={loading}
      className="w-full flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-accent/50 transition-colors disabled:opacity-50"
    >
      <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="text-right flex-1">
        <p className="font-bold text-sm">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      {loading && <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
    </button>
  );
}

function FullExportButton() {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    if (!confirm('ייצוא Supabase מלא כולל מפתחות שירות (Service Role) ו-Database URL. שמור את הקובץ במקום מאובטח. להמשיך?')) return;
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error('יש להתחבר מחדש'); return; }

      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/full-supabase-export`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        const err = await res.text();
        toast.error('שגיאה בייצוא: ' + err);
        return;
      }

      const blob = await res.blob();
      const dlUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = dlUrl;
      a.download = `full_supabase_export_${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(dlUrl);
      toast.success('ייצוא Supabase מלא הושלם!');
    } catch (e) {
      toast.error('שגיאה בלתי צפויה');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-primary bg-primary/5 hover:bg-primary/10 transition-colors disabled:opacity-50"
    >
      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
        <Package size={20} className="text-primary" />
      </div>
      <div className="text-right flex-1">
        <p className="font-bold text-sm">Full Supabase Export (ZIP)</p>
        <p className="text-xs text-muted-foreground">Schema DDL + Migrations + Auth + RLS + Storage + Secrets keys + Config</p>
      </div>
      {loading && <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
    </button>
  );
}
