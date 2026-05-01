import { useCallback, useEffect } from "react";
import { Keyboard } from "../components/Keyboard";
import { QuizCard } from "../components/QuizCard";
import { useQuiz } from "../hooks/useQuiz";
import { LETTERS, cangjieLetters, getKey } from "../data/letterMap";

function pickRandomLetter(): string {
  return LETTERS[Math.floor(Math.random() * LETTERS.length)];
}

export function LetterPractice() {
  const { current, stats, lastResult, lastCorrectKey, next, answer } = useQuiz(LETTERS);

  const pickNext = useCallback(() => {
    next(pickRandomLetter);
  }, [next]);

  const handleKeyPress = useCallback(
    (key: string) => {
      if (!current || lastResult) return;
      const correctKey = getKey(cangjieLetters[current]);
      answer(key, correctKey);
      setTimeout(pickNext, 600);
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
        correct={stats.correct}
        total={stats.total}
      />
      <Keyboard
        onKeyPress={handleKeyPress}
        highlightKey={lastCorrectKey}
        highlightColor={lastResult}
      />
    </div>
  );
}
