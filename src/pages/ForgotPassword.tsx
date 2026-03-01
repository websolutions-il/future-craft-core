import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import logo from '@/assets/logo.png';
import { KeyRound, ArrowRight, Loader2, CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('send-password-reset', {
        body: {
          email,
          redirect_url: `${window.location.origin}/reset-password`,
        },
      });

      setLoading(false);
      if (fnError || data?.error) {
        setError('שגיאה בשליחת הקישור. נסה שוב.');
      } else {
        setSent(true);
      }
    } catch {
      setLoading(false);
      setError('שגיאה בשליחת הקישור. נסה שוב.');
    }
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="דליה" className="h-24 mb-4 brightness-0 invert" />
        </div>

        <div className="bg-card rounded-3xl shadow-2xl p-8 space-y-5">
          {sent ? (
            <div className="text-center space-y-4">
              <CheckCircle size={48} className="mx-auto text-green-500" />
              <h2 className="text-2xl font-bold text-foreground">נשלח בהצלחה!</h2>
              <p className="text-muted-foreground">
                קישור לאיפוס סיסמה נשלח לכתובת <strong dir="ltr">{email}</strong>.
                <br />בדוק את תיבת הדואר שלך.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-primary text-primary-foreground text-lg font-bold py-4 rounded-2xl mt-4 hover:opacity-90 transition-all"
              >
                חזרה לכניסה
              </button>
            </div>
          ) : (
            <>
              <div className="text-center">
                <KeyRound size={32} className="mx-auto mb-2 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">שחזור סיסמה</h2>
                <p className="text-muted-foreground mt-1">הכנס את האימייל שלך ונשלח לך קישור לאיפוס</p>
              </div>

              {error && (
                <div className="bg-destructive/10 text-destructive rounded-xl p-4 text-center font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-lg font-medium mb-2">אימייל</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full p-4 text-lg rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none transition-colors"
                    placeholder="הכנס אימייל..." dir="ltr" style={{ textAlign: 'right' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground text-xl font-bold py-5 rounded-2xl shadow-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 size={20} className="animate-spin mx-auto" /> : 'שלח קישור לאיפוס'}
                </button>
              </form>

              <button
                onClick={() => navigate('/login')}
                className="w-full flex items-center justify-center gap-2 text-primary font-medium text-lg py-2"
              >
                <ArrowRight size={18} />
                חזרה לכניסה
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
