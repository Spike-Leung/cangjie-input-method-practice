export const cangjieLetters: Record<string, string> = {
  A: "日",
  B: "月",
  C: "金",
  D: "木",
  E: "水",
  F: "火",
  G: "土",
  H: "竹",
  I: "戈",
  J: "十",
  K: "大",
  L: "中",
  M: "一",
  N: "弓",
  O: "人",
  P: "心",
  Q: "手",
  R: "口",
  S: "尸",
  T: "廿",
  U: "山",
  V: "女",
  W: "田",
  X: "難",
  Y: "卜",
  Z: "重",
  "⌫": "⌫"
};

export const LETTERS = Object.keys(cangjieLetters);

export type CangjieCategory = "philosophy" | "stroke" | "body" | "shape" | "special" | "delete";

export const LETTER_CATEGORY: Record<string, CangjieCategory> = {
  A: "philosophy", B: "philosophy", C: "philosophy", D: "philosophy",
  E: "philosophy", F: "philosophy", G: "philosophy",
  H: "stroke", I: "stroke", J: "stroke", K: "stroke",
  L: "stroke", M: "stroke", N: "stroke",
  O: "body", P: "body", Q: "body", R: "body",
  S: "shape", T: "shape", U: "shape", V: "shape",
  W: "shape", Y: "shape",
  X: "special", Z: "special",
  "⌫": "delete"
};

export function getLetter(key: string): string {
  return cangjieLetters[key] ?? "";
}

export function getKey(letter: string): string {
  for (const [k, v] of Object.entries(cangjieLetters)) {
    if (v === letter) return k;
  }
  return "";
}
