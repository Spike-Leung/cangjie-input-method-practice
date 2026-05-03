import { useState } from "react";

interface QuizCardProps {
  display: string;
  image?: string;
  hint?: string;
  showHint?: boolean;
  onToggleHint?: () => void;
  lastResult: "correct" | "wrong" | null;
  copyText?: string;
}

export function QuizCard({
  display,
  image,
  hint,
  showHint,
  onToggleHint,
  lastResult,
  copyText,
}: QuizCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!copyText) return;
    navigator.clipboard.writeText(copyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="quiz-card">
      <div className={`quiz-display ${lastResult}`}>
        {image ? (
          <img src={image} alt={display} />
        ) : (
          display
        )}
      </div>
      {hint && showHint && <div className="quiz-answer">{hint}</div>}
      {(onToggleHint || copyText) && (
        <div className="quiz-card-actions">
          {onToggleHint && (
            <label className="quiz-hint-toggle">
              <input
                type="checkbox"
                checked={showHint ?? false}
                onChange={onToggleHint}
              />
              提示(空格切換)
            </label>
          )}
          {copyText && (
            <button
              className={`quiz-copy-btn ${copied ? "copied" : ""}`}
              onClick={handleCopy}
            >
              {copied ? "✓ 已複製" : "複製"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
