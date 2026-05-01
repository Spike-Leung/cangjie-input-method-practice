interface QuizCardProps {
  label: string;
  display: string;
  image?: string;
  lastResult: "correct" | "wrong" | null;
  lastCorrectKey: string | null;
  correct: number;
  total: number;
}

export function QuizCard({
  label,
  display,
  image,
  lastResult,
  lastCorrectKey,
  correct,
  total,
}: QuizCardProps) {
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <div className="quiz-card">
      <div className="quiz-label">{label}</div>
      <div className={`quiz-display ${lastResult}`}>
        {image ? <img src={image} alt={display} /> : display}
      </div>
      {lastResult === "wrong" && lastCorrectKey && (
        <div className="quiz-answer">答案：{lastCorrectKey}</div>
      )}
      <div className="quiz-stats">
        <span className="stat">
          正確：{correct} / {total}
        </span>
        <span className="stat">正確率：{accuracy}%</span>
      </div>
    </div>
  );
}
