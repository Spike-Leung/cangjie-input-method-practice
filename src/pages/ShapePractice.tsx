import { useCallback, useEffect, useRef, useState } from "react";
import { Keyboard } from "../components/Keyboard";
import { QuizCard } from "../components/QuizCard";
import { useQuiz } from "../hooks/useQuiz";
import { useHintState } from "../hooks/useHintState";
import { AUXILIARY_SHAPES } from "../data/auxiliaryShapes";
import { cangjieLetters } from "../data/letterMap";
import { weightedPick } from "../utils/weightedRandom";

const STATS_KEY = "cangjie-shape-stats";
const FILTER_KEY = "cangjie-shape-disabled";

interface KeyStats {
  correct: number;
  total: number;
}

function loadStats(): Record<string, KeyStats> {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStats(stats: Record<string, KeyStats>) {
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

export function ShapePractice() {
  const { current, lastResult, lastCorrectKey, lastWrongKey, next, answer } =
    useQuiz(AUXILIARY_SHAPES);

  const stats = useRef<Record<string, KeyStats>>(loadStats());
  const disabledKeys = useRef<Set<string>>(loadDisabled());

  const [editMode, setEditMode] = useState(false);
  const { showHint, toggleHint } = useHintState();
  const [, forceRender] = useState(0);

  const toggleKey = useCallback((key: string) => {
    const next = new Set(disabledKeys.current);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    saveDisabled(next);
    disabledKeys.current = next;
    forceRender((n) => n + 1);
  }, []);

  const toggleAllKeys = useCallback(() => {
    if (disabledKeys.current.size === 0) {
      const all = new Set(Object.keys(cangjieLetters));
      saveDisabled(all);
      disabledKeys.current = all;
    } else {
      const empty = new Set<string>();
      saveDisabled(empty);
      disabledKeys.current = empty;
    }
    forceRender((n) => n + 1);
  }, []);

  const pickNext = useCallback(() => {
    const dk = disabledKeys.current;
    const candidates = AUXILIARY_SHAPES.filter((s) => !dk.has(s.key));
    if (candidates.length === 0) return;
    const st = stats.current;
    const weighted = candidates.map((s) => {
      const ks = st[s.key] ?? { correct: 0, total: 0 };
      const errorRate = ks.total > 0 ? (ks.total - ks.correct) / ks.total : 0;
      return { ...s, weight: 1 + errorRate * 6 };
    });
    next(() => weightedPick(weighted));
  }, [next]);

  const toggleEdit = useCallback(() => {
    setEditMode((v) => !v);
    editMode && pickNext();
  }, [editMode, pickNext]);

  const handleKeyPress = useCallback(
    (key: string) => {
      if (!current) return;
      if (lastResult === "correct") return;
      const correctKey = current.key;
      const isCorrect = key === correctKey;

      const ls = stats.current;
      if (!ls[correctKey]) ls[correctKey] = { correct: 0, total: 0 };
      ls[correctKey].total += 1;
      if (isCorrect) ls[correctKey].correct += 1;
      saveStats(ls);

      answer(key, correctKey);
      if (isCorrect) {
        setTimeout(pickNext, 100);
      }
    },
    [current, lastResult, answer, pickNext],
  );

  useEffect(() => {
    if (!current) pickNext();
  }, [current, pickNext]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (editMode) return;
      if (e.code === "Space") {
        e.preventDefault();
        toggleHint();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [editMode]);

  const display = current ? current.letter : "";

  return (
    <div className="practice-page">
      <h1>倉頡輔助字型練習</h1>
      <QuizCard
        display={display}
        image={current?.image}
        hint={current?.letter}
        showHint={showHint}
        onToggleHint={toggleHint}
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
        onToggleEdit={toggleEdit}
        onToggleAllKeys={toggleAllKeys}
      />
    </div>
  );
}
