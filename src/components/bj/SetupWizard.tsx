import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useSession } from "@/store/session";
import { DEFAULT_RULES, type Rules, type SetupConfig, type ShoeMode } from "@/lib/blackjack/types";

interface Props {
  onDone: () => void;
}

export function SetupWizard({ onDone }: Props) {
  const startSession = useSession((s) => s.startSession);
  const ruleProfiles = useSession((s) => s.ruleProfiles);
  const saveRuleProfile = useSession((s) => s.saveRuleProfile);

  const [casino, setCasino] = useState("Bellagio");
  const [game, setGame] = useState("Double Deck Pitch");
  const [tableId, setTableId] = useState("BJ-14");
  const [dealerId, setDealerId] = useState("D-127");
  const [players, setPlayers] = useState(4);
  const [shoeMode, setShoeMode] = useState<ShoeMode>("fresh");
  const [rules, setRules] = useState<Rules>(DEFAULT_RULES);
  const [profileName, setProfileName] = useState("");

  const update = <K extends keyof Rules>(k: K, v: Rules[K]) =>
    setRules((r) => ({ ...r, [k]: v }));

  const submit = () => {
    const cfg: SetupConfig = {
      casino, game, tableId, dealerId,
      shoeNumber: 1,
      players,
      rules,
      shoeMode,
      startedAt: Date.now(),
    };
    startSession(cfg);
    onDone();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="mb-8">
        <div className="text-xs uppercase tracking-[0.2em] text-primary mb-2">Session Setup</div>
        <h1 className="text-4xl font-semibold tracking-tight">Configure your shoe</h1>
        <p className="text-muted-foreground mt-2 text-sm max-w-xl">
          Define the table, dealer, and rule set. Blackjack Edge AI uses these to
          compute mathematically sound recommendations. Nothing is guaranteed.
        </p>
      </div>

      <div className="glass rounded-2xl p-6 grid md:grid-cols-2 gap-5">
        <Field label="Casino"><Input value={casino} onChange={(e) => setCasino(e.target.value)} /></Field>
        <Field label="Game"><Input value={game} onChange={(e) => setGame(e.target.value)} /></Field>
        <Field label="Table ID"><Input value={tableId} onChange={(e) => setTableId(e.target.value)} /></Field>
        <Field label="Dealer ID"><Input value={dealerId} onChange={(e) => setDealerId(e.target.value)} /></Field>
        <Field label="Number of Decks">
          <Select value={String(rules.decks)} onValueChange={(v) => update("decks", parseInt(v))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {[1, 2, 4, 6, 8].map((d) => <SelectItem key={d} value={String(d)}>{d} deck{d > 1 ? "s" : ""}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label={`Players at table (max ${rules.maxPlayers})`}>
          <Input type="number" min={1} max={rules.maxPlayers}
            value={players} onChange={(e) => setPlayers(Math.min(rules.maxPlayers, parseInt(e.target.value) || 1))} />
        </Field>
        <Field label="Max Players Supported">
          <Select value={String(rules.maxPlayers)} onValueChange={(v) => update("maxPlayers", parseInt(v))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {[5, 6, 7].map((d) => <SelectItem key={d} value={String(d)}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Blackjack Payout">
          <Select value={rules.blackjackPayout} onValueChange={(v) => update("blackjackPayout", v as Rules["blackjackPayout"])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="3:2">3 : 2 (preferred)</SelectItem>
              <SelectItem value="6:5">6 : 5 (avoid)</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Double On">
          <Select value={rules.doubleOn} onValueChange={(v) => update("doubleOn", v as Rules["doubleOn"])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any two cards</SelectItem>
              <SelectItem value="9-11">9, 10, 11 only</SelectItem>
              <SelectItem value="10-11">10, 11 only</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Surrender">
          <Select value={rules.surrender} onValueChange={(v) => update("surrender", v as Rules["surrender"])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="late">Late</SelectItem>
              <SelectItem value="early">Early</SelectItem>
              <SelectItem value="none">None</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Max Splits">
          <Select value={String(rules.maxSplits)} onValueChange={(v) => update("maxSplits", parseInt(v))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4].map((d) => <SelectItem key={d} value={String(d)}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>

        <Toggle label="Dealer Hits Soft 17 (H17)"
          checked={rules.dealerHitsSoft17} onChange={(v) => update("dealerHitsSoft17", v)} />
        <Toggle label="Double After Split"
          checked={rules.doubleAfterSplit} onChange={(v) => update("doubleAfterSplit", v)} />
        <Toggle label="Resplit Aces"
          checked={rules.resplitAces} onChange={(v) => update("resplitAces", v)} />
        <Toggle label="Hit Split Aces"
          checked={rules.hitSplitAces} onChange={(v) => update("hitSplitAces", v)} />
      </div>

      <div className="glass rounded-2xl p-6 mt-5">
        <div className="text-xs uppercase tracking-[0.2em] text-primary mb-3">Shoe Status</div>
        <div className="grid grid-cols-2 gap-3">
          <ShoeOption
            active={shoeMode === "fresh"}
            onClick={() => setShoeMode("fresh")}
            title="Fresh Shoe"
            desc="Full counting & true-count analytics enabled."
          />
          <ShoeOption
            active={shoeMode === "mid"}
            onClick={() => setShoeMode("mid")}
            title="Mid Shoe"
            desc="Basic Strategy only until next shuffle."
          />
        </div>
      </div>

      <div className="glass rounded-2xl p-6 mt-5">
        <div className="text-xs uppercase tracking-[0.2em] text-primary mb-3">Rule Profile</div>
        <div className="flex flex-wrap gap-2 mb-3">
          {ruleProfiles.length === 0 && <span className="text-xs text-muted-foreground">No saved profiles yet.</span>}
          {ruleProfiles.map((p) => (
            <button key={p.id}
              className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-primary/60 hover:text-primary transition"
              onClick={() => setRules(p.rules)}>
              {p.name}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Input placeholder="Profile name (e.g. Strip 6D S17)" value={profileName} onChange={(e) => setProfileName(e.target.value)} />
          <Button variant="secondary" onClick={() => { if (profileName.trim()) { saveRuleProfile(profileName.trim(), rules); setProfileName(""); } }}>
            Save Rules
          </Button>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <Button size="lg" onClick={submit} className="bg-primary text-primary-foreground hover:bg-primary/90 px-8">
          Begin Session →
        </Button>
      </div>
    </motion.div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 px-3 py-2.5">
      <span className="text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function ShoeOption({ active, onClick, title, desc }: { active: boolean; onClick: () => void; title: string; desc: string }) {
  return (
    <button onClick={onClick}
      className={`text-left rounded-xl border p-4 transition ${
        active ? "border-primary/70 bg-primary/10 shadow-[0_0_0_1px_var(--primary)_inset]" : "border-border hover:border-primary/40"
      }`}>
      <div className="text-sm font-semibold">{title}</div>
      <div className="text-xs text-muted-foreground mt-1">{desc}</div>
    </button>
  );
}
