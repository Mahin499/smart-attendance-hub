import { useState } from "react";
import { MOCK_STUDENTS, MOCK_PERIODS } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, CameraOff, CheckCircle2, XCircle, AlertTriangle, Eye } from "lucide-react";

type AttendanceStatus = "present" | "absent" | "sleepy" | "not-attentive" | "pending";

const statusConfig = {
  present: { label: "Present", icon: CheckCircle2, className: "bg-success/10 text-success border-success/30" },
  absent: { label: "Absent", icon: XCircle, className: "bg-destructive/10 text-destructive border-destructive/30" },
  sleepy: { label: "Sleepy", icon: AlertTriangle, className: "bg-warning/10 text-warning border-warning/30" },
  "not-attentive": { label: "Not Attentive", icon: Eye, className: "bg-info/10 text-info border-info/30" },
  pending: { label: "Pending", icon: Camera, className: "bg-muted text-muted-foreground border-border" },
};

export default function LiveAttendance() {
  const [cameraActive, setCameraActive] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("1");
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>(
    Object.fromEntries(MOCK_STUDENTS.map(s => [s.id, "pending"]))
  );

  const period = MOCK_PERIODS.find(p => p.period === Number(selectedPeriod));
  const isFree = period?.isFree;

  const updateStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const counts = {
    present: Object.values(attendance).filter(s => s === "present").length,
    absent: Object.values(attendance).filter(s => s === "absent").length,
    sleepy: Object.values(attendance).filter(s => s === "sleepy").length,
    "not-attentive": Object.values(attendance).filter(s => s === "not-attentive").length,
    pending: Object.values(attendance).filter(s => s === "pending").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Live Attendance</h1>
          <p className="text-muted-foreground">AI-powered facial recognition attendance</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MOCK_PERIODS.map(p => (
                <SelectItem key={p.period} value={String(p.period)}>
                  Period {p.period} {p.isFree ? "(Free)" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isFree ? (
        <Card className="shadow-card border-warning/30 bg-warning/5">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-warning mb-3" />
            <h3 className="font-heading font-bold text-lg text-foreground">Free Period</h3>
            <p className="text-sm text-muted-foreground">Attendance is disabled for this period</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Camera View */}
          <Card className="shadow-card overflow-hidden">
            <CardContent className="p-0">
              <div className="relative bg-foreground/5 aspect-video max-h-[400px] flex items-center justify-center">
                {cameraActive ? (
                  <div className="relative w-full h-full bg-foreground/90 flex items-center justify-center">
                    <div className="text-center text-primary-foreground">
                      <Camera className="h-16 w-16 mx-auto mb-3 animate-pulse-subtle" />
                      <p className="font-heading font-bold text-lg">Camera Active</p>
                      <p className="text-sm opacity-70">Scanning for faces... (Demo Mode)</p>
                      <p className="text-xs opacity-50 mt-2">
                        Connect to Lovable Cloud to enable real facial recognition
                      </p>
                    </div>
                    {/* Scan overlay */}
                    <div className="absolute inset-8 border-2 border-accent/40 rounded-xl" />
                    <div className="absolute top-4 right-4">
                      <div className="flex items-center gap-2 bg-destructive/90 px-3 py-1.5 rounded-full">
                        <div className="h-2 w-2 rounded-full bg-destructive-foreground animate-pulse-subtle" />
                        <span className="text-xs font-medium text-destructive-foreground">LIVE</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <CameraOff className="h-16 w-16 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground font-medium">Camera is off</p>
                    <p className="text-sm text-muted-foreground">Start camera to begin attendance</p>
                  </div>
                )}
              </div>
              <div className="p-4 flex justify-center">
                <Button
                  onClick={() => setCameraActive(!cameraActive)}
                  variant={cameraActive ? "destructive" : "default"}
                  className="gap-2"
                >
                  {cameraActive ? <CameraOff className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
                  {cameraActive ? "Stop Camera" : "Start Camera"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {(Object.keys(counts) as AttendanceStatus[]).map(status => {
              const config = statusConfig[status];
              return (
                <div key={status} className={`rounded-lg border p-3 text-center ${config.className}`}>
                  <config.icon className="h-5 w-5 mx-auto mb-1" />
                  <p className="text-lg font-bold">{counts[status]}</p>
                  <p className="text-xs">{config.label}</p>
                </div>
              );
            })}
          </div>

          {/* Student List */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-heading">Attendance ({MOCK_STUDENTS.length} students)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {MOCK_STUDENTS.map(student => {
                  const status = attendance[student.id];
                  const config = statusConfig[status];
                  return (
                    <div key={student.id} className="flex items-center justify-between py-3 gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-heading font-bold text-sm shrink-0">
                          {student.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{student.name}</p>
                          <p className="text-xs text-muted-foreground">{student.regNo} • {student.class}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {(["present", "absent", "sleepy", "not-attentive"] as AttendanceStatus[]).map(s => {
                          const sc = statusConfig[s];
                          return (
                            <button
                              key={s}
                              onClick={() => updateStatus(student.id, s)}
                              title={sc.label}
                              className={`p-1.5 rounded-md border transition-colors ${
                                status === s ? sc.className + " border-2" : "border-transparent hover:bg-muted"
                              }`}
                            >
                              <sc.icon className="h-4 w-4" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
