import { useMemo } from "react";
import { useSession } from "@/store/session";
import { StatCard } from "./StatCard";
import type { HandRecord } from "@/lib/blackjack/types";

interface Aggregate {
  id: string;
  sessions: number;
  hands: number;
  avgPen: number;
  avgPlayers: number;
  avgTC: number;
}

function aggregateBy(hands: HandRecord[], key: "tableId" | "dealerId"): Aggregate[] {
  const map = new Map<string, HandRecord[]>();
  for (const h of hands) {
    const k = h[key];
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(h);
  }
  return Array.from(map.entries()).map(([id, rows]) => {
    const shoes = new Set(rows.map((r) => `${r.tableId}-${r.dealerId}-${r.shoeNumber}`));
    const avg = (a: number[]) => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
    return {
      id,
      sessions: shoes.size,
      hands: rows.length,
      avgPen: avg(rows.map((r) => r.penetration)),
      avgPlayers: avg(rows.map((r) => r.players)),
      avgTC: avg(rows.map((r) => r.trueCount)),
    };
  });
}

export function TableManager() {
  const hands = useSession((s) => s.hands);
  const tables = useMemo(() => aggregateBy(hands, "tableId"), [hands]);

  return (
    <div className="space-y-5">
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-primary">Tables</div>
        <h2 className="text-2xl font-semibold">Table Manager</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Tables Tracked" value={tables.length} />
        <StatCard label="Total Hands" value={hands.length} />
        <StatCard label="Avg Penetration" value={`${(tables.length ? tables.reduce((a,b)=>a+b.avgPen,0)/tables.length : 0).toFixed(1)}%`} />
        <StatCard label="Avg True Count" value={(tables.length ? tables.reduce((a,b)=>a+b.avgTC,0)/tables.length : 0).toFixed(2)} />
      </div>

      <div className="glass rounded-2xl p-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-[10px] uppercase tracking-wider text-muted-foreground">
            <tr className="border-b border-border">
              {["Table", "Sessions", "Hands", "Avg Players", "Avg Penetration", "Avg True Count"].map((h) => (
                <th key={h} className="text-left py-2 px-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tables.map((t) => (
              <tr key={t.id} className="border-b border-border/40 numeric">
                <td className="py-3 px-3 font-medium">{t.id}</td>
                <td className="py-3 px-3">{t.sessions}</td>
                <td className="py-3 px-3">{t.hands}</td>
                <td className="py-3 px-3">{t.avgPlayers.toFixed(1)}</td>
                <td className="py-3 px-3 text-gold">{t.avgPen.toFixed(1)}%</td>
                <td className="py-3 px-3 text-primary">{t.avgTC.toFixed(2)}</td>
              </tr>
            ))}
            {tables.length === 0 && (
              <tr><td colSpan={6} className="text-center py-6 text-muted-foreground text-xs">No tables tracked yet. Log hands to populate.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function DealerManager() {
  const hands = useSession((s) => s.hands);
  const dealers = useMemo(() => aggregateBy(hands, "dealerId"), [hands]);

  return (
    <div className="space-y-5">
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-primary">Dealers</div>
        <h2 className="text-2xl font-semibold">Dealer Profiles</h2>
        <p className="text-xs text-muted-foreground mt-1">Descriptive statistics only. Dealers do not influence card outcomes.</p>
      </div>

      <div className="glass rounded-2xl p-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-[10px] uppercase tracking-wider text-muted-foreground">
            <tr className="border-b border-border">
              {["Dealer", "Sessions Observed", "Hands", "Avg Players", "Avg Penetration", "Avg True Count"].map((h) => (
                <th key={h} className="text-left py-2 px-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dealers.map((d) => (
              <tr key={d.id} className="border-b border-border/40 numeric">
                <td className="py-3 px-3 font-medium">{d.id}</td>
                <td className="py-3 px-3">{d.sessions}</td>
                <td className="py-3 px-3">{d.hands}</td>
                <td className="py-3 px-3">{d.avgPlayers.toFixed(1)}</td>
                <td className="py-3 px-3 text-gold">{d.avgPen.toFixed(1)}%</td>
                <td className="py-3 px-3 text-primary">{d.avgTC.toFixed(2)}</td>
              </tr>
            ))}
            {dealers.length === 0 && (
              <tr><td colSpan={6} className="text-center py-6 text-muted-foreground text-xs">No dealers tracked yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
