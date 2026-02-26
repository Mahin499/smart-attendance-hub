import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatCard from "@/components/StatCard";
import { BarChart3, TrendingUp, Users, Calendar } from "lucide-react";

export default function Analytics() {
  const { user } = useAuth();
  const [studentCount, setStudentCount] = useState(0);
  const [records, setRecords] = useState<any[]>([]);
  const [periodCount, setPeriodCount] = useState(0);

  useEffect(() => {
    supabase.from("students").select("id", { count: "exact", head: true }).then(({ count }) => setStudentCount(count || 0));
    supabase.from("period_config").select("id", { count: "exact", head: true }).eq("is_free", false).then(({ count }) => setPeriodCount(count || 0));

    // Get last 7 days of records
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    let query = supabase.from("attendance_records").select("*").gte("date", weekAgo.toISOString().split("T")[0]);
    if (user?.role === "faculty") query = query.eq("recorded_by", user.id);
    query.then(({ data }) => setRecords(data || []));
  }, [user]);

  const present = records.filter(r => r.status === "present").length;
  const total = records.length || 1;
  const avgAttendance = Math.round((present / total) * 100);

  // Group by date
  const byDate: Record<string, { total: number; present: number }> = {};
  records.forEach(r => {
    if (!byDate[r.date]) byDate[r.date] = { total: 0, present: 0 };
    byDate[r.date].total++;
    if (r.status === "present") byDate[r.date].present++;
  });

  const dailyRates = Object.entries(byDate).sort().slice(-5).map(([date, { total, present }]) => ({
    day: new Date(date).toLocaleDateString("en", { weekday: "short" }),
    rate: Math.round((present / total) * 100),
  }));

  // Group by class (via students join)
  const statusCounts = {
    present: records.filter(r => r.status === "present").length,
    absent: records.filter(r => r.status === "absent").length,
    sleepy: records.filter(r => r.status === "sleepy").length,
    talking: records.filter(r => r.status === "talking").length,
    "not-attentive": records.filter(r => r.status === "not-attentive").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Attendance Analytics</h1>
        <p className="text-muted-foreground">Insights from the last 7 days</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Avg Attendance" value={`${avgAttendance}%`} icon={BarChart3} variant="accent" />
        <StatCard title="Total Students" value={studentCount} icon={Users} variant="default" />
        <StatCard title="Active Periods" value={periodCount} icon={Calendar} variant="success" />
        <StatCard title="Total Records" value={records.length} icon={TrendingUp} variant="warning" />
      </div>

      <Card className="shadow-card">
        <CardHeader><CardTitle className="font-heading">Daily Attendance Rate</CardTitle></CardHeader>
        <CardContent>
          {dailyRates.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No attendance data yet.</p>
          ) : (
            <div className="flex items-end gap-4 h-48">
              {dailyRates.map(d => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs font-medium text-foreground">{d.rate}%</span>
                  <div className="w-full rounded-t-md bg-accent/80" style={{ height: `${Math.max(d.rate * 1.6, 8)}px` }} />
                  <span className="text-xs text-muted-foreground">{d.day}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader><CardTitle className="font-heading">Status Breakdown (7 days)</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(statusCounts).map(([label, count]) => (
              <div key={label} className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${label === "present" ? "bg-success" : label === "absent" ? "bg-destructive" : label === "sleepy" ? "bg-warning" : "bg-info"}`} />
                <span className="text-sm text-foreground flex-1 capitalize">{label.replace("-", " ")}</span>
                <span className="text-sm font-medium text-foreground">{count}</span>
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${label === "present" ? "bg-success" : label === "absent" ? "bg-destructive" : label === "sleepy" ? "bg-warning" : "bg-info"}`}
                    style={{ width: `${total > 0 ? (count / total) * 100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
