export interface WeightedItem {
  weight: number;
}

export function weightedPick<T extends WeightedItem>(items: T[]): T {
  if (items.length === 0) throw new Error("empty items");
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let r = Math.random() * totalWeight;
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item;
  }
  return items[items.length - 1];
}
