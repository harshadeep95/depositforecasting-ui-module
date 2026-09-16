import { Bar, BarChart, CartesianGrid, Cell as RCell, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { fmtGBP, fmtPct, type ProductQuarters, type ProductTrendPoint } from "@/lib/deposit-data";
import { Sparkline } from "@/components/deposit/Sparkline";

function TooltipBox({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-semibold text-foreground">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-muted-foreground">
          <span className="font-medium text-foreground">{p.name}: </span>
          {typeof p.value === "number" ? fmtGBP(p.value) : String(p.value)}
        </p>
      ))}
    </div>
  );
}

const TREND_COLORS = ["var(--kpmg)", "var(--cobalt)", "var(--status-go)", "var(--status-caution)", "var(--status-stop)", "var(--muted-foreground)"];

export function QuarterlyPanel({ rows, trends }: { rows: ProductQuarters[]; trends?: { points: ProductTrendPoint[]; keys: string[] } }) {
  const quarterLabels = rows[0]?.quarters.map((q) => q.label) ?? [];
  const forecastLabel = rows[0]?.forecast.label ?? "";

  const chartData = [...quarterLabels, forecastLabel].map((label, i) => {
    const isForecast = i === quarterLabels.length;
    let total = 0;
    for (const r of rows) total += isForecast ? r.forecast.closing : (r.quarters[i]?.closing ?? 0);
    return { label, isForecast, total };
  });

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Product performance — last four quarters and the forecast window</h2>
        <p className="text-sm text-muted-foreground">
          Closing balances by product for the four completed quarters, with the model&apos;s projection for the selected
          horizon under the active scenario.
        </p>
      </div>

      <div className="grid gap-3 xl:grid-cols-[1fr_360px]">
        <Card className="overflow-x-auto border-border p-0">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/60 text-left">
                <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Product</th>
                {quarterLabels.map((q) => (
                  <th key={q} className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {q}
                  </th>
                ))}
                <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-primary">
                  {forecastLabel} forecast
                </th>
                <th className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">Trend</th>
                <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">QoQ</th>
                <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Rate vs mkt</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.key} className="border-b border-border last:border-0">
                  <td className="px-3 py-2">
                    <span className="font-medium text-foreground">{r.name}</span>
                    <span className="ml-2 rounded bg-secondary px-1.5 py-0.5 text-[10px] font-semibold uppercase text-secondary-foreground">
                      {r.family}
                    </span>
                  </td>
                  {r.quarters.map((q) => (
                    <td key={q.label} className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                      {fmtGBP(q.closing)}
                    </td>
                  ))}
                  <td className="px-3 py-2 text-right font-semibold tabular-nums text-primary">{fmtGBP(r.forecast.closing)}</td>
                  <td className="px-3 py-2">
                    <div className="flex justify-center">
                      <Sparkline
                        values={[...r.quarters.map((q) => q.closing), r.forecast.closing]}
                        positive={r.qoqPct >= 0}
                      />
                    </div>
                  </td>
                  <td className={cn("px-3 py-2 text-right font-medium tabular-nums", r.qoqPct >= 0 ? "text-status-go" : "text-status-stop")}>
                    {fmtPct(r.qoqPct)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                    {r.rate.toFixed(2)}% / {r.competitorRate.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card className="border-border p-4">
          <p className="mb-2 text-sm font-semibold text-foreground">Total book by quarter</p>
          <div className="h-[clamp(190px,28vh,260px)] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={{ stroke: "var(--border)" }} />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  tickFormatter={(v: number) => fmtGBP(v)}
                  tickLine={false}
                  axisLine={false}
                  width={60}
                />
                <Tooltip content={<TooltipBox />} cursor={{ fill: "var(--muted)" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="total" name="Closing balance" radius={[3, 3, 0, 0]} isAnimationActive={false}>
                  {chartData.map((d, i) => (
                    <RCell key={i} fill={d.isForecast ? "var(--cobalt)" : "var(--kpmg)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Dark bars are actuals; the cobalt bar is the scenario forecast for {forecastLabel}.
          </p>
        </Card>
      </div>

      {trends && trends.points.length > 0 && (
        <Card className="border-border p-4">
          <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm font-semibold text-foreground">Product balance trend — trailing 24 months</p>
            <p className="text-xs text-muted-foreground">Monthly closing balance by product, actuals only.</p>
          </div>
          <div className="h-[clamp(240px,32vh,340px)] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends.points} margin={{ top: 6, right: 12, bottom: 0, left: 8 }}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={{ stroke: "var(--border)" }}
                  interval={2}
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
                {trends.keys.map((k, i) => (
                  <Line
                    key={k}
                    type="monotone"
                    dataKey={k}
                    name={k}
                    stroke={TREND_COLORS[i % TREND_COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </section>
  );
}
