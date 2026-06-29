import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dashboard } from "@/components/bj/Dashboard";
import { SetupWizard } from "@/components/bj/SetupWizard";
import { LiveSession } from "@/components/bj/LiveSession";
import { Statistics } from "@/components/bj/Statistics";
import { TableManager, DealerManager } from "@/components/bj/TableManager";
import { ShoeTracking } from "@/components/bj/ShoeTracking";
import { Settings as SettingsView } from "@/components/bj/Settings";
import { useSession } from "@/store/session";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Play, BarChart3, Layers, Table2, UserCircle2, Settings, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Blackjack Edge AI — Decision Terminal" },
      { name: "description", content: "Professional blackjack analytics, counting, and decision engine. Research-grade, not a gambling bot." },
      { property: "og:title", content: "Blackjack Edge AI" },
      { property: "og:description", content: "Professional blackjack analytics, counting, and decision engine." },
    ],
  }),
  component: Index,
});

type Tab = "dashboard" | "setup" | "live" | "stats" | "shoes" | "tables" | "dealers" | "settings";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: "live", label: "Live Session", icon: <Play className="h-4 w-4" /> },
  { id: "stats", label: "Analytics", icon: <BarChart3 className="h-4 w-4" /> },
  { id: "shoes", label: "Shoes", icon: <Layers className="h-4 w-4" /> },
  { id: "tables", label: "Tables", icon: <Table2 className="h-4 w-4" /> },
  { id: "dealers", label: "Dealers", icon: <UserCircle2 className="h-4 w-4" /> },
  { id: "settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
];

function Index() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const config = useSession((s) => s.config);

  const go = (t: Tab) => setTab(t);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/60 border-b border-border">
        <div className="max-w-[1600px] mx-auto px-5 h-16 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-gold flex items-center justify-center shadow-[0_0_20px_-4px_var(--primary)]">
              <Sparkles className="h-4 w-4 text-background" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">Blackjack Edge AI</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Decision Terminal</div>
            </div>
          </div>

          <nav className="ml-6 flex items-center gap-1 overflow-x-auto">
            {TABS.filter((t) => t.id !== "setup").map((t) => (
              <button
                key={t.id}
                onClick={() => go(t.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 h-9 rounded-lg text-xs font-medium uppercase tracking-wider transition whitespace-nowrap",
                  tab === t.id
                    ? "bg-primary/15 text-primary border border-primary/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                )}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            <span className={cn("h-2 w-2 rounded-full", config ? "bg-primary shadow-[0_0_8px_var(--primary)]" : "bg-muted-foreground/40")} />
            {config ? "Session Live" : "Idle"}
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-5 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            {tab === "dashboard" && (
              <Dashboard onStartSession={() => go("setup")} onResume={() => go("live")} />
            )}
            {tab === "setup" && <SetupWizard onDone={() => go("live")} />}
            {tab === "live" && (config
              ? <LiveSession onEnd={() => { useSession.getState().endSession(); go("dashboard"); }} />
              : <EmptyState onStart={() => go("setup")} />)}
            {tab === "stats" && <Statistics />}
            {tab === "shoes" && <ShoeTracking />}
            {tab === "tables" && <TableManager />}
            {tab === "dealers" && <DealerManager />}
            {tab === "settings" && <SettingsView />}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="max-w-[1600px] mx-auto px-5 pb-8 pt-4 text-[10px] text-muted-foreground/70 italic">
        Blackjack Edge AI is a research and decision-support tool. It does not predict, guarantee, or influence outcomes.
      </footer>
    </div>
  );
}

function EmptyState({ onStart }: { onStart: () => void }) {
  return (
    <div className="glass rounded-2xl p-12 text-center max-w-xl mx-auto">
      <div className="text-xs uppercase tracking-[0.2em] text-primary mb-2">No active session</div>
      <h2 className="text-2xl font-semibold mb-2">Configure a session to begin</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Define the casino, table, dealer, and rule set. The terminal will activate counting and decision engines.
      </p>
      <button onClick={onStart} className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 h-11 rounded-lg text-sm font-semibold uppercase tracking-wider">
        Open Setup Wizard →
      </button>
    </div>
  );
}
