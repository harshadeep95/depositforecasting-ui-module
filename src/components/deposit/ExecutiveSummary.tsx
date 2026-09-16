import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PERSONAS, fmtGBP, fmtPct, narrative, type Kpis, type Scenario } from "@/lib/deposit-data";

const TILE_DEFS: Record<string, (k: Kpis, s: Scenario) => { label: string; value: string; sub: string; tone: "up" | "down" | "flat" }> = {
  balance: (k) => ({
    label: "Deposit balance",
    value: fmtGBP(k.balance),
    sub: `${fmtPct(k.deltaPct)} year on year`,
    tone: k.deltaPct >= 0 ? "up" : "down",
  }),
  forecast: (k, s) => ({
    label: `Forecast (${s.horizon}m)`,
    value: fmtGBP(k.forecast),
    sub: `${fmtPct(k.vsBaselinePct)} vs baseline`,
    tone: k.vsBaselinePct >= 0 ? "up" : "down",
  }),
  netFlow: (k, s) => ({
    label: `Net flow (${s.horizon}m)`,
    value: fmtGBP(k.netFlow),
    sub: k.netFlow >= 0 ? "Net inflow" : "Net outflow",
    tone: k.netFlow >= 0 ? "up" : "down",
  }),
  costOfFunds: (k) => ({
    label: "Cost of funds",
    value: `${k.costOfFunds.toFixed(2)}%`,
    sub: "Blended, weighted by balance",
    tone: "flat",
  }),
  attrition: (k) => ({
    label: "Attrition (annualised)",
    value: `${(k.attritionRate * 100).toFixed(1)}%`,
    sub: k.attritionRate * 100 > 12 ? "Above tolerance" : "Within tolerance",
    tone: k.attritionRate * 100 > 12 ? "down" : "up",
  }),
  mape: (k) => ({
    label: "Model accuracy (MAPE)",
    value: `${k.mape.toFixed(1)}%`,
    sub: k.mape > 5 ? "Outside 5% band" : "Inside 5% band",
    tone: k.mape > 5 ? "down" : "up",
  }),
};

export function ExecutiveSummary({
  personaId,
  kpis,
  scenario,
}: {
  personaId: string;
  kpis: Kpis;
  scenario: Scenario;
}) {
  const persona = PERSONAS.find((p) => p.id === personaId) ?? PERSONAS[0]!;
  const tiles = persona.kpis.map((k) => TILE_DEFS[k]!(kpis, scenario));

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Executive summary</h2>
          <p className="text-sm text-muted-foreground">
            {persona.name} · {persona.role} — {persona.focus}
          </p>
        </div>
        <span className="rounded-full bg-secondary px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-secondary-foreground">
          Synthetic demo data
        </span>
      </div>

      <Card className="gradient-wash border-border p-5">
        <p className="max-w-4xl text-[15px] leading-relaxed text-foreground">{narrative(persona.id, kpis, scenario)}</p>
      </Card>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((t) => (
          <Card key={t.label} className="border-border p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t.label}</p>
            <p className="mt-1.5 text-2xl font-semibold tracking-tight text-primary">{t.value}</p>
            <p
              className={cn(
                "mt-1 text-xs font-medium",
                t.tone === "up" && "text-status-go",
                t.tone === "down" && "text-status-stop",
                t.tone === "flat" && "text-muted-foreground",
              )}
            >
              {t.sub}
            </p>
          </Card>
        ))}
      </div>
    </section>
  );
}
