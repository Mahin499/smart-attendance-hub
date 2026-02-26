import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import StatCard from "@/components/StatCard";
import { Users, GraduationCap, BarChart3, Camera } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

export default function PrincipalHome() {
  const [facultyCount, setFacultyCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [todayRecords, setTodayRecords] = useState<any[]>([]);
  const [recentFaculty, setRecentFaculty] = useState<any[]>([]);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];

    supabase.from("user_roles").select("user_id").eq("role", "faculty").then(({ data }) => {
      setFacultyCount(data?.length || 0);
      if (data && data.length > 0) {
        supabase.from("profiles").select("*").in("id", data.map(d => d.user_id)).limit(5).then(({ data: profiles }) => {
          setRecentFaculty(profiles || []);
        });
      }
    });

    supabase.from("students").select("id", { count: "exact", head: true }).then(({ count }) => setStudentCount(count || 0));
    supabase.from("attendance_records").select("*").eq("date", today).then(({ data }) => setTodayRecords(data || []));
  }, []);

  const present = todayRecords.filter(r => r.status === "present").length;
  const total = todayRecords.length || 1;
  const percentage = Math.round((present / total) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Principal Dashboard</h1>
        <p className="text-muted-foreground">Overview of your institution's attendance system</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Faculty" value={facultyCount} icon={Users} variant="default" />
        <StatCard title="Total Students" value={studentCount} icon={GraduationCap} variant="accent" />
        <StatCard title="Today's Attendance" value={`${percentage}%`} icon={BarChart3} variant="success" subtitle={`${present} present`} />
        <StatCard title="Records Today" value={todayRecords.length} icon={Camera} variant="warning" />
      </div>

      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-heading">Recent Faculty</CardTitle>
          <Link to="/dashboard/faculty" className="text-sm text-accent hover:underline">View all →</Link>
        </CardHeader>
        <CardContent>
          {recentFaculty.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">No faculty registered yet.</p>
          ) : (
            <div className="divide-y">
              {recentFaculty.map((f: any) => (
                <div key={f.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-accent/20 flex items-center justify-center text-accent font-heading font-bold text-sm">{f.name?.charAt(0) || "?"}</div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{f.name || "—"}</p>
                      <p className="text-xs text-muted-foreground">{f.email}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(f.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
