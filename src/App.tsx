import { BrowserRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";
import { LetterPractice } from "./pages/LetterPractice";
import { ShapePractice } from "./pages/ShapePractice";

export default function App() {
  return (
    <BrowserRouter>
      <nav className="nav">
        <NavLink to="/letter-practice" className={({ isActive }) => (isActive ? "nav-active" : "")}>
          字母鍵位練習
        </NavLink>
        <NavLink to="/shape-practice" className={({ isActive }) => (isActive ? "nav-active" : "")}>
          輔助字型練習
        </NavLink>
      </nav>
      <Routes>
        <Route path="/letter-practice" element={<LetterPractice />} />
        <Route path="/shape-practice" element={<ShapePractice />} />
        <Route path="*" element={<Navigate to="/letter-practice" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
