import { NavLink, useLocation } from 'react-router-dom';
import { Home, Car, Users, Route, Wrench, FileText, AlertTriangle, BarChart3, RefreshCw, Menu, X, LogOut, Settings, Bell, Briefcase, ClipboardList, History, UserCheck, Phone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUnreadNotifications } from '@/hooks/useUnreadNotifications';
import logo from '@/assets/white-logo.png';
import { useState } from 'react';

interface NavItem {
  path: string;
  label: string;
  icon: any;
}

// Manager / Super Admin nav items (categorized)
const managerCategories = [
  {
    title: 'בית',
    items: [
      { path: '/dashboard', label: 'דשבורד', icon: Home },
      { path: '/settings', label: 'הגדרות', icon: Settings },
    ],
  },
  {
    title: 'הצי רכב שלי',
    items: [
      { path: '/vehicles', label: 'רכבים', icon: Car },
      { path: '/drivers', label: 'נהגים', icon: Users },
      { path: '/attach-car', label: 'הצמדת רכב לנהג', icon: UserCheck },
      { path: '/alerts', label: 'התראות', icon: Bell },
      { path: '/faults', label: 'תקלות', icon: Wrench },
      { path: '/history', label: 'היסטוריה', icon: History },
    ],
  },
  {
    title: 'שירותים',
    items: [
      { path: '/service-orders', label: 'הזמנת שירותים', icon: Briefcase },
      { path: '/reports', label: 'דוחות', icon: BarChart3 },
      { path: '/accidents', label: 'דיווח תאונה', icon: AlertTriangle },
      { path: '/routes', label: 'ניהול מסלולים', icon: Route },
      
      { path: '/customers', label: 'לקוחות שלי', icon: Users },
    ],
  },
  {
    title: 'אחר',
    items: [
      { path: '/documents', label: 'מסמכים', icon: FileText },
      { path: '/handover', label: 'החלפת רכב', icon: RefreshCw },
    ],
  },
];

// Manager mobile bottom nav
const managerMobileNav: NavItem[] = [
  { path: '/dashboard', label: 'בית', icon: Home },
  { path: '/alerts', label: 'התראות', icon: Bell },
  { path: '/service-orders', label: 'שירותים', icon: Briefcase },
  { path: '/settings', label: 'הגדרות', icon: Settings },
];

// Driver mobile bottom nav
const driverMobileNav: NavItem[] = [
  { path: '/dashboard', label: 'בית', icon: Home },
  { path: '/driver-notifications', label: 'התראות', icon: Bell },
  { path: '/faults', label: 'תקלה', icon: Wrench },
  { path: '/expenses', label: 'חשבוניות', icon: FileText },
];

// All manager items flat (for "more" menu on mobile)
const allManagerItems = managerCategories.flatMap(c => c.items);

export default function BottomNav() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showMore, setShowMore] = useState(false);
  const unreadCount = useUnreadNotifications();

  const isDriver = user?.role === 'driver';
  const mobileNav = isDriver ? driverMobileNav : managerMobileNav;
  const moreItems = isDriver ? [] : allManagerItems.filter(
    item => !managerMobileNav.some(m => m.path === item.path)
  );

  const isMoreActive = moreItems.some(item => location.pathname.startsWith(item.path));

  return (
    <>
      {/* More menu overlay - only for managers */}
      {showMore && !isDriver && (
        <div className="fixed inset-0 z-40 bg-foreground/50" onClick={() => setShowMore(false)}>
          <div
            className="absolute bottom-[80px] left-0 right-0 bg-card rounded-t-3xl shadow-2xl p-4 animate-fade-in max-h-[60vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4 px-2">
              <h3 className="text-xl font-bold">תפריט נוסף</h3>
              <button onClick={() => setShowMore(false)} className="p-2 rounded-xl bg-muted">
                <X size={24} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {moreItems.map(item => (
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
          {mobileNav.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-item-mobile flex-1 relative ${isActive ? 'text-primary font-bold' : 'text-muted-foreground'}`
              }
            >
              <item.icon size={26} />
              {item.path === '/driver-notifications' && unreadCount > 0 && (
                <span className="absolute top-1 left-1/2 bg-destructive text-destructive-foreground text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
              <span className="text-xs">{item.label}</span>
            </NavLink>
          ))}
          {!isDriver && (
            <button
              onClick={() => setShowMore(!showMore)}
              className={`nav-item-mobile flex-1 ${isMoreActive ? 'text-primary font-bold' : 'text-muted-foreground'}`}
            >
              <Menu size={26} />
              <span className="text-xs">עוד</span>
            </button>
          )}
        </div>
      </nav>
    </>
  );
}

export function DesktopSidebar() {
  const { user, logout } = useAuth();
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({ 'בית': true });
  const unreadCount = useUnreadNotifications();

  const isDriver = user?.role === 'driver';

  const toggleCategory = (title: string) => {
    setOpenCategories(prev => ({ ...prev, [title]: !prev[title] }));
  };

  // Driver gets a simple flat sidebar
  const driverSidebarItems: NavItem[] = [
    { path: '/dashboard', label: 'דשבורד', icon: Home },
    { path: '/driver-notifications', label: 'התראות', icon: Bell },
    { path: '/driver-schedule', label: 'לוח זמנים', icon: ClipboardList },
    { path: '/faults', label: 'דיווח תקלה', icon: Wrench },
    { path: '/expenses', label: 'דלק וחשבוניות', icon: FileText },
    { path: '/accidents', label: 'תאונה וחירום', icon: AlertTriangle },
    { path: '/handover', label: 'החלפת נהג', icon: RefreshCw },
    { path: '/work-orders', label: 'סידור עבודה', icon: ClipboardList },
    { path: '/history', label: 'היסטוריה טיפולים', icon: History },
    { path: '/emergency', label: 'שירותי חירום 24/7', icon: Phone },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-primary text-primary-foreground h-screen fixed right-0 top-0 z-20">
      <div className="p-6 flex flex-col items-center border-b border-primary-foreground/20">
        <img src={logo} alt="דליה" className="h-16 mb-2" />
        <p className="text-sm opacity-80">{user?.full_name}</p>
        <p className="text-xs opacity-60">{user?.company_name}</p>
        <span className="mt-1 text-xs bg-primary-foreground/20 px-3 py-1 rounded-full">
          {user?.role === 'super_admin' ? 'מנהל על' : user?.role === 'fleet_manager' ? 'מנהל צי' : 'נהג'}
        </span>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        {isDriver ? (
          // Simple flat list for drivers
          driverSidebarItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-4 text-lg font-medium transition-colors relative ${
                  isActive ? 'bg-primary-foreground/20 font-bold' : 'hover:bg-primary-foreground/10'
                }`
              }
            >
              <item.icon size={22} />
              <span>{item.label}</span>
              {item.path === '/driver-notifications' && unreadCount > 0 && (
                <span className="bg-destructive text-destructive-foreground text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1 mr-auto">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </NavLink>
          ))
        ) : (
          // Categorized collapsible menu for managers
          managerCategories.map(cat => (
            <div key={cat.title} className="mb-1">
              <button
                onClick={() => toggleCategory(cat.title)}
                className="w-full flex items-center justify-between px-6 py-3 text-sm font-bold opacity-80 hover:opacity-100 transition-opacity"
              >
                <span>{cat.title}</span>
                <span className={`transition-transform ${openCategories[cat.title] ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {openCategories[cat.title] && (
                <div>
                  {cat.items.map(item => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-8 py-3 text-base font-medium transition-colors ${
                          isActive ? 'bg-primary-foreground/20 font-bold' : 'hover:bg-primary-foreground/10'
                        }`
                      }
                    >
                      <item.icon size={20} />
                      <span>{item.label}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </nav>

      <button
        onClick={() => logout()}
        className="flex items-center gap-3 px-6 py-4 text-lg font-medium border-t border-primary-foreground/20 hover:bg-primary-foreground/10 transition-colors"
      >
        <LogOut size={22} />
        <span>התנתקות</span>
      </button>
    </aside>
  );
}
