import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { accessApi } from "@/lib/access-api";
import { ArrowLeft, KeyRound, UserPlus } from "lucide-react";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/sign-in")({ component: SignInPage });

const REMEMBER_KEY = "ia_remember_v1";

function SignInPage() {
  const { user, loading } = useAuth();
  const nav = useNavigate();

  const [fullName, setFullName] = useState("");
  const [code, setCode] = useState("");
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) nav({ to: "/dashboard" });
  }, [user, loading, nav]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(REMEMBER_KEY);
      if (raw) {
        const { name, code } = JSON.parse(raw);
        if (name) setFullName(name);
        if (code) setCode(code);
      }
    } catch {}
  }, []);

  const submit = async () => {
    if (!fullName.trim() || !code.trim()) return toast.error("Enter your full name and access code");
    setBusy(true);
    try {
      const creds = await accessApi.signIn({ full_name: fullName, code });
      const { error } = await supabase.auth.signInWithPassword({
        email: creds.email,
        password: creds.password,
      });
      if (error) throw error;
      if (remember) {
        localStorage.setItem(REMEMBER_KEY, JSON.stringify({ name: fullName, code: code.toUpperCase() }));
      } else {
        localStorage.removeItem(REMEMBER_KEY);
      }
      toast.success("Welcome back");
      nav({ to: "/dashboard" });
    } catch (e: any) {
      toast.error(e?.message || "Invalid name or access code");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-card text-card-foreground shadow-card-elev">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Link>
        <Link to="/" className="flex justify-center mb-6">
          <img src={logo} alt="Power Electronics 1" className="h-16" />
        </Link>
        <h1 className="text-2xl font-bold text-center">Sign in</h1>
        <p className="text-sm text-muted-foreground text-center mt-1">
          Use the full name you registered with and the access code your agent gave you.
        </p>

        <div className="space-y-3 mt-6">
          <div>
            <Label>Full name</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="As registered" />
          </div>
          <div>
            <Label>Access code</Label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="AUT-XXXX-XXXX"
              className="font-mono tracking-wider uppercase"
            />
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
            <Checkbox checked={remember} onCheckedChange={(v) => setRemember(!!v)} />
            <span>Remember me on this device</span>
          </label>
          <Button onClick={submit} disabled={busy} className="w-full bg-brand-gradient">
            <KeyRound className="h-4 w-4 mr-2" /> {busy ? "Signing in…" : "Sign in"}
          </Button>
        </div>

        <div className="mt-6 pt-6 border-t border-border/40 text-center">
          <p className="text-sm text-muted-foreground mb-3">New here?</p>
          <Button asChild variant="outline" className="w-full">
            <Link to="/request-access">
              <UserPlus className="h-4 w-4 mr-2" /> Request Access
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
