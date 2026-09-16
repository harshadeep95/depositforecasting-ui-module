import { RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { ScenarioLibrary } from "@/components/deposit/ScenarioLibrary";
import {
  ASSUMPTION_CONTROLS,
  DEFAULT_ASSUMPTIONS,
  fmtGBP,
  type FullTree,
  type TreeNode,
  type TreeAssumptions,
} from "@/lib/deposit-data";

interface Props {
  assumptions: TreeAssumptions;
  onAssumption: (k: keyof TreeAssumptions, v: number) => void;
  onApply: (a: TreeAssumptions) => void;
  onReset: () => void;
  tree: FullTree;
  forecast: number;
  baselineForecast: number;
  ranked: { key: keyof TreeAssumptions; label: string; impact: number }[];
}

export function AssumptionPanel({
  assumptions,
  onAssumption,
  onApply,
  onReset,
  tree,
  forecast,
  baselineForecast,
  ranked,
}: Props) {
  const dirty = ASSUMPTION_CONTROLS.some((c) => assumptions[c.key] !== DEFAULT_ASSUMPTIONS[c.key]);
  const vsBaseline = forecast - baselineForecast;

  return (
    <div className="space-y-4">
      <Card className="gradient-brand border-0 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-primary-foreground/75">
          Live forecast with your assumptions
        </p>
        <p className="mt-1 text-3xl font-semibold tabular-nums text-primary-foreground">{fmtGBP(forecast)}</p>
        <div className="mt-3 grid grid-cols-2 gap-3 text-primary-foreground">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-primary-foreground/70">Vs scenario baseline</p>
            <p className="text-sm font-semibold tabular-nums">
              {vsBaseline >= 0 ? "+" : "−"}
              {fmtGBP(Math.abs(vsBaseline))}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-primary-foreground/70">Tree closing balance</p>
            <p className="text-sm font-semibold tabular-nums">{fmtGBP(tree.closing)}</p>
          </div>
        </div>
      </Card>

      <Card className="border-border p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-foreground">Assumptions</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Every change flows straight through the decision tree into the forecast.
            </p>
          </div>
          <Button size="sm" variant="secondary" disabled={!dirty} onClick={onReset}>
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Reset
          </Button>
        </div>

        <div className="mt-4 space-y-4">
          {ASSUMPTION_CONTROLS.map((c) => {
            const value = assumptions[c.key];
            const impact = ranked.find((r) => r.key === c.key)?.impact ?? 0;
            return (
              <div key={c.key}>
                <div className="flex items-baseline justify-between gap-2">
                  <label className="text-[11px] font-medium text-foreground">{c.label}</label>
                  <span className="text-xs font-semibold tabular-nums text-primary">
                    {c.unit === "pct" ? `${value}%` : `${value} idx`}
                  </span>
                </div>
                <Slider
                  className="mt-2"
                  value={[value]}
                  min={c.min}
                  max={c.max}
                  step={c.step}
                  onValueChange={([v]) => onAssumption(c.key, v ?? value)}
                />
                <div className="mt-1 flex items-baseline justify-between gap-2">
                  <p className="text-[10px] leading-snug text-muted-foreground">{c.help}</p>
                  {Math.abs(impact) >= 1 ? (
                    <span
                      className={cn(
                        "shrink-0 text-[10px] font-semibold tabular-nums",
                        impact >= 0 ? "text-status-go" : "text-status-stop",
                      )}
                    >
                      {impact >= 0 ? "+" : "−"}
                      {fmtGBP(Math.abs(impact))}
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <ScenarioLibrary assumptions={assumptions} onApply={onApply} />
    </div>
  );
}

export function rankAssumptions(tree: FullTree) {
  const out: { key: keyof TreeAssumptions; label: string; impact: number }[] = [];
  const walk = (n: TreeNode) => {
    if (n.assumption && typeof n.impact === "number") {
      out.push({ key: n.assumption, label: n.label, impact: n.impact });
    }
    (n.children ?? []).forEach(walk);
  };
  (tree.root.children ?? []).forEach(walk);
  return out.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
}
