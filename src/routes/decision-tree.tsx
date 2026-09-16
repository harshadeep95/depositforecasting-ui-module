import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { TopBar } from "@/components/deposit/TopBar";
import { AssumptionPanel, rankAssumptions } from "@/components/deposit/AssumptionPanel";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TreeGraph, TreeLegend, type GraphNode } from "@/components/deposit/TreeGraph";
import { useAssumptions } from "@/lib/assumption-store";
import {
  ALL_FILTERS,
  BASELINE_SCENARIO,
  assumptionDrift,
  buildDataset,
  buildFullTree,
  computeKpis,
  filterCells,
  fmtGBP,
  type Filters,
  type Scenario,
} from "@/lib/deposit-data";

const TITLE = "Decision Tree | DepositIQ Deposit Forecasting";
const DESCRIPTION =
  "Explore the full DepositIQ deposit forecast decision tree: every driver node, its contribution to closing balance, and adjustable assumptions that flow straight through to the forecast.";

export const Route = createFileRoute("/decision-tree")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DecisionTreePage,
});

function DecisionTreePage() {
  const [personaId, setPersonaId] = useState("exec");
  const [filters, setFilters] = useState<Filters>(ALL_FILTERS);
  const [scenario, setScenario] = useState<Scenario>(BASELINE_SCENARIO);
  const { assumptions, setAssumption, setAll, reset } = useAssumptions();

  const dataset = useMemo(() => buildDataset(), []);
  const cells = useMemo(() => filterCells(dataset.cells, filters), [dataset, filters]);
  const tree = useMemo(() => buildFullTree(cells, scenario, assumptions), [cells, scenario, assumptions]);
  const drift = useMemo(() => assumptionDrift(cells, scenario, assumptions), [cells, scenario, assumptions]);
  const kpis = useMemo(() => computeKpis(cells, scenario, drift), [cells, scenario, drift]);
  const baselineKpis = useMemo(() => computeKpis(cells, scenario, 0), [cells, scenario]);
  const ranked = useMemo(() => rankAssumptions(tree), [tree]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopBar
        personaId={personaId}
        onPersona={setPersonaId}
        filters={filters}
        onFilters={setFilters}
        horizon={scenario.horizon}
        onHorizon={(h) => setScenario((s) => ({ ...s, horizon: h }))}
      />

      <main className="flex-1">
        <div className="mx-auto max-w-[1500px] space-y-5 px-5 py-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Forecast decision tree</h1>
            <p className="max-w-3xl text-sm text-muted-foreground">
              Every node in the deposit forecast, from closing balance down to the individual predictive drivers.
              Assumptions live in the panel on the right so you can watch the forecast, the tree and each node&apos;s
              pound impact move as you drag.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/">Back to dashboard</Link>
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <Card className="border-border p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Tree closing balance
            </p>
            <p className="mt-1 text-3xl font-semibold tabular-nums text-foreground">{fmtGBP(tree.closing)}</p>
          </Card>
          <Card className="border-border p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Model default closing
            </p>
            <p className="mt-1 text-3xl font-semibold tabular-nums text-foreground">{fmtGBP(tree.defaultClosing)}</p>
          </Card>
          <Card className="border-border p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Horizon forecast impact
            </p>
            <p
              className={cn(
                "mt-1 text-3xl font-semibold tabular-nums",
                kpis.forecast >= baselineKpis.forecast ? "text-status-go" : "text-status-stop",
              )}
            >
              {kpis.forecast >= baselineKpis.forecast ? "+" : "−"}
              {fmtGBP(Math.abs(kpis.forecast - baselineKpis.forecast))}
            </p>
          </Card>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <Card className="min-w-0 gradient-wash border-border p-4">
            <TreeGraph root={tree.root as unknown as GraphNode} defaultDepth={3} />
            <div className="mt-4">
              <TreeLegend />
            </div>
          </Card>

          <div className="xl:sticky xl:top-[96px] xl:h-fit">
            <AssumptionPanel
              assumptions={assumptions}
              onAssumption={setAssumption}
              onApply={setAll}
              onReset={reset}
              tree={tree}
              forecast={kpis.forecast}
              baselineForecast={baselineKpis.forecast}
              ranked={ranked}
            />
          </div>
        </div>

          <footer className="border-t border-border pt-4 text-xs text-muted-foreground">
          Advisory prototype. All customers, accounts, products and transactions are synthetic and generated in the
          browser. No live or production systems are connected.
          </footer>
        </div>
      </main>
    </div>
  );
}
