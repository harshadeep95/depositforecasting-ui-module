import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/deposit/TopBar";
import { ExecutiveSummary } from "@/components/deposit/ExecutiveSummary";
import { ForecastPanel } from "@/components/deposit/ForecastPanel";
import { QuarterlyPanel } from "@/components/deposit/QuarterlyPanel";
import { WaterfallPanel } from "@/components/deposit/WaterfallPanel";
import { DriverTree } from "@/components/deposit/DriverTree";
import { InsightsPanel, WinsLosses } from "@/components/deposit/InsightsPanel";
import { KeyAssumptions, KeyRecommendations } from "@/components/deposit/ModelBrief";
import { AssumptionPanel, rankAssumptions } from "@/components/deposit/AssumptionPanel";
import { FloatingCopilot } from "@/components/deposit/FloatingCopilot";
import { ModelsPanel } from "@/components/deposit/ModelsPanel";
import { VersionControl } from "@/components/deposit/VersionControl";
import { buildContext } from "@/components/deposit/Copilot";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAssumptions } from "@/lib/assumption-store";
import { FORECAST_MODELS, useForecastModel } from "@/lib/model-store";
import { logChange } from "@/lib/audit-store";
import {
  ALL_FILTERS,
  BASELINE_SCENARIO,
  PERSONAS,
  assumptionDrift,
  breakdownBy,
  buildActions,
  buildDataset,
  buildDriverTree,
  buildFullTree,
  buildInsights,
  computeKpis,
  filterCells,
  productTrends,
  projectSeries,
  quarterlyByProduct,
  waterfallByProduct,
  type Filters,
  type Scenario,
} from "@/lib/deposit-data";

const TITLE = "DepositIQ | Retail Deposit Forecasting Prototype";
const DESCRIPTION =
  "DepositIQ: interactive retail deposit forecasting with what-if scenarios, persona-aware insights, top wins and losses, and Sterling, the AI Q&A analyst — on synthetic data.";

export const Route = createFileRoute("/")({
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
  component: Index,
});

const TABS = [
  { id: "summary", label: "Executive summary" },
  { id: "products", label: "Product performance" },
  { id: "forecast", label: "Interactive forecast" },
  { id: "tree", label: "Decision tree" },
  { id: "waterfall", label: "Product waterfall" },
  { id: "models", label: "Models" },
  { id: "versions", label: "Version control" },
];


function Index() {
  const [personaId, setPersonaId] = useState("exec");
  const [filters, setFilters] = useState<Filters>(ALL_FILTERS);
  const [scenario, setScenario] = useState<Scenario>(BASELINE_SCENARIO);
  const [tab, setTab] = useState("summary");

  const { assumptions, setAssumption, setAll, reset } = useAssumptions();
  const { model, modelId, setModel } = useForecastModel();

  const dataset = useMemo(() => buildDataset(), []);
  const cells = useMemo(() => filterCells(dataset.cells, filters), [dataset, filters]);
  const assumptionOnlyDrift = useMemo(
    () => assumptionDrift(cells, scenario, assumptions),
    [cells, scenario, assumptions],
  );
  const drift = assumptionOnlyDrift + model.driftPerMonth;
  const mapeAdj = model.mape - 3.1;
  const fullTree = useMemo(() => buildFullTree(cells, scenario, assumptions), [cells, scenario, assumptions]);
  const ranked = useMemo(() => rankAssumptions(fullTree), [fullTree]);
  const kpis = useMemo(() => computeKpis(cells, scenario, drift, mapeAdj), [cells, scenario, drift, mapeAdj]);
  const baselineKpis = useMemo(() => computeKpis(cells, scenario, 0, mapeAdj), [cells, scenario, mapeAdj]);
  const projection = useMemo(() => projectSeries(cells, scenario, drift), [cells, scenario, drift]);
  const bySegment = useMemo(() => breakdownBy(cells, scenario, "segment", drift), [cells, scenario, drift]);
  const byProduct = useMemo(() => breakdownBy(cells, scenario, "product", drift), [cells, scenario, drift]);
  const insights = useMemo(() => buildInsights(cells, scenario, kpis), [cells, scenario, kpis]);
  const actions = useMemo(() => buildActions(kpis, scenario), [kpis, scenario]);
  const quarterly = useMemo(() => quarterlyByProduct(cells, scenario), [cells, scenario]);
  const trends = useMemo(() => productTrends(cells, 24), [cells]);
  const waterfall = useMemo(() => waterfallByProduct(cells, scenario), [cells, scenario]);
  const driverTree = useMemo(() => buildDriverTree(cells, scenario, kpis), [cells, scenario, kpis]);
  const movements = useMemo(() => {
    const rows = [
      ...bySegment.map((b) => ({ ...b, dimension: "Segment" })),
      ...byProduct.map((b) => ({ ...b, dimension: "Product" })),
      ...breakdownBy(cells, scenario, "region", drift).map((b) => ({ ...b, dimension: "Region" })),
    ].map((r) => ({
      ...r,
      driver:
        r.delta >= 0
          ? scenario.offerRateBps > 0
            ? `Repricing (+${scenario.offerRateBps}bps) attracting balances`
            : "Organic growth and seasonal inflows"
          : scenario.competitorPressureBps > 0
            ? `Competitor pricing +${scenario.competitorPressureBps}bps drawing balances out`
            : "Rate-sensitive outflow and maturity roll-off",
    }));
    const sorted = [...rows].sort((a, b) => b.delta - a.delta);
    return { wins: sorted.slice(0, 5), losses: sorted.slice(-5).reverse() };
  }, [bySegment, byProduct, cells, scenario, drift]);

  const persona = PERSONAS.find((p) => p.id === personaId) ?? PERSONAS[0]!;

  const log = (area: string, detail: string) => logChange(persona.name, persona.role, area, detail);

  const handlePersona = (id: string) => {
    const next = PERSONAS.find((p) => p.id === id);
    if (next) logChange(next.name, next.role, "Persona", `Switched view to ${next.name} (${next.role})`);
    setPersonaId(id);
  };

  const handleHorizon = (h: number) => {
    log("Horizon", `Forecast horizon set to ${h} months`);
    setScenario((s) => ({ ...s, horizon: h }));
  };

  const handleFilters = (f: Filters) => {
    log("Filters", "Adjusted segment, product or region filters");
    setFilters(f);
  };

  const handleScenario = (updater: Scenario | ((s: Scenario) => Scenario)) => {
    setScenario((prev) => {
      const next = typeof updater === "function" ? (updater as (s: Scenario) => Scenario)(prev) : updater;
      log(
        "Scenario",
        `What-if updated — base ${next.baseRateBps}bps, offer ${next.offerRateBps}bps, competitor ${next.competitorPressureBps}bps, marketing ${next.marketingUplift}%`,
      );
      return next;
    });
  };

  const handleModel = (id: string) => {
    if (id === modelId) return;
    const prev = FORECAST_MODELS.find((x) => x.id === modelId);
    const next = FORECAST_MODELS.find((x) => x.id === id);
    setModel(id);
    log(
      "Model",
      `Dashboard updated — forecast model changed from ${prev?.name ?? modelId} to ${next?.name ?? id} (back-test MAPE ${next?.mape.toFixed(1) ?? "—"}%)`,
    );
  };

  const handleAssumption = (key: Parameters<typeof setAssumption>[0], value: number) => {
    log("Assumptions", `Decision-tree driver "${String(key)}" set to ${value}`);
    setAssumption(key, value);
  };

  const handleApplyAll = (next: Parameters<typeof setAll>[0]) => {
    log("Assumptions", "Applied a saved scenario from the library");
    setAll(next);
  };

  const context = useMemo(
    () => buildContext(kpis, scenario, bySegment, byProduct, insights, persona.role),
    [kpis, scenario, bySegment, byProduct, insights, persona.role],
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopBar
        personaId={personaId}
        onPersona={handlePersona}
        filters={filters}
        onFilters={handleFilters}
        horizon={scenario.horizon}
        onHorizon={handleHorizon}
      />

      <Tabs value={tab} onValueChange={setTab} className="flex flex-1 flex-col">
        <div className="sticky top-[72px] z-30 border-b border-border bg-secondary/60 backdrop-blur">
          <div className="mx-auto w-full max-w-[1500px] px-5 pt-3">
            <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1.5 rounded-none border-0 bg-transparent p-0">
              {TABS.map((t) => (
                <TabsTrigger
                  key={t.id}
                  value={t.id}
                  className="relative -mb-px rounded-t-lg rounded-b-none border border-border border-b-transparent bg-muted px-4 py-2 text-xs font-medium text-muted-foreground shadow-none transition-colors hover:bg-accent hover:text-foreground data-[state=active]:border-b-background data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-[0_-2px_0_0_var(--color-cobalt)_inset]"
                >
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </div>

        <main className="flex-1 bg-background">
          <div className="mx-auto max-w-[1500px] px-5 py-6">


          <TabsContent value="summary" className="space-y-6">
            <ExecutiveSummary personaId={personaId} kpis={kpis} scenario={scenario} />
            <div className="grid items-stretch gap-5 xl:auto-rows-fr xl:grid-cols-2">
              <WaterfallPanel rows={waterfall} allProductsOnly compact />
              <InsightsPanel insights={insights} actions={actions} personaId={personaId} compact showActions={false} />
              <KeyAssumptions assumptions={assumptions} scenario={scenario} model={model} />
              <KeyRecommendations kpis={kpis} scenario={scenario} model={model} actions={actions} personaId={personaId} />
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-8">
            <QuarterlyPanel rows={quarterly} trends={trends} />
            <WinsLosses wins={movements.wins} losses={movements.losses} />
          </TabsContent>


          <TabsContent value="forecast" className="space-y-6">
            <ForecastPanel
              points={projection.points}
              scenario={scenario}
              onScenario={handleScenario}
              bySegment={bySegment}
              byProduct={byProduct}
            />
          </TabsContent>


          <TabsContent value="tree">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
              <DriverTree tree={driverTree} />
              <div className="xl:sticky xl:top-[150px] xl:h-fit">
                <AssumptionPanel
                  assumptions={assumptions}
                  onAssumption={handleAssumption}
                  onApply={handleApplyAll}
                  onReset={reset}
                  tree={fullTree}
                  forecast={kpis.forecast}
                  baselineForecast={baselineKpis.forecast}
                  ranked={ranked}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="waterfall">
            <WaterfallPanel rows={waterfall} />
          </TabsContent>

          <TabsContent value="models" className="space-y-6">
            <ModelsPanel modelId={modelId} onModel={handleModel} />
          </TabsContent>

          <TabsContent value="versions" className="space-y-6">
            <VersionControl />
          </TabsContent>

            <footer className="mt-4 border-t border-border pb-4 pt-3 text-[11px] text-muted-foreground">
              Advisory prototype. All customers, accounts, products and transactions are synthetic and generated in the
              browser. No live or production systems are connected.
            </footer>
          </div>
        </main>
      </Tabs>

      <FloatingCopilot context={context} kpis={kpis} scenario={scenario} bySegment={bySegment} />
    </div>
  );
}
