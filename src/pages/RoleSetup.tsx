import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { GraduationCap, Loader2, Shield, Users } from "lucide-react";

export default function RoleSetup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"choose" | "principal" | "faculty">("choose");
  const [regCode, setRegCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasPrincipal, setHasPrincipal] = useState<boolean | null>(null);

  useEffect(() => {
    if (user?.role) navigate("/dashboard");
  }, [user?.role, navigate]);

  useEffect(() => {
    supabase
      .from("user_roles")
      .select("id")
      .eq("role", "principal")
      .limit(1)
      .then(({ data }) => setHasPrincipal((data?.length ?? 0) > 0));
  }, []);

  const setupPrincipal = async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    // Only allow first principal
    const { data: existing } = await supabase.from("user_roles").select("id").eq("role", "principal").limit(1);
    if (existing && existing.length > 0) {
      setError("A principal already exists. Please register as faculty.");
      setLoading(false);
      return;
    }
    const { error } = await supabase.from("user_roles").insert({ user_id: user.id, role: "principal" });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      window.location.reload();
    }
  };

  const setupFaculty = async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    const { data: codeData } = await supabase
      .from("registration_codes")
      .select("id")
      .eq("code", regCode)
      .eq("is_active", true)
      .maybeSingle();
    if (!codeData) {
      setError("Invalid or expired registration code");
      setLoading(false);
      return;
    }
    // Use edge function or direct insert - principal must have inserted the role
    // For faculty self-registration, we need a workaround since RLS only allows principal to insert
    // We'll use a database function
    const { error } = await supabase.rpc("register_faculty_with_code", {
      _user_id: user.id,
      _code: regCode,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <GraduationCap className="h-8 w-8 text-accent" />
          <span className="text-2xl font-heading font-bold text-foreground">Smart Attendance</span>
        </div>

        {mode === "choose" && (
          <Card className="border-0 shadow-elevated">
            <CardHeader className="pb-4 text-center">
              <h2 className="text-2xl font-heading font-bold text-foreground">Select Your Role</h2>
              <p className="text-muted-foreground text-sm">How will you use Smart Attendance?</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {!hasPrincipal && (
                <button
                  onClick={() => setMode("principal")}
                  className="w-full flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="p-3 rounded-lg bg-accent/10"><Shield className="h-6 w-6 text-accent" /></div>
                  <div>
                    <p className="font-heading font-bold text-foreground">Principal</p>
                    <p className="text-xs text-muted-foreground">First admin setup — manage the institution</p>
                  </div>
                </button>
              )}
              <button
                onClick={() => setMode("faculty")}
                className="w-full flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left"
              >
                <div className="p-3 rounded-lg bg-primary/10"><Users className="h-6 w-6 text-primary" /></div>
                <div>
                  <p className="font-heading font-bold text-foreground">Faculty</p>
                  <p className="text-xs text-muted-foreground">Register with a code from your principal</p>
                </div>
              </button>
              {error && <p className="text-sm text-destructive text-center">{error}</p>}
            </CardContent>
          </Card>
        )}

        {mode === "principal" && (
          <Card className="border-0 shadow-elevated">
            <CardHeader className="pb-4">
              <h2 className="text-2xl font-heading font-bold text-foreground">Principal Setup</h2>
              <p className="text-muted-foreground text-sm">You'll be the first admin of this system</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Logged in as: <strong>{user?.email}</strong></p>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setMode("choose")}>Back</Button>
                <Button className="flex-1" onClick={setupPrincipal} disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Confirm as Principal
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {mode === "faculty" && (
          <Card className="border-0 shadow-elevated">
            <CardHeader className="pb-4">
              <h2 className="text-2xl font-heading font-bold text-foreground">Faculty Registration</h2>
              <p className="text-muted-foreground text-sm">Enter the code from your principal</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Registration Code</Label>
                  <Input value={regCode} onChange={e => setRegCode(e.target.value)} placeholder="Enter registration code" />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setMode("choose")}>Back</Button>
                  <Button className="flex-1" onClick={setupFaculty} disabled={loading || !regCode}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Register as Faculty
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
