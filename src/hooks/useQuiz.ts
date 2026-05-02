import { useState, useCallback } from "react";

export interface QuizStats {
  correct: number;
  total: number;
}

export function useQuiz<T>(_items: T[]) {
  const [current, setCurrent] = useState<T | null>(null);
  const [stats, setStats] = useState<QuizStats>({ correct: 0, total: 0 });
  const [lastResult, setLastResult] = useState<"correct" | "wrong" | null>(null);
  const [lastCorrectKey, setLastCorrectKey] = useState<string | null>(null);
  const [lastWrongKey, setLastWrongKey] = useState<string | null>(null);

  const next = useCallback(
    (pickFn: () => T) => {
      const item = pickFn();
      setCurrent(item);
      setLastResult(null);
      setLastCorrectKey(null);
      setLastWrongKey(null);
    },
    []
  );

  const answer = useCallback(
    (
      key: string,
      correctKey: string
    ): { result: "correct" | "wrong" } => {
      const isCorrect = key === correctKey;
      setStats((s) => ({
        correct: s.correct + (isCorrect ? 1 : 0),
        total: s.total + 1,
      }));
      setLastResult(isCorrect ? "correct" : "wrong");
      setLastCorrectKey(correctKey);
      setLastWrongKey(isCorrect ? null : key);
      return { result: isCorrect ? "correct" : "wrong" };
    },
    []
  );

  return { current, stats, lastResult, lastCorrectKey, lastWrongKey, next, answer, setCurrent };
}
