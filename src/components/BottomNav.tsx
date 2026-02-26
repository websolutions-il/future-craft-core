import { NavLink, useLocation } from 'react-router-dom';
import { Home, Car, Users, Route, FileText, AlertTriangle, BarChart3, Map, Wrench, Menu, X, LogOut, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import logo from '@/assets/white-logo.png';
import { useState } from 'react';

const navItems = [
  { path: '/dashboard', label: 'ראשי', icon: Home },
  { path: '/vehicles', label: 'רכבים', icon: Car },
  { path: '/drivers', label: 'נהגים', icon: Users },
  { path: '/customers', label: 'לקוחות', icon: Users },
  { path: '/routes', label: 'מסלולים', icon: Route },
  { path: '/faults', label: 'תקלות', icon: Wrench },
  { path: '/handover', label: 'החלפת רכב', icon: RefreshCw },
  { path: '/documents', label: 'מסמכים', icon: FileText },
  { path: '/accidents', label: 'תאונות', icon: AlertTriangle },
  { path: '/reports', label: 'דוחות', icon: BarChart3 },
  { path: '/roadmap', label: 'תוכנית', icon: Map },
];

// Mobile: show first 4 in bottom nav, rest in "more" menu
const mobileNavItems = navItems.slice(0, 4);
const moreNavItems = navItems.slice(4);

export default function BottomNav() {
  const { logout } = useAuth();
  const location = useLocation();
  const [showMore, setShowMore] = useState(false);

  const isMoreActive = moreNavItems.some(item => location.pathname.startsWith(item.path));

  return (
    <>
      {/* More menu overlay */}
      {showMore && (
        <div className="fixed inset-0 z-40 bg-foreground/50" onClick={() => setShowMore(false)}>
          <div 
            className="absolute bottom-[80px] left-0 right-0 bg-card rounded-t-3xl shadow-2xl p-4 animate-fade-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4 px-2">
              <h3 className="text-xl font-bold">תפריט נוסף</h3>
              <button onClick={() => setShowMore(false)} className="p-2 rounded-xl bg-muted">
                <X size={24} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {moreNavItems.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setShowMore(false)}
                  className={({ isActive }) =>
                    `big-action-btn ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`
                  }
                >
                  <item.icon size={32} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
              <button
                onClick={() => { setShowMore(false); logout(); }}
                className="big-action-btn bg-destructive/10 text-destructive"
              >
                <LogOut size={32} />
                <span>התנתקות</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom navigation bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-card border-t-2 border-border shadow-[0_-4px_20px_rgba(0,0,0,0.1)] md:hidden">
        <div className="flex justify-around items-center px-1">
          {mobileNavItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-item-mobile flex-1 ${isActive ? 'text-primary font-bold' : 'text-muted-foreground'}`
              }
            >
              <item.icon size={26} />
              <span className="text-xs">{item.label}</span>
            </NavLink>
          ))}
          <button
            onClick={() => setShowMore(!showMore)}
            className={`nav-item-mobile flex-1 ${isMoreActive ? 'text-primary font-bold' : 'text-muted-foreground'}`}
          >
            <Menu size={26} />
            <span className="text-xs">עוד</span>
          </button>
        </div>
      </nav>
    </>
  );
}

export function DesktopSidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-primary text-primary-foreground min-h-screen fixed right-0 top-0 z-20">
      <div className="p-6 flex flex-col items-center border-b border-primary-foreground/20">
        <img src={logo} alt="דליה" className="h-16 mb-2" />
        <p className="text-sm opacity-80">{user?.name}</p>
        <p className="text-xs opacity-60">{user?.companyName}</p>
      </div>
      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-4 text-lg font-medium transition-colors ${
                isActive ? 'bg-primary-foreground/20 font-bold' : 'hover:bg-primary-foreground/10'
              }`
            }
          >
            <item.icon size={22} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <button
        onClick={logout}
        className="flex items-center gap-3 px-6 py-4 text-lg font-medium border-t border-primary-foreground/20 hover:bg-primary-foreground/10 transition-colors"
      >
        <LogOut size={22} />
        <span>התנתקות</span>
      </button>
    </aside>
  );
}
