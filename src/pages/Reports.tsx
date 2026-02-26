import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, FileSpreadsheet, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";

interface PeriodConfig {
  period_number: number;
  start_time: string;
  end_time: string;
  is_free: boolean;
}

export default function Reports() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [periods, setPeriods] = useState<PeriodConfig[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.from("period_config").select("*").order("period_number").then(({ data }) => setPeriods(data || []));
  }, []);

  const exportExcel = async () => {
    if (!user) return;
    setLoading(true);

    // Build query
    let query = supabase
      .from("attendance_records")
      .select("*, students(name, reg_no, class)")
      .eq("date", date);

    if (user.role === "faculty") {
      query = query.eq("recorded_by", user.id);
    }

    if (selectedPeriod !== "all") {
      query = query.eq("period_number", Number(selectedPeriod));
    }

    const { data, error } = await query.order("period_number");

    setLoading(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    if (!data || data.length === 0) {
      toast({ title: "No data", description: "No attendance records found for this date/period." });
      return;
    }

    // Format for Excel
    const rows = data.map((r: any) => ({
      "Student Name": r.students?.name || "—",
      "Register No": r.students?.reg_no || "—",
      "Class": r.students?.class || "—",
      "Period": r.period_number,
      "Status": r.status.charAt(0).toUpperCase() + r.status.slice(1),
      "Date": r.date,
      "Recorded At": new Date(r.created_at).toLocaleTimeString(),
    }));

    const wb = XLSX.utils.book_new();

    if (selectedPeriod === "all") {
      // Group by period
      const periodGroups: Record<number, any[]> = {};
      rows.forEach((r: any) => {
        const p = r.Period;
        if (!periodGroups[p]) periodGroups[p] = [];
        periodGroups[p].push(r);
      });

      // Add "All" sheet
      const wsAll = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, wsAll, "All Periods");

      // Add per-period sheets
      Object.entries(periodGroups).forEach(([pNum, pRows]) => {
        const ws = XLSX.utils.json_to_sheet(pRows);
        XLSX.utils.book_append_sheet(wb, ws, `Period ${pNum}`);
      });
    } else {
      const ws = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, `Period ${selectedPeriod}`);
    }

    XLSX.writeFile(wb, `attendance_${date}_${selectedPeriod === "all" ? "all-periods" : `period-${selectedPeriod}`}.xlsx`);
    toast({ title: "Exported!", description: "Excel file downloaded." });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Reports & Export</h1>
        <p className="text-muted-foreground">Download attendance reports as Excel sheets</p>
      </div>

      <Card className="shadow-card">
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Period</Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Periods</SelectItem>
                  {periods.map(p => (
                    <SelectItem key={p.period_number} value={String(p.period_number)}>
                      Period {p.period_number} ({p.start_time} – {p.end_time})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={exportExcel} disabled={loading} className="w-full gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Download Excel
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
            <div className="flex-1 flex items-center gap-4 p-4 rounded-lg bg-success/5 border border-success/20">
              <div className="p-3 rounded-xl bg-success/10"><FileSpreadsheet className="h-8 w-8 text-success" /></div>
              <div>
                <h3 className="font-heading font-bold text-foreground">Full Day Report</h3>
                <p className="text-sm text-muted-foreground">Select "All Periods" to get a multi-sheet Excel with each period on its own tab</p>
              </div>
            </div>
            <div className="flex-1 flex items-center gap-4 p-4 rounded-lg bg-accent/5 border border-accent/20">
              <div className="p-3 rounded-xl bg-accent/10"><FileSpreadsheet className="h-8 w-8 text-accent" /></div>
              <div>
                <h3 className="font-heading font-bold text-foreground">Period-wise Report</h3>
                <p className="text-sm text-muted-foreground">Select a specific period to export that period's attendance only</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
