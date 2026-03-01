import { Outlet, useNavigate } from 'react-router-dom';
import BottomNav, { DesktopSidebar } from '@/components/BottomNav';
import { useAuth } from '@/contexts/AuthContext';
import logo from '@/assets/logo.png';
import { LogOut, X, Eye } from 'lucide-react';
import HelpButton from '@/components/HelpButton';

export default function Layout() {
  const { user, realUser, isImpersonating, stopImpersonation, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Impersonation Banner */}
      {isImpersonating && (
        <div className="bg-warning text-warning-foreground px-4 py-2 flex items-center justify-between text-sm font-bold sticky top-0 z-50 shadow-md">
          <div className="flex items-center gap-2">
            <Eye size={16} />
            <span>מצב צפייה: {user?.full_name} ({user?.company_name})</span>
          </div>
          <button
            onClick={() => {
              stopImpersonation();
              navigate('/user-management');
            }}
            className="flex items-center gap-1 bg-background/20 rounded-lg px-3 py-1 hover:bg-background/40 transition-colors"
          >
            <X size={14} />
            חזרה למנהל על
          </button>
        </div>
      )}

      <DesktopSidebar />

      {/* Mobile header */}
      <header className="md:hidden bg-primary text-primary-foreground p-4 flex items-center justify-between sticky top-0 z-20 shadow-lg">
        <div className="flex items-center gap-3">
          <img src={logo} alt="דליה" className="h-10 brightness-0 invert" />
          <div>
            <h1 className="text-lg font-bold leading-tight">דליה</h1>
            <p className="text-xs opacity-80">{user?.company_name}</p>
          </div>
        </div>
        <button onClick={() => logout()} className="flex items-center gap-2 bg-primary-foreground/20 rounded-xl px-3 py-2 active:scale-95 transition-transform">
          <LogOut size={20} />
          <span className="text-sm font-medium">יציאה</span>
        </button>
      </header>

      {/* Main content */}
      <main className="md:mr-64 pb-24 md:pb-8 p-4 md:p-8">
        <Outlet />
      </main>

      <BottomNav />
      <HelpButton />
    </div>
  );
}
