import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import logo from '@/assets/logo.png';

export default function Login() {
  const { login, signup } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (isSignup) {
      const { error } = await signup(email, password, { full_name: fullName, phone, company_name: companyName });
      if (error) {
        setError(error);
      } else {
        // If auto-confirm is on, isAuthenticated will become true and redirect happens
        // Otherwise show message
        setSuccess('נרשמת בהצלחה! בדוק את האימייל לאישור.');
      }
    } else {
      const { error } = await login(email, password);
      if (error) setError('שם משתמש או סיסמה שגויים');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="דליה" className="h-24 mb-4 brightness-0 invert" />
          <h1 className="text-3xl font-bold text-primary-foreground">דליה</h1>
          <p className="text-primary-foreground/70 text-lg mt-1">פתרונות מימון ותפעול לרכב</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-3xl shadow-2xl p-8 space-y-5">
          <h2 className="text-2xl font-bold text-center text-foreground">
            {isSignup ? 'הרשמה למערכת' : 'כניסה למערכת'}
          </h2>

          {error && (
            <div className="bg-destructive/10 text-destructive rounded-xl p-4 text-center text-lg font-medium">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-success/10 text-success rounded-xl p-4 text-center text-lg font-medium">
              {success}
            </div>
          )}

          {isSignup && (
            <>
              <div>
                <label className="block text-lg font-medium mb-2">שם מלא</label>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required
                  className="w-full p-4 text-lg rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none transition-colors"
                  placeholder="הכנס שם מלא..." />
              </div>
              <div>
                <label className="block text-lg font-medium mb-2">טלפון</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  className="w-full p-4 text-lg rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none transition-colors"
                  placeholder="050-1234567" dir="ltr" />
              </div>
              <div>
                <label className="block text-lg font-medium mb-2">שם חברה</label>
                <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)}
                  className="w-full p-4 text-lg rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none transition-colors"
                  placeholder="שם החברה שלך..." />
              </div>
            </>
          )}

          <div>
            <label className="block text-lg font-medium mb-2">אימייל</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full p-4 text-lg rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none transition-colors"
              placeholder="הכנס אימייל..." dir="ltr" />
          </div>

          <div>
            <label className="block text-lg font-medium mb-2">סיסמה</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full p-4 text-lg rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none transition-colors"
              placeholder="••••••" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-primary text-primary-foreground text-xl font-bold py-5 rounded-2xl shadow-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50">
            {loading ? 'טוען...' : isSignup ? 'הירשם' : 'התחבר'}
          </button>

          <button type="button" onClick={() => { setIsSignup(!isSignup); setError(''); setSuccess(''); }}
            className="w-full text-center text-primary font-medium text-lg py-2">
            {isSignup ? 'כבר יש לי חשבון - כניסה' : 'אין לי חשבון - הרשמה'}
          </button>
        </form>
      </div>
    </div>
  );
}
