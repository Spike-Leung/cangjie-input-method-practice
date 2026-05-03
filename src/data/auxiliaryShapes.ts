import { cangjieLetters } from "./letterMap";

export interface ShapeEntry {
  key: string;
  letter: string;
  image: string;
}

const imageModules = import.meta.glob(
  "/public/data/*/*.svg",
  { eager: true, query: "?url", import: "default" }
);

export const auxiliaryShapes: ShapeEntry[] = Object.entries(imageModules)
  .map(([path, url]) => {
    const parts = path.split("/");
    const key = parts[parts.length - 2].toUpperCase();
    const letter = cangjieLetters[key];
    if (!letter) return null;
    return { key, letter, image: url };
  })
  .filter((e): e is ShapeEntry => e !== null);

export const AUXILIARY_SHAPES = auxiliaryShapes;
