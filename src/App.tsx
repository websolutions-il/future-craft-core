import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ThemeToggle from "@/components/ThemeToggle";
import Layout from "@/components/Layout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Vehicles from "@/pages/Vehicles";
import Drivers from "@/pages/Drivers";
import Customers from "@/pages/Customers";
import RoutesPage from "@/pages/RoutesPage";
import Faults from "@/pages/Faults";
import VehicleHandover from "@/pages/VehicleHandover";
import Documents from "@/pages/Documents";
import Accidents from "@/pages/Accidents";
import Reports from "@/pages/Reports";
import Roadmap from "@/pages/Roadmap";
import Settings from "@/pages/Settings";
import AttachCar from "@/pages/AttachCar";
import Alerts from "@/pages/Alerts";
import HistoryPage from "@/pages/History";
import ServiceOrders from "@/pages/ServiceOrders";
import DriverView from "@/pages/DriverView";
import Expenses from "@/pages/Expenses";
import WorkOrders from "@/pages/WorkOrders";
import Emergency from "@/pages/Emergency";
import DriverNotifications from "@/pages/DriverNotifications";
import DriverWeeklySchedule from "@/pages/DriverWeeklySchedule";
import UserManagement from "@/pages/UserManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-lg">טוען...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Navigate to="/dashboard" replace />} />
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/vehicles" element={<Vehicles />} />
        <Route path="/drivers" element={<Drivers />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/routes" element={<RoutesPage />} />
        <Route path="/faults" element={<Faults />} />
        <Route path="/handover" element={<VehicleHandover />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/accidents" element={<Accidents />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/attach-car" element={<AttachCar />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/service-orders" element={<ServiceOrders />} />
        <Route path="/driver-view" element={<DriverView />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/work-orders" element={<WorkOrders />} />
        <Route path="/emergency" element={<Emergency />} />
        <Route path="/driver-notifications" element={<DriverNotifications />} />
        <Route path="/driver-schedule" element={<DriverWeeklySchedule />} />
        <Route path="/user-management" element={<UserManagement />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <ThemeToggle />
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
