export type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";

export const RANKS: Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

export type CountSystem =
  | "hi-lo"
  | "ko"
  | "omega-ii"
  | "zen"
  | "hi-opt-i"
  | "hi-opt-ii"
  | "red-seven"
  | "basic";

export type ShoeMode = "fresh" | "mid";

export type Action = "stand" | "hit" | "double" | "split" | "surrender";

export interface Rules {
  decks: number;
  dealerHitsSoft17: boolean; // H17 vs S17
  blackjackPayout: "3:2" | "6:5";
  doubleAfterSplit: boolean;
  doubleOn: "any" | "9-11" | "10-11";
  resplitAces: boolean;
  hitSplitAces: boolean;
  maxSplits: number;
  surrender: "none" | "late" | "early";
  maxPlayers: number;
}

export const DEFAULT_RULES: Rules = {
  decks: 6,
  dealerHitsSoft17: false,
  blackjackPayout: "3:2",
  doubleAfterSplit: true,
  doubleOn: "any",
  resplitAces: false,
  hitSplitAces: false,
  maxSplits: 3,
  surrender: "late",
  maxPlayers: 7,
};

export interface SetupConfig {
  casino: string;
  game: string;
  tableId: string;
  dealerId: string;
  shoeNumber: number;
  players: number;
  rules: Rules;
  shoeMode: ShoeMode;
  startedAt: number;
}

export type HandOutcome = "win" | "loss" | "push" | "blackjack" | "surrender";

export interface HandRecord {
  id: string;
  timestamp: number;
  casino: string;
  game: string;
  tableId: string;
  dealerId: string;
  shoeNumber: number;
  handNumber: number;
  players: number;
  playerCards: Rank[];
  dealerUpcard: Rank | null;
  visibleCards: Rank[];
  outcome: HandOutcome | null;
  runningCount: number;
  trueCount: number;
  cardsRemaining: number;
  decksRemaining: number;
  penetration: number;
  recommendedAction: Action | null;
  actualAction: Action | null;
  notes: string;
}
