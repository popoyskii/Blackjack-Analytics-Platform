import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  CountSystem,
  HandOutcome,
  HandRecord,
  Rank,
  Rules,
  SetupConfig,
  ShoeMode,
} from "@/lib/blackjack/types";
import { DEFAULT_RULES } from "@/lib/blackjack/types";
import { cardValue, computeTrueCount, penetration } from "@/lib/blackjack/count";

export interface CountPoint {
  t: number;
  rc: number;
  tc: number;
  pen: number;
}

export interface TableProfile {
  id: string;
  name: string;
  casino: string;
  sessions: number;
  avgPenetration: number;
  avgPlayers: number;
  avgShoeLength: number;
  avgTrueCount: number;
}

export interface DealerProfile {
  id: string;
  sessionsObserved: number;
  avgPenetration: number;
  avgShoeLength: number;
  dealerBustPct: number;
  avgPlayers: number;
}

export interface ShoeRecord {
  shoeNumber: number;
  startedAt: number;
  endedAt: number | null;
  cardsDealt: number;
  history: CountPoint[];
  maxTC: number;
  minTC: number;
  penetration: number;
}

interface SessionState {
  // setup
  config: SetupConfig | null;
  countSystem: CountSystem;
  shoeMode: ShoeMode;

  // live state
  runningCount: number;
  cardsDealt: number;
  totalCards: number;
  currentHand: Rank[];
  dealerUpcard: Rank | null;
  handNumber: number;
  shoeStartedAt: number;
  history: CountPoint[];

  // records
  hands: HandRecord[];
  shoes: ShoeRecord[];
  tables: TableProfile[];
  dealers: DealerProfile[];
  ruleProfiles: { id: string; name: string; rules: Rules }[];

  // actions
  startSession: (cfg: SetupConfig) => void;
  endSession: () => void;
  setCountSystem: (s: CountSystem) => void;
  addCard: (r: Rank) => void;
  removeLastCard: () => void;
  setPlayerCard: (r: Rank) => void;
  setDealerUpcard: (r: Rank) => void;
  clearHand: () => void;
  finishHand: (outcome: HandOutcome | null, recommended: string | null) => void;
  newShoe: () => void;
  shuffle: () => void;
  saveRuleProfile: (name: string, rules: Rules) => void;
  deleteRuleProfile: (id: string) => void;
  clearAll: () => void;
}

const uid = () => Math.random().toString(36).slice(2, 10);

export const useSession = create<SessionState>()(
  persist(
    (set, get) => ({
      config: null,
      countSystem: "hi-lo",
      shoeMode: "fresh",
      runningCount: 0,
      cardsDealt: 0,
      totalCards: DEFAULT_RULES.decks * 52,
      currentHand: [],
      dealerUpcard: null,
      handNumber: 0,
      shoeStartedAt: Date.now(),
      history: [],
      hands: [],
      shoes: [],
      tables: [],
      dealers: [],
      ruleProfiles: [],

      startSession: (cfg) =>
        set({
          config: cfg,
          shoeMode: cfg.shoeMode,
          runningCount: 0,
          cardsDealt: 0,
          totalCards: cfg.rules.decks * 52,
          currentHand: [],
          dealerUpcard: null,
          handNumber: 0,
          shoeStartedAt: Date.now(),
          history: [{ t: Date.now(), rc: 0, tc: 0, pen: 0 }],
        }),

      endSession: () => set({ config: null }),

      setCountSystem: (s) => set({ countSystem: s }),

      addCard: (r) => {
        const s = get();
        if (!s.config) return;
        const delta = cardValue(r, s.countSystem);
        const rc = s.runningCount + delta;
        const dealt = s.cardsDealt + 1;
        const remaining = Math.max(0, s.totalCards - dealt);
        const tc = computeTrueCount(rc, remaining, s.config.rules.decks);
        const pen = penetration(s.totalCards, remaining);
        set({
          runningCount: rc,
          cardsDealt: dealt,
          history: [...s.history, { t: Date.now(), rc, tc, pen }].slice(-2000),
        });
      },

      removeLastCard: () => {
        const s = get();
        if (s.cardsDealt === 0) return;
        const last = s.history[s.history.length - 1];
        const prev = s.history[s.history.length - 2];
        if (!last || !prev) return;
        set({
          runningCount: prev.rc,
          cardsDealt: s.cardsDealt - 1,
          history: s.history.slice(0, -1),
          currentHand: s.currentHand.length > 0 ? s.currentHand.slice(0, -1) : s.currentHand,
        });
      },

      setPlayerCard: (r) => {
        get().addCard(r);
        set((s) => ({ currentHand: [...s.currentHand, r] }));
      },

      setDealerUpcard: (r) => {
        const s = get();
        if (s.dealerUpcard) return;
        get().addCard(r);
        set({ dealerUpcard: r });
      },

      clearHand: () => set({ currentHand: [], dealerUpcard: null }),

      finishHand: (outcome, recommended) => {
        const s = get();
        if (!s.config) return;
        const remaining = Math.max(0, s.totalCards - s.cardsDealt);
        const rec: HandRecord = {
          id: uid(),
          timestamp: Date.now(),
          casino: s.config.casino,
          game: s.config.game,
          tableId: s.config.tableId,
          dealerId: s.config.dealerId,
          shoeNumber: s.config.shoeNumber,
          handNumber: s.handNumber + 1,
          players: s.config.players,
          playerCards: [...s.currentHand],
          dealerUpcard: s.dealerUpcard,
          visibleCards: [...s.currentHand, ...(s.dealerUpcard ? [s.dealerUpcard] : [])],
          outcome,
          runningCount: s.runningCount,
          trueCount: computeTrueCount(s.runningCount, remaining, s.config.rules.decks),
          cardsRemaining: remaining,
          decksRemaining: remaining / 52,
          penetration: penetration(s.totalCards, remaining),
          recommendedAction: (recommended as HandRecord["recommendedAction"]) ?? null,
          actualAction: null,
          notes: "",
        };
        set({
          hands: [rec, ...s.hands].slice(0, 5000),
          handNumber: s.handNumber + 1,
          currentHand: [],
          dealerUpcard: null,
        });
      },

      newShoe: () => {
        const s = get();
        if (!s.config) return;
        const remaining = Math.max(0, s.totalCards - s.cardsDealt);
        const tcs = s.history.map((h) => h.tc);
        const shoe: ShoeRecord = {
          shoeNumber: s.config.shoeNumber,
          startedAt: s.shoeStartedAt,
          endedAt: Date.now(),
          cardsDealt: s.cardsDealt,
          history: s.history,
          maxTC: tcs.length ? Math.max(...tcs) : 0,
          minTC: tcs.length ? Math.min(...tcs) : 0,
          penetration: penetration(s.totalCards, remaining),
        };
        set({
          shoes: [shoe, ...s.shoes].slice(0, 500),
          config: { ...s.config, shoeNumber: s.config.shoeNumber + 1 },
          runningCount: 0,
          cardsDealt: 0,
          shoeMode: "fresh",
          shoeStartedAt: Date.now(),
          history: [{ t: Date.now(), rc: 0, tc: 0, pen: 0 }],
          currentHand: [],
          dealerUpcard: null,
        });
      },

      shuffle: () => get().newShoe(),

      saveRuleProfile: (name, rules) =>
        set((s) => ({ ruleProfiles: [...s.ruleProfiles, { id: uid(), name, rules }] })),

      deleteRuleProfile: (id) =>
        set((s) => ({ ruleProfiles: s.ruleProfiles.filter((p) => p.id !== id) })),

      clearAll: () =>
        set({
          config: null,
          runningCount: 0,
          cardsDealt: 0,
          currentHand: [],
          dealerUpcard: null,
          handNumber: 0,
          history: [],
          hands: [],
          shoes: [],
        }),
    }),
    {
      name: "bjedge-session-v1",
      partialize: (s) => ({
        countSystem: s.countSystem,
        hands: s.hands,
        shoes: s.shoes,
        tables: s.tables,
        dealers: s.dealers,
        ruleProfiles: s.ruleProfiles,
      }),
    },
  ),
);
