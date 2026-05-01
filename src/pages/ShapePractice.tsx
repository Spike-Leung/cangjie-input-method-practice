import { useCallback, useEffect, useRef } from "react";
import { Keyboard } from "../components/Keyboard";
import { QuizCard } from "../components/QuizCard";
import { useQuiz } from "../hooks/useQuiz";
import { AUXILIARY_SHAPES, ShapeEntry } from "../data/auxiliaryShapes";
import { weightedPick } from "../utils/weightedRandom";

const STORAGE_KEY = "cangjie-shape-stats";

interface LetterStats {
  correct: number;
  total: number;
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

function buildWeightedItems(
  shapes: ShapeEntry[],
  stats: Record<string, LetterStats>
): (ShapeEntry & { weight: number })[] {
  return shapes.map((s) => {
    const st = stats[s.key] ?? { correct: 0, total: 0 };
    const errorRate = st.total > 0 ? (st.total - st.correct) / st.total : 0;
    return { ...s, weight: 1 + errorRate * 6 };
  });
}

export function ShapePractice() {
  const { current, lastResult, lastCorrectKey, next, answer } =
    useQuiz(AUXILIARY_SHAPES);

  const letterStats = useRef<Record<string, LetterStats>>(loadStats());
  const totalStats = useRef({ correct: 0, total: 0 });

  const pickNext = useCallback(() => {
    const weightedItems = buildWeightedItems(AUXILIARY_SHAPES, letterStats.current);
    const pick = () => weightedPick(weightedItems);
    next(pick);
  }, [next]);

  const handleKeyPress = useCallback(
    (key: string) => {
      if (!current || lastResult) return;
      const correctKey = current.key;
      const isCorrect = key === correctKey;

      const ls = letterStats.current;
      if (!ls[correctKey]) ls[correctKey] = { correct: 0, total: 0 };
      ls[correctKey].total += 1;
      if (isCorrect) ls[correctKey].correct += 1;
      totalStats.current.total += 1;
      if (isCorrect) totalStats.current.correct += 1;
      saveStats(ls);

      answer(key, correctKey);
      setTimeout(pickNext, 600);
    },
    [current, lastResult, answer, pickNext]
  );

  useEffect(() => {
    if (!current) pickNext();
  }, [current, pickNext]);

  const display = current ? current.letter : "";

  const handleReset = () => {
    letterStats.current = {};
    totalStats.current = { correct: 0, total: 0 };
    saveStats({});
    pickNext();
  };

  return (
    <div className="practice-page">
      <h1>倉頡輔助字型練習</h1>
      <p className="page-desc">看到輔助字型，輸入對應的倉頡字母鍵位</p>
      <QuizCard
        label="輔助字型"
        display={display}
        image={current?.image}
        lastResult={lastResult}
        lastCorrectKey={lastCorrectKey}
        correct={totalStats.current.correct}
        total={totalStats.current.total}
      />
      <Keyboard
        onKeyPress={handleKeyPress}
        highlightKey={lastCorrectKey}
        highlightColor={lastResult}
      />
      <button className="reset-btn" onClick={handleReset}>
        重置統計數據
      </button>
    </div>
  );
}
