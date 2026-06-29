import { useSession } from "@/store/session";
import { StatCard } from "./StatCard";
import { Button } from "@/components/ui/button";
import { useNow, formatDuration } from "@/lib/time";
import { computeTrueCount, penetration } from "@/lib/blackjack/count";
import { Activity, Layers, Users, Gauge } from "lucide-react";

interface Props {
  onStartSession: () => void;
  onResume: () => void;
}

export function Dashboard({ onStartSession, onResume }: Props) {
  const s = useSession();
  const now = useNow(1000);

  const active = !!s.config;
  const remaining = active ? Math.max(0, s.totalCards - s.cardsDealt) : 0;
  const tc = active ? computeTrueCount(s.runningCount, remaining, s.config!.rules.decks) : 0;
  const pen = active ? penetration(s.totalCards, remaining) : 0;
  const sessionMs = active ? now - s.config!.startedAt : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-primary mb-2">Live Terminal</div>
          <h1 className="text-4xl font-semibold tracking-tight">
            Blackjack <span className="text-primary text-glow">Edge</span> <span className="text-gold text-gold-glow">AI</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Mathematically sound decision support. No guarantees, only probability.
          </p>
        </div>
        <div className="flex gap-2">
          {active ? (
            <Button size="lg" onClick={onResume} className="bg-primary text-primary-foreground hover:bg-primary/90">
              Resume Session →
            </Button>
          ) : (
            <Button size="lg" onClick={onStartSession} className="bg-primary text-primary-foreground hover:bg-primary/90">
              Start New Session →
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <StatCard label="Current Session" value={active ? "LIVE" : "—"} accent={active ? "primary" : "default"}
          hint={active ? formatDuration(sessionMs) : "No session"} large />
        <StatCard label="Running Count" value={active ? (s.runningCount > 0 ? `+${s.runningCount}` : s.runningCount) : "—"}
          accent={active && s.runningCount > 0 ? "positive" : active && s.runningCount < 0 ? "negative" : "default"} large />
        <StatCard label="True Count" value={active ? (s.shoeMode === "mid" ? "—" : tc.toFixed(2)) : "—"}
          accent="gold" large />
        <StatCard label="Cards Remaining" value={active ? remaining : "—"} large />
        <StatCard label="Decks Remaining" value={active ? (remaining / 52).toFixed(2) : "—"} large />
        <StatCard label="Penetration" value={active ? `${pen.toFixed(1)}%` : "—"} accent="gold" large />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Shoe Status" value={active ? (s.shoeMode === "fresh" ? "FRESH" : "MID-SHOE") : "—"}
          accent={active && s.shoeMode === "fresh" ? "primary" : "gold"} />
        <StatCard label="Current Shoe" value={active ? `#${s.config!.shoeNumber}` : "—"} />
        <StatCard label="Current Table" value={active ? s.config!.tableId : "—"} />
        <StatCard label="Current Dealer" value={active ? s.config!.dealerId : "—"} />
        <StatCard label="Hands Logged" value={s.hands.length} />
        <StatCard label="Shoes Recorded" value={s.shoes.length} />
        <StatCard label="Players" value={active ? s.config!.players : "—"} />
        <StatCard label="Rules"
          value={active ? `${s.config!.rules.decks}D` : "—"}
          hint={active ? `${s.config!.rules.dealerHitsSoft17 ? "H17" : "S17"} · BJ ${s.config!.rules.blackjackPayout}` : ""} />
      </div>

      {!active && (
        <div className="grid md:grid-cols-2 gap-4">
          <FeatureCard icon={<Activity className="h-5 w-5" />} title="Decision Engine"
            text="Recommends the mathematically optimal action for every player hand against the dealer upcard, scoped to your house rules." />
          <FeatureCard icon={<Layers className="h-5 w-5" />} title="Shoe Telemetry"
            text="Tracks running count, true count, penetration, and shuffle cadence with full replay history." />
          <FeatureCard icon={<Gauge className="h-5 w-5" />} title="Eight Counting Systems"
            text="Hi-Lo, KO, Omega II, Zen, Hi-Opt I/II, Red Seven, or basic-strategy-only mode for research." />
          <FeatureCard icon={<Users className="h-5 w-5" />} title="Table & Dealer Research"
            text="Aggregates penetration, players, and shoe length per table and dealer for descriptive analytics." />
        </div>
      )}
    </div>
  );
}

function FeatureCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center gap-2 text-primary mb-2">{icon}<span className="text-xs uppercase tracking-[0.2em]">{title}</span></div>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
