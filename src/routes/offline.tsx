import { createFileRoute, Link } from "@tanstack/react-router";
import { Wifi, AlertTriangle, Home, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/offline")({ component: OfflinePage });

function OfflinePage() {
  return (
    <div className="min-h-screen bg-hero flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-card text-card-foreground shadow-card-elev text-center">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Power Electronics 1" className="h-16" />
        </div>
        
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-amber-500/20 border border-amber-500/30 mx-auto mb-4">
          <Wifi className="h-8 w-8 text-amber-500" />
        </div>
        
        <h1 className="text-2xl font-bold mb-2">You're offline</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Some features require an internet connection. Check your network and try again.
        </p>
        
        <div className="space-y-3 mb-6">
          <div className="rounded-lg bg-muted/40 border border-border/50 p-3 text-sm text-left">
            <p className="font-medium flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              What you can still do offline:
            </p>
            <ul className="text-muted-foreground text-xs space-y-1 ml-6 list-disc">
              <li>View flashcards you've previously accessed</li>
              <li>Review bookmarks and saved content</li>
              <li>Study your progress and mastery levels</li>
            </ul>
          </div>
        </div>
        
        <div className="space-y-2">
          <Button asChild className="w-full bg-brand-gradient">
            <Link to="/">
              <Home className="h-4 w-4 mr-1" />
              Go home
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link to="/dashboard">
              <BookOpen className="h-4 w-4 mr-1" />
              Back to dashboard
            </Link>
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground mt-4">
          Waiting for connection...
        </p>
      </Card>
    </div>
  );
}
