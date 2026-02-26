import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { demoUsers } from '@/data/demo-data';
import logo from '@/assets/logo.png';

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!login(username, password)) {
      setError('שם משתמש או סיסמה שגויים');
    }
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="דליה" className="h-24 mb-4 brightness-0 invert" />
          <h1 className="text-3xl font-bold text-primary-foreground">דליה</h1>
          <p className="text-primary-foreground/70 text-lg mt-1">פתרונות מימון ותפעול לרכב</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-3xl shadow-2xl p-8 space-y-6">
          <h2 className="text-2xl font-bold text-center text-foreground">כניסה למערכת</h2>
          
          {error && (
            <div className="bg-destructive/10 text-destructive rounded-xl p-4 text-center text-lg font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-lg font-medium mb-2">שם משתמש / אימייל</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full p-4 text-lg rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none transition-colors"
              placeholder="הכנס אימייל..."
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-lg font-medium mb-2">קוד אישי</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-4 text-lg rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none transition-colors"
              placeholder="••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground text-xl font-bold py-5 rounded-2xl shadow-lg hover:opacity-90 active:scale-[0.98] transition-all"
          >
            התחבר
          </button>

          <div className="mt-4 p-4 bg-muted rounded-xl">
            <p className="text-sm text-muted-foreground font-medium mb-2">משתמשי דמו:</p>
            {demoUsers.map(u => (
              <button
                key={u.id}
                type="button"
                onClick={() => { setUsername(u.email); login(u.email, ''); }}
                className="block w-full text-right p-2 text-sm hover:bg-secondary rounded-lg transition-colors"
              >
                {u.name} ({u.role === 'super_admin' ? 'מנהל על' : u.role === 'fleet_manager' ? 'מנהל צי' : 'נהג'})
              </button>
            ))}
          </div>
        </form>
      </div>
    </div>
  );
}
