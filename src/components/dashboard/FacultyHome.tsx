import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import StatCard from "@/components/StatCard";
import { Users, Camera, BarChart3, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

export default function FacultyHome() {
  const { user } = useAuth();
  const [studentCount, setStudentCount] = useState(0);
  const [students, setStudents] = useState<any[]>([]);
  const [todayRecords, setTodayRecords] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];

    supabase.from("students").select("*").eq("faculty_id", user.id).order("name").limit(5).then(({ data }) => {
      setStudents(data || []);
      setStudentCount(data?.length || 0);
    });

    supabase.from("attendance_records").select("*").eq("recorded_by", user.id).eq("date", today).then(({ data }) => {
      setTodayRecords(data || []);
    });
  }, [user]);

  const present = todayRecords.filter(r => r.status === "present").length;
  const absent = todayRecords.filter(r => r.status === "absent").length;
  const total = todayRecords.length || 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Faculty Dashboard</h1>
        <p className="text-muted-foreground">Manage your students and attendance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="My Students" value={studentCount} icon={Users} variant="default" />
        <StatCard title="Present Today" value={present} icon={BarChart3} variant="success" />
        <StatCard title="Absent Today" value={absent} icon={Camera} variant="destructive" />
        <StatCard title="Records Today" value={todayRecords.length} icon={Clock} variant="accent" />
      </div>

      <Card className="shadow-card border-accent/30 bg-accent/5">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="p-4 rounded-xl bg-accent/20"><Camera className="h-8 w-8 text-accent" /></div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="font-heading font-bold text-lg text-foreground">Start Live Attendance</h3>
            <p className="text-sm text-muted-foreground">Activate camera for AI-powered facial recognition attendance marking</p>
          </div>
          <Link to="/dashboard/attendance" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent text-accent-foreground font-medium hover:opacity-90 transition-opacity">
            <Camera className="h-4 w-4" />Launch Camera
          </Link>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-heading">Recent Students</CardTitle>
          <Link to="/dashboard/students" className="text-sm text-accent hover:underline">View all →</Link>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">No students yet. Add your first student!</p>
          ) : (
            <div className="divide-y">
              {students.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    {s.photo_url ? (
                      <img src={s.photo_url} alt={s.name} className="h-9 w-9 rounded-full object-cover" />
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-heading font-bold text-sm">{s.name.charAt(0)}</div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-foreground">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.reg_no} • {s.class}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
