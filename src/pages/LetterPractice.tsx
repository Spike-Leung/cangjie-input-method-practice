import { useCallback, useEffect, useRef, useState } from "react";
import { Keyboard } from "../components/Keyboard";
import { QuizCard } from "../components/QuizCard";
import { useQuiz } from "../hooks/useQuiz";
import { LETTERS, cangjieLetters, getKey } from "../data/letterMap";
import { weightedPick } from "../utils/weightedRandom";

const STATS_KEY = "cangjie-letter-stats";
const FILTER_KEY = "cangjie-letter-disabled";

interface LetterStats {
  correct: number;
  total: number;
}

interface WeightedLetter {
  letter: string;
  weight: number;
}

function loadStats(): Record<string, LetterStats> {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStats(stats: Record<string, LetterStats>) {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

function loadDisabled(): Set<string> {
  try {
    const raw = localStorage.getItem(FILTER_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveDisabled(keys: Set<string>) {
  localStorage.setItem(FILTER_KEY, JSON.stringify([...keys]));
}

export function LetterPractice() {
  const { current, lastResult, lastCorrectKey, lastWrongKey, next, answer } = useQuiz(LETTERS);

  const letterStats = useRef<Record<string, LetterStats>>(loadStats());
  const prev = useRef<string | null>(null);
  const disabledKeys = useRef<Set<string>>(loadDisabled());

  const [editMode, setEditMode] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [, forceRender] = useState(0);

  const toggleKey = useCallback((key: string) => {
    const next = new Set(disabledKeys.current);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    saveDisabled(next);
    disabledKeys.current = next;
    forceRender((n) => n + 1);
  }, []);

  const resetKeys = useCallback(() => {
    const empty = new Set<string>();
    saveDisabled(empty);
    disabledKeys.current = empty;
    forceRender((n) => n + 1);
  }, []);

  const loadPool = useCallback((): WeightedLetter[] => {
    const exclude = prev.current;
    const stats = letterStats.current;
    const dk = disabledKeys.current;
    let candidates = LETTERS.filter((l) => !dk.has(l));
    if (candidates.length > 1 && exclude) {
      const withoutPrev = candidates.filter((l) => l !== exclude);
      if (withoutPrev.length > 0) candidates = withoutPrev;
    }
    return candidates.map((l) => {
      const st = stats[l] ?? { correct: 0, total: 0 };
      const errorRate = st.total > 0 ? (st.total - st.correct) / st.total : 0;
      return { letter: l, weight: 1 + errorRate * 6 };
    });
  }, []);

  const pickNext = useCallback(() => {
    const pool = loadPool();
    if (pool.length === 0) return;
    next(() => {
      const picked = weightedPick(pool);
      prev.current = picked.letter;
      return picked.letter;
    });
  }, [next, loadPool]);

  const handleKeyPress = useCallback(
    (key: string) => {
      if (!current) return;
      if (lastResult === "correct") return;
      const correctKey = getKey(cangjieLetters[current]);
      const isCorrect = key === correctKey;

      const ls = letterStats.current;
      if (!ls[correctKey]) ls[correctKey] = { correct: 0, total: 0 };
      ls[correctKey].total += 1;
      if (isCorrect) ls[correctKey].correct += 1;
      saveStats(ls);

      if (isCorrect) {
        answer(key, correctKey);
        setTimeout(pickNext, 100);
      } else if (lastResult === "wrong") {
        answer(key, correctKey);
        setTimeout(pickNext, 100);
      } else {
        answer(key, correctKey);
      }
    },
    [current, lastResult, answer, pickNext]
  );

  useEffect(() => {
    if (!current) pickNext();
  }, [current, pickNext]);

  const display = current ? cangjieLetters[current] : "";

  return (
    <div className="practice-page">
      <h1>倉頡字母鍵位練習</h1>
      <QuizCard
        display={display}
        hint={current ?? undefined}
        showHint={showHint}
        onToggleHint={() => setShowHint((v) => !v)}
        lastResult={lastResult}
      />
      <Keyboard
        onKeyPress={handleKeyPress}
        highlightKey={lastResult === "correct" ? lastCorrectKey : null}
        highlightColor={lastResult === "correct" ? "correct" : null}
        wrongKey={lastResult === "wrong" ? lastWrongKey : null}
        editMode={editMode}
        disabledKeys={disabledKeys.current}
        onToggleKey={toggleKey}
        onToggleEdit={() => setEditMode((v) => !v)}
        onResetKeys={resetKeys}
      />
    </div>
  );
}
