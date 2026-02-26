import { Car, Users, Wrench, AlertTriangle, Route, FileText, TrendingUp, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { demoVehicles, demoDrivers, demoFaults, demoAccidents, demoRoutes, roleLabels } from '@/data/demo-data';

export default function Dashboard() {
  const { user } = useAuth();

  const stats = [
    { label: 'רכבים פעילים', value: demoVehicles.filter(v => v.status === 'active').length, total: demoVehicles.length, icon: Car, color: 'bg-primary text-primary-foreground', link: '/vehicles' },
    { label: 'נהגים פעילים', value: demoDrivers.filter(d => d.status === 'active').length, total: demoDrivers.length, icon: Users, color: 'bg-info text-info-foreground', link: '/drivers' },
    { label: 'תקלות פתוחות', value: demoFaults.filter(f => f.status === 'new').length, total: demoFaults.length, icon: Wrench, color: 'bg-warning text-warning-foreground', link: '/faults' },
    { label: 'תאונות פתוחות', value: demoAccidents.filter(a => a.status !== 'closed').length, total: demoAccidents.length, icon: AlertTriangle, color: 'bg-destructive text-destructive-foreground', link: '/accidents' },
  ];

  const quickActions = [
    { label: 'דיווח תקלה', icon: Wrench, link: '/faults', color: 'bg-warning text-warning-foreground' },
    { label: 'דיווח תאונה', icon: AlertTriangle, link: '/accidents', color: 'bg-destructive text-destructive-foreground' },
    { label: 'העלאת מסמך', icon: FileText, link: '/documents', color: 'bg-info text-info-foreground' },
    { label: 'מסלולים', icon: Route, link: '/routes', color: 'bg-success text-success-foreground' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="page-header">שלום, {user?.name} 👋</h1>
        <p className="text-lg text-muted-foreground">
          {roleLabels[user?.role || '']} • {user?.companyName}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {stats.map(stat => (
          <Link key={stat.label} to={stat.link} className={`stat-card ${stat.color} hover:scale-[1.02] transition-transform`}>
            <stat.icon size={32} />
            <span className="text-3xl font-black">{stat.value}</span>
            <span className="text-sm font-medium opacity-90">{stat.label}</span>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <h2 className="text-xl font-bold mb-4">פעולות מהירות</h2>
      <div className="grid grid-cols-2 gap-4 mb-8">
        {quickActions.map(action => (
          <Link key={action.label} to={action.link} className={`big-action-btn ${action.color}`}>
            <action.icon size={36} />
            <span>{action.label}</span>
          </Link>
        ))}
      </div>

      {/* Recent Faults */}
      <h2 className="text-xl font-bold mb-4">תקלות אחרונות</h2>
      <div className="space-y-3">
        {demoFaults.slice(0, 3).map(fault => (
          <div key={fault.id} className="card-elevated flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${fault.urgency === 'critical' ? 'bg-destructive' : fault.urgency === 'urgent' ? 'bg-warning' : 'bg-info'}`} />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-lg truncate">{fault.faultType} - {fault.vehiclePlate}</p>
              <p className="text-muted-foreground">{fault.driverName} • {fault.date}</p>
            </div>
            <span className="status-badge status-new text-sm">חדש</span>
          </div>
        ))}
      </div>

      {/* Active Routes */}
      <h2 className="text-xl font-bold mb-4 mt-8">מסלולים פעילים</h2>
      <div className="space-y-3">
        {demoRoutes.filter(r => r.status === 'active').slice(0, 3).map(route => (
          <div key={route.id} className="card-elevated">
            <div className="flex items-center justify-between mb-2">
              <p className="font-bold text-lg">{route.name}</p>
              <span className="status-badge status-active">פעיל</span>
            </div>
            <p className="text-muted-foreground">{route.origin} → {route.destination}</p>
            {route.driverName && <p className="text-sm text-muted-foreground mt-1">נהג: {route.driverName}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
