import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallAppButton({ className = "" }: { className?: string }) {
  const [evt, setEvt] = useState<BIPEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setEvt(e as BIPEvent);
    };
    const onInstalled = () => { setInstalled(true); setEvt(null); };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", onInstalled);
    if (window.matchMedia?.("(display-mode: standalone)").matches) setInstalled(true);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;

  const install = async () => {
    if (!evt) {
      // iOS / unsupported _ show instructions
      alert("To install: open in Chrome > tap the menu > 'Add to Home screen' / 'Install app'.");
      return;
    }
    await evt.prompt();
    await evt.userChoice;
    setEvt(null);
  };

  return (
    <Button onClick={install} size="lg" className={`bg-brand-gradient text-primary-foreground shadow-glow text-base hover:bg-brand-gradient ${className}`}>
      <Download className="h-4 w-4 mr-1" /> Install App
    </Button>
  );
}
