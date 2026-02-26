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
  const { login, signup, signInWithGoogle, signInWithGitHub, signInWithMicrosoft, signInWithDiscord } = useAuth();
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

    const result = await signup(email, password, name, { reg_code: regCode });
    // attempt to assign faculty role immediately if we received a user id
    if (result.success && result.user && regCode) {
      try {
        await supabase.rpc("register_faculty_with_code", {
          _user_id: result.user.id,
          _code: regCode,
        });
      } catch (err) {
        // ignore, will try again when they log in through RoleSetup
        console.warn("early role assignment failed", err);
      }
    }
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
    } catch (err: any) {
      setError(err?.message || "Google sign-in failed");
      setLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithGitHub();
    } catch (err: any) {
      setError(err?.message || "GitHub sign-in failed");
      setLoading(false);
    }
  };

  const handleMicrosoftSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithMicrosoft();
    } catch (err: any) {
      setError(err?.message || "Microsoft sign-in failed");
      setLoading(false);
    }
  };

  const handleDiscordSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithDiscord();
    } catch (err: any) {
      setError(err?.message || "Discord sign-in failed");
      setLoading(false);
    }
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
            <button
              onClick={() => navigate("/register-principal")}
              className="flex-1 py-2.5 text-sm font-medium rounded-md transition-all text-muted-foreground hover:text-foreground"
            >
              Principal
            </button>
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
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or continue with</span></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button type="button" variant="outline" className="gap-2 text-xs" onClick={handleGoogleSignIn} disabled={loading}>
                      <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                      Google
                    </Button>
                    <Button type="button" variant="outline" className="gap-2 text-xs" onClick={handleGitHubSignIn} disabled={loading}>
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                      GitHub
                    </Button>
                    <Button type="button" variant="outline" className="gap-2 text-xs" onClick={handleMicrosoftSignIn} disabled={loading}>
                      <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M2 2h8v8H2V2zm10 0h8v8h-8V2zM2 12h8v8H2v-8zm10 0h8v8h-8v-8z" fill="currentColor"/></svg>
                      Microsoft
                    </Button>
                    <Button type="button" variant="outline" className="gap-2 text-xs" onClick={handleDiscordSignIn} disabled={loading}>
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.211.375-.445.865-.607 1.25a18.27 18.27 0 00-5.487 0c-.165-.39-.395-.875-.607-1.25a.077.077 0 00-.079-.036 19.736 19.736 0 00-4.885 1.515.07.07 0 00-.033.028C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.056 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.975 14.975 0 001.293-2.1.073.073 0 00-.041-.102 13.19 13.19 0 01-1.881-.9.075.075 0 00-.008-.125c.126-.094.252-.192.373-.293a.075.075 0 00.031-.104c3.946 1.848 8.229 1.848 12.119 0a.075.075 0 00.03-.104c-.12-.101-.246-.199-.372-.293a.075.075 0 00-.009.125 13.064 13.064 0 01-1.881.9.073.073 0 00-.041.103c.299.81.645 1.588 1.293 2.1a.075.075 0 00.084.028 19.863 19.863 0 005.993-3.03.077.077 0 00.031-.055c.504-4.774-.847-8.92-3.585-12.627a.06.06 0 00-.033-.028zM8.423 15.429c-1.074 0-1.96-.987-1.96-2.196 0-1.209.874-2.196 1.96-2.196 1.094 0 1.975.987 1.96 2.196 0 1.209-.875 2.196-1.96 2.196zm7.151 0c-1.073 0-1.96-.987-1.96-2.196 0-1.209.874-2.196 1.96-2.196 1.094 0 1.975.987 1.96 2.196 0 1.209-.875 2.196-1.96 2.196z"/></svg>
                      Discord
                    </Button>
                  </div>
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
