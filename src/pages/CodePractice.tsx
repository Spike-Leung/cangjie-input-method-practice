import { useCallback, useEffect, useRef, useState } from "react";
import { Keyboard } from "../components/Keyboard";
import { QuizCard } from "../components/QuizCard";
import { CODE_CHARS, CodeEntry } from "../data/cangjieChars";
import { cangjieLetters } from "../data/letterMap";
import { weightedPick } from "../utils/weightedRandom";

const STATS_KEY = "cangjie-code-stats";

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

export function CodePractice() {
  const stats = useRef<Record<string, CodeStats>>(loadStats());
  const prev = useRef<string | null>(null);

  const [current, setCurrent] = useState<CodeEntry | null>(null);
  const [inputs, setInputs] = useState<string[]>([]);
  const [results, setResults] = useState<("correct" | "wrong")[]>([]);
  const [showHint, setShowHint] = useState(true);

  const pickNext = useCallback(() => {
    const st = stats.current;
    const candidates = CODE_CHARS;
    if (candidates.length === 0) return;

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
  }, []);

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

      const ls = stats.current;
      if (!ls[code]) ls[code] = { correct: 0, total: 0 };
      ls[code].total += 1;

      if (isCorrect && newInputs.length === codeLen) {
        ls[code].correct += 1;
        saveStats(ls);
        setTimeout(pickNext, 100);
      } else {
        saveStats(ls);
      }
    },
    [current, inputs, results, pickNext]
  );

  useEffect(() => {
    if (!current) pickNext();
  }, [current, pickNext]);

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
        setShowHint((v) => !v);
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
      const k = c.toUpperCase();
      if (!hintMap[k]) hintMap[k] = [];
      hintMap[k].push(i + 1);
    });
  }

  const hintRadicals = code
    .split("")
    .map((c) => cangjieLetters[c.toUpperCase()] || c)
    .join("");

  return (
    <div className="practice-page">
      <h1>倉頡拆碼練習</h1>
      <QuizCard
        display={display}
        hint={hintRadicals}
        showHint={showHint}
        onToggleHint={() => setShowHint((v) => !v)}
        lastResult={null}
        copyText={current?.char ?? ""}
      />

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

      <Keyboard
        onKeyPress={handleKeyPress}
        highlightKey={null}
        highlightColor={null}
        wrongKey={null}
        hintKeys={hintMap}
      />
    </div>
  );
}
