import { useSession } from "@/store/session";
import { StatCard } from "./StatCard";
import { COUNT_SYSTEMS } from "@/lib/blackjack/count";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export function Settings() {
  const countSystem = useSession((s) => s.countSystem);
  const setCountSystem = useSession((s) => s.setCountSystem);
  const ruleProfiles = useSession((s) => s.ruleProfiles);
  const deleteRuleProfile = useSession((s) => s.deleteRuleProfile);
  const clearAll = useSession((s) => s.clearAll);

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-primary">Settings</div>
        <h2 className="text-2xl font-semibold">Preferences</h2>
      </div>

      <div className="glass rounded-2xl p-5 space-y-4">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Counting System</div>
        <Select value={countSystem} onValueChange={(v) => setCountSystem(v as any)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {COUNT_SYSTEMS.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.label} — {c.description}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="glass rounded-2xl p-5">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Saved Rule Profiles</div>
        {ruleProfiles.length === 0 && <p className="text-sm text-muted-foreground">No saved profiles. Save one from the setup wizard.</p>}
        <div className="space-y-2">
          {ruleProfiles.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 px-3 py-2">
              <div>
                <div className="text-sm font-medium">{p.name}</div>
                <div className="text-[10px] text-muted-foreground">
                  {p.rules.decks}D · {p.rules.dealerHitsSoft17 ? "H17" : "S17"} · BJ {p.rules.blackjackPayout} · {p.rules.surrender}
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-negative" onClick={() => deleteRuleProfile(p.id)}>Delete</Button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Currency" value="PHP" hint="Display only" />
        <StatCard label="Theme" value="Dark" hint="Optimized for low light" />
        <StatCard label="Persistence" value="Local" hint="Browser localStorage" />
        <StatCard label="Version" value="1.0" hint="Edge AI" />
      </div>

      <div className="glass rounded-2xl p-5 border border-negative/30">
        <div className="text-xs uppercase tracking-[0.2em] text-negative mb-2">Danger Zone</div>
        <p className="text-sm text-muted-foreground mb-3">Clear all session history, hands, shoes, and current state.</p>
        <Button variant="outline" className="border-negative/40 text-negative hover:bg-negative/10"
          onClick={() => { if (confirm("Clear all data?")) clearAll(); }}>Clear All Data</Button>
      </div>

      <div className="text-[10px] text-muted-foreground/70 italic max-w-prose">
        Blackjack Edge AI is a research and decision-support tool. It does not guarantee outcomes, profits, or wins.
        Use responsibly. Casinos may prohibit advantage play; know the rules of any venue you visit.
      </div>
    </div>
  );
}
