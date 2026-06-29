import { useMemo } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from "recharts";
import { useSession } from "@/store/session";
import { useNow, formatDuration } from "@/lib/time";
import { computeTrueCount, penetration } from "@/lib/blackjack/count";
import { StatCard } from "./StatCard";
import { DecisionEngine } from "./DecisionEngine";
import { Keypad } from "./Keypad";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Rank } from "@/lib/blackjack/types";
import { cn } from "@/lib/utils";

interface Props {
  onEnd: () => void;
}

const CARD_PILL = "min-w-[2.5rem] h-14 px-3 rounded-lg border border-border bg-secondary/40 numeric text-xl font-semibold flex items-center justify-center";

export function LiveSession({ onEnd }: Props) {
  const s = useSession();
  const now = useNow(1000);

  if (!s.config) return null;

  const remaining = Math.max(0, s.totalCards - s.cardsDealt);
  const decksRemaining = remaining / 52;
  const tc = computeTrueCount(s.runningCount, remaining, s.config.rules.decks);
  const pen = penetration(s.totalCards, remaining);
  const sessionMs = now - s.config.startedAt;

  const onPlayerCard = (r: Rank) => s.setPlayerCard(r);
  const onDealerCard = (r: Rank) => s.setDealerUpcard(r);

  // For keypad: cards always increment count; we route based on whether dealer up is set + hand length toggle handled below
  const onKeypadCard = (r: Rank) => s.addCard(r);

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* Top status strip */}
      <div className="col-span-12 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <StatCard label="Running Count" value={s.runningCount > 0 ? `+${s.runningCount}` : s.runningCount}
          accent={s.runningCount > 0 ? "positive" : s.runningCount < 0 ? "negative" : "default"} />
        <StatCard label="True Count" value={s.shoeMode === "mid" ? "—" : tc.toFixed(2)}
          accent={s.shoeMode === "mid" ? "default" : tc >= 2 ? "primary" : tc <= -1 ? "negative" : "default"} />
        <StatCard label="Cards Remaining" value={remaining} />
        <StatCard label="Decks Remaining" value={decksRemaining.toFixed(2)} />
        <StatCard label="Penetration" value={`${pen.toFixed(1)}%`} accent="gold" />
        <StatCard label="Shoe #" value={s.config.shoeNumber} />
        <StatCard label="Hands" value={s.handNumber} />
        <StatCard label="Session Time" value={formatDuration(sessionMs)} accent="gold" />
      </div>

      {/* Table info bar */}
      <div className="col-span-12 glass rounded-xl px-4 py-2.5 flex flex-wrap items-center gap-3 text-xs">
        <Badge variant="outline" className="border-primary/40 text-primary">{s.config.casino}</Badge>
        <span className="text-muted-foreground">Table</span><span className="font-medium">{s.config.tableId}</span>
        <span className="text-muted-foreground">·</span>
        <span className="text-muted-foreground">Dealer</span><span className="font-medium">{s.config.dealerId}</span>
        <span className="text-muted-foreground">·</span>
        <span className="text-muted-foreground">{s.config.players} players</span>
        <span className="text-muted-foreground">·</span>
        <span className="text-muted-foreground">{s.config.rules.decks}D · {s.config.rules.dealerHitsSoft17 ? "H17" : "S17"} · BJ {s.config.rules.blackjackPayout}</span>
        {s.shoeMode === "mid" && <Badge className="bg-gold/20 text-gold border-gold/40 ml-2">Basic Strategy Only</Badge>}
        <Button variant="ghost" size="sm" className="ml-auto text-muted-foreground hover:text-negative" onClick={onEnd}>
          End Session
        </Button>
      </div>

      {/* Left: Decision Engine */}
      <div className="col-span-12 lg:col-span-7 flex flex-col gap-4">
        <DecisionEngine />

        {/* Player Area */}
        <div className="glass rounded-2xl p-5">
          <div className="text-xs uppercase tracking-[0.2em] text-primary mb-3">Player Area</div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Your Cards</div>
              <div className="flex flex-wrap gap-2 min-h-[3.5rem] p-2 rounded-lg border border-dashed border-border bg-secondary/20">
                {s.currentHand.length === 0 && <span className="text-xs text-muted-foreground self-center px-2">Tap a card below to add</span>}
                {s.currentHand.map((c, i) => (
                  <div key={i} className={cn(CARD_PILL, c === "A" && "text-gold border-gold/40")}>{c}</div>
                ))}
              </div>
              <div className="mt-2 grid grid-cols-7 gap-1">
                {(["A","2","3","4","5","6","7","8","9","10","J","Q","K"] as Rank[]).map((r) => (
                  <button key={r} onClick={() => onPlayerCard(r)}
                    className="h-9 rounded-md border border-border bg-secondary/30 hover:border-primary/50 text-sm numeric">
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Dealer Upcard</div>
              <div className="flex flex-wrap gap-2 min-h-[3.5rem] p-2 rounded-lg border border-dashed border-border bg-secondary/20">
                {!s.dealerUpcard && <span className="text-xs text-muted-foreground self-center px-2">Tap dealer's visible card</span>}
                {s.dealerUpcard && <div className={cn(CARD_PILL, "border-gold/50 text-gold")}>{s.dealerUpcard}</div>}
              </div>
              <div className="mt-2 grid grid-cols-7 gap-1">
                {(["A","2","3","4","5","6","7","8","9","10","J","Q","K"] as Rank[]).map((r) => (
                  <button key={r} onClick={() => onDealerCard(r)} disabled={!!s.dealerUpcard}
                    className="h-9 rounded-md border border-border bg-secondary/30 hover:border-gold/50 disabled:opacity-30 text-sm numeric">
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-5 gap-2">
            {["win","loss","push","blackjack","surrender"].map((o) => (
              <button key={o}
                onClick={() => s.finishHand(o as any, null)}
                className="h-10 rounded-md border border-border bg-secondary/30 hover:border-primary/50 text-xs uppercase tracking-wider">
                Log {o}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Keypad + Charts */}
      <div className="col-span-12 lg:col-span-5 flex flex-col gap-4">
        <Keypad
          onCard={onKeypadCard}
          onUndo={s.removeLastCard}
          onClearHand={s.clearHand}
          onFinishHand={() => s.finishHand(null, null)}
          onNewShoe={s.newShoe}
          onShuffle={s.shuffle}
        />

        <CountChart />
      </div>
    </div>
  );
}

function CountChart() {
  const history = useSession((s) => s.history);
  const shoeMode = useSession((s) => s.shoeMode);

  const data = useMemo(
    () => history.map((h, i) => ({ i, rc: h.rc, tc: Number(h.tc.toFixed(2)), pen: Number(h.pen.toFixed(1)) })),
    [history],
  );

  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs uppercase tracking-[0.2em] text-primary">Count Telemetry</div>
        <div className="text-[10px] text-muted-foreground">{data.length} samples</div>
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="oklch(1 0 0 / 0.06)" vertical={false} />
            <XAxis dataKey="i" hide />
            <YAxis tick={{ fill: "oklch(0.65 0.015 240)", fontSize: 10 }} width={28} />
            <Tooltip contentStyle={{ background: "oklch(0.18 0.012 240)", border: "1px solid oklch(0.28 0.012 240)", borderRadius: 8, fontSize: 12 }} />
            <Line type="monotone" dataKey="rc" stroke="oklch(0.78 0.18 150)" strokeWidth={2} dot={false} name="RC" />
            {shoeMode !== "mid" && <Line type="monotone" dataKey="tc" stroke="oklch(0.83 0.15 85)" strokeWidth={2} dot={false} name="TC" />}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="h-20 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="pen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.78 0.18 150)" stopOpacity={0.6} />
                <stop offset="100%" stopColor="oklch(0.78 0.18 150)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="i" hide />
            <YAxis hide domain={[0, 100]} />
            <Area type="monotone" dataKey="pen" stroke="oklch(0.78 0.18 150)" fill="url(#pen)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
