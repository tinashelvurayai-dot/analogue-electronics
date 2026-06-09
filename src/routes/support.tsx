import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/support")({ component: Support });

function Support() {
  const { user, profile, loading } = useAuth();
  const nav = useNavigate();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (!loading && !user) nav({ to: "/sign-in" }); }, [user, loading, nav]);

  const submit = async () => {
    if (!subject.trim() || !message.trim()) return toast.error("Fill in both fields");
    setBusy(true);
    const { error } = await supabase.from("support_tickets").insert({
      user_id: user!.id, user_email: profile?.email || user!.email!, subject, message,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Ticket submitted. We'll get back to you.");
    setSubject(""); setMessage("");
  };

  return (
    <div className="min-h-screen bg-hero">
      <AppHeader showBack backTo="/dashboard" />
      <main className="container mx-auto px-4 py-10 max-w-2xl">
        <Card className="p-6 bg-card text-card-foreground">
          <h2 className="text-2xl font-bold">Support</h2>
          <p className="text-sm text-muted-foreground mt-1 mb-6">Email: industrialautomation@gmail.com</p>
          <div className="space-y-3">
            <div><Label>Subject</Label><Input value={subject} onChange={e => setSubject(e.target.value)} maxLength={120} /></div>
            <div><Label>Message</Label><Textarea value={message} rows={6} onChange={e => setMessage(e.target.value)} maxLength={2000} /></div>
            <Button onClick={submit} disabled={busy} className="bg-brand-gradient">Submit ticket</Button>
          </div>
        </Card>
        <MyTickets userId={user?.id} />
      </main>
    </div>
  );
}

function MyTickets({ userId }: { userId?: string }) {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    if (!userId) return;
    supabase.from("support_tickets").select("*").eq("user_id", userId).order("created_at", { ascending: false })
      .then(({ data }) => setRows(data || []));
  }, [userId]);
  if (!rows.length) return null;
  return (
    <Card className="p-6 bg-card text-card-foreground mt-6">
      <h3 className="font-semibold mb-3">Your previous messages</h3>
      <div className="space-y-3">
        {rows.map(t => (
          <div key={t.id} className="border border-border/50 rounded-md p-3">
            <div className="flex items-center justify-between text-sm">
              <strong>{t.subject}</strong>
              <span className="text-xs text-muted-foreground">{t.status}</span>
            </div>
            <p className="text-sm mt-1 whitespace-pre-wrap">{t.message}</p>
            {t.admin_reply && (
              <div className="mt-2 rounded-md bg-secondary/10 border border-secondary/30 p-2">
                <p className="text-xs font-semibold text-secondary">Admin reply</p>
                <p className="text-sm whitespace-pre-wrap mt-1">{t.admin_reply}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
