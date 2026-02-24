import { useAuth } from "@/lib/auth-context";
import PrincipalDashboard from "@/components/dashboard/PrincipalHome";
import FacultyHome from "@/components/dashboard/FacultyHome";

export default function Dashboard() {
  const { user } = useAuth();
  return user?.role === "principal" ? <PrincipalDashboard /> : <FacultyHome />;
}
