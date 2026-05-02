interface QuizCardProps {
  label: string;
  display: string;
  image?: string;
  hint?: string;
  lastResult: "correct" | "wrong" | null;
}

export function QuizCard({
  label,
  display,
  image,
  hint,
  lastResult,
}: QuizCardProps) {
  return (
    <div className="quiz-card">
      <div className="quiz-label">{label}</div>
      <div className={`quiz-display ${lastResult}`}>
        {image ? (
          <img src={image} alt={display} />
        ) : (
          <>
            {display}
            {hint && <span className="quiz-hint">{hint}</span>}
          </>
        )}
      </div>
    </div>
  );
}
