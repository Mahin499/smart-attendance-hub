import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import FacultyManagement from "./pages/FacultyManagement";
import StudentManagement from "./pages/StudentManagement";
import LiveAttendance from "./pages/LiveAttendance";
import Analytics from "./pages/Analytics";
import PeriodConfig from "./pages/PeriodConfig";
import Reports from "./pages/Reports";
import DashboardLayout from "./components/DashboardLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <DashboardLayout>{children}</DashboardLayout>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/dashboard/faculty" element={<ProtectedRoute><FacultyManagement /></ProtectedRoute>} />
      <Route path="/dashboard/students" element={<ProtectedRoute><StudentManagement /></ProtectedRoute>} />
      <Route path="/dashboard/attendance" element={<ProtectedRoute><LiveAttendance /></ProtectedRoute>} />
      <Route path="/dashboard/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="/dashboard/periods" element={<ProtectedRoute><PeriodConfig /></ProtectedRoute>} />
      <Route path="/dashboard/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
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

export default App;
