import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Volume2, Square, ChevronDown, User, UserRound } from "lucide-react";

type ToneKey = "female" | "male";

const STORAGE_KEY = "ae1.tts.tone";

function pickVoice(voices: SpeechSynthesisVoice[], tone: ToneKey): SpeechSynthesisVoice | undefined {
  if (!voices.length) return undefined;
  const english = voices.filter((v) => v.lang?.toLowerCase().startsWith("en"));
  const pool = english.length ? english : voices;
  const femaleHints = ["female", "samantha", "victoria", "karen", "moira", "tessa", "fiona", "zira", "susan", "amy", "joanna", "salli", "ivy", "kimberly", "kendra"];
  const maleHints = ["male", "daniel", "alex", "fred", "tom", "david", "mark", "george", "oliver", "rishi", "aaron", "arthur", "matthew", "joey", "justin"];
  const hints = tone === "female" ? femaleHints : maleHints;
  const match = pool.find((v) => hints.some((h) => v.name.toLowerCase().includes(h)));
  if (match) return match;
  // Fallback: female -> first voice, male -> last voice (rough heuristic)
  return tone === "female" ? pool[0] : pool[pool.length - 1];
}

function stripMarkup(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\$\$[\s\S]*?\$\$/g, " ")
    .replace(/\$[^$\n]*\$/g, " ")
    .replace(/[*_`#>]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function ReadAloudButton({ text, label = "Read aloud" }: { text: string; label?: string }) {
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;
  const [speaking, setSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [tone, setTone] = useState<ToneKey>(() => {
    if (typeof window === "undefined") return "female";
    return ((window.localStorage.getItem(STORAGE_KEY) as ToneKey) ?? "female");
  });
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!supported) return;
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.addEventListener?.("voiceschanged", load);
    return () => window.speechSynthesis.removeEventListener?.("voiceschanged", load);
  }, [supported]);

  useEffect(() => {
    return () => {
      if (supported) window.speechSynthesis.cancel();
    };
  }, [supported]);

  if (!supported) return null;

  const setToneAndStore = (t: ToneKey) => {
    setTone(t);
    try { window.localStorage.setItem(STORAGE_KEY, t); } catch { /* ignore */ }
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  const speak = () => {
    const clean = stripMarkup(text);
    if (!clean) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(clean);
    const voice = pickVoice(voices, tone);
    if (voice) u.voice = voice;
    u.rate = 1;
    u.pitch = tone === "female" ? 1.05 : 0.95;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    utterRef.current = u;
    setSpeaking(true);
    window.speechSynthesis.speak(u);
  };

  return (
    <div className="inline-flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={speaking ? stop : speak}
        className="hover:bg-purple-500/20"
        title={speaking ? "Stop" : label}
      >
        {speaking ? <Square className="h-4 w-4 mr-1" /> : <Volume2 className="h-4 w-4 mr-1" />}
        <span className="text-xs">{speaking ? "Stop" : tone === "female" ? "Female" : "Male"}</span>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="ghost" size="sm" className="px-1 hover:bg-purple-500/20" title="Voice tone">
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Voice tone</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setToneAndStore("female")}>
            <UserRound className="h-4 w-4 mr-2" /> Female {tone === "female" && "·"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setToneAndStore("male")}>
            <User className="h-4 w-4 mr-2" /> Male {tone === "male" && "·"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}