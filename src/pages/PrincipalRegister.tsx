import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Loader2 } from "lucide-react";

export default function PrincipalRegister() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    const result = await signup(email, password, name, { school_name: schoolName });
    setLoading(false);
    if (result.success) {
      setSuccess("Account created! Check your email to verify, then sign in.");
      // you could optionally redirect to login
      // navigate("/");
    } else {
      setError(result.error || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <GraduationCap className="h-8 w-8 text-accent" />
          <span className="text-2xl font-heading font-bold text-foreground">Smart Attendance</span>
        </div>
        <Card className="border-0 shadow-elevated">
          <CardHeader className="pb-4">
            <h2 className="text-2xl font-heading font-bold text-foreground">Principal Registration</h2>
            <p className="text-muted-foreground text-sm">Sign up to administer your institution</p>
          </CardHeader>
          <CardContent>
            {success && <p className="text-sm text-success mb-4 text-center bg-success/10 p-3 rounded-lg">{success}</p>}
            {error && <p className="text-sm text-destructive mb-4 text-center">{error}</p>}
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>College / School Name</Label>
                <Input value={schoolName} onChange={e => setSchoolName(e.target.value)} placeholder="e.g. Adi Shankara Institute" required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Register
              </Button>
            </form>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <button className="text-primary" onClick={() => navigate('/')}>Sign in</button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
