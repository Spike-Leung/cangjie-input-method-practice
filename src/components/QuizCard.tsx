interface QuizCardProps {
  label: string;
  display: string;
  image?: string;
  lastResult: "correct" | "wrong" | null;
  lastCorrectKey: string | null;
}

export function QuizCard({
  label,
  display,
  image,
  lastResult,
  lastCorrectKey,
}: QuizCardProps) {
  return (
    <div className="quiz-card">
      <div className="quiz-label">{label}</div>
      <div className={`quiz-display ${lastResult}`}>
        {image ? <img src={image} alt={display} /> : display}
      </div>
    </div>
  );
}
