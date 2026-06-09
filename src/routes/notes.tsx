import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { RichContent } from "@/components/RichContent";

export const Route = createFileRoute("/notes")({ component: StudyNotes });

interface StudyNote {
  id: string;
  title: string;
  category: string;
  content: string;
  order_index: number;
}

function StudyNotes() {
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from("study_notes")
          .select("*")
          .order("category")
          .order("order_index");
        
        if (data) {
          setNotes(data as StudyNote[]);
          const firstCategory = [...new Set(data.map(n => n.category))][0];
          setSelectedCategory(firstCategory || null);
        }
      } catch (error) {
        console.error("[v0] Error loading study notes:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const categories = [...new Set(notes.map(n => n.category))];
  const activeNotes = selectedCategory 
    ? notes.filter(n => n.category === selectedCategory)
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-hero">
        <AppHeader />
        <div className="container mx-auto p-10 text-muted-foreground">Loading study materials…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hero">
      <AppHeader />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="h-6 w-6 text-secondary" />
            <h1 className="text-4xl font-bold text-foreground">Study Materials</h1>
          </div>
          <p className="text-foreground/70">
            Professional course notes and reference materials with LaTeX-formatted equations and tables.
          </p>
        </div>

        {categories.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>Study materials coming soon.</p>
          </Card>
        ) : (
          <div className="space-y-6">
            <Tabs value={selectedCategory || ""} onValueChange={setSelectedCategory} className="w-full">
              <TabsList className="grid w-full gap-2" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(150px, 1fr))` }}>
                {categories.map(cat => (
                  <TabsTrigger key={cat} value={cat} className="text-xs sm:text-sm">
                    {cat}
                  </TabsTrigger>
                ))}
              </TabsList>

              {categories.map(cat => (
                <TabsContent key={cat} value={cat} className="space-y-6 mt-6">
                  {notes.filter(n => n.category === cat).map(note => (
                    <Card key={note.id} className="p-6 md:p-8 bg-card text-card-foreground shadow-card-elev">
                      <h2 className="text-2xl font-bold mb-4 text-foreground">{note.title}</h2>
                      <div className="prose prose-invert max-w-none text-sm md:text-base leading-relaxed">
                        <RichContent text={note.content} />
                      </div>
                    </Card>
                  ))}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        )}
      </main>
    </div>
  );
}
