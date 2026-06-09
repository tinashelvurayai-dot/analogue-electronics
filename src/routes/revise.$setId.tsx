import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, ArrowLeft, Lock, RotateCw, Star, ThumbsUp, AlertCircle, Flame, Target, Brain } from "lucide-react";
import { useScreenshotProtection } from "@/hooks/use-screenshot-protection";
import { RichContent } from "@/components/RichContent";
import { useBookmarks, useMastery, summariseMastery } from "@/hooks/use-study-state";

export const Route = createFileRoute("/revise/$setId")({ component: Revise });

function Revise() {
  const { setId } = Route.useParams();
  const { user, profile, loading } = useAuth();
  const nav = useNavigate();
  const { hidden } = useScreenshotProtection();
  const [set, setSet] = useState<any>(null);
  const [cards, setCards] = useState<any[]>([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const { mastery, setLevel } = useMastery();
  const { has: isBookmarked, toggle: toggleBookmark } = useBookmarks();

  useEffect(() => { if (!loading && !user) nav({ to: "/sign-in" }); }, [user, loading, nav]);

  useEffect(() => {
    (async () => {
      try {
        const [setResult, cardsResult] = await Promise.all([
          supabase
            .from("topic_sets")
            .select("*")
            .eq("id", setId)
            .maybeSingle(),
          supabase
            .from("cards")
            .select("*")
            .eq("topic_set_id", setId)
            .order("order_index")
            .limit(1000) // Prevent loading excessive cards
        ]);
        setSet(setResult.data);
        setCards(cardsResult.data || []);
      } catch (error) {
        console.error("[v0] Error loading topic data:", error);
      }
    })();
  }, [setId]);

  const summary = useMemo(() => summariseMastery(cards.map((c) => c.id), mastery), [cards, mastery]);

  if (!set || cards.length === 0) {
    return <div className="min-h-screen bg-hero"><AppHeader /><div className="container mx-auto p-10 text-muted-foreground">Loading…</div></div>;
  }

  const isFull = profile?.access_level === "full";
  const card = cards[idx];
  const locked = false; // All cards available to all users
  const progress = ((idx + 1) / cards.length) * 100;

  const goNext = () => { setIdx((i) => Math.min(cards.length - 1, i + 1)); setFlipped(false); };
  const mark = (level: "got" | "practice") => {
    setLevel(card.id, level);
    if (idx < cards.length - 1) goNext();
  };
  const cardLevel = mastery[card.id];

  return (
    <div className="min-h-screen bg-hero no-select">
      <AppHeader />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Button asChild className="mb-6 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-0 font-semibold hover:text-white"><Link to="/dashboard" className="text-white"><ArrowLeft className="h-4 w-4 mr-1" /> Back to All Topics</Link></Button>
        
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-foreground">{set.title}</h1>
          <p className="text-foreground/75 text-sm md:text-base leading-relaxed max-w-2xl">{set.description}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-purple-600/20 to-purple-500/10 border border-purple-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm text-foreground/70 mb-1">
              <Brain className="h-4 w-4 text-purple-600" />
              <span className="font-semibold">Progress</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{idx + 1}<span className="text-sm text-foreground/60 font-normal"> / {cards.length}</span></div>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm text-foreground/70 mb-1">
              <Flame className="h-4 w-4 text-emerald-600" />
              <span className="font-semibold">Mastered</span>
            </div>
            <div className="text-2xl font-bold text-emerald-400">{summary.got}</div>
          </div>
          
          <div className="bg-gradient-to-br from-amber-600/20 to-amber-500/10 border border-amber-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm text-foreground/70 mb-1">
              <Target className="h-4 w-4 text-amber-600" />
              <span className="font-semibold">To Revisit</span>
            </div>
            <div className="text-2xl font-bold text-amber-400">{summary.practice}</div>
          </div>
        </div>

        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between text-sm font-semibold text-foreground/70">
            <span>Mastery Progress</span>
            <span className="text-purple-600">{summary.masteryPercent}% Complete</span>
          </div>
          <div className="h-3 w-full bg-muted/40 rounded-full overflow-hidden flex gap-0.5">
            <div className="h-full bg-gradient-to-r from-purple-600 to-purple-500 transition-all duration-500" style={{ width: `${summary.masteryPercent}%` }} />
            <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500" style={{ width: `${Math.max(0, 100 - summary.masteryPercent)}%` }} />
          </div>
        </div>

        <div className="relative">
          {hidden && <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center text-muted-foreground text-sm">Protected. Return focus to the app to continue.</div>}
          <Card
            className={`p-8 md:p-10 min-h-[420px] bg-gradient-to-br ${flipped ? "from-purple-600/15 to-indigo-600/10" : "from-slate-50/5 to-slate-100/5"} text-card-foreground shadow-lg cursor-pointer protected-watermark transition-all duration-300 border-2 border-purple-500/30 hover:border-purple-500/50`}
            data-watermark={profile?.email || "INDUSTRIAL AUTOMATION"}
            onClick={() => !locked && setFlipped((f) => !f)}
          >
            {false ? (
              <div className="flex flex-col items-center justify-center text-center h-[350px] gap-4">
                <Lock className="h-16 w-16 text-purple-500/40" />
                <h3 className="text-2xl font-bold text-foreground">Full Access Unlocks Everything</h3>
                <p className="text-foreground/75 max-w-md leading-relaxed">
                  You've mastered the free preview! Contact an authorised agent for full access to all {cards.length} cards in this topic.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <Badge className={`${flipped ? "bg-gradient-to-r from-purple-600 to-indigo-600" : "bg-gradient-to-r from-slate-600 to-slate-700"} text-white border-0 text-sm font-semibold px-3 py-1`}>
                    {flipped ? "📌 Answer" : "❓ Question"}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      title={isBookmarked(card.id) ? "Remove bookmark" : "Bookmark card"}
                      onClick={(e) => { e.stopPropagation(); toggleBookmark(card.id); }}
                      className="hover:bg-purple-500/20"
                    >
                      <Star className={`h-5 w-5 ${isBookmarked(card.id) ? "fill-amber-400 text-amber-400" : "text-foreground/50"}`} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setFlipped(f => !f); }} className="hover:bg-purple-500/20">
                      <RotateCw className="h-5 w-5 mr-2" /> Flip
                    </Button>
                  </div>
                </div>
                <div className={`text-lg leading-relaxed text-foreground ${!flipped ? "font-semibold" : ""}`}>
                  <RichContent text={flipped ? card.answer : card.question} />
                </div>
                {!flipped && <p className="text-sm text-foreground/60 flex items-center justify-center gap-2 pt-4 border-t border-purple-500/20">💡 Tap the card or click Flip to reveal the answer</p>}
              </div>
            )}
          </Card>
        </div>

        {!locked && (
          <div className="grid grid-cols-2 gap-4 mt-8">
            <Button
              className={cardLevel === "practice" ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 font-semibold text-base py-6" : "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 font-semibold text-base py-6 hover:from-amber-600 hover:to-orange-600"}
              onClick={(e) => { e.stopPropagation(); mark("practice"); }}
            >
              <AlertCircle className="h-5 w-5 mr-2" /> 
              <span>Needs Practice</span>
            </Button>
            <Button
              className={cardLevel === "got" ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 font-semibold text-base py-6" : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 font-semibold text-base py-6 hover:from-emerald-600 hover:to-teal-600"}
              onClick={(e) => { e.stopPropagation(); mark("got"); }}
            >
              <ThumbsUp className="h-5 w-5 mr-2" /> 
              <span>Got It!</span>
            </Button>
          </div>
        )}

        <div className="flex justify-between mt-8 gap-4">
          <Button 
            disabled={idx === 0} 
            onClick={() => { setIdx(i => i - 1); setFlipped(false); }}
            className="bg-gradient-to-r from-slate-600 to-slate-700 text-white border-0 font-semibold hover:from-slate-700 hover:to-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-5 w-5 mr-2" /> Previous Card
          </Button>
          <Button 
            disabled={idx === cards.length - 1} 
            onClick={goNext}
            className="bg-gradient-to-r from-slate-600 to-slate-700 text-white border-0 font-semibold hover:from-slate-700 hover:to-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next Card <ChevronRight className="h-5 w-5 ml-2" />
          </Button>
        </div>

        <div className="mt-6 flex gap-4">
          <Button asChild className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-0 font-semibold py-6">
            <Link to="/dashboard"><ArrowLeft className="h-4 w-4 mr-2" /> Return to All Topics</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
