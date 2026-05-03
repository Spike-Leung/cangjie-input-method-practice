import { type ReactNode, useState } from "react";

interface QuizCardProps {
  display: string;
  image?: string;
  hint?: string;
  showHint?: boolean;
  onToggleHint?: () => void;
  lastResult: "correct" | "wrong" | null;
  copyText?: string;
  extraActions?: ReactNode;
  leftActions?: ReactNode;
  zdicUrl?: string;
}

export function QuizCard({
  display,
  image,
  hint,
  showHint,
  onToggleHint,
  lastResult,
  copyText,
  extraActions,
  leftActions,
  zdicUrl,
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
      {leftActions && <div className="quiz-card-left-actions">{leftActions}</div>}
      <div className={`quiz-display ${lastResult}`}>
        {image ? (
          <img src={image} alt={display} />
        ) : (
          display
        )}
      </div>
      {hint && showHint && <div className="quiz-answer">{hint}</div>}
      {(onToggleHint || copyText || extraActions) && (
        <div className="quiz-card-actions">
          {copyText && (
            <button
              className={`quiz-copy-btn ${copied ? "copied" : ""}`}
              onClick={handleCopy}
            >
              {copied ? "✓ 已複製" : "複製"}
            </button>
          )}
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
          {extraActions}
        </div>
      )}
      {zdicUrl && (
        <div className="quiz-bottom-links">
          <a href={zdicUrl} target="_blank" rel="noopener noreferrer">
            漢典
          </a>
        </div>
      )}
    </div>
  );
}
