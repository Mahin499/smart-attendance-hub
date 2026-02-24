import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_STUDENTS, MOCK_PERIODS, getAttendanceStats } from "@/lib/mock-data";
import StatCard from "@/components/StatCard";
import { BarChart3, TrendingUp, Users, Calendar } from "lucide-react";

export default function Analytics() {
  const stats = getAttendanceStats();

  const weeklyData = [
    { day: "Mon", rate: 92 },
    { day: "Tue", rate: 88 },
    { day: "Wed", rate: 95 },
    { day: "Thu", rate: 85 },
    { day: "Fri", rate: 78 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Attendance Analytics</h1>
        <p className="text-muted-foreground">Detailed insights into attendance patterns</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Avg Attendance" value="87%" icon={BarChart3} variant="accent" trend={{ value: 3, positive: true }} />
        <StatCard title="Total Students" value={MOCK_STUDENTS.length} icon={Users} variant="default" />
        <StatCard title="Active Periods" value={MOCK_PERIODS.filter(p => !p.isFree).length} icon={Calendar} variant="success" />
        <StatCard title="Weekly Trend" value="+5%" icon={TrendingUp} variant="warning" />
      </div>

      {/* Weekly chart placeholder */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-heading">Weekly Attendance Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4 h-48">
            {weeklyData.map(d => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs font-medium text-foreground">{d.rate}%</span>
                <div className="w-full rounded-t-md bg-accent/80" style={{ height: `${d.rate * 1.6}px` }} />
                <span className="text-xs text-muted-foreground">{d.day}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Class-wise breakdown */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-heading">Class-wise Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {["CSE-A", "CSE-B", "ECE-A", "MECH-A"].map((cls, i) => {
              const rate = [92, 85, 88, 79][i];
              return (
                <div key={cls} className="flex items-center gap-4">
                  <span className="text-sm font-medium text-foreground w-20">{cls}</span>
                  <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${rate}%` }} />
                  </div>
                  <span className="text-sm font-medium text-foreground w-12 text-right">{rate}%</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
