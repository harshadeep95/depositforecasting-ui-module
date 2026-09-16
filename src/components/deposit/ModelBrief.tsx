import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  ASSUMPTION_CONTROLS,
  DEFAULT_ASSUMPTIONS,
  fmtGBP,
  type ActionItem,
  type Kpis,
  type Scenario,
  type TreeAssumptions,
} from "@/lib/deposit-data";
import type { ForecastModel } from "@/lib/model-store";

/** Key assumptions the selected model is currently running on. */
export function KeyAssumptions({
  assumptions,
  scenario,
  model,
}: {
  assumptions: TreeAssumptions;
  scenario: Scenario;
  model: ForecastModel;
}) {
  const rows = ASSUMPTION_CONTROLS.map((c) => {
    const value = assumptions[c.key];
    const base = DEFAULT_ASSUMPTIONS[c.key];
    const changed = Math.abs(value - base) > 1e-9;
    const fmt = (v: number) => (c.unit === "pct" ? `${v}%` : `${v} idx`);
    return { key: c.key as string, label: c.label, value: fmt(value), base: fmt(base), changed };
  });
  const changed = rows.filter((r) => r.changed);
  const shown = changed.length ? changed : rows.slice(0, 5);

  return (
    <Card className="flex h-full flex-col border-border p-4">
      <div>
        <h3 className="text-base font-semibold text-foreground">Key assumptions the model is using</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {model.name} · back-test MAPE {model.mape.toFixed(1)}% ·{" "}
          {changed.length ? `${changed.length} driver${changed.length > 1 ? "s" : ""} overridden` : "running on model defaults"}
        </p>
      </div>

      <ul className="mt-3 space-y-1.5">
        {shown.map((r) => (
          <li key={r.key} className="flex items-baseline justify-between gap-3 border-b border-border pb-1.5 last:border-0">
            <span className="text-xs text-muted-foreground">{r.label}</span>
            <span className="flex items-baseline gap-2 tabular-nums">
              {r.changed && <span className="text-[10px] text-muted-foreground line-through">{r.base}</span>}
              <span className={cn("text-sm font-semibold", r.changed ? "text-primary" : "text-foreground")}>{r.value}</span>
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-3 rounded-md bg-secondary px-3 py-2 text-[11px] leading-relaxed text-secondary-foreground">
        Pricing context: base rate {(scenario.baseRateBps / 100).toFixed(2)}%, own offer{" "}
        {scenario.offerRateBps >= 0 ? "+" : ""}
        {scenario.offerRateBps}bps, competitor pressure +{scenario.competitorPressureBps}bps, marketing uplift{" "}
        {scenario.marketingUplift}% over a {scenario.horizon}-month horizon.
      </p>
    </Card>
  );
}

/** Model-generated recommendations for the leadership team. */
export function KeyRecommendations({
  kpis,
  scenario,
  model,
  actions = [],
  personaId,
}: {
  kpis: Kpis;
  scenario: Scenario;
  model: ForecastModel;
  actions?: ActionItem[];
  personaId?: string;
}) {
  const visibleActions = personaId ? actions.filter((a) => a.personas.includes(personaId)) : actions;
  const attrition = kpis.attritionRate * 100;
  const recs: { title: string; body: string; tag: string; tone: "high" | "medium" | "low" }[] = [];

  recs.push(
    kpis.netFlow >= 0
      ? {
          title: "Hold the current pricing stance",
          body: `Net inflow of ${fmtGBP(kpis.netFlow)} over ${scenario.horizon} months means the book funds itself without a further rate give-away.`,
          tag: "Pricing",
          tone: "low",
        }
      : {
          title: "Reprice the most rate-sensitive tiers",
          body: `Projected net outflow of ${fmtGBP(Math.abs(kpis.netFlow))} — a targeted +15 to +25bps on notice and fixed tiers closes most of the gap at lower cost than a book-wide move.`,
          tag: "Pricing",
          tone: "high",
        },
  );

  recs.push(
    attrition > 12
      ? {
          title: "Launch a maturity retention campaign",
          body: `Attrition is running at ${attrition.toFixed(1)}%, above the 12% tolerance. Pre-maturity contact on the next roll window is the highest-return lever in the driver tree.`,
          tag: "Retention",
          tone: "high",
        }
      : {
          title: "Redeploy retention spend to acquisition",
          body: `Attrition at ${attrition.toFixed(1)}% is inside tolerance, so front-book acquisition earns more per pound than further retention offers.`,
          tag: "Growth",
          tone: "medium",
        },
  );

  recs.push({
    title: kpis.costOfFunds > 3.2 ? "Rebalance the funding mix" : "Extend duration while funding is cheap",
    body:
      kpis.costOfFunds > 3.2
        ? `Blended cost of funds is ${kpis.costOfFunds.toFixed(2)}%. Shifting incremental volume from fixed bonds to easy access and current accounts protects margin.`
        : `Blended cost of funds is ${kpis.costOfFunds.toFixed(2)}%. Lock in term balances now to reduce refinancing risk later in the horizon.`,
    tag: "Treasury",
    tone: kpis.costOfFunds > 3.2 ? "high" : "medium",
  });

  recs.push({
    title: kpis.mape > 5 ? "Refresh the model before committing the plan" : "Adopt the forecast into the funding plan",
    body:
      kpis.mape > 5
        ? `${model.name} is tracking at ${kpis.mape.toFixed(1)}% error, outside the 5% band. Re-fit on the latest quarter before the numbers go to ALCO.`
        : `${model.name} is tracking at ${kpis.mape.toFixed(1)}% error, inside the 5% band, so the ${fmtGBP(kpis.forecast)} projection is safe to plan against.`,
    tag: "Model",
    tone: kpis.mape > 5 ? "high" : "low",
  });

  return (
    <Card className="flex h-full flex-col border-border p-4">
      <div>
        <h3 className="text-base font-semibold text-foreground">Key actions &amp; recommendations</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Owned actions for this persona plus model recommendations from the filtered book, the active scenario and {model.name}.
        </p>
      </div>

      {visibleActions.length > 0 && (
        <div className="mt-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Key actions</p>
          <ul className="mt-2 space-y-2">
            {visibleActions.map((a) => (
              <li key={a.id} className="rounded-md border border-border p-2.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium leading-snug text-foreground">{a.title}</p>
                  <span
                    className={cn(
                      "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                      a.priority === "High" && "bg-status-stop/10 text-status-stop",
                      a.priority === "Medium" && "bg-status-caution/15 text-status-caution",
                      a.priority === "Low" && "bg-secondary text-secondary-foreground",
                    )}
                  >
                    {a.priority}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {a.owner} · {a.impact}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Model recommendations
          </p>
        </div>
      )}
      <ol className="mt-2 space-y-2.5">
        {recs.map((r, i) => (
          <li key={r.title} className="flex gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
              {i + 1}
            </span>
            <div>
              <p className="text-sm font-medium leading-snug text-foreground">{r.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{r.body}</p>
              <span
                className={cn(
                  "mt-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                  r.tone === "high" && "bg-status-stop/10 text-status-stop",
                  r.tone === "medium" && "bg-status-caution/15 text-status-caution",
                  r.tone === "low" && "bg-secondary text-secondary-foreground",
                )}
              >
                {r.tag}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}
