import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Clock, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PeriodConfig {
  id: string;
  period_number: number;
  start_time: string;
  end_time: string;
  is_free: boolean;
}

export default function PeriodConfigPage() {
  const { toast } = useToast();
  const [periods, setPeriods] = useState<PeriodConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("period_config").select("*").order("period_number").then(({ data }) => {
      setPeriods(data || []);
      setLoading(false);
    });
  }, []);

  const toggleFree = (periodNumber: number) => {
    setPeriods(prev => prev.map(p => p.period_number === periodNumber ? { ...p, is_free: !p.is_free } : p));
  };

  const saveChanges = async () => {
    setSaving(true);
    for (const p of periods) {
      await supabase.from("period_config").update({ is_free: p.is_free }).eq("id", p.id);
    }
    setSaving(false);
    toast({ title: "Saved!", description: "Period configuration updated." });
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Period Configuration</h1>
          <p className="text-muted-foreground">Configure class periods and free periods</p>
        </div>
        <Button onClick={saveChanges} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Changes
        </Button>
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
              <div key={p.id} className={`flex items-center justify-between py-4 ${p.is_free ? "opacity-60" : ""}`}>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-heading font-bold">{p.period_number}</div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Period {p.period_number}</p>
                    <p className="text-xs text-muted-foreground">{p.start_time} – {p.end_time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${p.is_free ? "bg-warning/10 text-warning" : "bg-success/10 text-success"}`}>
                    {p.is_free ? "Free Period" : "Active"}
                  </span>
                  <Switch checked={p.is_free} onCheckedChange={() => toggleFree(p.period_number)} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
