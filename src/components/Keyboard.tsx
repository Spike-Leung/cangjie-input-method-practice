import { useEffect, useCallback } from "react";
import { cangjieLetters } from "../data/letterMap";

interface KeyboardProps {
  onKeyPress: (key: string) => void;
  highlightKey: string | null;
  highlightColor: "correct" | "wrong" | null;
  wrongKey: string | null;
}

const ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
];

export function Keyboard({ onKeyPress, highlightKey, highlightColor, wrongKey }: KeyboardProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (cangjieLetters[key]) {
        e.preventDefault();
        onKeyPress(key);
      }
    },
    [onKeyPress]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="keyboard">
      {ROWS.map((row, ri) => (
        <div key={ri} className="keyboard-row">
          {row.map((key) => {
            const isWrong = key === wrongKey;
            const isCorrect = !isWrong && key === highlightKey && highlightColor;
            const colorClass = isWrong ? "key-wrong" : isCorrect ? `key-${highlightColor}` : "";
            const hasMapping = !!cangjieLetters[key];
            return (
              <button
                key={key}
                className={`key ${colorClass} ${hasMapping ? "" : "key-disabled"}`}
                onClick={() => hasMapping && onKeyPress(key)}
                disabled={!hasMapping}
              >
                <span className="key-cangjie">{cangjieLetters[key] || ""}</span>
                <span className="key-en">{key}</span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
