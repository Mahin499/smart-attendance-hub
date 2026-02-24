import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Eye, EyeOff, GraduationCap, Loader2 } from "lucide-react";
import loginHero from "@/assets/login-hero.jpg";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"login" | "register" | "forgot">("login");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const success = await login(username, password);
    setLoading(false);
    if (success) {
      navigate("/dashboard");
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel - Hero */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-hero relative overflow-hidden items-center justify-center">
        <img
          src={loginHero}
          alt="Smart Attendance"
          className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay"
        />
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
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <GraduationCap className="h-8 w-8 text-accent" />
            <span className="text-2xl font-heading font-bold text-foreground">Smart Attendance</span>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-1 bg-muted p-1 rounded-lg mb-8">
            {(["login", "register", "forgot"] as const).map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); }}
                className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all ${
                  tab === t
                    ? "bg-card shadow-card text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "login" ? "Sign In" : t === "register" ? "Register" : "Reset"}
              </button>
            ))}
          </div>

          {tab === "login" && (
            <Card className="border-0 shadow-elevated">
              <CardHeader className="pb-4">
                <h2 className="text-2xl font-heading font-bold text-foreground">Welcome back</h2>
                <p className="text-muted-foreground text-sm">Sign in to your dashboard</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In
                  </Button>
                  <div className="text-center pt-2">
                    <p className="text-xs text-muted-foreground">
                      Demo: <code className="bg-muted px-1.5 py-0.5 rounded text-foreground">principal</code> / <code className="bg-muted px-1.5 py-0.5 rounded text-foreground">admin123</code>
                    </p>
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
                <form className="space-y-4" onSubmit={e => e.preventDefault()}>
                  <div className="space-y-2">
                    <Label>Registration Code</Label>
                    <Input placeholder="Enter code from principal" />
                  </div>
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input placeholder="Your full name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Username</Label>
                    <Input placeholder="Choose a username" />
                  </div>
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <Input type="password" placeholder="Create a password" />
                  </div>
                  <Button type="submit" className="w-full">Create Account</Button>
                </form>
              </CardContent>
            </Card>
          )}

          {tab === "forgot" && (
            <Card className="border-0 shadow-elevated">
              <CardHeader className="pb-4">
                <h2 className="text-2xl font-heading font-bold text-foreground">Reset Password</h2>
                <p className="text-muted-foreground text-sm">Enter your username to reset password</p>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={e => e.preventDefault()}>
                  <div className="space-y-2">
                    <Label>Username</Label>
                    <Input placeholder="Enter your username" />
                  </div>
                  <Button type="submit" className="w-full">Send Reset Link</Button>
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
