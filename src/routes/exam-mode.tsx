import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, Zap, Volume2, Eye, EyeOff, Flag, CheckCircle2, RotateCcw } from "lucide-react";
import { useBookmarks, useMastery } from "@/hooks/use-study-state";
const ALL_EXAM_CARDS: ExamCard[] = [];

export const Route = createFileRoute("/exam-mode")({ component: ExamMode });

interface ExamCard {
  id: string;
  question: string;
  answer: string;
  difficulty?: string;
  topic?: string;
}

function ExamMode() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [cards, setCards] = useState<ExamCard[]>([]);
  const [fetching, setFetching] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewedCards, setReviewedCards] = useState<Set<string>>(new Set());
  const [markedCards, setMarkedCards] = useState<Set<string>>(new Set());
  const { bookmarks, toggle: toggleBookmark } = useBookmarks();
  const { mastery, setLevel } = useMastery();

  useEffect(() => { if (!loading && !user) nav({ to: "/sign-in" }); }, [user, loading, nav]);

  useEffect(() => {
    if (!user) return;
    setFetching(true);
    const loadCards = async () => {
      try {
        // Find topic sets whose title looks exam-related and aggregate their cards.
        const { data: sets } = await supabase
          .from("topic_sets")
          .select("id, title")
          .or("title.ilike.%exam%,title.ilike.%practice%");
        const ids = (sets || []).map((s: any) => s.id);
        let rows: any[] = [];
        if (ids.length > 0) {
          const { data } = await supabase
            .from("cards")
            .select("id, question, answer, difficulty, topic_set_id")
            .in("topic_set_id", ids)
            .order("order_index");
          rows = data || [];
        }
        // Fallback: if no exam-tagged sets found, pull every card so users still see content.
        if (rows.length === 0) {
          const { data } = await supabase
            .from("cards")
            .select("id, question, answer, difficulty, topic_set_id")
            .order("order_index")
            .limit(500);
          rows = data || [];
        }
        setCards(rows.map((c: any) => ({
          id: c.id,
          question: c.question,
          answer: c.answer,
          difficulty: c.difficulty || "medium",
          topic: "EXAM Mode",
        })));
      } catch (e) {
        console.error("[exam-mode] load failed", e);
        setCards(ALL_EXAM_CARDS);
      } finally {
        setFetching(false);
      }
    };
    loadCards();
  }, [user]);

  const currentCard = cards[currentIndex];
  const isBookmarked = currentCard && bookmarks.includes(currentCard.id);
  const isMastered = !!currentCard && mastery[currentCard.id] === "got";
  const progress = useMemo(() => ({
    current: currentIndex + 1,
    total: cards.length,
    reviewed: reviewedCards.size,
    marked: markedCards.size,
    percentage: cards.length > 0 ? Math.round(((currentIndex + 1) / cards.length) * 100) : 0
  }), [currentIndex, cards.length, reviewedCards.size, markedCards.size]);

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
      if (currentCard) setReviewedCards(prev => new Set([...prev, currentCard.id]));
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleMark = () => {
    if (!currentCard) return;
    if (markedCards.has(currentCard.id)) {
      setMarkedCards(prev => {
        const newSet = new Set(prev);
        newSet.delete(currentCard.id);
        return newSet;
      });
    } else {
      setMarkedCards(prev => new Set([...prev, currentCard.id]));
    }
  };

  const handleBookmark = () => {
    if (!currentCard) return;
    toggleBookmark(currentCard.id);
  };

  const handleMastery = async () => {
    if (!currentCard) return;
    setLevel(currentCard.id, isMastered ? null : "got");
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setReviewedCards(new Set());
    setMarkedCards(new Set());
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-hero">
        <AppHeader />
        <main className="container mx-auto px-4 py-10">
          <Button asChild variant="outline" size="sm" className="mb-6 text-white border-white/40 hover:bg-white/10">
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
            </Link>
          </Button>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white"></div>
          </div>
        </main>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="min-h-screen bg-hero">
        <AppHeader />
        <main className="container mx-auto px-4 py-10">
          <Button asChild variant="outline" size="sm" className="mb-6 text-white border-white/40 hover:bg-white/10">
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
            </Link>
          </Button>
          <Card className="p-12 bg-card text-card-foreground text-center">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Exam Questions Yet</h2>
            <p className="text-muted-foreground mb-6">Exam Mode questions are being prepared. Check back soon!</p>
            <Button asChild className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-0">
              <Link to="/dashboard">Return to Dashboard</Link>
            </Button>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hero">
      <AppHeader />
      <main className="container mx-auto px-4 py-10">
        {/* Back Button */}
        <Button asChild variant="outline" size="sm" className="mb-6 text-white border-white/40 hover:bg-white/10">
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
          </Link>
        </Button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-orange-400" />
            <span className="text-xs uppercase tracking-wider text-orange-400 font-semibold">Exam Preparation</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">EXAM Mode</h1>
          <p className="text-white/80 mt-2">Comprehensive exam-level questions covering all automation topics. Practice with the exact format you'll see on the exam.</p>
        </div>

        {/* Progress Overview */}
        <Card className="p-6 bg-gradient-to-r from-orange-600/30 to-amber-600/20 border-orange-500/40 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-white/70 uppercase font-semibold">Current Question</p>
              <p className="text-2xl font-bold text-white mt-1">{progress.current}/{progress.total}</p>
            </div>
            <div>
              <p className="text-xs text-white/70 uppercase font-semibold">Progress</p>
              <p className="text-2xl font-bold text-white mt-1">{progress.percentage}%</p>
            </div>
            <div>
              <p className="text-xs text-white/70 uppercase font-semibold">Reviewed</p>
              <p className="text-2xl font-bold text-white mt-1">{progress.reviewed}</p>
            </div>
            <div>
              <p className="text-xs text-white/70 uppercase font-semibold">Marked</p>
              <p className="text-2xl font-bold text-orange-400 mt-1">{progress.marked}</p>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="mt-4 h-2 w-full bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </Card>

        {/* Main Flashcard */}
        {currentCard && (
          <div className="space-y-6 mb-8">
            {/* Difficulty Badge */}
            <div className="flex items-center gap-2 flex-wrap">
              {currentCard.difficulty && (
                <Badge className={`
                  ${currentCard.difficulty === 'easy' ? 'bg-green-600/70 border-green-500/50' : 
                    currentCard.difficulty === 'medium' ? 'bg-yellow-600/70 border-yellow-500/50' :
                    'bg-red-600/70 border-red-500/50'} text-white border`}>
                  {currentCard.difficulty.charAt(0).toUpperCase() + currentCard.difficulty.slice(1)} Level
                </Badge>
              )}
              <span className="text-xs text-white/60">Question {progress.current}</span>
            </div>

            {/* Flashcard */}
            <Card 
              className="min-h-96 bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border-purple-500/40 p-8 cursor-pointer transition-all duration-300 hover:shadow-lg"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div className="h-full flex flex-col justify-between relative">
                <div>
                  <div className="absolute top-4 right-4">
                    {isFlipped ? <EyeOff className="h-5 w-5 text-purple-400" /> : <Eye className="h-5 w-5 text-purple-400" />}
                  </div>
                  <p className="text-sm font-semibold text-purple-300/80 mb-4">
                    {isFlipped ? "ANSWER" : "QUESTION"}
                  </p>
                  <div className="text-white text-lg md:text-xl leading-relaxed font-medium min-h-24">
                    {isFlipped ? currentCard.answer : currentCard.question}
                  </div>
                </div>
                <div className="text-center text-white/50 text-sm mt-6">
                  Click to {isFlipped ? "show question" : "reveal answer"}
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                onClick={handleBookmark}
                className={`${isBookmarked ? 'bg-amber-600 hover:bg-amber-700' : 'bg-white/20 hover:bg-white/30'} text-white border-0`}
              >
                ★ {isBookmarked ? "Bookmarked" : "Bookmark"}
              </Button>
              <Button
                onClick={handleMark}
                className={`${markedCards.has(currentCard.id) ? 'bg-orange-600 hover:bg-orange-700' : 'bg-white/20 hover:bg-white/30'} text-white border-0`}
              >
                <Flag className="h-4 w-4 mr-2" /> {markedCards.has(currentCard.id) ? "Marked" : "Mark for Review"}
              </Button>
              <Button
                onClick={handleMastery}
                className={`${isMastered ? 'bg-green-600 hover:bg-green-700' : 'bg-white/20 hover:bg-white/30'} text-white border-0`}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" /> {isMastered ? "Mastered" : "Mark Mastered"}
              </Button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 justify-center mb-8">
          <Button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            variant="outline"
            className="text-white border-white/40 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            className="text-white border-white/40 hover:bg-white/10"
          >
            <RotateCcw className="h-4 w-4 mr-2" /> Reset
          </Button>
          <Button
            onClick={handleNext}
            disabled={currentIndex === cards.length - 1}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next →
          </Button>
        </div>

        {/* End of Exam Info */}
        {currentIndex === cards.length - 1 && (
          <Card className="p-6 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-green-500/40 text-center">
            <CheckCircle2 className="h-12 w-12 mx-auto text-green-400 mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">Reached End of Exam</h3>
            <p className="text-white/80 mb-4">You've reviewed all {cards.length} exam questions. Great preparation!</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Button asChild className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-0">
                <Link to="/dashboard">Return to Dashboard</Link>
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                className="text-white border-white/40 hover:bg-white/10"
              >
                Start Over
              </Button>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
