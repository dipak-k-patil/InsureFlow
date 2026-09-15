import { useEffect, useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Loader2 } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const emailSchema = z.string().trim().email("Enter a valid email").max(255);
const pwSchema = z.string().min(8, "At least 8 characters").max(72);

export default function AuthPage() {
  const nav = useNavigate();
  const location = useLocation();
  const { session, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  const from = (location.state as { from?: string })?.from || "/";

  useEffect(() => {
    // Redirect to hash-based recovery? Handled by dedicated route.
  }, []);

  if (loading) return null;
  if (session) return <Navigate to={from} replace />;

  const handleGoogle = async () => {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error(result.error.message || "Google sign-in failed");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sign-in failed");
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const emailV = emailSchema.parse(normalizedEmail);
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(emailV, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Password reset link sent. Check your inbox.");
        setMode("signin");
      } else if (mode === "signup") {
        pwSchema.parse(password);
        const { error } = await supabase.auth.signUp({
          email: emailV,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName.trim() || emailV.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Account created! You can sign in now.");
        setMode("signin");
      } else {
        pwSchema.parse(password);
        const { error } = await supabase.auth.signInWithPassword({ email: emailV, password });
        if (error) throw error;
        nav(from, { replace: true });
      }
    } catch (err) {
      console.error('Auth error', err);
      const msg = err instanceof z.ZodError ? err.errors[0].message : err instanceof Error ? err.message : 'Failed';
      const friendly = msg === 'Invalid login credentials' ? 'Invalid email or password' : msg;
      toast.error(friendly);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-panel p-8"
      >
        <div className="flex items-center justify-center mb-6">
          <img
            src="/insureflow-logo.png"
            alt="Insureflow Logo"
            className="h-10 w-auto object-contain"
          />
        </div>

        <Tabs value={mode === "forgot" ? "signin" : mode} onValueChange={(v) => setMode(v as "signin" | "signup")}>
          <TabsList className="grid grid-cols-2 w-full mb-6">
            <TabsTrigger value="signin">Sign in</TabsTrigger>
            <TabsTrigger value="signup">Sign up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="mt-0">
            <Button type="button" variant="outline" className="w-full gap-2 mb-4" onClick={handleGoogle} disabled={busy}>
              <GoogleIcon /> Continue with Google
            </Button>
            <Divider />
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="Email">
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </Field>
              {mode !== "forgot" && (
                <Field label="Password">
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </Field>
              )}
              <Button type="submit" className="w-full" disabled={busy}>
                {busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {mode === "forgot" ? "Send reset link" : "Sign in"}
              </Button>
              <button
                type="button"
                onClick={() => setMode(mode === "forgot" ? "signin" : "forgot")}
                className="text-xs text-primary hover:underline block mx-auto"
              >
                {mode === "forgot" ? "Back to sign in" : "Forgot password?"}
              </button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="mt-0">
            <Button type="button" variant="outline" className="w-full gap-2 mb-4" onClick={handleGoogle} disabled={busy}>
              <GoogleIcon /> Sign up with Google
            </Button>
            <Divider />
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="Full name">
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={100} />
              </Field>
              <Field label="Email">
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </Field>
              <Field label="Password">
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
              </Field>
              <Button type="submit" className="w-full" disabled={busy}>
                {busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create account
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

function Divider() {
  return (
    <div className="relative my-4">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center text-[11px] uppercase">
        <span className="bg-background px-2 text-muted-foreground">or with email</span>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.5 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.4-4.5 2.4-7.2 2.4-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C9.6 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.4l6.2 5.2C41 34.4 44 29.6 44 24c0-1.3-.1-2.4-.4-3.5z"/>
    </svg>
  );
}
