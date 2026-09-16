import { ArrowDownRight, ArrowUpRight, CircleAlert, Lightbulb, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Sparkline } from "@/components/deposit/Sparkline";
import { cn } from "@/lib/utils";
import { fmtGBP, fmtPct, type ActionItem, type Insight, type Movement } from "@/lib/deposit-data";

const SEVERITY: Record<Insight["severity"], { ring: string; text: string; icon: typeof Lightbulb }> = {
  positive: { ring: "border-l-status-go", text: "text-status-go", icon: TrendingUp },
  neutral: { ring: "border-l-kpmg", text: "text-primary", icon: Lightbulb },
  watch: { ring: "border-l-status-caution", text: "text-status-caution", icon: CircleAlert },
  risk: { ring: "border-l-status-stop", text: "text-status-stop", icon: CircleAlert },
};

export function InsightsPanel({
  insights,
  actions,
  personaId,
  compact = false,
  showActions = true,
}: {
  insights: Insight[];
  actions: ActionItem[];
  personaId: string;
  compact?: boolean;
  showActions?: boolean;
}) {
  const visibleInsights = insights.filter((i) => i.personas.includes(personaId));
  const visibleActions = actions.filter((a) => a.personas.includes(personaId));

  return (
    <section className={cn("space-y-3", compact && "flex h-full flex-col")}>
      <div>
        <h2 className={cn("font-semibold text-foreground", compact ? "text-base" : "text-xl")}>
          {showActions ? "Insights & key actions" : "Key insights"}
        </h2>
        <p className={cn("text-muted-foreground", compact ? "text-xs" : "text-sm")}>
          Generated from the filtered book under the active scenario.
        </p>
      </div>
      <div className={cn("grid gap-3", compact ? "flex-1 grid-cols-1 content-start" : "lg:grid-cols-[1.4fr_1fr]")}>
        <div className={cn("grid gap-2.5", compact ? "grid-cols-1" : "sm:grid-cols-2")}>
          {visibleInsights.map((i) => {
            const s = SEVERITY[i.severity];
            const Icon = s.icon;
            return (
              <Card key={i.id} className={cn("border-l-4 border-border p-4", s.ring)}>
                <div className="flex items-start gap-2">
                  <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", s.text)} />
                  <div>
                    <p className="text-sm font-semibold leading-snug text-foreground">{i.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{i.body}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {showActions && (
        <Card className="border-border p-4">
          <p className="mb-3 text-sm font-semibold text-foreground">Key actions for this persona</p>
          <ol className="space-y-3">
            {visibleActions.map((a, idx) => (
              <li key={a.id} className="flex gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                  {idx + 1}
                </span>
                <div>
                  <p className="text-sm font-medium leading-snug text-foreground">{a.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {a.owner} · {a.impact}
                  </p>
                  <span
                    className={cn(
                      "mt-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                      a.priority === "High" && "bg-status-stop/10 text-status-stop",
                      a.priority === "Medium" && "bg-status-caution/15 text-status-caution",
                      a.priority === "Low" && "bg-secondary text-secondary-foreground",
                    )}
                  >
                    {a.priority} priority
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </Card>
        )}
      </div>
    </section>
  );
}

export function WinsLosses({ wins, losses }: { wins: Movement[]; losses: Movement[] }) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Top wins &amp; losses</h2>
        <p className="text-sm text-muted-foreground">
          Largest projected balance movements across segments, products and regions.
        </p>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        <MovementTable title="Top wins" rows={wins} positive />
        <MovementTable title="Top losses" rows={losses} positive={false} />
      </div>
    </section>
  );
}

function MovementTable({ title, rows, positive }: { title: string; rows: Movement[]; positive: boolean }) {
  const Icon = positive ? ArrowUpRight : ArrowDownRight;
  return (
    <Card className="overflow-hidden border-border">
      <div className="flex items-center gap-2 border-b border-border bg-secondary px-4 py-2.5">
        <Icon className={cn("h-4 w-4", positive ? "text-status-go" : "text-status-stop")} />
        <p className="text-sm font-semibold text-secondary-foreground">{title}</p>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
            <th className="px-4 py-2 font-medium">Driver group</th>
            <th className="px-4 py-2 text-center font-medium">12m trend</th>
            <th className="px-4 py-2 text-right font-medium">Today</th>
            <th className="px-4 py-2 text-right font-medium">Δ Forecast</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const trend = r.trend ?? [];
            const trendPct =
              trend.length > 1 && trend[0]! > 0 ? (trend[trend.length - 1]! / trend[0]! - 1) * 100 : 0;
            return (
            <tr key={`${r.dimension}-${r.key}`} className="border-b border-border last:border-0 align-top">
              <td className="px-4 py-2.5">
                <p className="font-medium text-foreground">{r.name}</p>
                <p className="text-xs text-muted-foreground">
                  {r.dimension} · {r.driver}
                </p>
              </td>
              <td className="px-3 py-2.5">
                <div className="flex flex-col items-center">
                  <Sparkline values={trend} positive={trendPct >= 0} />
                  <span className={cn("text-[11px] font-medium", trendPct >= 0 ? "text-status-go" : "text-status-stop")}>
                    {fmtPct(trendPct)} 12m
                  </span>
                </div>
              </td>
              <td className="whitespace-nowrap px-4 py-2.5 text-right text-foreground">{fmtGBP(r.balance)}</td>
              <td
                className={cn(
                  "whitespace-nowrap px-4 py-2.5 text-right font-semibold",
                  r.delta >= 0 ? "text-status-go" : "text-status-stop",
                )}
              >
                {fmtGBP(r.delta)}
                <span className="block text-xs font-medium">{fmtPct(r.deltaPct)}</span>
              </td>
            </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}
