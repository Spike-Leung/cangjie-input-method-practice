import { useEffect, useCallback } from "react";
import { cangjieLetters, LETTER_CATEGORY } from "../data/letterMap";

interface KeyboardProps {
  onKeyPress: (key: string) => void;
  highlightKey: string | null;
  highlightColor: "correct" | "wrong" | null;
  wrongKey: string | null;
  editMode?: boolean;
  disabledKeys?: Set<string>;
  onToggleKey?: (key: string) => void;
  onToggleEdit?: () => void;
  onToggleAllKeys?: () => void;
  hintKeys?: Record<string, number[]>;
}

const ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
];

export function Keyboard({
  onKeyPress,
  highlightKey,
  highlightColor,
  wrongKey,
  editMode,
  disabledKeys,
  onToggleKey,
  onToggleEdit,
  onToggleAllKeys,
  hintKeys,
}: KeyboardProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (editMode) return;
      const key = e.key.toUpperCase();
      if (cangjieLetters[key]) {
        e.preventDefault();
        onKeyPress(key);
      }
    },
    [onKeyPress, editMode],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className={`keyboard ${editMode ? "edit-mode" : ""}`}>
      <div className="keyboard-edit-container">
        <div
          className={`keyboard-edit-hint ${editMode ? "" : "keyboard-edit-hint-hidden"}`}
        >
          點選按鍵切換啟用／禁用
        </div>
        <div className="keyboard-edit-actions">
          {editMode && onToggleAllKeys && (
            <button className="keyboard-reset-btn" onClick={onToggleAllKeys}>
              全選
            </button>
          )}
          {onToggleEdit && (
            <button className="keyboard-edit-toggle" onClick={onToggleEdit}>
              {editMode ? "完成" : "編輯範圍"}
            </button>
          )}
        </div>
      </div>

      {ROWS.map((row, ri) => (
        <div key={ri} className="keyboard-row">
          {row.map((key) => {
            const hasMapping = !!cangjieLetters[key];
            const isFiltered = disabledKeys?.has(key);
            const isWrong = key === wrongKey;
            const isCorrect =
              !isWrong && key === highlightKey && highlightColor;
            const colorClass = isWrong
              ? "key-wrong"
              : isCorrect
                ? `key-${highlightColor}`
                : "";
            const scopeClass = isFiltered ? "key-scope-off" : "";
            const catClass = `key-cat-${LETTER_CATEGORY[key] || ""}`;
            const hintNums = hintKeys?.[key];
            const hintClass = hintNums?.length ? "key-hint" : "";
            const hasHints = hintKeys && Object.keys(hintKeys).length > 0;
            const dimmedClass = !editMode && hasHints && !hintNums?.length ? "key-dimmed" : "";

            if (editMode) {
              return (
                <button
                  key={key}
                  className={`key ${catClass} ${dimmedClass} ${scopeClass} ${hintClass} ${hasMapping ? "" : "key-disabled"}`}
                  onClick={() => hasMapping && onToggleKey?.(key)}
                  disabled={!hasMapping}
                >
                  <span className="key-cangjie">
                    {cangjieLetters[key] || ""}
                  </span>
                  <span className="key-en">{key}</span>
                  {hintNums && (
                    <span className="key-hint-nums">
                      {hintNums.map((n) => (
                        <span key={n} className="key-hint-num">{n}</span>
                      ))}
                    </span>
                  )}
                </button>
              );
            }

            return (
              <button
                key={key}
                className={`key ${catClass} ${dimmedClass} ${hintClass} ${colorClass} ${scopeClass} ${hasMapping && !isFiltered ? "" : "key-disabled"}`}
                onClick={() => hasMapping && !isFiltered && onKeyPress(key)}
                disabled={!hasMapping || !!isFiltered}
              >
                <span className="key-cangjie">{cangjieLetters[key] || ""}</span>
                <span className="key-en">{key}</span>
                {hintNums && (
                  <span className="key-hint-nums">
                    {hintNums.map((n) => (
                      <span key={n} className="key-hint-num">{n}</span>
                    ))}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
