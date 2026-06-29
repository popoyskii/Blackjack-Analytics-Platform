import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";
import { useSession } from "@/store/session";
import { basicStrategy, ACTION_LABEL, evaluateHand } from "@/lib/blackjack/strategy";
import { cn } from "@/lib/utils";

const ACTION_COLOR: Record<string, string> = {
  STAND: "text-primary text-glow",
  HIT: "text-gold text-gold-glow",
  DOUBLE: "text-chart-3",
  SPLIT: "text-chart-4",
  SURRENDER: "text-negative",
};

export function DecisionEngine() {
  const { config, currentHand, dealerUpcard, shoeMode } = useSession();

  const decision = useMemo(() => {
    if (!config || !dealerUpcard || currentHand.length < 2) return null;
    return basicStrategy(currentHand, dealerUpcard, config.rules);
  }, [config, currentHand, dealerUpcard]);

  const hand = currentHand.length ? evaluateHand(currentHand) : null;
  const label = decision ? ACTION_LABEL[decision.action] : "—";

  return (
    <div className="glass-strong rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-primary">Decision Engine</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            {shoeMode === "mid" ? "Basic Strategy Mode (mid-shoe)" : "Basic Strategy + Count Aware"}
          </div>
        </div>
        {hand && (
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Hand</div>
            <div className="numeric text-lg font-semibold">
              {hand.soft && !hand.isBlackjack ? "Soft " : ""}{hand.total}
              {hand.isBlackjack && <span className="text-gold ml-1">BJ</span>}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center min-h-[140px] py-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            className="text-center"
          >
            <div className={cn("text-7xl font-bold tracking-tight numeric", ACTION_COLOR[label] ?? "text-muted-foreground")}>
              {label}
            </div>
            {!decision && (
              <div className="text-xs text-muted-foreground mt-3 max-w-sm mx-auto">
                Enter at least two player cards and the dealer upcard to get a recommendation.
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {decision && (
        <>
          <div className="rounded-lg border border-border bg-secondary/30 p-3 text-xs text-muted-foreground">
            <span className="text-foreground font-medium">Why:</span> {decision.reason}
          </div>

          {decision.alternates.length > 0 && (
            <div className="mt-3">
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">
                Ranked Alternates
              </div>
              <div className="grid grid-cols-2 gap-2">
                {decision.alternates.map((a, i) => (
                  <div key={i} className="flex items-center justify-between rounded-md border border-border bg-secondary/20 px-3 py-2">
                    <span className="text-xs font-medium uppercase tracking-wider">{ACTION_LABEL[a.action]}</span>
                    <span className="text-[10px] text-muted-foreground">{a.note}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div className="mt-4 text-[10px] text-muted-foreground/70 italic">
        Recommendations are research aids based on probability. No outcome is guaranteed.
      </div>
    </div>
  );
}
