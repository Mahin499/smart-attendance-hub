import StatCard from "@/components/StatCard";
import { Users, Camera, BarChart3, Clock } from "lucide-react";
import { MOCK_STUDENTS, getAttendanceStats, MOCK_PERIODS } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

export default function FacultyHome() {
  const stats = getAttendanceStats();
  const now = new Date();
  const currentHour = now.getHours();
  const currentPeriod = MOCK_PERIODS.find(p => {
    const [sh] = p.startTime.split(":").map(Number);
    const [eh] = p.endTime.split(":").map(Number);
    return currentHour >= sh && currentHour < eh;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Faculty Dashboard</h1>
        <p className="text-muted-foreground">Manage your students and attendance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="My Students" value={MOCK_STUDENTS.length} icon={Users} variant="default" />
        <StatCard title="Today's Attendance" value={`${stats.percentage}%`} icon={BarChart3} variant="success" />
        <StatCard
          title="Current Period"
          value={currentPeriod ? `Period ${currentPeriod.period}` : "No class"}
          icon={Clock}
          variant="accent"
          subtitle={currentPeriod ? `${currentPeriod.startTime} - ${currentPeriod.endTime}` : ""}
        />
        <StatCard title="Absent Today" value={stats.absent} icon={Camera} variant="destructive" />
      </div>

      {/* Quick start attendance */}
      <Card className="shadow-card border-accent/30 bg-accent/5">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="p-4 rounded-xl bg-accent/20">
            <Camera className="h-8 w-8 text-accent" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="font-heading font-bold text-lg text-foreground">Start Live Attendance</h3>
            <p className="text-sm text-muted-foreground">
              Activate camera for AI-powered facial recognition attendance marking
            </p>
          </div>
          <Link
            to="/dashboard/attendance"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent text-accent-foreground font-medium hover:opacity-90 transition-opacity"
          >
            <Camera className="h-4 w-4" />
            Launch Camera
          </Link>
        </CardContent>
      </Card>

      {/* Student List Preview */}
      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-heading">Recent Students</CardTitle>
          <Link to="/dashboard/students" className="text-sm text-accent hover:underline">View all →</Link>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {MOCK_STUDENTS.slice(0, 5).map(s => (
              <div key={s.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-heading font-bold text-sm">
                    {s.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.regNo} • {s.class}</p>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-success/10 text-success font-medium">Present</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
