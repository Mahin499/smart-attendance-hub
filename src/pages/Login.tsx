import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Eye, EyeOff, GraduationCap, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import campusImage from "@/assets/campus.jpg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [regCode, setRegCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"login" | "register" | "forgot">("login");
  const { login, signup, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.error || "Invalid credentials");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Validate registration code
    const { data: codeData } = await supabase
      .from("registration_codes")
      .select("id, is_active")
      .eq("code", regCode)
      .eq("is_active", true)
      .maybeSingle();

    if (!codeData) {
      setError("Invalid or expired registration code");
      setLoading(false);
      return;
    }

    const result = await signup(email, password, name);
    setLoading(false);
    if (result.success) {
      setSuccess("Account created! Check your email to verify, then sign in.");
      setTab("login");
    } else {
      setError(result.error || "Registration failed");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess("Password reset link sent to your email!");
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch {
      setError("Google sign-in failed");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel - Hero */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-hero relative overflow-hidden items-center justify-center">
        <img src={campusImage} alt="Campus" className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay" />
        <div className="relative z-10 text-center px-12 animate-fade-in">
          <div className="inline-flex items-center gap-3 mb-6 bg-primary-foreground/10 backdrop-blur-sm px-6 py-3 rounded-full">
            <GraduationCap className="h-8 w-8 text-accent" />
            <span className="text-2xl font-heading font-bold text-primary-foreground">Smart Attendance</span>
          </div>
          <h1 className="text-4xl xl:text-5xl font-heading font-bold text-primary-foreground mb-4 leading-tight">
            AI-Powered<br />Attendance Management
          </h1>
          <p className="text-lg text-primary-foreground/70 max-w-md mx-auto">
            Facial recognition technology for seamless, accurate, and intelligent attendance tracking.
          </p>
        </div>
      </div>

      {/* Right panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-background relative">
        {/* background image for smaller viewports (large already has the left hero) */}
        <img
          src={campusImage}
          alt="Campus"
          className="absolute inset-0 w-full h-full object-cover opacity-10 lg:hidden"
        />
+        <div className="w-full max-w-md animate-fade-in relative">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <GraduationCap className="h-8 w-8 text-accent" />
            <span className="text-2xl font-heading font-bold text-foreground">Smart Attendance</span>
          </div>

          <div className="flex gap-1 bg-muted p-1 rounded-lg mb-8">
            {(["login", "register", "forgot"] as const).map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); setSuccess(""); }}
                className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all ${
                  tab === t ? "bg-card shadow-card text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "login" ? "Sign In" : t === "register" ? "Register" : "Reset"}
              </button>
            ))}
          </div>

          {success && <p className="text-sm text-success mb-4 text-center bg-success/10 p-3 rounded-lg">{success}</p>}

          {tab === "login" && (
            <Card className="border-0 shadow-elevated">
              <CardHeader className="pb-4">
                <h2 className="text-2xl font-heading font-bold text-foreground">Welcome back</h2>
                <p className="text-muted-foreground text-sm">Sign in to your dashboard</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In
                  </Button>
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or</span></div>
                  </div>
                  <Button type="button" variant="outline" className="w-full gap-2" onClick={handleGoogleSignIn} disabled={loading}>
                    <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    Sign in with Google
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {tab === "register" && (
            <Card className="border-0 shadow-elevated">
              <CardHeader className="pb-4">
                <h2 className="text-2xl font-heading font-bold text-foreground">Faculty Registration</h2>
                <p className="text-muted-foreground text-sm">Enter your registration code from the principal</p>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleRegister}>
                  <div className="space-y-2">
                    <Label>Registration Code</Label>
                    <Input value={regCode} onChange={e => setRegCode(e.target.value)} placeholder="Enter code from principal" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Create a password" required />
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {tab === "forgot" && (
            <Card className="border-0 shadow-elevated">
              <CardHeader className="pb-4">
                <h2 className="text-2xl font-heading font-bold text-foreground">Reset Password</h2>
                <p className="text-muted-foreground text-sm">Enter your email to reset password</p>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleForgotPassword}>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" required />
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Send Reset Link
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
