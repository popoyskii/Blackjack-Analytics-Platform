import { useMemo } from "react";
import { useSession } from "@/store/session";
import { StatCard } from "./StatCard";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from "recharts";
import type { HandRecord } from "@/lib/blackjack/types";

function pct(n: number, d: number) { return d === 0 ? 0 : (n / d) * 100; }

export function Statistics() {
  const hands = useSession((s) => s.hands);
  const shoes = useSession((s) => s.shoes);

  const stats = useMemo(() => {
    const total = hands.length;
    const wins = hands.filter((h) => h.outcome === "win" || h.outcome === "blackjack").length;
    const losses = hands.filter((h) => h.outcome === "loss").length;
    const pushes = hands.filter((h) => h.outcome === "push").length;
    const bjs = hands.filter((h) => h.outcome === "blackjack").length;
    const rcs = hands.map((h) => h.runningCount);
    const tcs = hands.map((h) => h.trueCount);
    const pens = hands.map((h) => h.penetration);
    const avg = (a: number[]) => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
    return {
      total,
      winPct: pct(wins, total),
      lossPct: pct(losses, total),
      pushPct: pct(pushes, total),
      bjPct: pct(bjs, total),
      avgRC: avg(rcs),
      avgTC: avg(tcs),
      maxRC: rcs.length ? Math.max(...rcs) : 0,
      maxTC: tcs.length ? Math.max(...tcs) : 0,
      avgPen: avg(pens),
      longestShoe: shoes.length ? Math.max(...shoes.map((s) => s.cardsDealt)) : 0,
      avgShoeLen: shoes.length ? avg(shoes.map((s) => s.cardsDealt)) : 0,
    };
  }, [hands, shoes]);

  const series = useMemo(() => {
    return [...hands].reverse().slice(-200).map((h, i) => ({
      i, rc: h.runningCount, tc: Number(h.trueCount.toFixed(2)), pen: Number(h.penetration.toFixed(1)),
    }));
  }, [hands]);

  const outcomeData = [
    { name: "Win", v: stats.winPct },
    { name: "Loss", v: stats.lossPct },
    { name: "Push", v: stats.pushPct },
    { name: "BJ", v: stats.bjPct },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-primary">Analytics</div>
          <h2 className="text-2xl font-semibold">Session Statistics</h2>
        </div>
        <Button variant="outline" onClick={() => exportCSV(hands)}>Export CSV</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <StatCard label="Hands Logged" value={stats.total} />
        <StatCard label="Win %" value={`${stats.winPct.toFixed(1)}%`} accent="positive" />
        <StatCard label="Loss %" value={`${stats.lossPct.toFixed(1)}%`} accent="negative" />
        <StatCard label="Push %" value={`${stats.pushPct.toFixed(1)}%`} />
        <StatCard label="Blackjack %" value={`${stats.bjPct.toFixed(1)}%`} accent="gold" />
        <StatCard label="Avg Penetration" value={`${stats.avgPen.toFixed(1)}%`} />
        <StatCard label="Avg RC" value={stats.avgRC.toFixed(2)} />
        <StatCard label="Avg TC" value={stats.avgTC.toFixed(2)} />
        <StatCard label="Max RC" value={stats.maxRC} accent="primary" />
        <StatCard label="Max TC" value={stats.maxTC.toFixed(2)} accent="primary" />
        <StatCard label="Longest Shoe" value={stats.longestShoe} />
        <StatCard label="Avg Shoe Len" value={stats.avgShoeLen.toFixed(0)} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Chart title="Running Count Over Time">
          <LineChart data={series}>
            <CartesianGrid stroke="oklch(1 0 0 / 0.06)" vertical={false} />
            <XAxis dataKey="i" hide />
            <YAxis tick={{ fill: "oklch(0.65 0.015 240)", fontSize: 10 }} width={28} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="rc" stroke="oklch(0.78 0.18 150)" strokeWidth={2} dot={false} />
          </LineChart>
        </Chart>
        <Chart title="True Count Over Time">
          <LineChart data={series}>
            <CartesianGrid stroke="oklch(1 0 0 / 0.06)" vertical={false} />
            <XAxis dataKey="i" hide />
            <YAxis tick={{ fill: "oklch(0.65 0.015 240)", fontSize: 10 }} width={28} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="tc" stroke="oklch(0.83 0.15 85)" strokeWidth={2} dot={false} />
          </LineChart>
        </Chart>
        <Chart title="Penetration Over Time">
          <LineChart data={series}>
            <CartesianGrid stroke="oklch(1 0 0 / 0.06)" vertical={false} />
            <XAxis dataKey="i" hide />
            <YAxis tick={{ fill: "oklch(0.65 0.015 240)", fontSize: 10 }} width={28} domain={[0, 100]} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="pen" stroke="oklch(0.65 0.18 240)" strokeWidth={2} dot={false} />
          </LineChart>
        </Chart>
        <Chart title="Outcome Distribution">
          <BarChart data={outcomeData}>
            <CartesianGrid stroke="oklch(1 0 0 / 0.06)" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: "oklch(0.65 0.015 240)", fontSize: 11 }} />
            <YAxis tick={{ fill: "oklch(0.65 0.015 240)", fontSize: 10 }} width={28} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="v" fill="oklch(0.78 0.18 150)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </Chart>
      </div>

      <HandHistory hands={hands} />
    </div>
  );
}

const tooltipStyle = { background: "oklch(0.18 0.012 240)", border: "1px solid oklch(0.28 0.012 240)", borderRadius: 8, fontSize: 12 };

function Chart({ title, children }: { title: string; children: React.ReactElement }) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="text-xs uppercase tracking-[0.2em] text-primary mb-2">{title}</div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer>
      </div>
    </div>
  );
}

function HandHistory({ hands }: { hands: HandRecord[] }) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="text-xs uppercase tracking-[0.2em] text-primary mb-3">Recent Hands</div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="text-[10px] uppercase tracking-wider text-muted-foreground">
            <tr className="border-b border-border">
              {["#", "Time", "Casino", "Table", "Shoe", "Cards", "Up", "Outcome", "RC", "TC", "Pen"].map((h) => (
                <th key={h} className="text-left py-2 px-2 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hands.slice(0, 50).map((h) => (
              <tr key={h.id} className="border-b border-border/40 numeric">
                <td className="py-2 px-2 text-muted-foreground">{h.handNumber}</td>
                <td className="py-2 px-2 text-muted-foreground">{new Date(h.timestamp).toLocaleTimeString()}</td>
                <td className="py-2 px-2">{h.casino}</td>
                <td className="py-2 px-2">{h.tableId}</td>
                <td className="py-2 px-2">{h.shoeNumber}</td>
                <td className="py-2 px-2 font-medium">{h.playerCards.join(" ")}</td>
                <td className="py-2 px-2 text-gold">{h.dealerUpcard ?? "—"}</td>
                <td className="py-2 px-2 uppercase">{h.outcome ?? "—"}</td>
                <td className="py-2 px-2">{h.runningCount}</td>
                <td className="py-2 px-2">{h.trueCount.toFixed(2)}</td>
                <td className="py-2 px-2">{h.penetration.toFixed(1)}%</td>
              </tr>
            ))}
            {hands.length === 0 && (
              <tr><td colSpan={11} className="text-center py-6 text-muted-foreground text-xs">No hands logged yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function exportCSV(hands: HandRecord[]) {
  const headers = ["timestamp","casino","game","tableId","dealerId","shoeNumber","handNumber","players","playerCards","dealerUpcard","outcome","runningCount","trueCount","cardsRemaining","decksRemaining","penetration","recommendedAction","actualAction","notes"];
  const rows = hands.map((h) => [
    new Date(h.timestamp).toISOString(), h.casino, h.game, h.tableId, h.dealerId, h.shoeNumber, h.handNumber, h.players,
    h.playerCards.join(" "), h.dealerUpcard ?? "", h.outcome ?? "", h.runningCount, h.trueCount.toFixed(3),
    h.cardsRemaining, h.decksRemaining.toFixed(2), h.penetration.toFixed(2),
    h.recommendedAction ?? "", h.actualAction ?? "", h.notes,
  ]);
  const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `bjedge-${Date.now()}.csv`; a.click();
  URL.revokeObjectURL(url);
}
