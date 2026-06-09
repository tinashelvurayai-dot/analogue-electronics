import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { QrCode, Copy, Share2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  trigger?: React.ReactNode;
  className?: string;
}

export function ShareQRDialog({ trigger, className }: Props) {
  const [open, setOpen] = useState(false);
  const url = typeof window !== "undefined" ? window.location.origin : "";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied — paste it anywhere");
    } catch {
      toast.error("Could not copy");
    }
  };

  const nativeShare = async () => {
    if (!navigator.share) return copy();
    try {
      await navigator.share({
        title: "Power Electronics 1 – Exam revision platform",
        text: "Master Power Electronics 1. Ace your exam with confidence.",
        url,
      });
    } catch {
      /* user cancelled */
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" className={`bg-brand-gradient text-primary-foreground ${className ?? ""}`}>
            <QrCode className="h-4 w-4 mr-1" /> Share via QR
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-popover max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><QrCode className="h-5 w-5" /> Share the app</DialogTitle>
          <DialogDescription>
            Point a phone camera at this QR code. It opens the app in their browser - they can install it
            straight to their home screen, no app store needed.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          <div className="bg-white p-4 rounded-xl">
            <QRCodeSVG value={url || "https://example.com"} size={220} level="M" includeMargin={false} />
          </div>
          <p className="text-xs text-muted-foreground break-all text-center font-mono">{url}</p>
          <div className="flex gap-2 w-full">
            <Button variant="outline" onClick={copy} className="flex-1"><Copy className="h-4 w-4 mr-1" /> Copy link</Button>
            <Button onClick={nativeShare} className="flex-1 bg-brand-gradient"><Share2 className="h-4 w-4 mr-1" /> Share…</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
