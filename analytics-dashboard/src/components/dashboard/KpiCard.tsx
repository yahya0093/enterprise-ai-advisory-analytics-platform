import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
  accent?: "primary" | "accent" | "chart3" | "chart4" | "chart5";
  trend?: number;
}

const accentMap: Record<string, string> = {
  primary: "from-primary/30 to-primary/5 text-primary",
  accent: "from-accent/30 to-accent/5 text-accent",
  chart3: "from-[var(--chart-3)]/30 to-[var(--chart-3)]/5 text-[var(--chart-3)]",
  chart4: "from-[var(--chart-4)]/30 to-[var(--chart-4)]/5 text-[var(--chart-4)]",
  chart5: "from-[var(--chart-5)]/30 to-[var(--chart-5)]/5 text-[var(--chart-5)]",
};

export function KpiCard({ label, value, hint, icon, accent = "primary", trend }: Props) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 transition-all hover:border-border hover:shadow-[0_0_40px_-10px_var(--color-primary)]">
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-60 pointer-events-none", accentMap[accent])} />
      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="text-xs uppercase tracking-widest text-muted-foreground font-medium">{label}</div>
          {icon && <div className={cn("opacity-80", accentMap[accent].split(" ").pop())}>{icon}</div>}
        </div>
        <div className="mt-3 text-3xl font-bold tracking-tight tabular-nums">{value}</div>
        <div className="mt-1 flex items-center gap-2 text-xs">
          {typeof trend === "number" && (
            <span className={cn("font-semibold", trend >= 0 ? "text-primary" : "text-destructive")}>
              {trend >= 0 ? "▲" : "▼"} {Math.abs(trend).toFixed(1)}%
            </span>
          )}
          {hint && <span className="text-muted-foreground">{hint}</span>}
        </div>
      </div>
    </div>
  );
}
