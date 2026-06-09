import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, ArrowLeft, RotateCw, Star } from "lucide-react";
import { useBookmarks } from "@/hooks/use-study-state";
import { RichContent } from "@/components/RichContent";
import { useScreenshotProtection } from "@/hooks/use-screenshot-protection";

export const Route = createFileRoute("/bookmarks")({ component: BookmarksPage });

function BookmarksPage() {
  const { user, profile, loading } = useAuth();
  const nav = useNavigate();
  const { hidden } = useScreenshotProtection();
  const { bookmarks, toggle } = useBookmarks();
  const [cards, setCards] = useState<any[]>([]);
  const [sets, setSets] = useState<Record<string, string>>({});
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => { if (!loading && !user) nav({ to: "/sign-in" }); }, [user, loading, nav]);

  useEffect(() => {
    if (bookmarks.length === 0) { setCards([]); return; }
    supabase.from("cards").select("*").in("id", bookmarks).then(({ data }) => setCards(data || []));
    supabase.from("topic_sets").select("id, title").then(({ data }) => {
      const m: Record<string, string> = {};
      (data || []).forEach((s: any) => { m[s.id] = s.title; });
      setSets(m);
    });
  }, [bookmarks.join("|")]);

  const orderedCards = useMemo(() => {
    // Keep order in which the user bookmarked them.
    const byId = new Map(cards.map((c) => [c.id, c]));
    return bookmarks.map((id) => byId.get(id)).filter(Boolean);
  }, [cards, bookmarks]);

  useEffect(() => { if (idx >= orderedCards.length) setIdx(0); }, [orderedCards.length, idx]);

  if (bookmarks.length === 0) {
    return (
      <div className="min-h-screen bg-hero">
        <AppHeader />
        <main className="container mx-auto px-4 py-10 max-w-3xl">
        <Button asChild className="mb-6 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-0 font-semibold hover:text-white"><Link to="/dashboard" className="text-white"><ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard</Link></Button>
          <Card className="p-10 bg-card text-card-foreground text-center">
            <Star className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="text-xl font-semibold">No bookmarks yet</h3>
            <p className="text-sm text-muted-foreground mt-2">Tap the star on any card to save it here for fast revision.</p>
          </Card>
        </main>
      </div>
    );
  }

  if (orderedCards.length === 0) {
    return <div className="min-h-screen bg-hero"><AppHeader /><div className="container mx-auto p-10 text-muted-foreground">Loading bookmarks…</div></div>;
  }

  const card = orderedCards[idx];
  const progress = ((idx + 1) / orderedCards.length) * 100;

  return (
    <div className="min-h-screen bg-hero no-select">
      <AppHeader />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Button variant="ghost" asChild className="mb-4"><Link to="/dashboard"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Link></Button>
        <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
          <Star className="h-5 w-5 fill-amber-400 text-amber-400" /> My bookmarks
        </h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3 flex-wrap">
          <span>Card {idx + 1} of {orderedCards.length}</span>
          <Badge variant="outline" className="ml-auto text-xs">{sets[card.topic_set_id] || "Card"}</Badge>
        </div>
        <div className="h-1 w-full bg-muted/40 rounded-full overflow-hidden mb-6">
          <div className="h-full bg-brand-gradient transition-all" style={{ width: `${progress}%` }} />
        </div>

        <div className="relative">
          {hidden && <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center text-muted-foreground text-sm">Protected. Return focus to the app to continue.</div>}
          <Card
            className="p-8 min-h-[360px] bg-card text-card-foreground shadow-card-elev cursor-pointer protected-watermark"
            data-watermark={profile?.email || "INDUSTRIAL AUTOMATION"}
            onClick={() => setFlipped((f) => !f)}
          >
            <div>
              <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
                <Badge className="bg-brand-gradient text-primary-foreground">{flipped ? "Answer" : "Question"}</Badge>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); toggle(card.id); }} title="Remove bookmark">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setFlipped(f => !f); }}>
                    <RotateCw className="h-4 w-4 mr-1" /> Flip
                  </Button>
                </div>
              </div>
              <RichContent text={flipped ? card.answer : card.question} />
              {!flipped && <p className="text-xs text-muted-foreground mt-6">Tap card or press Flip to reveal answer.</p>}
            </div>
          </Card>
        </div>

        <div className="flex justify-between mt-8 gap-4">
          <Button disabled={idx === 0} onClick={() => { setIdx(i => i - 1); setFlipped(false); }} className="bg-gradient-to-r from-slate-600 to-slate-700 text-white border-0 font-semibold hover:from-slate-700 hover:to-slate-800 disabled:opacity-50 disabled:cursor-not-allowed hover:text-white">
            <ChevronLeft className="h-5 w-5 mr-2" /> Previous Bookmark
          </Button>
          <Button disabled={idx === orderedCards.length - 1} onClick={() => { setIdx(i => i + 1); setFlipped(false); }} className="bg-gradient-to-r from-slate-600 to-slate-700 text-white border-0 font-semibold hover:from-slate-700 hover:to-slate-800 disabled:opacity-50 disabled:cursor-not-allowed hover:text-white">
            Next Bookmark <ChevronRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </main>
    </div>
  );
}
