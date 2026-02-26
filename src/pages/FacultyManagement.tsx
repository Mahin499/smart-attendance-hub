import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Copy, Key, Loader2, Trash2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FacultyProfile {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export default function FacultyManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [faculty, setFaculty] = useState<FacultyProfile[]>([]);
  const [codes, setCodes] = useState<{ id: string; code: string; is_active: boolean; created_at: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchFaculty = async () => {
    const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "faculty");
    if (roles && roles.length > 0) {
      const ids = roles.map(r => r.user_id);
      const { data: profiles } = await supabase.from("profiles").select("*").in("id", ids);
      setFaculty(profiles || []);
    } else {
      setFaculty([]);
    }
    setLoading(false);
  };

  const fetchCodes = async () => {
    const { data } = await supabase.from("registration_codes").select("*").order("created_at", { ascending: false });
    setCodes(data || []);
  };

  useEffect(() => { fetchFaculty(); fetchCodes(); }, []);

  const generateCode = async () => {
    if (!user) return;
    setGenerating(true);
    const code = `FAC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const { error } = await supabase.from("registration_codes").insert({ code, created_by: user.id });
    setGenerating(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Code generated!" });
      fetchCodes();
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copied!", description: "Registration code copied to clipboard." });
  };

  const removeFaculty = async (userId: string) => {
    await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "faculty");
    fetchFaculty();
    toast({ title: "Faculty removed" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Faculty Management</h1>
          <p className="text-muted-foreground">Manage faculty accounts and registration codes</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2"><Key className="h-4 w-4" />Registration Codes</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-heading">Faculty Registration Codes</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Share active codes with faculty members so they can register.</p>
                <Button onClick={generateCode} disabled={generating} className="w-full gap-2">
                  {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  Generate New Code
                </Button>
                <div className="space-y-2 max-h-60 overflow-auto">
                  {codes.map(c => (
                    <div key={c.id} className="flex items-center gap-2">
                      <code className={`flex-1 bg-muted px-3 py-2 rounded text-sm font-mono ${!c.is_active ? "line-through opacity-50" : ""}`}>{c.code}</code>
                      <Button variant="outline" size="icon" onClick={() => copyCode(c.code)} className="h-8 w-8"><Copy className="h-3.5 w-3.5" /></Button>
                    </div>
                  ))}
                  {codes.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No codes yet. Generate one!</p>}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="shadow-card">
        <CardHeader><CardTitle className="font-heading">All Faculty ({faculty.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div>
          ) : faculty.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No faculty registered yet. Generate a code and share it!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 text-sm font-medium text-muted-foreground">Name</th>
                    <th className="pb-3 text-sm font-medium text-muted-foreground">Email</th>
                    <th className="pb-3 text-sm font-medium text-muted-foreground">Joined</th>
                    <th className="pb-3 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {faculty.map(f => (
                    <tr key={f.id} className="border-b last:border-0">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-xs">{f.name?.charAt(0) || "?"}</div>
                          <span className="text-sm font-medium text-foreground">{f.name || "—"}</span>
                        </div>
                      </td>
                      <td className="py-3 text-sm text-muted-foreground">{f.email}</td>
                      <td className="py-3 text-sm text-muted-foreground">{new Date(f.created_at).toLocaleDateString()}</td>
                      <td className="py-3">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeFaculty(f.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
