import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Stethoscope, User } from "lucide-react";
import loginBg from "@/assets/login-bg.jpg";

type Mode = "login" | "signup";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("patient");
  const [error, setError] = useState("");
  const { login, signup, validatePassword } = useAuth();
  const navigate = useNavigate();

  const pwHint = password ? validatePassword(password) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password || (mode === "signup" && !name)) {
      setError("Please fill in all fields");
      return;
    }
    const result = mode === "signup"
      ? signup(name, email, password, role)
      : login(email, password, role);
    if (result.ok) {
      navigate(role === "doctor" ? "/doctor-dashboard" : "/patient-dashboard");
    } else {
      setError(result.error || "Something went wrong");
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${loginBg})` }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" aria-hidden />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-medical shadow-lg">
            <Heart className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">MediCare</h1>
          <p className="text-muted-foreground">Your health, our priority</p>
        </div>

        <Card className="shadow-card border-border/50 backdrop-blur-md bg-card/95">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-xl">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </CardTitle>
            <CardDescription>
              {mode === "login"
                ? "Sign in to your account to continue"
                : "Accounts can only be created once — choose carefully"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Mode toggle */}
            <div className="mb-4 flex rounded-lg bg-muted p-1">
              <button
                onClick={() => { setMode("login"); setError(""); }}
                className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
                  mode === "login" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setMode("signup"); setError(""); }}
                className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
                  mode === "signup" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Role toggle */}
            <div className="mb-6 flex rounded-lg bg-muted p-1">
              <button
                onClick={() => setRole("patient")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium transition-all ${
                  role === "patient" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                <User className="h-4 w-4" /> Patient
              </button>
              <button
                onClick={() => setRole("doctor")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium transition-all ${
                  role === "doctor" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                <Stethoscope className="h-4 w-4" /> Doctor
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={name} onChange={(e) => { setName(e.target.value); setError(""); }} />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={role === "patient" ? "patient@demo.com" : "doctor@demo.com"}
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={mode === "signup" ? "Min 8 chars, mixed case, number & symbol" : "Enter your password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                />
                {mode === "signup" && pwHint && (
                  <p className="text-xs text-destructive">{pwHint}</p>
                )}
                {mode === "signup" && password && !pwHint && (
                  <p className="text-xs text-success">Strong password ✓</p>
                )}
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full">
                {mode === "login" ? "Sign In" : "Create Account"}
              </Button>
            </form>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              Demo accounts: <code>patient@demo.com</code> / <code>doctor@demo.com</code> — password <code>Demo@Pass1</code>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
