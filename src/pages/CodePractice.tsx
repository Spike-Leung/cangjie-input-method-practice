import { useCallback, useEffect, useRef, useState } from "react";
import { Keyboard } from "../components/Keyboard";
import { QuizCard } from "../components/QuizCard";
import { CODE_CHARS, CodeEntry } from "../data/cangjieChars";
import { cangjieLetters } from "../data/letterMap";
import { useHintState } from "../hooks/useHintState";
import { weightedPick } from "../utils/weightedRandom";

const STATS_KEY = "cangjie-code-stats";
const MISSED_KEY = "cangjie-code-missed";

interface CodeStats {
  correct: number;
  total: number;
}

function loadStats(): Record<string, CodeStats> {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStats(stats: Record<string, CodeStats>) {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

function loadMissedCodes(): Set<string> {
  try {
    const raw = localStorage.getItem(MISSED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveMissedCodes(codes: Set<string>) {
  localStorage.setItem(MISSED_KEY, JSON.stringify([...codes]));
}

const MISSED_THRESHOLD = 2;

export function CodePractice() {
  const stats = useRef<Record<string, CodeStats>>(loadStats());
  const prev = useRef<string | null>(null);
  const missedCodes = useRef<Set<string>>(loadMissedCodes());
  const consecutiveWrongs = useRef(0);
  const attemptHadWrong = useRef(false);

  const [current, setCurrent] = useState<CodeEntry | null>(null);
  const [inputs, setInputs] = useState<string[]>([]);
  const [results, setResults] = useState<("correct" | "wrong")[]>([]);
  const { showHint, toggleHint } = useHintState();
  const [missedMode, setMissedMode] = useState(() => {
    try {
      return localStorage.getItem("cangjie-code-missed-mode") === "true";
    } catch {
      return false;
    }
  });
  const [showMissedEditor, setShowMissedEditor] = useState(false);
  const [, forceRender] = useState(0);

  const pickNext = useCallback(() => {
    const mc = missedCodes.current;
    let candidates = missedMode
      ? CODE_CHARS.filter((c) => mc.has(c.code))
      : CODE_CHARS;
    if (candidates.length === 0) return;

    const st = stats.current;
    let pool = candidates.map((c) => {
      const s = st[c.code] ?? { correct: 0, total: 0 };
      const errorRate = s.total > 0 ? (s.total - s.correct) / s.total : 0;
      return { ...c, weight: 1 + errorRate * 6 };
    });

    if (pool.length > 1 && prev.current) {
      const filtered = pool.filter((c) => c.char !== prev.current);
      if (filtered.length > 0) pool = filtered;
    }

    const picked = weightedPick(pool);
    prev.current = picked.char;
    setCurrent(picked);
    setInputs([]);
    setResults([]);
    consecutiveWrongs.current = 0;
    attemptHadWrong.current = false;
  }, [missedMode]);

  const handleKeyPress = useCallback(
    (key: string) => {
      if (!current) return;
      const code = current.code;
      const codeLen = code.length;
      const pos = inputs.length;

      if (pos >= codeLen) {
        if (results.some((r) => r === "wrong")) {
          setInputs([key]);
          setResults([key === code[0].toUpperCase() ? "correct" : "wrong"]);
        }
        return;
      }

      const isCorrect = key === code[pos].toUpperCase();
      const newInputs = [...inputs, key];
      const newResults = [...results, isCorrect ? "correct" : "wrong"] as ("correct" | "wrong")[];
      setInputs(newInputs);
      setResults(newResults);

      if (isCorrect) {
        consecutiveWrongs.current = 0;
      } else {
        consecutiveWrongs.current += 1;
        attemptHadWrong.current = true;
        if (consecutiveWrongs.current >= MISSED_THRESHOLD && !missedCodes.current.has(code)) {
          missedCodes.current.add(code);
          saveMissedCodes(missedCodes.current);
        }
      }

      if (newResults.length === codeLen && newResults.every((r) => r === "correct")) {
        const ls = stats.current;
        if (!ls[code]) ls[code] = { correct: 0, total: 0 };
        ls[code].total += 1;
        if (!attemptHadWrong.current) ls[code].correct += 1;
        saveStats(ls);
        setTimeout(pickNext, 100);
      }
    },
    [current, inputs, results, pickNext]
  );

  const clearMissed = useCallback(() => {
    missedCodes.current = new Set();
    saveMissedCodes(missedCodes.current);
    setMissedMode(false);
    if (!current) pickNext();
  }, [current, pickNext]);

  const removeMissed = useCallback((code: string) => {
    missedCodes.current.delete(code);
    saveMissedCodes(missedCodes.current);
    if (missedCodes.current.size === 0 && missedMode) {
      setMissedMode(false);
    }
    forceRender((n) => n + 1);
  }, [missedMode]);

  useEffect(() => {
    if (!current) pickNext();
  }, [current, pickNext]);

  useEffect(() => {
    localStorage.setItem("cangjie-code-missed-mode", String(missedMode));
  }, [missedMode]);

  useEffect(() => {
    if (missedMode && missedCodes.current.size === 0) {
      setCurrent(null);
    } else {
      pickNext();
    }
  }, [missedMode, pickNext]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Backspace" || e.key === "Delete") {
        e.preventDefault();
        if (inputs.length === 0) return;
        setInputs((prev) => prev.slice(0, -1));
        setResults((prev) => prev.slice(0, -1));
      }
      if (e.code === "Space") {
        e.preventDefault();
        toggleHint();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [inputs]);

  const code = current?.code ?? "";
  const codeLen = code.length;
  const display = current?.char ?? "";

  const hintMap: Record<string, number[]> = {};
  if (showHint) {
    code.split("").forEach((c, i) => {
      if (results[i] === "correct") return;
      const k = c.toUpperCase();
      if (!hintMap[k]) hintMap[k] = [];
      hintMap[k].push(i + 1);
    });
  }

  const hintRadicals = code
    .split("")
    .map((c) => cangjieLetters[c.toUpperCase()] || c)
    .join("");

  const missedCount = missedCodes.current.size;

  const modeActions = (
    <>
      <button
        className={`quiz-mode-btn ${!missedMode ? "active" : ""}`}
        onClick={() => setMissedMode(false)}
      >
        全部
      </button>
      <button
        className={`quiz-mode-btn ${missedMode ? "active" : ""}`}
        onClick={() => setMissedMode(true)}
        disabled={missedCount === 0}
      >
        錯題集({missedCount})
      </button>
      {missedMode && missedCount > 0 && (
        <button className="quiz-clear-btn" onClick={clearMissed}>
          清除錯題
        </button>
      )}
      {missedCount > 0 && (
        <button className="quiz-mode-btn" onClick={() => setShowMissedEditor(true)}>
          編輯錯題
        </button>
      )}
    </>
  );

  if (showMissedEditor) {
    const items = [...missedCodes.current].map((mc) => {
      const entry = CODE_CHARS.find((c) => c.code === mc);
      const radical = mc
        .split("")
        .map((ch) => cangjieLetters[ch.toUpperCase()] || ch)
        .join("");
      return { code: mc, char: entry?.char ?? "?", radical };
    });

    return (
      <div className="practice-page">
        <h1>倉頡拆碼練習</h1>
        <div className="quiz-card missed-editor">
          <div className="missed-editor-bar">
            <span className="missed-editor-title">錯題集 ({items.length})</span>
            <button className="quiz-mode-btn" onClick={() => setShowMissedEditor(false)}>
              返回練習
            </button>
          </div>
          {items.length === 0 ? (
            <div className="missed-empty">暫無錯題</div>
          ) : (
            <div className="missed-list">
              {items.map((item) => (
                <div key={item.code} className="missed-item">
                  <span className="missed-char">{item.char}</span>
                  <span className="missed-code">{item.radical}</span>
                  <button
                    className="missed-delete-btn"
                    onClick={() => removeMissed(item.code)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="practice-page">
      <h1>倉頡拆碼練習</h1>
      {missedMode && missedCount === 0 ? (
        <div className="quiz-card missed-editor">
          <div className="quiz-display-empty">
            暫無錯題
          </div>
        </div>
      ) : (
        <QuizCard
          display={display}
          hint={hintRadicals}
          showHint={showHint}
          onToggleHint={toggleHint}
          lastResult={null}
          copyText={current?.char ?? ""}
          zdicUrl={current ? `https://www.zdic.net/hans/${current.char}` : undefined}
          leftActions={modeActions}
        />
      )}

      {current && (
        <>
          <div className="code-slots">
            {Array.from({ length: codeLen }).map((_, i) => {
              const rawInput = inputs[i] ?? "";
              const input = rawInput ? cangjieLetters[rawInput] || rawInput : "";
              const result = results[i];
              const placeholder = showHint && !rawInput
                ? cangjieLetters[code[i].toUpperCase()] || code[i]
                : "";
              const slotClass = result === "correct"
                ? "correct"
                : result === "wrong"
                  ? "wrong"
                  : "";
              const cursorClass = i === inputs.length ? "current" : "";

              return (
                <div key={i} className={`code-slot ${cursorClass} ${slotClass}`}>
                  {placeholder && !rawInput && (
                    <span className="code-slot-placeholder">{placeholder}</span>
                  )}
                  {input && <span className="code-slot-input">{input}</span>}
                </div>
              );
            })}
          </div>

          <div className="code-notice">
            如果對編碼存疑，請以
            <a
              href={current ? `https://chidic.eduhk.hk/v.php?dicword=${encodeURIComponent(current.char)}` : "https://chidic.eduhk.hk/"}
              target="_blank"
              rel="noopener noreferrer"
            >
              漢文庫典
            </a>
            為準。如果確認有誤，請
            <a
              href="https://github.com/Spike-Leung/cangjie-input-method-practice/issues/new"
              target="_blank"
              rel="noopener noreferrer"
            >
              提交 issue
            </a>
            ，謝謝 :)
          </div>

          <Keyboard
            onKeyPress={handleKeyPress}
            highlightKey={null}
            highlightColor={null}
            wrongKey={null}
            hintKeys={hintMap}
          />
        </>
      )}
    </div>
  );
}
