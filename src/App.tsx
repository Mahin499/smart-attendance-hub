import { Toaster } from "@/components/ui/toaster";
import { Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import RoleSetup from "./pages/RoleSetup";
import Dashboard from "./pages/Dashboard";
import FacultyManagement from "./pages/FacultyManagement";
import StudentManagement from "./pages/StudentManagement";
import LiveAttendance from "./pages/LiveAttendance";
import Analytics from "./pages/Analytics";
import PeriodConfig from "./pages/PeriodConfig";
import Reports from "./pages/Reports";
import Setup from "./pages/Setup";
import Health from "./pages/Health";
import DashboardLayout from "./components/DashboardLayout";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>;
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (!user?.role) return <Navigate to="/setup" replace />;
  return <DashboardLayout>{children}</DashboardLayout>;
}

function AppRoutes() {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>;

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? (user?.role ? <Navigate to="/dashboard" replace /> : <Navigate to="/setup" replace />) : <Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/setup" element={isAuthenticated ? (user?.role ? <Navigate to="/dashboard" replace /> : <RoleSetup />) : <Navigate to="/" replace />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/dashboard/faculty" element={<ProtectedRoute><FacultyManagement /></ProtectedRoute>} />
      <Route path="/dashboard/students" element={<ProtectedRoute><StudentManagement /></ProtectedRoute>} />
      <Route path="/dashboard/attendance" element={<ProtectedRoute><LiveAttendance /></ProtectedRoute>} />
      <Route path="/dashboard/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="/dashboard/periods" element={<ProtectedRoute><PeriodConfig /></ProtectedRoute>} />
      <Route path="/dashboard/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route path="/health" element={<Health />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const AppContent = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

const App = () => {
  // If Supabase is not configured, show the setup page first
  if (!isSupabaseConfigured()) {
    return <Setup />;
  }
  
  return <AppContent />;
};

export default App;
