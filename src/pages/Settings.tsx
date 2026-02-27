import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User, Building2, Phone, Mail, Moon, Sun, LogOut, Shield, Save, ChevronLeft } from 'lucide-react';
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
