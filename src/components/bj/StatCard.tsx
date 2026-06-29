import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  accent?: "default" | "primary" | "gold" | "positive" | "negative";
  className?: string;
  large?: boolean;
}

const accentMap = {
  default: "text-foreground",
  primary: "text-primary text-glow",
  gold: "text-gold text-gold-glow",
  positive: "text-positive",
  negative: "text-negative",
};

export function StatCard({ label, value, hint, accent = "default", className, large }: StatCardProps) {
  return (
    <div className={cn("glass rounded-2xl p-5 flex flex-col gap-1.5", className)}>
      <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-medium">
        {label}
      </span>
      <span className={cn("numeric font-semibold leading-none", large ? "text-5xl" : "text-3xl", accentMap[accent])}>
        {value}
      </span>
      {hint && <span className="text-xs text-muted-foreground mt-1">{hint}</span>}
    </div>
  );
}
