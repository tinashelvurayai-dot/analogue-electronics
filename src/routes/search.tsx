import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search as SearchIcon, Star } from "lucide-react";
import { useBookmarks } from "@/hooks/use-study-state";

export const Route = createFileRoute("/search")({ component: SearchPage });

type CardRow = { id: string; question: string; answer: string; topic_set_id: string; order_index: number };

function SearchPage() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [cards, setCards] = useState<CardRow[]>([]);
  const [sets, setSets] = useState<Record<string, { title: string }>>({});
  const { has, toggle } = useBookmarks();

  useEffect(() => { if (!loading && !user) nav({ to: "/sign-in" }); }, [user, loading, nav]);

  useEffect(() => {
    supabase.from("cards").select("id, question, answer, topic_set_id, order_index").then(({ data }) => setCards(data || []));
    supabase.from("topic_sets").select("id, title").then(({ data }) => {
      const m: Record<string, { title: string }> = {};
      (data || []).forEach((s: any) => { m[s.id] = { title: s.title }; });
      setSets(m);
    });
  }, []);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return [];
    return cards.filter((c) =>
      c.question.toLowerCase().includes(needle) || c.answer.toLowerCase().includes(needle)
    ).slice(0, 60);
  }, [q, cards]);

  return (
    <div className="min-h-screen bg-hero">
      <AppHeader />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Button asChild className="mb-6 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-0 font-semibold hover:text-white"><Link to="/dashboard" className="text-white"><ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard</Link></Button>
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white">Search Cards</h1>
        <p className="text-white/80 mb-6">Search across every card in your entire library</p>
        <div className="relative mb-6">
          <SearchIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. Laplace, ladder logic, butterfly valve..." className="pl-9" />
        </div>
        {q.trim() === "" ? (
          <p className="text-sm text-muted-foreground">Start typing to search {cards.length} cards.</p>
        ) : results.length === 0 ? (
          <p className="text-sm text-muted-foreground">No matches for "{q}".</p>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">{results.length} result{results.length === 1 ? "" : "s"}</p>
            {results.map((c) => (
              <Card key={c.id} className="p-4 bg-card text-card-foreground">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <Badge variant="outline" className="mb-2 text-xs">{sets[c.topic_set_id]?.title || "Set"}</Badge>
                    <p className="font-medium line-clamp-2">{c.question}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.answer.replace(/[*`#$]/g, "")}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => toggle(c.id)} title="Bookmark">
                      <Star className={`h-4 w-4 ${has(c.id) ? "fill-amber-400 text-amber-400" : ""}`} />
                    </Button>
                    <Button size="sm" asChild>
                      <Link to="/revise/$setId" params={{ setId: c.topic_set_id }}>Open</Link>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
