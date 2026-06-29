import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Rank } from "@/lib/blackjack/types";
import { RANKS } from "@/lib/blackjack/types";

interface Props {
  onCard: (r: Rank) => void;
  onUndo: () => void;
  onClearHand: () => void;
  onFinishHand: () => void;
  onNewShoe: () => void;
  onShuffle: () => void;
  disabled?: boolean;
}

const ACTION_BTNS = [
  { id: "undo", label: "Undo", tone: "neutral" },
  { id: "clear", label: "Clear Hand", tone: "neutral" },
  { id: "finish", label: "Finish Hand", tone: "primary" },
  { id: "shoe", label: "New Shoe", tone: "gold" },
  { id: "shuffle", label: "Shuffle", tone: "gold" },
] as const;

export function Keypad({ onCard, onUndo, onClearHand, onFinishHand, onNewShoe, onShuffle, disabled }: Props) {
  const handle = (id: typeof ACTION_BTNS[number]["id"]) => {
    if (id === "undo") onUndo();
    if (id === "clear") onClearHand();
    if (id === "finish") onFinishHand();
    if (id === "shoe") onNewShoe();
    if (id === "shuffle") onShuffle();
  };

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="text-xs uppercase tracking-[0.2em] text-primary">Fast Card Entry</div>
        <div className="text-[10px] text-muted-foreground">Tap to log each visible card</div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {RANKS.map((r) => (
          <motion.button
            key={r}
            disabled={disabled}
            whileTap={{ scale: 0.94 }}
            onClick={() => onCard(r)}
            className={cn(
              "h-16 rounded-xl border border-border bg-secondary/40 hover:bg-secondary",
              "hover:border-primary/60 transition text-2xl font-semibold numeric",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              r === "A" && "text-gold",
            )}
          >
            {r}
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-2 mt-3">
        {ACTION_BTNS.map((b) => (
          <button
            key={b.id}
            onClick={() => handle(b.id)}
            className={cn(
              "h-12 rounded-xl text-xs font-semibold uppercase tracking-wider transition",
              b.tone === "neutral" && "border border-border bg-secondary/30 hover:bg-secondary",
              b.tone === "primary" && "bg-primary text-primary-foreground hover:bg-primary/90",
              b.tone === "gold" && "bg-gold/20 text-gold border border-gold/40 hover:bg-gold/30",
            )}
          >
            {b.label}
          </button>
        ))}
      </div>
    </div>
  );
}
