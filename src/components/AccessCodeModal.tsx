import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { KeyRound } from "lucide-react";

export function AccessCodeModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { refresh } = useAuth();

  const submit = async () => {
    if (!code.trim()) return;
    setLoading(true);
    const { data, error } = await supabase.rpc("redeem_access_code", { _code: code.trim().toUpperCase() });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    const result = data as { success: boolean; error?: string };
    if (!result.success) { toast.error(result.error || "Could not redeem code"); return; }
    toast.success("Full access unlocked!");
    await refresh();
    onOpenChange(false);
    setCode("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-popover">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5" /> Enter Access Code</DialogTitle>
          <DialogDescription>
            Paste the code your agent gave you. Format: AUT-XXXX-XXXX.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="AUT-7X9K-2LM"
            className="font-mono tracking-wider uppercase"
            maxLength={32}
          />
          <Button onClick={submit} disabled={loading} className="w-full bg-brand-gradient">
            {loading ? "Verifying…" : "Unlock full access"}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            No code? Contact an authorised agent: pay $5 (solo) or $8 (pair).
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
