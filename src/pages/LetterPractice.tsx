import { useCallback, useEffect, useRef } from "react";
import { Keyboard } from "../components/Keyboard";
import { QuizCard } from "../components/QuizCard";
import { useQuiz } from "../hooks/useQuiz";
import { LETTERS, cangjieLetters, getKey } from "../data/letterMap";
import { weightedPick } from "../utils/weightedRandom";

const STORAGE_KEY = "cangjie-letter-stats";

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
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStats(stats: Record<string, LetterStats>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

export function LetterPractice() {
  const { current, lastResult, lastCorrectKey, lastWrongKey, next, answer } = useQuiz(LETTERS);

  const letterStats = useRef<Record<string, LetterStats>>(loadStats());
  const prev = useRef<string | null>(null);

  const loadPool = useCallback((): WeightedLetter[] => {
    const exclude = prev.current;
    const stats = letterStats.current;
    return LETTERS
      .filter((l) => l !== exclude)
      .map((l) => {
        const st = stats[l] ?? { correct: 0, total: 0 };
        const errorRate = st.total > 0 ? (st.total - st.correct) / st.total : 0;
        return { letter: l, weight: 1 + errorRate * 6 };
      });
  }, []);

  const pickNext = useCallback(() => {
    const pool = loadPool();
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
      <p className="page-desc">看到倉頡字母，按下對應的英文鍵位</p>
      <QuizCard
        label="請輸入對應鍵位"
        display={display}
        lastResult={lastResult}
        lastCorrectKey={lastCorrectKey}
      />
      <Keyboard
        onKeyPress={handleKeyPress}
        highlightKey={lastResult === "correct" ? lastCorrectKey : null}
        highlightColor={lastResult === "correct" ? "correct" : null}
        wrongKey={lastResult === "wrong" ? lastWrongKey : null}
      />
    </div>
  );
}
