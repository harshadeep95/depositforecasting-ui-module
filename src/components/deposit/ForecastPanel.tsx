import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import {
  BASELINE_SCENARIO,
  HISTORY_MONTHS,
  SCENARIO_PRESETS,
  fmtGBP,
  fmtPct,
  monthLabel,
  type Breakdown,
  type ForecastPoint,
  type Scenario,
} from "@/lib/deposit-data";

interface Props {
  points: ForecastPoint[];
  scenario: Scenario;
  onScenario: (s: Scenario) => void;
  bySegment: Breakdown[];
  byProduct: Breakdown[];
}

const CONTROLS: {
  key: keyof Scenario;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
}[] = [
  { key: "baseRateBps", label: "Base rate move", min: -100, max: 150, step: 5, unit: "bps" },
  { key: "offerRateBps", label: "Own savings offer", min: -75, max: 150, step: 5, unit: "bps" },
  { key: "competitorPressureBps", label: "Competitor pressure", min: 0, max: 150, step: 5, unit: "bps" },
  { key: "marketingUplift", label: "Acquisition uplift", min: -20, max: 40, step: 1, unit: "%" },
  { key: "attritionShock", label: "Attrition shock", min: -30, max: 60, step: 1, unit: "%" },
  { key: "seasonality", label: "Seasonality intensity", min: 0, max: 2, step: 0.1, unit: "x" },
];

function TooltipBox({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-semibold text-foreground">{label}</p>
      {payload
        .filter((p) => p.value != null && p.name !== "Confidence band")
        .map((p) => (
          <p key={p.name} className="text-muted-foreground">
            <span className="font-medium text-foreground">{p.name}: </span>
            {typeof p.value === "number" ? fmtGBP(p.value) : String(p.value)}
          </p>
        ))}
    </div>
  );
}

export function ForecastPanel({ points, scenario, onScenario, bySegment, byProduct }: Props) {
  const isBaseline =
    scenario.baseRateBps === 0 &&
    scenario.offerRateBps === 0 &&
    scenario.competitorPressureBps === 0 &&
    scenario.marketingUplift === 0 &&
    scenario.attritionShock === 0 &&
    scenario.seasonality === 1;

  const set = (key: keyof Scenario, value: number) => onScenario({ ...scenario, [key]: value });

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Interactive forecast</h2>
          <p className="text-sm text-muted-foreground">
            Five years of monthly actuals with a {scenario.horizon}-month projection and confidence band.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {SCENARIO_PRESETS.map((p) => (
            <Button
              key={p.id}
              size="sm"
              variant="outline"
              title={p.description}
              onClick={() => onScenario({ ...p.scenario, horizon: scenario.horizon })}
            >
              {p.name}
            </Button>
          ))}
          <Button
            size="sm"
            variant="ghost"
            disabled={isBaseline}
            onClick={() => onScenario({ ...BASELINE_SCENARIO, horizon: scenario.horizon })}
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Reset
          </Button>
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-[1.75fr_1fr]">
        <div className="space-y-3">
        <Card className="border-border p-4">

          <div className="h-[clamp(180px,25vh,280px)] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
                <defs>
                  <linearGradient id="actualFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--kpmg)" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="var(--kpmg)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  interval={5}
                  tickLine={false}
                  axisLine={{ stroke: "var(--border)" }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  tickFormatter={(v: number) => fmtGBP(v)}
                  tickLine={false}
                  axisLine={false}
                  width={64}
                />
                <Tooltip content={<TooltipBox />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <ReferenceLine
                  x={monthLabel(HISTORY_MONTHS - 1)}
                  stroke="var(--navy)"
                  strokeDasharray="4 4"
                  label={{ value: "Today", position: "insideTopRight", fontSize: 11, fill: "var(--navy)" }}
                />
                <Area
                  type="monotone"
                  dataKey="band"
                  name="Confidence band"
                  stroke="none"
                  fill="var(--lightblue)"
                  fillOpacity={0.55}
                  isAnimationActive={false}
                />
                <Area
                  type="monotone"
                  dataKey="actual"
                  name="Actuals"
                  stroke="var(--kpmg)"
                  strokeWidth={2}
                  fill="url(#actualFill)"
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="baseline"
                  name="Baseline forecast"
                  stroke="var(--pacific)"
                  strokeWidth={2}
                  strokeDasharray="5 4"
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="scenario"
                  name="Scenario forecast"
                  stroke="var(--cobalt)"
                  strokeWidth={2.5}
                  dot={false}
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="grid gap-3 lg:grid-cols-2">
          <BreakdownCard title="Forecast balance by segment" rows={bySegment} />
          <BreakdownCard title="Forecast balance by product" rows={byProduct} />
        </div>
        </div>

        <Card className="border-border p-4 xl:sticky xl:top-[132px] xl:h-fit">
          <p className="text-sm font-semibold text-foreground">What-if scenario controls</p>
          <p className="mb-3 text-xs text-muted-foreground">
            Adjust the drivers; the forecast, insights and copilot context update instantly.
          </p>
          <div className="space-y-3.5">
            {CONTROLS.map((c) => {
              const value = scenario[c.key] as number;
              return (
                <div key={c.key}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground">{c.label}</span>
                    <span className="rounded bg-secondary px-1.5 py-0.5 text-[11px] font-semibold text-secondary-foreground">
                      {c.unit === "x" ? value.toFixed(1) : value > 0 && c.unit !== "%" ? `+${value}` : value}
                      {c.unit === "x" ? "×" : c.unit}
                    </span>
                  </div>
                  <Slider
                    value={[value]}
                    min={c.min}
                    max={c.max}
                    step={c.step}
                    onValueChange={(v) => set(c.key, v[0]!)}
                  />
                </div>
              );
            })}
          </div>
        </Card>
      </div>

    </section>
  );
}

function BreakdownCard({ title, rows }: { title: string; rows: Breakdown[] }) {
  return (
    <Card className="border-border p-4">
      <p className="mb-2 text-sm font-semibold text-foreground">{title}</p>
      <div className="h-[clamp(130px,16vh,170px)] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              tickFormatter={(v: number) => fmtGBP(v)}
              tickLine={false}
              axisLine={false}
              width={60}
            />
            <Tooltip content={<TooltipBox />} cursor={{ fill: "var(--muted)" }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="balance" name="Today" fill="var(--kpmg)" radius={[3, 3, 0, 0]} isAnimationActive={false} />
            <Bar dataKey="forecast" name="Forecast" fill="var(--pacific)" radius={[3, 3, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
        {rows.map((r) => (
          <span key={r.key} className="text-muted-foreground">
            {r.name}:{" "}
            <span className={cn("font-semibold", r.delta >= 0 ? "text-status-go" : "text-status-stop")}>
              {fmtPct(r.deltaPct)}
            </span>
          </span>
        ))}
      </div>
    </Card>
  );
}
