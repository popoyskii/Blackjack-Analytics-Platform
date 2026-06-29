import type { CountSystem, Rank } from "./types";

const TABLES: Record<CountSystem, Record<Rank, number>> = {
  "hi-lo": { A: -1, "2": 1, "3": 1, "4": 1, "5": 1, "6": 1, "7": 0, "8": 0, "9": 0, "10": -1, J: -1, Q: -1, K: -1 },
  ko:     { A: -1, "2": 1, "3": 1, "4": 1, "5": 1, "6": 1, "7": 1, "8": 0, "9": 0, "10": -1, J: -1, Q: -1, K: -1 },
  "omega-ii": { A: 0, "2": 1, "3": 1, "4": 2, "5": 2, "6": 2, "7": 1, "8": 0, "9": -1, "10": -2, J: -2, Q: -2, K: -2 },
  zen: { A: -1, "2": 1, "3": 1, "4": 2, "5": 2, "6": 2, "7": 1, "8": 0, "9": 0, "10": -2, J: -2, Q: -2, K: -2 },
  "hi-opt-i": { A: 0, "2": 0, "3": 1, "4": 1, "5": 1, "6": 1, "7": 0, "8": 0, "9": 0, "10": -1, J: -1, Q: -1, K: -1 },
  "hi-opt-ii": { A: 0, "2": 1, "3": 1, "4": 2, "5": 2, "6": 1, "7": 1, "8": 0, "9": 0, "10": -2, J: -2, Q: -2, K: -2 },
  "red-seven": { A: -1, "2": 1, "3": 1, "4": 1, "5": 1, "6": 1, "7": 0.5, "8": 0, "9": 0, "10": -1, J: -1, Q: -1, K: -1 },
  basic: { A: 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0, "7": 0, "8": 0, "9": 0, "10": 0, J: 0, Q: 0, K: 0 },
};

export const COUNT_SYSTEMS: { id: CountSystem; label: string; description: string }[] = [
  { id: "hi-lo", label: "Hi-Lo", description: "Balanced. Most widely used." },
  { id: "ko", label: "KO", description: "Unbalanced. No true-count conversion needed." },
  { id: "omega-ii", label: "Omega II", description: "Balanced multi-level." },
  { id: "zen", label: "Zen Count", description: "Balanced multi-level." },
  { id: "hi-opt-i", label: "Hi-Opt I", description: "Balanced single-level." },
  { id: "hi-opt-ii", label: "Hi-Opt II", description: "Balanced multi-level." },
  { id: "red-seven", label: "Red Seven", description: "Unbalanced." },
  { id: "basic", label: "Basic Strategy Only", description: "No counting." },
];

export function cardValue(rank: Rank, system: CountSystem): number {
  return TABLES[system][rank];
}

export function computeTrueCount(running: number, cardsRemaining: number, decks: number): number {
  const decksRemaining = Math.max(cardsRemaining / 52, 0.25);
  return running / decksRemaining;
}

export function penetration(totalCards: number, remaining: number): number {
  if (totalCards === 0) return 0;
  return ((totalCards - remaining) / totalCards) * 100;
}
