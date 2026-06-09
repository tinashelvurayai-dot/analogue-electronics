import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AccessCodeModal } from "@/components/AccessCodeModal";
import { KeyRound } from "lucide-react";

export const Route = createFileRoute("/profile")({ component: Profile });

function Profile() {
  const { user, profile, loading, refresh } = useAuth();
  const nav = useNavigate();
  const [pw, setPw] = useState("");
  const [modal, setModal] = useState(false);

  useEffect(() => { if (!loading && !user) nav({ to: "/sign-in" }); }, [user, loading, nav]);

  const changePassword = async () => {
    if (pw.length < 6) return toast.error("Password must be at least 6 characters");
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) return toast.error(error.message);
    toast.success("Password updated");
    setPw("");
  };

  if (!profile) return null;
  const isFull = profile.access_level === "full";

  return (
    <div className="min-h-screen bg-hero">
      <AppHeader showBack backTo="/dashboard" />
      <main className="container mx-auto px-4 py-10 max-w-2xl space-y-6">
        <Card className="p-6 bg-card text-card-foreground">
          <h2 className="text-2xl font-bold mb-4">Your profile</h2>
          <div className="space-y-2 text-sm">
            <div><span className="text-muted-foreground">Name:</span> {profile.full_name || "_"}</div>
            <div><span className="text-muted-foreground">Email:</span> {profile.email}</div>
            <div className="flex items-center gap-2"><span className="text-muted-foreground">Access:</span>
              {isFull
                ? <Badge className="bg-brand-gradient">Full access – unlimited</Badge>
                : <Badge variant="outline">Free tier</Badge>}
            </div>
          </div>
        </Card>

        {!isFull && (
          <Card className="p-6 bg-card text-card-foreground border-2 border-secondary/40">
            <h3 className="font-semibold mb-2">Enter access code</h3>
            <p className="text-sm text-muted-foreground mb-4">Pay $5 (solo) or $8 (pair) to an authorised agent to receive a code.</p>
            <Button onClick={() => setModal(true)} className="bg-brand-gradient"><KeyRound className="h-4 w-4 mr-2" /> Enter code</Button>
          </Card>
        )}

        <Card className="p-6 bg-card text-card-foreground">
          <h3 className="font-semibold mb-3">Change password</h3>
          <div className="space-y-3">
            <div><Label>New password</Label><Input type="password" value={pw} onChange={e => setPw(e.target.value)} /></div>
            <Button onClick={changePassword}>Update password</Button>
          </div>
        </Card>
      </main>
      <AccessCodeModal open={modal} onOpenChange={(v) => { setModal(v); if (!v) refresh(); }} />
    </div>
  );
}
