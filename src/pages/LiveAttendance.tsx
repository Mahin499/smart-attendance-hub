import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, CameraOff, CheckCircle2, XCircle, AlertTriangle, Eye, MessageCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as faceapi from "face-api.js";

type AttendanceStatus = "present" | "absent" | "sleepy" | "talking" | "not-attentive";

const statusConfig = {
  present: { label: "Present", icon: CheckCircle2, className: "bg-success/10 text-success border-success/30" },
  absent: { label: "Absent", icon: XCircle, className: "bg-destructive/10 text-destructive border-destructive/30" },
  sleepy: { label: "Sleepy", icon: AlertTriangle, className: "bg-warning/10 text-warning border-warning/30" },
  talking: { label: "Talking", icon: MessageCircle, className: "bg-info/10 text-info border-info/30" },
  "not-attentive": { label: "Not Attentive", icon: Eye, className: "bg-muted text-muted-foreground border-border" },
};

interface PeriodConfig {
  id: string;
  period_number: number;
  start_time: string;
  end_time: string;
  is_free: boolean;
}

interface Student {
  id: string;
  name: string;
  reg_no: string;
  class: string;
  photo_url: string | null;
}

export default function LiveAttendance() {
  const { user } = useAuth();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [periods, setPeriods] = useState<PeriodConfig[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [saving, setSaving] = useState(false);
  const [facesDetected, setFacesDetected] = useState(0);
  const [labeledDescriptors, setLabeledDescriptors] = useState<faceapi.LabeledFaceDescriptors[]>([]);

  // Load face-api models
  const loadModels = async () => {
    setLoadingModels(true);
    try {
      const MODEL_URL = "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights";
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ]);
      setModelsLoaded(true);
    } catch (err) {
      console.error("Failed to load face models:", err);
      toast({ title: "Error", description: "Failed to load face recognition models", variant: "destructive" });
    }
    setLoadingModels(false);
  };

  // Build labeled descriptors from student photos
  const buildDescriptors = useCallback(async () => {
    const studentsWithPhotos = students.filter(s => s.photo_url);
    const descriptors: faceapi.LabeledFaceDescriptors[] = [];

    for (const student of studentsWithPhotos) {
      try {
        const img = await faceapi.fetchImage(student.photo_url!);
        const detection = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptor();
        if (detection) {
          descriptors.push(new faceapi.LabeledFaceDescriptors(student.id, [detection.descriptor]));
        }
      } catch (err) {
        console.warn(`Could not process photo for ${student.name}:`, err);
      }
    }
    setLabeledDescriptors(descriptors);
    return descriptors;
  }, [students]);

  useEffect(() => {
    supabase.from("period_config").select("*").order("period_number").then(({ data }) => {
      setPeriods(data || []);
      if (data && data.length > 0) setSelectedPeriod(String(data[0].period_number));
    });
  }, []);

  useEffect(() => {
    if (user) {
      supabase.from("students").select("*").eq("faculty_id", user.id).order("name").then(({ data }) => {
        setStudents(data || []);
        const att: Record<string, AttendanceStatus> = {};
        (data || []).forEach(s => { att[s.id] = "absent"; });
        setAttendance(att);
      });
    }
  }, [user]);

  const startCamera = async () => {
    if (!modelsLoaded) await loadModels();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);

      // Build descriptors
      const descs = await buildDescriptors();

      // Start detection loop
      detectionIntervalRef.current = setInterval(async () => {
        if (!videoRef.current || !canvasRef.current) return;
        const detections = await faceapi
          .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptors()
          .withFaceExpressions();

        setFacesDetected(detections.length);

        // Draw detections
        const canvas = canvasRef.current;
        const displaySize = { width: videoRef.current.videoWidth, height: videoRef.current.videoHeight };
        faceapi.matchDimensions(canvas, displaySize);
        const resized = faceapi.resizeResults(detections, displaySize);
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resized);
        faceapi.draw.drawFaceLandmarks(canvas, resized);

        // Match faces
        if (descs.length > 0) {
          const matcher = new faceapi.FaceMatcher(descs, 0.6);
          for (const det of detections) {
            const match = matcher.findBestMatch(det.descriptor);
            if (match.label !== "unknown") {
              const studentId = match.label;
              // Determine activity based on expressions and landmarks
              let status: AttendanceStatus = "present";
              
              const expressions = det.expressions;
              // Check for sleepy: neutral with low eye aspect ratio
              const landmarks = det.landmarks;
              const leftEye = landmarks.getLeftEye();
              const rightEye = landmarks.getRightEye();
              const leftEAR = getEAR(leftEye);
              const rightEAR = getEAR(rightEye);
              const avgEAR = (leftEAR + rightEAR) / 2;

              if (avgEAR < 0.2) {
                status = "sleepy";
              } else if (expressions.surprised > 0.5 || (det.landmarks.getMouth().length > 0 && getMouthAR(det.landmarks.getMouth()) > 0.6)) {
                status = "talking";
              } else if (expressions.neutral > 0.8 && avgEAR < 0.25) {
                status = "not-attentive";
              }

              setAttendance(prev => ({ ...prev, [studentId]: status }));
            }
          }
        }
      }, 1500);

    } catch (err) {
      console.error("Camera error:", err);
      toast({ title: "Camera Error", description: "Could not access camera. Check permissions.", variant: "destructive" });
    }
  };

  const stopCamera = () => {
    if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    setCameraActive(false);
    setFacesDetected(0);
  };

  const updateStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const saveAttendance = async () => {
    if (!user || !selectedPeriod) return;
    setSaving(true);
    const records = Object.entries(attendance).map(([student_id, status]) => ({
      student_id,
      date: new Date().toISOString().split("T")[0],
      period_number: Number(selectedPeriod),
      status,
      recorded_by: user.id,
    }));

    const { error } = await supabase.from("attendance_records").upsert(records, {
      onConflict: "student_id,date,period_number",
    });

    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Attendance saved!", description: `${records.length} records saved for Period ${selectedPeriod}` });
    }
  };

  useEffect(() => {
    return () => { stopCamera(); };
  }, []);

  const period = periods.find(p => p.period_number === Number(selectedPeriod));
  const isFree = period?.is_free;

  const counts = {
    present: Object.values(attendance).filter(s => s === "present").length,
    absent: Object.values(attendance).filter(s => s === "absent").length,
    sleepy: Object.values(attendance).filter(s => s === "sleepy").length,
    talking: Object.values(attendance).filter(s => s === "talking").length,
    "not-attentive": Object.values(attendance).filter(s => s === "not-attentive").length,
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
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              {periods.map(p => (
                <SelectItem key={p.period_number} value={String(p.period_number)}>
                  Period {p.period_number} {p.is_free ? "(Free)" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={saveAttendance} disabled={saving || isFree} className="gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Attendance
          </Button>
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
                  <div className="relative w-full h-full">
                    <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
                    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <div className="flex items-center gap-2 bg-destructive/90 px-3 py-1.5 rounded-full">
                        <div className="h-2 w-2 rounded-full bg-destructive-foreground animate-pulse" />
                        <span className="text-xs font-medium text-destructive-foreground">LIVE</span>
                      </div>
                      <div className="bg-card/90 px-3 py-1.5 rounded-full">
                        <span className="text-xs font-medium text-foreground">{facesDetected} face(s)</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    {loadingModels ? (
                      <>
                        <Loader2 className="h-16 w-16 mx-auto text-accent mb-3 animate-spin" />
                        <p className="text-muted-foreground font-medium">Loading face recognition models...</p>
                      </>
                    ) : (
                      <>
                        <CameraOff className="h-16 w-16 mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground font-medium">Camera is off</p>
                        <p className="text-sm text-muted-foreground">Start camera to begin attendance</p>
                      </>
                    )}
                  </div>
                )}
              </div>
              <div className="p-4 flex justify-center">
                <Button onClick={cameraActive ? stopCamera : startCamera} variant={cameraActive ? "destructive" : "default"} className="gap-2" disabled={loadingModels}>
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
            <CardHeader><CardTitle className="font-heading">Attendance ({students.length} students)</CardTitle></CardHeader>
            <CardContent>
              {students.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No students found. Add students first!</p>
              ) : (
                <div className="divide-y">
                  {students.map(student => {
                    const status = attendance[student.id] || "absent";
                    const config = statusConfig[status];
                    return (
                      <div key={student.id} className="flex items-center justify-between py-3 gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          {student.photo_url ? (
                            <img src={student.photo_url} alt={student.name} className="h-9 w-9 rounded-full object-cover shrink-0" />
                          ) : (
                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-heading font-bold text-sm shrink-0">{student.name.charAt(0)}</div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{student.name}</p>
                            <p className="text-xs text-muted-foreground">{student.reg_no} • {student.class}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {(Object.keys(statusConfig) as AttendanceStatus[]).filter(s => s !== "absent" || status === "absent").map(s => {
                            const sc = statusConfig[s];
                            return (
                              <button key={s} onClick={() => updateStatus(student.id, s)} title={sc.label}
                                className={`p-1.5 rounded-md border transition-colors ${status === s ? sc.className + " border-2" : "border-transparent hover:bg-muted"}`}>
                                <sc.icon className="h-4 w-4" />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

// Eye Aspect Ratio calculation
function getEAR(eye: faceapi.Point[]) {
  if (eye.length < 6) return 0.3;
  const v1 = dist(eye[1], eye[5]);
  const v2 = dist(eye[2], eye[4]);
  const h = dist(eye[0], eye[3]);
  return (v1 + v2) / (2.0 * h);
}

function getMouthAR(mouth: faceapi.Point[]) {
  if (mouth.length < 20) return 0;
  const v = dist(mouth[14], mouth[18]);
  const h = dist(mouth[12], mouth[16]);
  return h > 0 ? v / h : 0;
}

function dist(p1: faceapi.Point, p2: faceapi.Point) {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}
