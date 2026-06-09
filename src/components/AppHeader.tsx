import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";
import { LogOut, Shield, User as UserIcon, LifeBuoy, ArrowLeft, BookOpen } from "lucide-react";
import { useRef } from "react";
import { InstallAppButton } from "@/components/InstallAppButton";

export function AppHeader({ showBack = false, backTo = "/" }: { showBack?: boolean; backTo?: string }) {
  const { user, isAdmin, signOut } = useAuth();
  const nav = useNavigate();
  const clickCount = useRef(0);
  const lastClick = useRef(0);

  const onLogo = (e: React.MouseEvent) => {
    const now = Date.now();
    if (now - lastClick.current > 800) clickCount.current = 0;
    lastClick.current = now;
    clickCount.current += 1;
    if (clickCount.current >= 7) {
      e.preventDefault();
      clickCount.current = 0;
      nav({ to: "/admin-setup" });
    }
  };

  return (
    <header className="border-b border-border/50 bg-background/80 backdrop-blur sticky top-0 z-40">
      <div className="container mx-auto flex items-center justify-between px-4 py-3 gap-2">
        <div className="flex items-center gap-2">
          {showBack && (
            <Button variant="ghost" size="sm" onClick={() => nav({ to: backTo as any })} className="text-white hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          )}
          <Link to="/" onClick={onLogo} className="flex items-center gap-3 select-none">
            <img src={logo} alt="Power Electronics 1" className="h-10 w-auto" draggable={false} />
          </Link>
        </div>
        <nav className="flex items-center gap-1 flex-wrap justify-end">
          <InstallAppButton className="hidden sm:inline-flex text-white hover:text-white border-white/30" />
          {user ? (
            <>
              <Button variant="ghost" size="sm" asChild className="text-white hover:text-white hover:bg-white/10">
                <Link to="/dashboard">Dashboard</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild className="text-white hover:text-white hover:bg-white/10">
                <Link to="/notes"><BookOpen className="h-4 w-4 mr-1" /> Materials</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild className="text-white hover:text-white hover:bg-white/10">
                <Link to="/profile"><UserIcon className="h-4 w-4 mr-1" /> Profile</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild className="text-white hover:text-white hover:bg-white/10">
                <Link to="/support"><LifeBuoy className="h-4 w-4 mr-1" /> Support</Link>
              </Button>
              {isAdmin && (
                <Button variant="secondary" size="sm" asChild>
                  <Link to="/admin"><Shield className="h-4 w-4 mr-1" /> Admin</Link>
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={async () => { await signOut(); nav({ to: "/" }); }} className="text-white hover:text-white hover:bg-white/10">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className="text-white hover:text-white hover:bg-white/10">
                <Link to="/sign-in">Sign in</Link>
              </Button>
              <Button size="sm" asChild className="bg-brand-gradient text-primary-foreground shadow-glow">
                <Link to="/request-access">Request Access</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
