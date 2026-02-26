import { Outlet } from 'react-router-dom';
import BottomNav, { DesktopSidebar } from '@/components/BottomNav';
import { useAuth } from '@/contexts/AuthContext';
import logo from '@/assets/logo.png';

export default function Layout() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <DesktopSidebar />
      
      {/* Mobile header */}
      <header className="md:hidden bg-primary text-primary-foreground p-4 flex items-center justify-between sticky top-0 z-20 shadow-lg">
        <div className="flex items-center gap-3">
          <img src={logo} alt="דליה" className="h-10 brightness-0 invert" />
          <div>
            <h1 className="text-lg font-bold leading-tight">דליה</h1>
            <p className="text-xs opacity-80">{user?.companyName}</p>
          </div>
        </div>
        <div className="text-left">
          <p className="text-sm font-medium">{user?.name}</p>
        </div>
      </header>

      {/* Main content */}
      <main className="md:mr-64 pb-24 md:pb-8 p-4 md:p-8">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}
