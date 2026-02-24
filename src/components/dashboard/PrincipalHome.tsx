import StatCard from "@/components/StatCard";
import { Users, UserPlus, GraduationCap, BarChart3, Camera } from "lucide-react";
import { MOCK_FACULTY, MOCK_STUDENTS, getAttendanceStats } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrincipalHome() {
  const stats = getAttendanceStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Principal Dashboard</h1>
        <p className="text-muted-foreground">Overview of your institution's attendance system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Faculty" value={MOCK_FACULTY.length} icon={Users} variant="default" trend={{ value: 12, positive: true }} />
        <StatCard title="Total Students" value={MOCK_STUDENTS.length} icon={GraduationCap} variant="accent" />
        <StatCard title="Today's Attendance" value={`${stats.percentage}%`} icon={BarChart3} variant="success" subtitle="Period 1" />
        <StatCard title="Active Sessions" value={2} icon={Camera} variant="warning" subtitle="Live now" />
      </div>

      {/* Recent Faculty */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-heading">Recent Faculty</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {MOCK_FACULTY.map(f => (
              <div key={f.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-accent/20 flex items-center justify-center text-accent font-heading font-bold text-sm">
                    {f.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{f.name}</p>
                    <p className="text-xs text-muted-foreground">{f.department}</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{f.joinedDate}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Attendance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-heading">Attendance Breakdown (Period 1)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: "Present", count: stats.present, color: "bg-success" },
                { label: "Absent", count: stats.absent, color: "bg-destructive" },
                { label: "Sleepy", count: stats.sleepy, color: "bg-warning" },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full ${item.color}`} />
                  <span className="text-sm text-foreground flex-1">{item.label}</span>
                  <span className="text-sm font-medium text-foreground">{item.count}</span>
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color}`}
                      style={{ width: `${(item.count / stats.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-heading">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {[
              { label: "Add Faculty", icon: UserPlus, desc: "Register new faculty" },
              { label: "View Reports", icon: BarChart3, desc: "Attendance analytics" },
              { label: "Manage Students", icon: GraduationCap, desc: "Student records" },
              { label: "Period Config", icon: Camera, desc: "Time schedules" },
            ].map(action => (
              <button
                key={action.label}
                className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-center"
              >
                <action.icon className="h-6 w-6 text-accent" />
                <span className="text-sm font-medium text-foreground">{action.label}</span>
                <span className="text-xs text-muted-foreground">{action.desc}</span>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
