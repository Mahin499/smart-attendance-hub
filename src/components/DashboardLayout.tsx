import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  GraduationCap, LayoutDashboard, Users, UserPlus,
  Camera, LogOut, ChevronLeft, ChevronRight, BarChart3, Clock, FileSpreadsheet
} from "lucide-react";

const principalNav = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Faculty", icon: Users, path: "/dashboard/faculty" },
  { label: "Students", icon: UserPlus, path: "/dashboard/students" },
  { label: "Analytics", icon: BarChart3, path: "/dashboard/analytics" },
  { label: "Period Config", icon: Clock, path: "/dashboard/periods" },
  { label: "Reports", icon: FileSpreadsheet, path: "/dashboard/reports" },
];

const facultyNav = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Students", icon: UserPlus, path: "/dashboard/students" },
  { label: "Live Attendance", icon: Camera, path: "/dashboard/attendance" },
  { label: "Reports", icon: FileSpreadsheet, path: "/dashboard/reports" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = user?.role === "principal" ? principalNav : facultyNav;

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className={`${collapsed ? "w-16" : "w-64"} bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300 shrink-0`}>
        <div className="flex items-center gap-2 px-4 h-16 border-b border-sidebar-border">
          <GraduationCap className="h-7 w-7 text-sidebar-primary shrink-0" />
          {!collapsed && <span className="font-heading font-bold text-lg text-sidebar-foreground truncate">Smart Attendance</span>}
        </div>
        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"}`}>
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="p-2 border-t border-sidebar-border space-y-1">
          <button onClick={() => setCollapsed(!collapsed)} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 transition-colors">
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            {!collapsed && <span>Collapse</span>}
          </button>
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-destructive/20 hover:text-destructive transition-colors">
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b bg-card flex items-center justify-between px-6 shrink-0">
          <h2 className="font-heading font-semibold text-foreground">{navItems.find(n => n.path === location.pathname)?.label || "Dashboard"}</h2>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">{user?.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
            </div>
            <div className="h-9 w-9 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-heading font-bold text-sm">
              {user?.name?.charAt(0)}
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <div className="animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}
