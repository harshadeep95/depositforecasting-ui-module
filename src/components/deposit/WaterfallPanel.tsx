import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell as RCell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fmtGBP, totalWaterfall, waterfallSteps, type WaterfallRow } from "@/lib/deposit-data";

const STEP_FILL: Record<string, string> = {
  start: "var(--navy)",
  in: "var(--cobalt)",
  out: "var(--pacific)",
  end: "var(--kpmg)",
};

function TooltipBox({ active, payload }: { active?: boolean; payload?: any[] }) {
  if (!active || !payload?.length) return null;
  const step = payload[0]?.payload as { name: string; amount: number } | undefined;
  if (!step) return null;
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-foreground">{step.name}</p>
      <p className="text-muted-foreground">{fmtGBP(step.amount)}</p>
    </div>
  );
}

export function WaterfallPanel({
  rows,
  allProductsOnly = false,
  compact = false,
}: {
  rows: WaterfallRow[];
  allProductsOnly?: boolean;
  compact?: boolean;
}) {
  const total = totalWaterfall(rows);
  const [selected, setSelected] = useState<string>("total");
  const active = allProductsOnly ? "total" : selected;
  const row = active === "total" ? total : (rows.find((r) => r.key === active) ?? total);
  const steps = waterfallSteps(row);
  const grossIn = row.backBookInflow + row.frontBookInflow;
  const grossOut = row.backBookOutflow + row.frontBookOutflow;

  return (
    <section className={cn("space-y-3", compact && "flex h-full flex-col")}>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className={cn("font-semibold text-foreground", compact ? "text-base" : "text-xl")}>
            Balance waterfall — back book vs front book
          </h2>
          <p className={cn("text-muted-foreground", compact ? "text-xs" : "text-sm")}>
            {compact
              ? "Opening balance, gross flows and closing balance over the selected horizon, split back book vs front book."
              : "Opening balance, gross inflows and outflows and closing balance across the selected forecast horizon, split between existing accounts (back book) and newly opened accounts (front book)."}
          </p>
        </div>
        {!allProductsOnly && (
        <div className="flex flex-wrap gap-1.5">
          <Button size="sm" variant={active === "total" ? "default" : "outline"} onClick={() => setSelected("total")}>
            All products
          </Button>
          {rows.map((r) => (
            <Button key={r.key} size="sm" variant={active === r.key ? "default" : "outline"} onClick={() => setSelected(r.key)}>
              {r.name}
            </Button>
          ))}
        </div>
        )}
      </div>

      <div className={cn("grid gap-3", compact ? "flex-1 grid-cols-1 content-start" : "xl:grid-cols-[1.6fr_1fr]")}>
        <Card className="border-border p-4">
          <div className={cn("w-full", compact ? "h-[220px]" : "h-[clamp(220px,34vh,320px)]")}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={steps} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={{ stroke: "var(--border)" }} />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  tickFormatter={(v: number) => fmtGBP(v)}
                  tickLine={false}
                  axisLine={false}
                  width={64}
                  domain={[0, "dataMax"]}
                />
                <Tooltip content={<TooltipBox />} cursor={{ fill: "var(--muted)" }} />
                <Bar dataKey="base" stackId="w" fill="transparent" isAnimationActive={false} />
                <Bar dataKey="value" stackId="w" radius={[3, 3, 0, 0]} isAnimationActive={false}>
                  {steps.map((s, i) => (
                    <RCell key={i} fill={STEP_FILL[s.kind]!} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="border-border p-4">
          <p className="mb-3 text-sm font-semibold text-foreground">{row.name} — quarter bridge</p>
          <dl className="space-y-2 text-sm">
            <Line label="Opening balance" value={row.opening} />
            <Line label="Back book inflows" value={row.backBookInflow} tone="in" />
            <Line label="Front book inflows (new accounts)" value={row.frontBookInflow} tone="in" />
            <Line label="Back book outflows" value={-row.backBookOutflow} tone="out" />
            <Line label="Front book outflows" value={-row.frontBookOutflow} tone="out" />
            <div className="border-t border-border pt-2">
              <Line label="Closing balance" value={row.closing} strong />
            </div>
          </dl>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <Stat label="Gross inflow" value={fmtGBP(grossIn)} />
            <Stat label="Gross outflow" value={fmtGBP(grossOut)} />
            <Stat label="Front book share of inflow" value={`${grossIn > 0 ? ((row.frontBookInflow / grossIn) * 100).toFixed(0) : "0"}%`} />
            <Stat label="Retention of back book" value={`${row.opening > 0 ? (100 - (row.backBookOutflow / row.opening) * 100).toFixed(1) : "0"}%`} />
          </div>
        </Card>
      </div>
    </section>
  );
}

function Line({ label, value, tone, strong }: { label: string; value: number; tone?: "in" | "out"; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className={cn("text-muted-foreground", strong && "font-semibold text-foreground")}>{label}</dt>
      <dd
        className={cn(
          "tabular-nums font-medium",
          strong ? "text-primary text-base font-semibold" : tone === "in" ? "text-status-go" : tone === "out" ? "text-status-stop" : "text-foreground",
        )}
      >
        {value >= 0 ? "" : "−"}
        {fmtGBP(Math.abs(value))}
      </dd>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-secondary px-2 py-1.5">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
