/**
 * Per-user study state stored in localStorage.
 *  - mastery: cardId -> "got" | "practice"
 *  - bookmarks: Set<cardId>
 * Reactive via a window-level "studystate" event so multiple components stay in sync.
 */
import { useCallback, useEffect, useState } from "react";

const MASTERY_KEY = "ia.mastery.v1";
const BOOKMARK_KEY = "ia.bookmarks.v1";
const EVT = "ia-study-state";

export type MasteryLevel = "got" | "practice";
export type MasteryMap = Record<string, MasteryLevel>;

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function writeJSON(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event(EVT));
  } catch {}
}

export function useMastery() {
  const [map, setMap] = useState<MasteryMap>(() => readJSON(MASTERY_KEY, {}));
  useEffect(() => {
    const onChange = () => setMap(readJSON(MASTERY_KEY, {}));
    window.addEventListener(EVT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);
  const setLevel = useCallback((cardId: string, level: MasteryLevel | null) => {
    const next = { ...readJSON<MasteryMap>(MASTERY_KEY, {}) };
    if (level === null) delete next[cardId];
    else next[cardId] = level;
    writeJSON(MASTERY_KEY, next);
  }, []);
  return { mastery: map, setLevel };
}

export function useBookmarks() {
  const [ids, setIds] = useState<string[]>(() => readJSON<string[]>(BOOKMARK_KEY, []));
  useEffect(() => {
    const onChange = () => setIds(readJSON<string[]>(BOOKMARK_KEY, []));
    window.addEventListener(EVT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);
  const toggle = useCallback((cardId: string) => {
    const current = readJSON<string[]>(BOOKMARK_KEY, []);
    const next = current.includes(cardId)
      ? current.filter((x) => x !== cardId)
      : [...current, cardId];
    writeJSON(BOOKMARK_KEY, next);
  }, []);
  const has = useCallback((cardId: string) => ids.includes(cardId), [ids]);
  return { bookmarks: ids, toggle, has };
}

/** Summarise mastery for a set of card ids. */
export function summariseMastery(cardIds: string[], mastery: MasteryMap) {
  if (cardIds.length === 0) return { reviewed: 0, got: 0, practice: 0, percent: 0, masteryPercent: 0 };
  let got = 0, practice = 0;
  for (const id of cardIds) {
    const v = mastery[id];
    if (v === "got") got++;
    else if (v === "practice") practice++;
  }
  const reviewed = got + practice;
  return {
    reviewed,
    got,
    practice,
    percent: Math.round((reviewed / cardIds.length) * 100),
    masteryPercent: Math.round((got / cardIds.length) * 100),
  };
}
