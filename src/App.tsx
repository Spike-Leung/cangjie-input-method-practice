import { useEffect, useState } from "react";
import { HashRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";
import { LetterPractice } from "./pages/LetterPractice";
import { ShapePractice } from "./pages/ShapePractice";
import { CodePractice } from "./pages/CodePractice";

const THEME_KEY = "cangjie-theme";

function loadTheme(): "light" | "dark" {
  try {
    const v = localStorage.getItem(THEME_KEY);
    if (v === "dark") return "dark";
  } catch { /* ignore */ }
  return "light";
}

function saveTheme(theme: "light" | "dark") {
  localStorage.setItem(THEME_KEY, theme);
}

export default function App() {
  const [theme, setTheme] = useState<"light" | "dark">(loadTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      saveTheme(next);
      return next;
    });
  };

  return (
    <HashRouter>
      <nav className="nav">
        <NavLink to="/letter-practice" className={({ isActive }) => (isActive ? "nav-active" : "")}>
          字母鍵位練習
        </NavLink>
        <NavLink to="/shape-practice" className={({ isActive }) => (isActive ? "nav-active" : "")}>
          輔助字型練習
        </NavLink>
        <NavLink to="/code-practice" className={({ isActive }) => (isActive ? "nav-active" : "")}>
          倉頡拆碼練習
        </NavLink>
        <button className="nav-theme-btn" onClick={toggleTheme}>
          {theme === "light" ? "☾" : "☀"}
        </button>
      </nav>
      <Routes>
        <Route path="/letter-practice" element={<LetterPractice />} />
        <Route path="/shape-practice" element={<ShapePractice />} />
        <Route path="/code-practice" element={<CodePractice />} />
        <Route path="*" element={<Navigate to="/letter-practice" replace />} />
      </Routes>
      <footer className="site-footer">
        <a
          href="https://github.com/Spike-Leung/cangjie-input-method-practice"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
        <a
          href="https://github.com/Spike-Leung/cangjie-input-method-practice/blob/main/LICENSE"
          target="_blank"
          rel="noopener noreferrer"
        >
          AGPL-3.0
        </a>
      </footer>
    </HashRouter>
  );
}
