import { useState } from "react";
import { MOCK_PERIODS, type PeriodConfig as PeriodConfigType } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Clock, Save } from "lucide-react";

export default function PeriodConfigPage() {
  const [periods, setPeriods] = useState<PeriodConfigType[]>(MOCK_PERIODS);

  const toggleFree = (period: number) => {
    setPeriods(prev => prev.map(p => p.period === period ? { ...p, isFree: !p.isFree } : p));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Period Configuration</h1>
          <p className="text-muted-foreground">Configure class periods and free periods</p>
        </div>
        <Button className="gap-2"><Save className="h-4 w-4" />Save Changes</Button>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-heading flex items-center gap-2">
            <Clock className="h-5 w-5 text-accent" />
            Class Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {periods.map(p => (
              <div key={p.period} className={`flex items-center justify-between py-4 ${p.isFree ? "opacity-60" : ""}`}>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-heading font-bold">
                    {p.period}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Period {p.period}</p>
                    <p className="text-xs text-muted-foreground">{p.startTime} – {p.endTime}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    p.isFree ? "bg-warning/10 text-warning" : "bg-success/10 text-success"
                  }`}>
                    {p.isFree ? "Free Period" : "Active"}
                  </span>
                  <Switch checked={p.isFree} onCheckedChange={() => toggleFree(p.period)} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
