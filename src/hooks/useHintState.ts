import { useState, useCallback } from "react";

const HINT_KEY = "cangjie-hint-shown";

export function useHintState() {
  const [showHint, setShowHint] = useState(() => {
    try {
      return localStorage.getItem(HINT_KEY) !== "false";
    } catch {
      return true;
    }
  });

  const toggleHint = useCallback(() => {
    setShowHint((v) => {
      const next = !v;
      localStorage.setItem(HINT_KEY, String(next));
      return next;
    });
  }, []);

  return { showHint, toggleHint };
}
