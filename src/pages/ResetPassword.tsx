import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import logo from '@/assets/logo.png';
import { KeyRound, Loader2, CheckCircle } from 'lucide-react';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isRecovery, setIsRecovery] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovery(true);
      }
    });

    // Also check hash for type=recovery
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setIsRecovery(true);
    }

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('סיסמה חייבת להכיל לפחות 6 תווים');
      return;
    }
    if (password !== confirmPassword) {
      setError('הסיסמאות אינן תואמות');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError('שגיאה בעדכון הסיסמה. נסה שוב.');
    } else {
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    }
  };

  if (!isRecovery) {
    return (
      <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-card rounded-3xl shadow-2xl p-8 text-center space-y-4">
          <KeyRound size={48} className="mx-auto text-muted-foreground" />
          <h2 className="text-xl font-bold text-foreground">קישור לא תקין</h2>
          <p className="text-muted-foreground">הקישור לאיפוס סיסמה אינו תקין או שפג תוקפו.</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-primary text-primary-foreground text-lg font-bold py-4 rounded-2xl hover:opacity-90 transition-all"
          >
            חזרה לכניסה
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="דליה" className="h-24 mb-4 brightness-0 invert" />
        </div>

        <div className="bg-card rounded-3xl shadow-2xl p-8 space-y-5">
          {success ? (
            <div className="text-center space-y-4">
              <CheckCircle size={48} className="mx-auto text-green-500" />
              <h2 className="text-2xl font-bold text-foreground">סיסמה עודכנה!</h2>
              <p className="text-muted-foreground">מעביר אותך למערכת...</p>
            </div>
          ) : (
            <>
              <div className="text-center">
                <KeyRound size={32} className="mx-auto mb-2 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">הגדרת סיסמה חדשה</h2>
              </div>

              {error && (
                <div className="bg-destructive/10 text-destructive rounded-xl p-4 text-center font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-lg font-medium mb-2">סיסמה חדשה</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full p-4 text-lg rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none transition-colors"
                    placeholder="לפחות 6 תווים"
                  />
                </div>
                <div>
                  <label className="block text-lg font-medium mb-2">אישור סיסמה</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full p-4 text-lg rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none transition-colors"
                    placeholder="הכנס שוב את הסיסמה"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground text-xl font-bold py-5 rounded-2xl shadow-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 size={20} className="animate-spin mx-auto" /> : 'עדכן סיסמה'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
