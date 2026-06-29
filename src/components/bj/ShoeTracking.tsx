import { useMemo } from "react";
import { useSession } from "@/store/session";
import { StatCard } from "./StatCard";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export function ShoeTracking() {
  const shoes = useSession((s) => s.shoes);
  const summary = useMemo(() => {
    const avg = (a: number[]) => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
    return {
      count: shoes.length,
      avgLen: avg(shoes.map((s) => s.cardsDealt)),
      avgPen: avg(shoes.map((s) => s.penetration)),
      longest: shoes.length ? Math.max(...shoes.map((s) => s.cardsDealt)) : 0,
      maxTC: shoes.length ? Math.max(...shoes.map((s) => s.maxTC)) : 0,
      minTC: shoes.length ? Math.min(...shoes.map((s) => s.minTC)) : 0,
    };
  }, [shoes]);

  return (
    <div className="space-y-5">
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-primary">Shoe Tracking</div>
        <h2 className="text-2xl font-semibold">Replay & telemetry</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <StatCard label="Shoes" value={summary.count} />
        <StatCard label="Avg Length" value={summary.avgLen.toFixed(0)} />
        <StatCard label="Avg Penetration" value={`${summary.avgPen.toFixed(1)}%`} accent="gold" />
        <StatCard label="Longest" value={summary.longest} />
        <StatCard label="Max TC" value={summary.maxTC.toFixed(2)} accent="primary" />
        <StatCard label="Min TC" value={summary.minTC.toFixed(2)} accent="negative" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {shoes.slice(0, 6).map((s) => (
          <div key={s.shoeNumber + "-" + s.startedAt} className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold">Shoe #{s.shoeNumber}</div>
              <div className="text-[10px] text-muted-foreground numeric">
                {s.cardsDealt} cards · {s.penetration.toFixed(1)}%
              </div>
            </div>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={s.history.map((p, i) => ({ i, rc: p.rc, tc: Number(p.tc.toFixed(2)) }))}>
                  <CartesianGrid stroke="oklch(1 0 0 / 0.06)" vertical={false} />
                  <XAxis dataKey="i" hide />
                  <YAxis tick={{ fill: "oklch(0.65 0.015 240)", fontSize: 10 }} width={28} />
                  <Tooltip contentStyle={{ background: "oklch(0.18 0.012 240)", border: "1px solid oklch(0.28 0.012 240)", borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="rc" stroke="oklch(0.78 0.18 150)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="tc" stroke="oklch(0.83 0.15 85)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 mt-2 text-[10px] text-muted-foreground numeric">
              <span>Max TC <span className="text-primary">{s.maxTC.toFixed(2)}</span></span>
              <span>Min TC <span className="text-negative">{s.minTC.toFixed(2)}</span></span>
            </div>
          </div>
        ))}
        {shoes.length === 0 && (
          <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground col-span-2">
            No shoes recorded yet. Tap "New Shoe" in the live session to archive one.
          </div>
        )}
      </div>
    </div>
  );
}
