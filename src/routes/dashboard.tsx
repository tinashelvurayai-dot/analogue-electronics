import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Unlock, BookOpen, Sparkles, ArrowRight, UserCheck, Star, Search, Flame, Zap, Target, ShieldCheck } from "lucide-react";
import { useBookmarks, useMastery, summariseMastery } from "@/hooks/use-study-state";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

const DEFAULT_AGENT_PLACEHOLDER = "Contact admin for agent details";

function Dashboard() {
  const { user, profile, loading } = useAuth();
  const nav = useNavigate();
  const [sets, setSets] = useState<any[]>([]);
  const [setCardIds, setSetCardIds] = useState<Record<string, string[]>>({});
  const [fetching, setFetching] = useState(true);
  const [agentName, setAgentName] = useState<string | null>(null);
  const { mastery } = useMastery();
  const { bookmarks } = useBookmarks();

  useEffect(() => { if (!loading && !user) nav({ to: "/sign-in" }); }, [user, loading, nav]);

  useEffect(() => {
    if (!user) return;
    setFetching(true);
    (async () => {
      try {
        // Optimized parallel queries with explicit column selection
        const [setResult, cardsResult, settingsResult] = await Promise.all([
          supabase
            .from("topic_sets")
            .select("id, title, description, order_index, free_card_limit")
            .order("order_index"),
          supabase
            .from("cards")
            .select("id, topic_set_id"),
          supabase
            .from("app_settings")
            .select("primary_agent_name")
            .eq("id", true)
            .maybeSingle()
        ]);

        setSets(setResult.data || []);
        
        const map: Record<string, string[]> = {};
        (cardsResult.data || []).forEach((r: any) => {
          (map[r.topic_set_id] ||= []).push(r.id);
        });
        setSetCardIds(map);
        
        if (settingsResult.data?.primary_agent_name) {
          setAgentName(settingsResult.data.primary_agent_name);
        }
        
        setFetching(false);
      } catch (error) {
        console.error("[v0] Error loading dashboard data:", error);
        setFetching(false);
      }
    })();
  }, [user]);

  const isFull = profile?.access_level === "full";
  const totalCards = useMemo(() => Object.values(setCardIds).reduce((s, x) => s + x.length, 0), [setCardIds]);
  const showAgent = agentName && agentName.trim() && agentName.trim() !== DEFAULT_AGENT_PLACEHOLDER;

  return (
    <div className="min-h-screen bg-hero">
      <AppHeader />
      <main className="container mx-auto px-4 py-10">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-secondary" />
            <span className="text-xs uppercase tracking-wider text-secondary font-semibold">Your library</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}
          </h1>
          <p className="text-white/90 mt-2 inline-flex items-center gap-2 flex-wrap">
            <Unlock className="h-4 w-4 text-secondary" />
            <span className="font-medium">{isFull ? "Full access unlocked – every card across every paper is yours." : "Free preview – first cards of each topic are unlocked."}</span>
            {totalCards > 0 && <span className="text-xs font-medium">· {totalCards} cards total</span>}
          </p>
          {showAgent && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-md border border-secondary/40 bg-secondary/5 px-3 py-1.5 text-sm">
              <UserCheck className="h-4 w-4 text-secondary" />
              <span className="inline-flex items-center gap-2 flex-wrap">
                <span>Authorised agent: <strong>{agentName}</strong></span>
                <span className="inline-flex items-center gap-1 rounded-full border border-secondary/50 bg-secondary/10 px-2.5 py-1 text-[11px] font-semibold text-secondary">
                  <ShieldCheck className="h-3.5 w-3.5" /> Verified ZIM Agent
                </span>
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            <Button asChild className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-0 font-semibold"><Link to="/search" className="text-white"><Search className="h-4 w-4 mr-1" /> Search all cards</Link></Button>
            <Button asChild className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-0 font-semibold">
              <Link to="/bookmarks" className="text-white">
                <Star className="h-4 w-4 mr-1 fill-amber-400 text-amber-400" /> My bookmarks
                {bookmarks.length > 0 && <Badge className="ml-2 bg-amber-400/20 border-amber-400/40 text-amber-300">{bookmarks.length}</Badge>}
              </Link>
            </Button>
          </div>
          
          {/* EXAM Mode Card */}
          <Card className="p-6 bg-gradient-to-r from-orange-600/30 to-red-600/20 border-orange-500/40 hover:border-orange-500/60 transition">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">EXAM Mode</h3>
                  <p className="text-white/80 text-sm">Comprehensive exam-level questions from past papers</p>
                </div>
              </div>
              <Button asChild className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white border-0 font-semibold whitespace-nowrap">
                <Link to="/exam-mode" className="text-white">
                  Start Exam <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </Card>
        </div>

        {fetching ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="p-6 bg-card animate-pulse h-48" />
            ))}
          </div>
        ) : sets.length === 0 ? (
          <Card className="p-10 bg-card text-card-foreground text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="text-xl font-semibold">No topic sets yet</h3>
            <p className="text-sm text-muted-foreground mt-2">Admin hasn't added content to the library yet. Check back soon.</p>
          </Card>
        ) : (
          <>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-white/80">
                <Zap className="h-4 w-4 text-purple-400" />
                <span><strong>{sets.length} comprehensive topics</strong> • Unlock your full learning potential</span>
              </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {sets.map((s, i) => {
              const ids = setCardIds[s.id] || [];
              const total = ids.length;
              const stat = summariseMastery(ids, mastery);
              
              // Purple accent colors for all cards
              const purpleShades = [
                "from-purple-600/30 to-purple-500/20 border-purple-500/40 hover:border-purple-500/60",
                "from-purple-500/30 to-indigo-500/20 border-indigo-500/40 hover:border-indigo-500/60",
                "from-purple-700/30 to-purple-600/20 border-purple-600/40 hover:border-purple-600/60",
              ];
              const purpleGradient = purpleShades[i % purpleShades.length];
              
              return (
                <Card key={s.id} className={`p-6 bg-gradient-to-br ${purpleGradient} text-card-foreground shadow-card-elev transition-all duration-300 border-2 hover:shadow-lg hover:scale-105 relative overflow-hidden group cursor-pointer`}>
                  <div className="absolute -top-4 -right-4 h-24 w-24 bg-gradient-to-br from-purple-400/10 to-transparent rounded-full blur-2xl group-hover:from-purple-400/20 transition" />
                  <div className="absolute -bottom-6 -left-6 h-20 w-20 bg-gradient-to-tr from-purple-300/10 to-transparent rounded-full blur-2xl group-hover:from-purple-300/20 transition" />
                  
                  <div className="relative z-10 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-purple-600/70 text-white border-0">Topic {s.order_index}</Badge>
                          {total > 0 && <Badge variant="outline" className="text-xs border-purple-500/50 text-purple-600">{total} cards</Badge>}
                        </div>
                        <h3 className="font-bold text-lg md:text-xl text-foreground leading-tight">{s.title}</h3>
                      </div>
                    </div>

                    <p className="text-sm text-foreground/80 leading-relaxed">{s.description}</p>

                    {total > 0 && (
                      <div className="pt-2 border-t border-purple-500/20 space-y-2">
                        <div className="flex items-center justify-between text-xs font-semibold text-foreground/70">
                          <div className="flex items-center gap-1">
                            <Target className="h-3 w-3 text-purple-600" />
                            <span>{stat.reviewed} / {total} reviewed</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Flame className="h-3 w-3 text-orange-500" />
                            <span>{stat.masteryPercent}% mastered</span>
                          </div>
                        </div>
                        <div className="h-2 w-full bg-muted/40 rounded-full overflow-hidden flex gap-0.5">
                          <div className="h-full bg-gradient-to-r from-purple-600 to-purple-500" style={{ width: `${stat.masteryPercent}%` }} />
                          <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400" style={{ width: `${Math.max(0, stat.percent - stat.masteryPercent)}%` }} />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-purple-500/20">
                      <div className="text-xs text-foreground/70 font-medium">
                        <span className="text-purple-600 font-semibold">✓ Full Access</span>
                      </div>
                      <Button asChild size="sm" className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-0">
                        <Link to="/revise/$setId" params={{ setId: s.id }}>
                          Learn <ArrowRight className="h-3 w-3 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
