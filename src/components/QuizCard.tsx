interface QuizCardProps {
  label: string;
  display: string;
  image?: string;
  hint?: string;
  showHint?: boolean;
  onToggleHint?: () => void;
  lastResult: "correct" | "wrong" | null;
}

export function QuizCard({
  label,
  display,
  image,
  hint,
  showHint,
  onToggleHint,
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
            {hint && showHint && <span className="quiz-hint">{hint}</span>}
          </>
        )}
      </div>
      {onToggleHint && (
        <label className="quiz-hint-toggle">
          <input
            type="checkbox"
            checked={showHint ?? false}
            onChange={onToggleHint}
          />
          提示
        </label>
      )}
    </div>
  );
}
