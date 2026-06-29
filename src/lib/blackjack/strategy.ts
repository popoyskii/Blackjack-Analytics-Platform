import type { Action, Rank, Rules } from "./types";

export function rankValue(r: Rank): number {
  if (r === "A") return 11;
  if (r === "J" || r === "Q" || r === "K" || r === "10") return 10;
  return parseInt(r, 10);
}

export interface HandValue {
  total: number;
  soft: boolean;
  isPair: boolean;
  isBlackjack: boolean;
}

export function evaluateHand(cards: Rank[]): HandValue {
  let total = 0;
  let aces = 0;
  for (const c of cards) {
    const v = rankValue(c);
    total += v;
    if (c === "A") aces++;
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  const soft = aces > 0 && total <= 21;
  const isPair = cards.length === 2 && rankValue(cards[0]!) === rankValue(cards[1]!);
  const isBlackjack = cards.length === 2 && total === 21;
  return { total, soft, isPair, isBlackjack };
}

// Dealer upcard index: 2..10 -> 0..8, A -> 9
function dealerIndex(up: Rank): number {
  if (up === "A") return 9;
  return rankValue(up) - 2;
}

// Strategy code: H=hit, S=stand, D=double (else hit), Ds=double (else stand),
// P=split, Ph=split if DAS else hit, R=surrender (else hit), Rs=surrender (else stand)
type Code = "H" | "S" | "D" | "Ds" | "P" | "Ph" | "R" | "Rs";

// Hard totals 5..21 (index 0..16)
// Source: standard multi-deck S17 chart, with H17 deviations applied separately
const HARD: Record<number, Code[]> = {
  5:  ["H","H","H","H","H","H","H","H","H","H"],
  6:  ["H","H","H","H","H","H","H","H","H","H"],
  7:  ["H","H","H","H","H","H","H","H","H","H"],
  8:  ["H","H","H","H","H","H","H","H","H","H"],
  9:  ["H","D","D","D","D","H","H","H","H","H"],
  10: ["D","D","D","D","D","D","D","D","H","H"],
  11: ["D","D","D","D","D","D","D","D","D","H"],
  12: ["H","H","S","S","S","H","H","H","H","H"],
  13: ["S","S","S","S","S","H","H","H","H","H"],
  14: ["S","S","S","S","S","H","H","H","H","H"],
  15: ["S","S","S","S","S","H","H","H","R","H"],
  16: ["S","S","S","S","S","H","H","R","R","R"],
  17: ["S","S","S","S","S","S","S","S","S","Rs"],
  18: ["S","S","S","S","S","S","S","S","S","S"],
  19: ["S","S","S","S","S","S","S","S","S","S"],
  20: ["S","S","S","S","S","S","S","S","S","S"],
  21: ["S","S","S","S","S","S","S","S","S","S"],
};

// Soft totals: A,2 (13) .. A,9 (20)
const SOFT: Record<number, Code[]> = {
  13: ["H","H","H","D","D","H","H","H","H","H"],
  14: ["H","H","H","D","D","H","H","H","H","H"],
  15: ["H","H","D","D","D","H","H","H","H","H"],
  16: ["H","H","D","D","D","H","H","H","H","H"],
  17: ["H","D","D","D","D","H","H","H","H","H"],
  18: ["Ds","Ds","Ds","Ds","Ds","S","S","H","H","H"],
  19: ["S","S","S","S","S","S","S","S","S","S"],
  20: ["S","S","S","S","S","S","S","S","S","S"],
};

// Pairs: keyed by single-card value (A=11, 10=10, 9, 8, ...)
const PAIRS: Record<number, Code[]> = {
  11: ["P","P","P","P","P","P","P","P","P","P"], // A,A
  10: ["S","S","S","S","S","S","S","S","S","S"],
  9:  ["P","P","P","P","P","S","P","P","S","S"],
  8:  ["P","P","P","P","P","P","P","P","P","P"],
  7:  ["P","P","P","P","P","P","H","H","H","H"],
  6:  ["Ph","P","P","P","P","H","H","H","H","H"],
  5:  ["D","D","D","D","D","D","D","D","H","H"],
  4:  ["H","H","H","Ph","Ph","H","H","H","H","H"],
  3:  ["Ph","Ph","P","P","P","P","H","H","H","H"],
  2:  ["Ph","Ph","P","P","P","P","H","H","H","H"],
};

export interface Decision {
  action: Action;
  reason: string;
  alternates: { action: Action; note: string }[];
}

function canDouble(cards: Rank[], rules: Rules, afterSplit = false): boolean {
  if (cards.length !== 2) return false;
  if (afterSplit && !rules.doubleAfterSplit) return false;
  const total = evaluateHand(cards).total;
  if (rules.doubleOn === "10-11") return total === 10 || total === 11;
  if (rules.doubleOn === "9-11") return total >= 9 && total <= 11;
  return true;
}

function canSurrender(rules: Rules, cards: Rank[]): boolean {
  return rules.surrender !== "none" && cards.length === 2;
}

function resolve(code: Code, rules: Rules, cards: Rank[], afterSplit = false): Action {
  switch (code) {
    case "H": return "hit";
    case "S": return "stand";
    case "D": return canDouble(cards, rules, afterSplit) ? "double" : "hit";
    case "Ds": return canDouble(cards, rules, afterSplit) ? "double" : "stand";
    case "P": return "split";
    case "Ph": return rules.doubleAfterSplit ? "split" : "hit";
    case "R": return canSurrender(rules, cards) ? "surrender" : "hit";
    case "Rs": return canSurrender(rules, cards) ? "surrender" : "stand";
  }
}

export function basicStrategy(
  playerCards: Rank[],
  dealerUp: Rank,
  rules: Rules,
): Decision | null {
  if (playerCards.length < 2 || !dealerUp) return null;
  const hand = evaluateHand(playerCards);
  const di = dealerIndex(dealerUp);

  if (hand.isBlackjack) {
    return { action: "stand", reason: "Natural blackjack.", alternates: [] };
  }

  let code: Code | undefined;
  let kind = "";

  if (hand.isPair) {
    const pv = rankValue(playerCards[0]!);
    code = PAIRS[pv]?.[di];
    kind = `Pair of ${playerCards[0]}s vs dealer ${dealerUp}`;
  } else if (hand.soft) {
    code = SOFT[hand.total]?.[di];
    kind = `Soft ${hand.total} vs dealer ${dealerUp}`;
  } else {
    const t = Math.min(21, Math.max(5, hand.total));
    code = HARD[t]?.[di];
    kind = `Hard ${hand.total} vs dealer ${dealerUp}`;
  }

  if (!code) {
    return { action: hand.total >= 17 ? "stand" : "hit", reason: "Fallback.", alternates: [] };
  }

  const action = resolve(code, rules, playerCards);
  const reason = `${kind}. ${rules.dealerHitsSoft17 ? "H17" : "S17"}, ${rules.decks}D, ` +
    `${rules.surrender === "none" ? "no surrender" : "surrender allowed"}.`;

  const alts = (["stand", "hit", "double", "split", "surrender"] as Action[])
    .filter((a) => a !== action)
    .filter((a) => {
      if (a === "double") return canDouble(playerCards, rules);
      if (a === "split") return hand.isPair;
      if (a === "surrender") return canSurrender(rules, playerCards);
      return true;
    })
    .map((a) => ({ action: a, note: legalNote(a, hand) }));

  return { action, reason, alternates: alts };
}

function legalNote(a: Action, hand: HandValue): string {
  switch (a) {
    case "hit": return hand.total >= 17 ? "Risk of bust" : "Legal";
    case "stand": return hand.total < 12 ? "Likely too low" : "Legal";
    case "double": return "Legal — one card only";
    case "split": return "Requires pair";
    case "surrender": return "Forfeit half bet";
  }
}

export const ACTION_LABEL: Record<Action, string> = {
  stand: "STAND",
  hit: "HIT",
  double: "DOUBLE",
  split: "SPLIT",
  surrender: "SURRENDER",
};
