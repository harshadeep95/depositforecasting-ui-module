/**
 * Fully synthetic retail-banking deposit dataset + forecasting engine.
 * Deterministic (seeded PRNG) — no real customer, company or production data.
 */

export type SegmentId = "mass" | "affluent" | "youth" | "retired" | "sme";
export type ProductId = "current" | "easy_access" | "fixed_bond" | "isa" | "notice" | "regular_saver";
export type RegionId = "london" | "south" | "midlands" | "north" | "scotland";

export interface Segment {
  id: SegmentId;
  name: string;
  rateElasticity: number;
  baseAttrition: number;
  growth: number;
}

export interface Product {
  id: ProductId;
  name: string;
  family: "CASA" | "Savings" | "Term" | "Tax-free";
  rate: number;
  competitorRate: number;
  termMonths: number;
  minBalance: number;
  /** Share of gross inflows that comes from newly opened (front book) accounts. */
  frontBookShare: number;
}

export interface Region {
  id: RegionId;
  name: string;
}

export interface Customer {
  id: string;
  segment: SegmentId;
  region: RegionId;
  tenureMonths: number;
  attritionPropensity: number;
}

export interface Account {
  id: string;
  customerId: string;
  segment: SegmentId;
  region: RegionId;
  product: ProductId;
  balance: number;
  maturityMonth: number | null;
}

export interface MonthPoint {
  month: number; // 0..HISTORY-1 historic, then forecast
  label: string;
  balance: number;
  inflow: number;
  outflow: number;
}

export interface Cell {
  segment: SegmentId;
  region: RegionId;
  product: ProductId;
  accounts: number;
  customers: number;
  series: MonthPoint[];
}

export interface Persona {
  id: string;
  name: string;
  role: string;
  focus: string;
  kpis: string[];
  tone: string;
}

export const HISTORY_MONTHS = 60;
export const START_YEAR = 2021;

export const SEGMENTS: Segment[] = [
  { id: "mass", name: "Mass Market", rateElasticity: 0.55, baseAttrition: 0.011, growth: 0.0026 },
  { id: "affluent", name: "Affluent", rateElasticity: 1.15, baseAttrition: 0.008, growth: 0.0041 },
  { id: "youth", name: "Youth & Starter", rateElasticity: 0.35, baseAttrition: 0.019, growth: 0.0058 },
  { id: "retired", name: "Retired & Later Life", rateElasticity: 0.8, baseAttrition: 0.006, growth: 0.0012 },
  { id: "sme", name: "Small Business", rateElasticity: 0.95, baseAttrition: 0.014, growth: 0.0034 },
];

export const PRODUCTS: Product[] = [
  { id: "current", name: "Current Account", family: "CASA", rate: 0.15, competitorRate: 0.2, termMonths: 0, minBalance: 0, frontBookShare: 0.06 },
  { id: "easy_access", name: "Easy Access Saver", family: "Savings", rate: 3.1, competitorRate: 3.45, termMonths: 0, minBalance: 1, frontBookShare: 0.14 },
  { id: "notice", name: "95-Day Notice", family: "Savings", rate: 4.05, competitorRate: 4.15, termMonths: 0, minBalance: 5000, frontBookShare: 0.18 },
  { id: "regular_saver", name: "Regular Saver", family: "Savings", rate: 5.25, competitorRate: 5.0, termMonths: 12, minBalance: 25, frontBookShare: 0.31 },
  { id: "fixed_bond", name: "Fixed Term Bond", family: "Term", rate: 4.35, competitorRate: 4.6, termMonths: 12, minBalance: 1000, frontBookShare: 0.27 },
  { id: "isa", name: "Cash ISA", family: "Tax-free", rate: 3.85, competitorRate: 4.0, termMonths: 0, minBalance: 1, frontBookShare: 0.2 },
];

export const REGIONS: Region[] = [
  { id: "london", name: "London & South East" },
  { id: "south", name: "South West" },
  { id: "midlands", name: "Midlands" },
  { id: "north", name: "North of England" },
  { id: "scotland", name: "Scotland & NI" },
];

export const PERSONAS: Persona[] = [
  {
    id: "exec",
    name: "Priya Raman",
    role: "Executive Leadership",
    focus: "Balance sheet strength, cost of funds and franchise growth",
    kpis: ["balance", "forecast", "netFlow", "costOfFunds"],
    tone: "Board-level: outcomes, funding risk and capital implications.",
  },
  {
    id: "analyst",
    name: "Tom Whitfield",
    role: "Business Analyst",
    focus: "Model drivers, elasticity and forecast accuracy",
    kpis: ["forecast", "netFlow", "attrition", "mape"],
    tone: "Analytical: drivers, sensitivities and model diagnostics.",
  },
  {
    id: "pm",
    name: "Amara Okafor",
    role: "Programme Manager",
    focus: "Delivery of pricing and retention initiatives",
    kpis: ["netFlow", "attrition", "balance", "mape"],
    tone: "Delivery-focused: owners, milestones and dependencies.",
  },
  {
    id: "treasury",
    name: "Daniel Cheng",
    role: "Treasury / ALM",
    focus: "Funding stability, liquidity buffers and behavioural maturity",
    kpis: ["balance", "netFlow", "costOfFunds", "forecast"],
    tone: "Liquidity-first: stickiness of balances, funding mix and LCR impact.",
  },
  {
    id: "pricing",
    name: "Sofia Marchetti",
    role: "Pricing & Product",
    focus: "Rate positioning, front-book vs back-book economics and elasticity",
    kpis: ["costOfFunds", "netFlow", "forecast", "balance"],
    tone: "Commercial: price points, competitor gaps and margin trade-offs.",
  },
  {
    id: "risk",
    name: "Ibrahim Nasser",
    role: "Risk & Compliance",
    focus: "Model governance, assumption validity and concentration risk",
    kpis: ["mape", "attrition", "balance", "netFlow"],
    tone: "Control-minded: assumptions, limits, validation and evidence.",
  },
  {
    id: "marketing",
    name: "Hannah Boyle",
    role: "Marketing & Acquisition",
    focus: "Campaign-driven new account flow and front-book funding",
    kpis: ["netFlow", "forecast", "attrition", "balance"],
    tone: "Growth-focused: acquisition volume, cost per pound raised and retention.",
  },
];

export interface Scenario {
  baseRateBps: number; // change in central bank base rate
  offerRateBps: number; // own savings rate offer change
  marketingUplift: number; // % acquisition uplift
  attritionShock: number; // % change in attrition
  competitorPressureBps: number; // competitor rate move
  seasonality: number; // 0..2 intensity multiplier
  horizon: number; // forecast months
}

export const BASELINE_SCENARIO: Scenario = {
  baseRateBps: 0,
  offerRateBps: 0,
  marketingUplift: 0,
  attritionShock: 0,
  competitorPressureBps: 0,
  seasonality: 1,
  horizon: 12,
};

export const SCENARIO_PRESETS: { id: string; name: string; description: string; scenario: Scenario }[] = [
  { id: "base", name: "Base Case", description: "Consensus rate path, no pricing change", scenario: { ...BASELINE_SCENARIO } },
  {
    id: "rate_rise",
    name: "Rate Rise",
    description: "+50bps base rate, matched 40bps offer",
    scenario: { ...BASELINE_SCENARIO, baseRateBps: 50, offerRateBps: 40, marketingUplift: 5 },
  },
  {
    id: "price_war",
    name: "Price War",
    description: "Competitors +75bps, we hold rates",
    scenario: { ...BASELINE_SCENARIO, competitorPressureBps: 75, attritionShock: 25 },
  },
];

/* ---------------------------- generation ---------------------------- */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function monthLabel(index: number) {
  const y = START_YEAR + Math.floor(index / 12);
  const m = index % 12;
  return `${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m]} ${String(y).slice(2)}`;
}

/** Bank of England style base-rate path used to drive elasticity (synthetic). */
function baseRatePath(i: number) {
  if (i < 8) return 0.1;
  if (i < 20) return 0.1 + (i - 8) * 0.28;
  if (i < 34) return Math.min(5.25, 3.5 + (i - 20) * 0.14);
  if (i < 48) return 5.25;
  return Math.max(3.75, 5.25 - (i - 48) * 0.11);
}

const SEG_WEIGHT: Record<SegmentId, number> = { mass: 0.42, affluent: 0.16, youth: 0.14, retired: 0.18, sme: 0.1 };
const REG_WEIGHT: Record<RegionId, number> = { london: 0.28, south: 0.15, midlands: 0.19, north: 0.24, scotland: 0.14 };
const PROD_WEIGHT: Record<ProductId, number> = {
  current: 0.26,
  easy_access: 0.28,
  notice: 0.09,
  regular_saver: 0.05,
  fixed_bond: 0.18,
  isa: 0.14,
};
const PROD_BALANCE_FACTOR: Record<ProductId, number> = {
  current: 0.35,
  easy_access: 1,
  notice: 1.25,
  regular_saver: 0.12,
  fixed_bond: 1.4,
  isa: 1,
};
const SEG_AVG_BALANCE: Record<SegmentId, number> = { mass: 8400, affluent: 46000, youth: 2200, retired: 27500, sme: 61000 };

export interface Dataset {
  customers: Customer[];
  accounts: Account[];
  cells: Cell[];
}

export function buildDataset(seed = 20260828): Dataset {
  const rnd = mulberry32(seed);
  const customers: Customer[] = [];
  const accounts: Account[] = [];

  const segIds = SEGMENTS.map((s) => s.id);
  const regIds = REGIONS.map((r) => r.id);
  const prodIds = PRODUCTS.map((p) => p.id);

  const pick = <T extends string>(ids: T[], weights: Record<T, number>) => {
    const r = rnd();
    let acc = 0;
    for (const id of ids) {
      acc += weights[id];
      if (r <= acc) return id;
    }
    return ids[ids.length - 1]!;
  };

  for (let i = 0; i < 2000; i++) {
    const segment = pick(segIds, SEG_WEIGHT);
    const region = pick(regIds, REG_WEIGHT);
    const seg = SEGMENTS.find((s) => s.id === segment)!;
    const customer: Customer = {
      id: `C${String(100000 + i)}`,
      segment,
      region,
      tenureMonths: Math.floor(rnd() * 220) + 3,
      attritionPropensity: Math.min(0.95, Math.max(0.01, seg.baseAttrition * 20 + (rnd() - 0.5) * 0.18)),
    };
    customers.push(customer);

    const nAcc = 1 + (rnd() < 0.55 ? 1 : 0) + (rnd() < 0.22 ? 1 : 0);
    for (let a = 0; a < nAcc; a++) {
      const product = pick(prodIds, PROD_WEIGHT);
      const avg = SEG_AVG_BALANCE[segment] * PROD_BALANCE_FACTOR[product];
      accounts.push({
        id: `A${String(500000 + accounts.length)}`,
        customerId: customer.id,
        segment,
        region,
        product,
        balance: Math.round(avg * (0.35 + rnd() * 1.7)),
        maturityMonth:
          product === "fixed_bond" || product === "regular_saver" ? HISTORY_MONTHS + Math.floor(rnd() * 18) : null,
      });
    }
  }

  // Aggregate monthly series per segment x region x product cell.
  const cells: Cell[] = [];
  for (const segment of segIds) {
    for (const region of regIds) {
      for (const product of prodIds) {
        const group = accounts.filter((a) => a.segment === segment && a.region === region && a.product === product);
        if (group.length === 0) continue;
        const endBalance = group.reduce((s, a) => s + a.balance, 0);
        const seg = SEGMENTS.find((s) => s.id === segment)!;
        const prod = PRODUCTS.find((p) => p.id === product)!;
        const noise = mulberry32(seed + segment.length * 31 + region.length * 17 + product.length * 7 + group.length);

        // Walk backwards from today's balance to construct 5 years of history.
        const series: MonthPoint[] = new Array(HISTORY_MONTHS);
        let bal = endBalance;
        for (let i = HISTORY_MONTHS - 1; i >= 0; i--) {
          const rateGap = (prod.rate + (baseRatePath(i) - baseRatePath(HISTORY_MONTHS - 1)) * 0.6 - prod.competitorRate) / 100;
          const season = seasonalFactor(i, product);
          const drift = seg.growth + rateGap * seg.rateElasticity * 0.6 + season * 0.5;
          const monthly = drift + (noise() - 0.5) * 0.012;
          const inflow = bal * (0.055 + Math.max(0, monthly) + season * 0.4);
          const outflow = inflow - bal * monthly;
          series[i] = {
            month: i,
            label: monthLabel(i),
            balance: Math.round(bal),
            inflow: Math.round(Math.max(0, inflow)),
            outflow: Math.round(Math.max(0, outflow)),
          };
          bal = bal / (1 + monthly);
        }
        cells.push({
          segment,
          region,
          product,
          accounts: group.length,
          customers: new Set(group.map((g) => g.customerId)).size,
          series,
        });
      }
    }
  }

  return { customers, accounts, cells };
}

function seasonalFactor(monthIndex: number, product: ProductId) {
  const m = monthIndex % 12;
  // Jan (new year saving) & Apr (ISA season) up, Dec (spend) down.
  const base = [0.012, 0.004, 0.002, 0.014, 0.001, -0.002, -0.004, -0.003, 0.002, 0.003, -0.002, -0.014][m]!;
  const weight =
    product === "isa" ? 1.6 : product === "current" ? 0.4 : product === "regular_saver" ? 1.3 : product === "notice" ? 0.9 : 1;
  return base * weight;
}

/* ---------------------------- filtering + forecast ---------------------------- */

export interface Filters {
  segments: SegmentId[];
  products: ProductId[];
  regions: RegionId[];
}

export const ALL_FILTERS: Filters = {
  segments: SEGMENTS.map((s) => s.id),
  products: PRODUCTS.map((p) => p.id),
  regions: REGIONS.map((r) => r.id),
};

export function filterCells(cells: Cell[], f: Filters) {
  return cells.filter(
    (c) => f.segments.includes(c.segment) && f.products.includes(c.product) && f.regions.includes(c.region),
  );
}

export function aggregate(cells: Cell[]): MonthPoint[] {
  const out: MonthPoint[] = [];
  for (let i = 0; i < HISTORY_MONTHS; i++) {
    let balance = 0;
    let inflow = 0;
    let outflow = 0;
    for (const c of cells) {
      const p = c.series[i]!;
      balance += p.balance;
      inflow += p.inflow;
      outflow += p.outflow;
    }
    out.push({ month: i, label: monthLabel(i), balance, inflow, outflow });
  }
  return out;
}

export interface ForecastPoint {
  month: number;
  label: string;
  actual: number | null;
  baseline: number | null;
  scenario: number | null;
  lower: number | null;
  upper: number | null;
  band: [number, number] | null;
}

function blendedElasticity(cells: Cell[]) {
  if (cells.length === 0) return 0.7;
  let w = 0;
  let e = 0;
  for (const c of cells) {
    const bal = c.series[HISTORY_MONTHS - 1]!.balance;
    e += (SEGMENTS.find((s) => s.id === c.segment)?.rateElasticity ?? 0.7) * bal;
    w += bal;
  }
  return w > 0 ? e / w : 0.7;
}

function blendedAttrition(cells: Cell[]) {
  if (cells.length === 0) return 0.01;
  let w = 0;
  let a = 0;
  for (const c of cells) {
    const bal = c.series[HISTORY_MONTHS - 1]!.balance;
    a += (SEGMENTS.find((s) => s.id === c.segment)?.baseAttrition ?? 0.01) * bal;
    w += bal;
  }
  return w > 0 ? a / w : 0.01;
}

function trendOf(history: MonthPoint[]) {
  const n = 18;
  const recent = history.slice(-n);
  const first = recent[0]!.balance;
  const last = recent[recent.length - 1]!.balance;
  if (first <= 0) return 0;
  return Math.pow(last / first, 1 / (n - 1)) - 1;
}

export function projectSeries(cells: Cell[], scenario: Scenario, drift = 0) {
  const history = aggregate(cells);
  const elasticity = blendedElasticity(cells);
  const attrition = blendedAttrition(cells);
  const trend = trendOf(history);
  const last = history[history.length - 1]!.balance;
  const dominantProduct = cells.length ? cells[0]!.product : "easy_access";

  const run = (applyScenario: boolean) => {
    const pts: number[] = [];
    let bal = last;
    for (let k = 1; k <= scenario.horizon; k++) {
      const i = HISTORY_MONTHS - 1 + k;
      const rateEffect = applyScenario
        ? ((scenario.offerRateBps + scenario.baseRateBps * 0.35 - scenario.competitorPressureBps) / 10000) *
          elasticity *
          1.6
        : 0;
      const acquisition = applyScenario ? (scenario.marketingUplift / 100) * 0.006 : 0;
      const churn = applyScenario ? -attrition * (scenario.attritionShock / 100) : 0;
      const season =
        seasonalFactor(i, dominantProduct as ProductId) * (applyScenario ? scenario.seasonality : 1) * 0.9;
      const monthly = trend + rateEffect + acquisition + churn + season + (applyScenario ? drift : 0);
      bal = bal * (1 + monthly);
      pts.push(bal);
    }
    return pts;
  };

  const baseline = run(false);
  const scen = run(true);

  const points: ForecastPoint[] = history.map((h) => ({
    month: h.month,
    label: h.label,
    actual: h.balance,
    baseline: null,
    scenario: null,
    lower: null,
    upper: null,
    band: null,
  }));
  // bridge
  points[points.length - 1] = {
    ...points[points.length - 1]!,
    baseline: last,
    scenario: last,
    band: [last, last],
  };

  for (let k = 0; k < scenario.horizon; k++) {
    const i = HISTORY_MONTHS + k;
    const s = scen[k]!;
    const width = s * (0.012 + k * 0.0042);
    points.push({
      month: i,
      label: monthLabel(i),
      actual: null,
      baseline: Math.round(baseline[k]!),
      scenario: Math.round(s),
      lower: Math.round(s - width),
      upper: Math.round(s + width),
      band: [Math.round(s - width), Math.round(s + width)],
    });
  }

  return {
    points,
    history,
    elasticity,
    attrition,
    trend,
    currentBalance: last,
    baselineEnd: Math.round(baseline[baseline.length - 1] ?? last),
    scenarioEnd: Math.round(scen[scen.length - 1] ?? last),
  };
}

export interface Kpis {
  balance: number;
  forecast: number;
  baselineForecast: number;
  netFlow: number;
  attritionRate: number;
  costOfFunds: number;
  mape: number;
  deltaPct: number;
  vsBaselinePct: number;
  customers: number;
  accounts: number;
}

export function computeKpis(cells: Cell[], scenario: Scenario, drift = 0, mapeAdj = 0): Kpis {
  const proj = projectSeries(cells, scenario, drift);
  const hist = proj.history;
  const last = hist[hist.length - 1]!;
  const lookback = Math.max(1, Math.min(hist.length, Math.round(scenario.horizon)));
  const inflow = hist.slice(-lookback).reduce((s, p) => s + p.inflow, 0);
  const outflow = hist.slice(-lookback).reduce((s, p) => s + p.outflow, 0);

  let weighted = 0;
  let total = 0;
  for (const c of cells) {
    const bal = c.series[HISTORY_MONTHS - 1]!.balance;
    const prod = PRODUCTS.find((p) => p.id === c.product)!;
    weighted += (prod.rate + scenario.offerRateBps / 100 + scenario.baseRateBps / 200) * bal;
    total += bal;
  }

  const attrition = blendedAttrition(cells) * (1 + scenario.attritionShock / 100);
  const yearAgo = hist[hist.length - 13]?.balance ?? last.balance;

  return {
    balance: last.balance,
    forecast: proj.scenarioEnd,
    baselineForecast: proj.baselineEnd,
    netFlow: inflow - outflow,
    attritionRate: attrition * 12,
    costOfFunds: total > 0 ? weighted / total : 0,
    mape:
      3.1 +
      mapeAdj +
      scenario.horizon / 40 +
      Math.abs(scenario.baseRateBps) / 400 +
      Math.abs(scenario.competitorPressureBps) / 500,
    deltaPct: yearAgo > 0 ? (last.balance / yearAgo - 1) * 100 : 0,
    vsBaselinePct: proj.baselineEnd > 0 ? (proj.scenarioEnd / proj.baselineEnd - 1) * 100 : 0,
    customers: cells.reduce((s, c) => s + c.customers, 0),
    accounts: cells.reduce((s, c) => s + c.accounts, 0),
  };
}

export interface Breakdown {
  key: string;
  name: string;
  balance: number;
  forecast: number;
  delta: number;
  deltaPct: number;
  /** Last 12 months of actual balances for this group — used for sparkline trends. */
  trend: number[];
}

export function breakdownBy(
  cells: Cell[],
  scenario: Scenario,
  dim: "segment" | "product" | "region",
  drift = 0,
): Breakdown[] {
  const groups = new Map<string, Cell[]>();
  for (const c of cells) {
    const key = c[dim];
    const arr = groups.get(key) ?? [];
    arr.push(c);
    groups.set(key, arr);
  }
  const nameOf = (key: string) =>
    dim === "segment"
      ? SEGMENTS.find((s) => s.id === key)!.name
      : dim === "product"
        ? PRODUCTS.find((p) => p.id === key)!.name
        : REGIONS.find((r) => r.id === key)!.name;

  return [...groups.entries()]
    .map(([key, group]) => {
      const proj = projectSeries(group, scenario, drift);
      const delta = proj.scenarioEnd - proj.currentBalance;
      const hist = aggregate(group);
      return {
        key,
        name: nameOf(key),
        balance: proj.currentBalance,
        forecast: proj.scenarioEnd,
        delta,
        deltaPct: proj.currentBalance > 0 ? (delta / proj.currentBalance) * 100 : 0,
        trend: hist.slice(-12).map((p) => p.balance),
      };
    })
    .sort((a, b) => b.balance - a.balance);
}

export interface Movement extends Breakdown {
  dimension: string;
  driver: string;
}

export function winsAndLosses(cells: Cell[], scenario: Scenario) {
  const rows: Movement[] = [];
  const push = (dim: "segment" | "product" | "region", label: string) => {
    for (const b of breakdownBy(cells, scenario, dim)) {
      rows.push({ ...b, dimension: label, driver: driverFor(dim, b, scenario) });
    }
  };
  push("segment", "Segment");
  push("product", "Product");
  push("region", "Region");

  const sorted = [...rows].sort((a, b) => b.delta - a.delta);
  return { wins: sorted.slice(0, 5), losses: sorted.slice(-5).reverse() };
}

function driverFor(dim: string, b: Breakdown, s: Scenario) {
  if (b.delta >= 0) {
    if (s.offerRateBps > 0) return `Repricing (+${s.offerRateBps}bps) attracting balances in ${b.name}`;
    if (s.marketingUplift > 0) return `Acquisition uplift of ${s.marketingUplift}% feeding ${b.name}`;
    return `Organic ${dim} growth and seasonal inflows in ${b.name}`;
  }
  if (s.competitorPressureBps > 0) return `Competitor pricing +${s.competitorPressureBps}bps drawing balances out of ${b.name}`;
  if (s.attritionShock > 0) return `Attrition shock of +${s.attritionShock}% concentrated in ${b.name}`;
  return `Rate-sensitive outflow and maturity roll-off in ${b.name}`;
}

/* ---------------------------- insights + actions ---------------------------- */

export interface Insight {
  id: string;
  title: string;
  body: string;
  severity: "positive" | "neutral" | "watch" | "risk";
  personas: string[];
}

export interface ActionItem {
  id: string;
  title: string;
  owner: string;
  priority: "High" | "Medium" | "Low";
  impact: string;
  personas: string[];
}

export const fmtGBP = (v: number) => {
  const abs = Math.abs(v);
  if (abs >= 1e9) return `£${(v / 1e9).toFixed(2)}bn`;
  if (abs >= 1e6) return `£${(v / 1e6).toFixed(1)}m`;
  if (abs >= 1e3) return `£${(v / 1e3).toFixed(0)}k`;
  return `£${v.toFixed(0)}`;
};

export const fmtPct = (v: number, dp = 1) => `${v >= 0 ? "+" : ""}${v.toFixed(dp)}%`;

export function buildInsights(cells: Cell[], scenario: Scenario, kpis: Kpis): Insight[] {
  const segs = breakdownBy(cells, scenario, "segment");
  const prods = breakdownBy(cells, scenario, "product");
  const best = [...segs].sort((a, b) => b.deltaPct - a.deltaPct)[0];
  const worst = [...segs].sort((a, b) => a.deltaPct - b.deltaPct)[0];
  const maturing = prods.find((p) => p.key === "fixed_bond");
  const concentration = segs.length ? (segs[0]!.balance / Math.max(1, kpis.balance)) * 100 : 0;

  const out: Insight[] = [
    {
      id: "trajectory",
      title: `Deposit base tracks to ${fmtGBP(kpis.forecast)} over ${scenario.horizon} months`,
      body: `Scenario closes ${fmtPct(kpis.vsBaselinePct)} against baseline of ${fmtGBP(kpis.baselineForecast)}, with a rolling 12-month net flow of ${fmtGBP(kpis.netFlow)}.`,
      severity: kpis.vsBaselinePct >= 0 ? "positive" : "risk",
      personas: ["exec", "analyst", "pm", "treasury", "pricing", "risk", "marketing"],
    },
  ];

  if (best) {
    out.push({
      id: "best-seg",
      title: `${best.name} is the strongest growth engine`,
      body: `Forecast balances rise ${fmtPct(best.deltaPct)} to ${fmtGBP(best.forecast)}. Rate elasticity in this segment amplifies any repricing decision.`,
      severity: "positive",
      personas: ["exec", "analyst", "treasury", "pricing", "risk", "marketing"],
    });
  }
  if (worst && worst.deltaPct < (best?.deltaPct ?? 0)) {
    out.push({
      id: "worst-seg",
      title: worst.deltaPct < 0
        ? `${worst.name} is the primary drag on the forecast`
        : `${worst.name} is the slowest-growing segment`,
      body: `Balances move ${fmtPct(worst.deltaPct)} to ${fmtGBP(worst.forecast)} under the current scenario, driven by attrition of ${(kpis.attritionRate * 100).toFixed(1)}% annualised.`,
      severity: worst.deltaPct < 0 ? "risk" : "watch",
      personas: ["exec", "analyst", "pm", "treasury", "pricing", "risk", "marketing"],
    });
  }
  if (maturing) {
    out.push({
      id: "maturity",
      title: `Fixed-term maturity cliff of ${fmtGBP(maturing.balance * 0.28)} in the next two quarters`,
      body: `Roughly 28% of the fixed bond book reaches maturity inside the horizon. Retention pricing needs to be agreed before the roll-off window opens.`,
      severity: "watch",
      personas: ["exec", "analyst", "pm", "treasury", "pricing", "risk", "marketing"],
    });
  }
  out.push({
    id: "concentration",
    title: `Top segment holds ${concentration.toFixed(0)}% of filtered balances`,
    body:
      concentration > 40
        ? `Concentration is above the 40% internal guardrail — funding is exposed to a single behavioural cohort.`
        : `Concentration sits within the internal guardrail, giving reasonable funding diversification.`,
    severity: concentration > 40 ? "risk" : "neutral",
    personas: ["exec", "analyst", "treasury", "pricing", "risk", "marketing"],
  });
  out.push({
    id: "cof",
    title: `Blended cost of funds at ${kpis.costOfFunds.toFixed(2)}%`,
    body: `Every additional 10bps on the savings offer costs approximately ${fmtGBP(kpis.balance * 0.001)} per annum at current volumes; the model shows a ${(kpis.vsBaselinePct / Math.max(1, scenario.offerRateBps || 1)).toFixed(3)}% balance response per bps.`,
    severity: "neutral",
    personas: ["exec", "analyst", "treasury", "pricing", "risk", "marketing"],
  });
  out.push({
    id: "accuracy",
    title: `Model back-test MAPE of ${kpis.mape.toFixed(1)}%`,
    body: `Accuracy remains inside the 5% tolerance band. Confidence intervals widen to roughly ±${(1.2 + scenario.horizon * 0.42).toFixed(1)}% by the end of the horizon.`,
    severity: kpis.mape > 5 ? "watch" : "positive",
    personas: ["analyst", "pm", "treasury", "pricing", "risk", "marketing"],
  });

  return out;
}

export function buildActions(kpis: Kpis, scenario: Scenario): ActionItem[] {
  return [
    {
      id: "a1",
      title: `Approve retention pricing for the ${fmtGBP(kpis.balance * 0.18)} maturity window`,
      owner: "Head of Savings Pricing",
      priority: "High",
      impact: `Protects up to ${fmtGBP(kpis.balance * 0.05)} of at-risk balances`,
      personas: ["exec", "pm", "treasury", "pricing", "risk", "marketing"],
    },
    {
      id: "a2",
      title: scenario.competitorPressureBps > 0 ? "Stand up competitor rate-response playbook" : "Refresh competitor rate benchmarking cadence",
      owner: "Product & Pricing",
      priority: scenario.competitorPressureBps > 0 ? "High" : "Medium",
      impact: "Reduces reaction time to market moves from 10 days to 48 hours",
      personas: ["exec", "analyst", "pm", "treasury", "pricing", "risk", "marketing"],
    },
    {
      id: "a3",
      title: "Re-fit elasticity coefficients on the latest 18 months of flow data",
      owner: "Deposit Modelling Lead",
      priority: "Medium",
      impact: `Expected MAPE improvement of 0.6pp from ${kpis.mape.toFixed(1)}%`,
      personas: ["analyst", "treasury", "pricing", "risk", "marketing"],
    },
    {
      id: "a4",
      title: "Sequence the retention campaign ahead of the ISA season peak",
      owner: "Programme Office",
      priority: "High",
      impact: "Aligns delivery with the April inflow peak",
      personas: ["pm", "treasury", "pricing", "risk", "marketing"],
    },
    {
      id: "a5",
      title: "Brief ALCO on funding concentration and scenario sensitivity",
      owner: "Treasury",
      priority: "Medium",
      impact: "Board-level visibility of liquidity risk under stress",
      personas: ["exec", "treasury", "pricing", "risk", "marketing"],
    },
  ];
}

export function narrative(personaId: string, kpis: Kpis, scenario: Scenario) {
  const dir = kpis.vsBaselinePct >= 0 ? "ahead of" : "behind";
  if (personaId === "exec") {
    return `Deposits stand at ${fmtGBP(kpis.balance)} and are forecast to reach ${fmtGBP(kpis.forecast)} in ${scenario.horizon} months — ${fmtPct(kpis.vsBaselinePct)} ${dir} baseline. Blended cost of funds is ${kpis.costOfFunds.toFixed(2)}% with annualised attrition of ${(kpis.attritionRate * 100).toFixed(1)}%. The decision in front of the board is how much margin to trade for balance sheet stability.`;
  }
  if (personaId === "analyst") {
    return `The model projects ${fmtGBP(kpis.forecast)} at horizon (baseline ${fmtGBP(kpis.baselineForecast)}), driven by a blended rate elasticity applied to ${kpis.accounts.toLocaleString()} accounts across ${kpis.customers.toLocaleString()} customers. Back-test MAPE is ${kpis.mape.toFixed(1)}%; rate and competitor terms carry the bulk of the scenario delta.`;
  }
  return `Delivery view: ${fmtGBP(kpis.forecast)} forecast at horizon, ${fmtPct(kpis.vsBaselinePct)} versus baseline. Five actions are open, two are High priority and both sit on the pricing critical path ahead of the seasonal inflow peak.`;
}

/* ---------------------------- quarterly view ---------------------------- */

export function quarterLabel(monthIndex: number) {
  const y = START_YEAR + Math.floor(monthIndex / 12);
  const q = Math.floor((monthIndex % 12) / 3) + 1;
  return `Q${q} ${y}`;
}

/** Month indices of the last 4 completed actual quarters. */
export const ACTUAL_QUARTERS = [0, 1, 2, 3].map((k) => HISTORY_MONTHS - 12 + k * 3);
export const FORECAST_QUARTER_START = HISTORY_MONTHS;

export interface QuarterCell {
  label: string;
  closing: number;
  netFlow: number;
  forecast: boolean;
}

export interface ProductQuarters {
  key: ProductId;
  name: string;
  family: string;
  rate: number;
  competitorRate: number;
  quarters: QuarterCell[];
  forecast: QuarterCell;
  qoqPct: number;
  yoyPct: number;
}

function groupByProduct(cells: Cell[]) {
  const groups = new Map<ProductId, Cell[]>();
  for (const c of cells) {
    const arr = groups.get(c.product) ?? [];
    arr.push(c);
    groups.set(c.product, arr);
  }
  return groups;
}

/** Forward window used for quarterly and waterfall projections — follows the selected horizon. */
export function forecastWindow(scenario: Scenario) {
  return Math.max(1, Math.min(60, Math.round(scenario.horizon)));
}

export function quarterlyByProduct(cells: Cell[], scenario: Scenario): ProductQuarters[] {
  const out: ProductQuarters[] = [];
  for (const [product, group] of groupByProduct(cells)) {
    const prod = PRODUCTS.find((p) => p.id === product)!;
    const hist = aggregate(group);
    const quarters: QuarterCell[] = ACTUAL_QUARTERS.map((start) => {
      const end = hist[start + 2]!;
      const prev = hist[start - 1]?.balance ?? hist[start]!.balance;
      return { label: quarterLabel(start), closing: end.balance, netFlow: end.balance - prev, forecast: false };
    });
    const win = forecastWindow(scenario);
    const proj = projectSeries(group, { ...scenario, horizon: win });
    const closing = proj.scenarioEnd;
    const lastActual = quarters[quarters.length - 1]!;
    const forecast: QuarterCell = {
      label: win === 3 ? quarterLabel(FORECAST_QUARTER_START) : `Next ${win}m`,
      closing,
      netFlow: closing - lastActual.closing,
      forecast: true,
    };
    out.push({
      key: product,
      name: prod.name,
      family: prod.family,
      rate: prod.rate + scenario.offerRateBps / 100,
      competitorRate: prod.competitorRate + scenario.competitorPressureBps / 100,
      quarters,
      forecast,
      qoqPct: lastActual.closing > 0 ? (forecast.netFlow / lastActual.closing) * 100 : 0,
      yoyPct: quarters[0]!.closing > 0 ? (closing / quarters[0]!.closing - 1) * 100 : 0,
    });
  }
  return out.sort((a, b) => b.forecast.closing - a.forecast.closing);
}

/* ---------------------------- product trends ---------------------------- */

export interface ProductTrendPoint {
  label: string;
  [product: string]: string | number;
}

/** Monthly closing balance per product over the trailing window, for trend charts. */
export function productTrends(cells: Cell[], months = 24) {
  const groups = groupByProduct(cells);
  const series = new Map<ProductId, MonthPoint[]>();
  for (const [product, group] of groups) series.set(product, aggregate(group));

  const start = Math.max(0, HISTORY_MONTHS - months);
  const points: ProductTrendPoint[] = [];
  for (let i = start; i < HISTORY_MONTHS; i++) {
    const row: ProductTrendPoint = { label: monthLabel(i) };
    for (const [product, hist] of series) {
      const prod = PRODUCTS.find((p) => p.id === product)!;
      row[prod.name] = hist[i]!.balance;
    }
    points.push(row);
  }

  const keys = [...series.keys()].map((k) => PRODUCTS.find((p) => p.id === k)!.name);
  return { points, keys };
}

/* ---------------------------- waterfall ---------------------------- */

export interface WaterfallRow {
  key: ProductId | "total";
  name: string;
  opening: number;
  backBookInflow: number;
  frontBookInflow: number;
  backBookOutflow: number;
  frontBookOutflow: number;
  closing: number;
}

export function waterfallByProduct(cells: Cell[], scenario: Scenario): WaterfallRow[] {
  const rows: WaterfallRow[] = [];
  for (const [product, group] of groupByProduct(cells)) {
    const prod = PRODUCTS.find((p) => p.id === product)!;
    const hist = aggregate(group);
    const opening = hist[HISTORY_MONTHS - 1]!.balance;
    const win = forecastWindow(scenario);
    const proj = projectSeries(group, { ...scenario, horizon: win });
    const closing = proj.scenarioEnd;
    const net = closing - opening;

    const grossIn =
      hist.slice(-win).reduce((s, p) => s + p.inflow, 0) * (1 + scenario.marketingUplift / 100) * 0.6;
    const grossOut = Math.max(grossIn * 0.1, grossIn - net);

    const frontShare = Math.min(0.75, prod.frontBookShare * (1 + scenario.marketingUplift / 100));
    const frontBookInflow = grossIn * frontShare;
    const backBookInflow = grossIn - frontBookInflow;
    // Newly opened accounts churn less inside the quarter than the back book.
    const frontOutShare = 0.08 * (1 + scenario.attritionShock / 100);
    const frontBookOutflow = grossOut * Math.min(0.4, frontOutShare);
    const backBookOutflow = grossOut - frontBookOutflow;

    rows.push({
      key: product,
      name: prod.name,
      opening,
      backBookInflow,
      frontBookInflow,
      backBookOutflow,
      frontBookOutflow,
      closing: opening + grossIn - grossOut,
    });
  }
  rows.sort((a, b) => b.opening - a.opening);
  return rows;
}

export function totalWaterfall(rows: WaterfallRow[]): WaterfallRow {
  return rows.reduce<WaterfallRow>(
    (t, r) => ({
      key: "total",
      name: "All products",
      opening: t.opening + r.opening,
      backBookInflow: t.backBookInflow + r.backBookInflow,
      frontBookInflow: t.frontBookInflow + r.frontBookInflow,
      backBookOutflow: t.backBookOutflow + r.backBookOutflow,
      frontBookOutflow: t.frontBookOutflow + r.frontBookOutflow,
      closing: t.closing + r.closing,
    }),
    {
      key: "total",
      name: "All products",
      opening: 0,
      backBookInflow: 0,
      frontBookInflow: 0,
      backBookOutflow: 0,
      frontBookOutflow: 0,
      closing: 0,
    },
  );
}

/** Recharts-friendly floating-bar waterfall steps. */
export interface WaterfallStep {
  name: string;
  base: number;
  value: number;
  amount: number;
  kind: "start" | "in" | "out" | "end";
}

export function waterfallSteps(r: WaterfallRow): WaterfallStep[] {
  const steps: WaterfallStep[] = [];
  let cursor = r.opening;
  steps.push({ name: "Opening", base: 0, value: r.opening, amount: r.opening, kind: "start" });
  const add = (name: string, amount: number, kind: "in" | "out") => {
    const next = cursor + amount;
    steps.push({ name, base: Math.min(cursor, next), value: Math.abs(amount), amount, kind });
    cursor = next;
  };
  add("Back book in", r.backBookInflow, "in");
  add("Front book in", r.frontBookInflow, "in");
  add("Back book out", -r.backBookOutflow, "out");
  add("Front book out", -r.frontBookOutflow, "out");
  steps.push({ name: "Closing", base: 0, value: cursor, amount: cursor, kind: "end" });
  return steps;
}

/* ---------------------------- driver tree ---------------------------- */

export interface DriverNode {
  id: string;
  label: string;
  value: number;
  unit: "gbp" | "count" | "pct";
  kind: "calculation" | "predictive" | "baseline" | "manual" | "external";
  sign?: "+" | "-" | "±";
  note?: string;
  children?: DriverNode[];
}

export function buildDriverTree(cells: Cell[], scenario: Scenario, kpis: Kpis): DriverNode {
  const rows = waterfallByProduct(cells, scenario);
  const t = totalWaterfall(rows);
  const accounts = cells.reduce((s, c) => s + c.accounts, 0);
  const openings = Math.round(accounts * 0.031 * (1 + scenario.marketingUplift / 100));
  const closures = Math.round(accounts * 0.019 * (1 + scenario.attritionShock / 100));
  const activeAccounts = accounts + openings - closures;

  const withdrawals = t.backBookOutflow * 0.72;
  const churnMaturity = t.backBookOutflow * 0.28 + t.frontBookOutflow;
  const internalTransfers = t.opening * 0.004 * (scenario.offerRateBps >= 0 ? 1 : -1);
  const externalImpact =
    (t.closing - t.opening) -
    (t.frontBookInflow + t.backBookInflow - withdrawals - churnMaturity + internalTransfers);

  return {
    id: "closing",
    label: "Closing deposits",
    value: t.closing,
    unit: "gbp",
    kind: "calculation",
    note: `Forecast grain: product × segment × lifecycle × time`,
    children: [
      {
        id: "opening",
        label: "Opening deposit balance",
        value: t.opening,
        unit: "gbp",
        kind: "calculation",
        sign: "+",
        children: [
          {
            id: "active_accounts",
            label: "Active deposit accounts",
            value: activeAccounts,
            unit: "count",
            kind: "calculation",
            note: `Prior-period active + ${openings.toLocaleString()} openings − ${closures.toLocaleString()} closures`,
          },
          {
            id: "avg_balance",
            label: "Average balance per active account",
            value: activeAccounts > 0 ? t.opening / activeAccounts : 0,
            unit: "gbp",
            kind: "baseline",
            note: "Historical balance per account by product and segment",
          },
        ],
      },
      {
        id: "netflow",
        label: "Net flow",
        value: t.closing - t.opening,
        unit: "gbp",
        kind: "calculation",
        sign: "+",
        children: [
          {
            id: "new_inflow",
            label: "New-account inflows (front book)",
            value: t.frontBookInflow,
            unit: "gbp",
            kind: "predictive",
            sign: "+",
            note: `New accounts × amount per account × campaign uplift (${scenario.marketingUplift >= 0 ? "+" : ""}${scenario.marketingUplift}%)`,
          },
          {
            id: "existing_inflow",
            label: "Existing-customer inflows (back book)",
            value: t.backBookInflow,
            unit: "gbp",
            kind: "predictive",
            sign: "+",
            note: "Deposit frequency × amount per cycle × payroll seasonality",
          },
          {
            id: "withdrawals",
            label: "Withdrawals",
            value: withdrawals,
            unit: "gbp",
            kind: "predictive",
            sign: "-",
            note: "Withdrawal frequency × amount per cycle × historical seasonality",
          },
          {
            id: "churn",
            label: "Churn / maturity flows",
            value: churnMaturity,
            unit: "gbp",
            kind: "predictive",
            sign: "±",
            note: `Contract maturity dates × renewal propensity, attrition shock ${scenario.attritionShock >= 0 ? "+" : ""}${scenario.attritionShock}%`,
          },
          {
            id: "transfers",
            label: "Internal product transfers",
            value: internalTransfers,
            unit: "gbp",
            kind: "predictive",
            sign: "±",
            note: "Maturity / expiry transfer propensity and pricing migration rules",
          },
          {
            id: "external",
            label: "External signals impact",
            value: externalImpact,
            unit: "gbp",
            kind: "external",
            sign: "±",
            note: `Rate gap ${scenario.offerRateBps - scenario.competitorPressureBps}bps, base rate ${scenario.baseRateBps >= 0 ? "+" : ""}${scenario.baseRateBps}bps, cost of funds ${kpis.costOfFunds.toFixed(2)}%`,
          },
        ],
      },
    ],
  };
}

/* ---------------------- full decision tree (adjustable) ---------------------- */

export interface TreeAssumptions {
  openingRate: number; // % of accounts opened per quarter
  closureRate: number; // % of accounts closed per quarter
  newAcctDeposit: number; // index, 100 = model default average deposit per new account
  backBookDeposit: number; // index, 100 = model default deposit per existing customer cycle
  withdrawalRate: number; // index, 100 = model default withdrawal propensity
  renewalPropensity: number; // % of maturing balances retained
  transferPropensity: number; // index, 100 = model default internal transfer volume
  externalSensitivity: number; // index, 100 = model default macro/competitor sensitivity
}

export const DEFAULT_ASSUMPTIONS: TreeAssumptions = {
  openingRate: 3.1,
  closureRate: 1.9,
  newAcctDeposit: 100,
  backBookDeposit: 100,
  withdrawalRate: 100,
  renewalPropensity: 62,
  transferPropensity: 100,
  externalSensitivity: 100,
};

export interface AssumptionControl {
  key: keyof TreeAssumptions;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: "pct" | "index";
  help: string;
}

export const ASSUMPTION_CONTROLS: AssumptionControl[] = [
  { key: "openingRate", label: "Account opening rate", min: 0, max: 8, step: 0.1, unit: "pct", help: "Share of the account base opened as new accounts in the quarter." },
  { key: "closureRate", label: "Account closure rate", min: 0, max: 8, step: 0.1, unit: "pct", help: "Share of the account base fully closed in the quarter." },
  { key: "newAcctDeposit", label: "Avg deposit per new account", min: 50, max: 160, step: 1, unit: "index", help: "Index on the modelled funding amount for each newly opened account." },
  { key: "backBookDeposit", label: "Existing-customer deposit frequency", min: 50, max: 160, step: 1, unit: "index", help: "Index on deposit frequency × amount per cycle for the back book." },
  { key: "withdrawalRate", label: "Withdrawal propensity", min: 50, max: 180, step: 1, unit: "index", help: "Index on withdrawal frequency and average withdrawal size." },
  { key: "renewalPropensity", label: "Maturity renewal propensity", min: 20, max: 95, step: 1, unit: "pct", help: "Share of maturing fixed and notice balances that roll over." },
  { key: "transferPropensity", label: "Internal transfer propensity", min: 0, max: 250, step: 5, unit: "index", help: "Index on balances migrating between own products on maturity or repricing." },
  { key: "externalSensitivity", label: "External signal sensitivity", min: 0, max: 220, step: 5, unit: "index", help: "Index on the response to base rate, competitor pricing and macro signals." },
];

export interface TreeNode extends DriverNode {
  formula?: string;
  impact?: number; // £ effect on closing balance vs default assumption
  share?: number; // % of closing balance
  assumption?: keyof TreeAssumptions;
  children?: TreeNode[];
}

interface TreeTerms {
  opening: number;
  accounts: number;
  openings: number;
  closures: number;
  activeAccounts: number;
  avgBalance: number;
  frontIn: number;
  backIn: number;
  withdrawals: number;
  churn: number;
  transfers: number;
  external: number;
  closing: number;
}

function treeTerms(cells: Cell[], scenario: Scenario, a: TreeAssumptions): TreeTerms {
  const t = totalWaterfall(waterfallByProduct(cells, scenario));
  const accounts = cells.reduce((s, c) => s + c.accounts, 0);
  const d = DEFAULT_ASSUMPTIONS;

  const openings = accounts * (a.openingRate / 100) * (1 + scenario.marketingUplift / 100);
  const baseOpenings = accounts * (d.openingRate / 100) * (1 + scenario.marketingUplift / 100);
  const closures = accounts * (a.closureRate / 100) * (1 + scenario.attritionShock / 100);
  const activeAccounts = accounts + openings - closures;

  const frontIn = t.frontBookInflow * (a.newAcctDeposit / 100) * (baseOpenings > 0 ? openings / baseOpenings : 1);
  const backIn = t.backBookInflow * (a.backBookDeposit / 100);
  const withdrawals = t.backBookOutflow * 0.72 * (a.withdrawalRate / 100);
  const maturityPool = t.backBookOutflow * 0.28 + t.frontBookOutflow;
  const churn = maturityPool * ((100 - a.renewalPropensity) / (100 - d.renewalPropensity));
  const transfers = t.opening * 0.004 * (scenario.offerRateBps >= 0 ? 1 : -1) * (a.transferPropensity / 100);

  const defaultResidual =
    t.closing -
    t.opening -
    (t.frontBookInflow + t.backBookInflow - t.backBookOutflow * 0.72 - maturityPool + t.opening * 0.004 * (scenario.offerRateBps >= 0 ? 1 : -1));
  const external = defaultResidual * (a.externalSensitivity / 100);

  const closing = t.opening + frontIn + backIn - withdrawals - churn + transfers + external;
  return {
    opening: t.opening,
    accounts,
    openings,
    closures,
    activeAccounts,
    avgBalance: activeAccounts > 0 ? t.opening / activeAccounts : 0,
    frontIn,
    backIn,
    withdrawals,
    churn,
    transfers,
    external,
    closing,
  };
}

export interface FullTree {
  root: TreeNode;
  closing: number;
  defaultClosing: number;
  totalImpact: number;
}

export function buildFullTree(cells: Cell[], scenario: Scenario, a: TreeAssumptions): FullTree {
  const cur = treeTerms(cells, scenario, a);
  const def = treeTerms(cells, scenario, DEFAULT_ASSUMPTIONS);

  const impactOf = (key: keyof TreeAssumptions) => {
    if (a[key] === DEFAULT_ASSUMPTIONS[key]) return 0;
    const reverted = treeTerms(cells, scenario, { ...a, [key]: DEFAULT_ASSUMPTIONS[key] });
    return cur.closing - reverted.closing;
  };

  const share = (v: number) => (cur.closing > 0 ? (v / cur.closing) * 100 : 0);
  const pctFmt = (v: number) => `${v >= 0 ? "+" : ""}${v}`;

  const root: TreeNode = {
    id: "closing",
    label: "Closing deposit balance",
    value: cur.closing,
    unit: "gbp",
    kind: "calculation",
    note: "Grain: product × customer segment × lifecycle × time. Horizon: next quarter.",
    formula: "Opening balance + net flow",
    impact: cur.closing - def.closing,
    share: 100,
    children: [
      {
        id: "opening",
        label: "Opening deposit balance",
        value: cur.opening,
        unit: "gbp",
        kind: "calculation",
        sign: "+",
        formula: "Active accounts × average balance per account",
        share: share(cur.opening),
        children: [
          {
            id: "active",
            label: "Active deposit accounts",
            value: cur.activeAccounts,
            unit: "count",
            kind: "calculation",
            formula: "Prior active + openings − closures",
            note: `${Math.round(cur.openings).toLocaleString()} openings, ${Math.round(cur.closures).toLocaleString()} closures`,
            children: [
              {
                id: "openings",
                label: "New accounts opened",
                value: cur.openings,
                unit: "count",
                kind: "predictive",
                sign: "+",
                assumption: "openingRate",
                formula: `Account base × opening rate ${a.openingRate}% × campaign uplift ${pctFmt(scenario.marketingUplift)}%`,
                impact: impactOf("openingRate"),
              },
              {
                id: "closures",
                label: "Accounts closed",
                value: cur.closures,
                unit: "count",
                kind: "predictive",
                sign: "-",
                assumption: "closureRate",
                formula: `Account base × closure rate ${a.closureRate}% × attrition shock ${pctFmt(scenario.attritionShock)}%`,
                impact: impactOf("closureRate"),
              },
            ],
          },
          {
            id: "avg_balance",
            label: "Average balance per active account",
            value: cur.avgBalance,
            unit: "gbp",
            kind: "baseline",
            formula: "Historical balance per account by product and segment",
          },
        ],
      },
      {
        id: "netflow",
        label: "Net flow",
        value: cur.closing - cur.opening,
        unit: "gbp",
        kind: "calculation",
        sign: "+",
        formula: "Inflows − outflows ± transfers ± external effects",
        share: share(cur.closing - cur.opening),
        children: [
          {
            id: "front_in",
            label: "New-account inflows (front book)",
            value: cur.frontIn,
            unit: "gbp",
            kind: "predictive",
            sign: "+",
            assumption: "newAcctDeposit",
            formula: "New accounts × average deposit per new account",
            impact: impactOf("newAcctDeposit") + impactOf("openingRate"),
            share: share(cur.frontIn),
          },
          {
            id: "back_in",
            label: "Existing-customer inflows (back book)",
            value: cur.backIn,
            unit: "gbp",
            kind: "predictive",
            sign: "+",
            assumption: "backBookDeposit",
            formula: "Deposit frequency × amount per cycle × payroll seasonality",
            impact: impactOf("backBookDeposit"),
            share: share(cur.backIn),
          },
          {
            id: "withdrawals",
            label: "Withdrawals",
            value: cur.withdrawals,
            unit: "gbp",
            kind: "predictive",
            sign: "-",
            assumption: "withdrawalRate",
            formula: "Withdrawal frequency × amount per cycle × seasonality",
            impact: impactOf("withdrawalRate"),
            share: share(-cur.withdrawals),
          },
          {
            id: "churn",
            label: "Churn and maturity outflows",
            value: cur.churn,
            unit: "gbp",
            kind: "predictive",
            sign: "-",
            assumption: "renewalPropensity",
            formula: `Maturing balances × (100% − renewal propensity ${a.renewalPropensity}%)`,
            impact: impactOf("renewalPropensity"),
            share: share(-cur.churn),
          },
          {
            id: "transfers",
            label: "Internal product transfers",
            value: cur.transfers,
            unit: "gbp",
            kind: "manual",
            sign: "±",
            assumption: "transferPropensity",
            formula: "Maturity / expiry transfer propensity and pricing migration rules",
            impact: impactOf("transferPropensity"),
            share: share(cur.transfers),
          },
          {
            id: "external",
            label: "External signals impact",
            value: cur.external,
            unit: "gbp",
            kind: "external",
            sign: "±",
            assumption: "externalSensitivity",
            formula: `Rate gap ${scenario.offerRateBps - scenario.competitorPressureBps}bps, base rate ${pctFmt(scenario.baseRateBps)}bps, competitor and macro signals`,
            impact: impactOf("externalSensitivity"),
            share: share(cur.external),
          },
        ],
      },
    ],
  };

  return { root, closing: cur.closing, defaultClosing: def.closing, totalImpact: cur.closing - def.closing };
}

/* ---------------------- assumptions -> forecast wiring ---------------------- */

/**
 * Converts decision-tree assumptions into a monthly growth-rate delta so the
 * headline forecast, KPIs and breakdowns move when assumptions are adjusted.
 */
export function assumptionDrift(cells: Cell[], scenario: Scenario, a: TreeAssumptions): number {
  const tree = buildFullTree(cells, scenario, a);
  if (tree.defaultClosing <= 0) return 0;
  const ratio = tree.closing / tree.defaultClosing;
  if (!Number.isFinite(ratio) || ratio <= 0) return 0;
  const monthly = Math.pow(ratio, 1 / 3) - 1;
  return Math.max(-0.02, Math.min(0.02, monthly));
}
