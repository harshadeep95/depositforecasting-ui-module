import { useCallback, useSyncExternalStore } from "react";

export interface ForecastModel {
  id: string;
  name: string;
  family: string;
  summary: string;
  pros: string[];
  cons: string[];
  /** Back-test mean absolute percentage error on the synthetic hold-out. */
  mape: number;
  /** Explainability / refresh-cost ratings, 1 (low) to 5 (high). */
  explainability: number;
  runtime: string;
  /** Monthly drift the model contributes to the projection, vs the champion. */
  driftPerMonth: number;
  /** True for the model actually powering this dashboard. */
  champion?: boolean;
}

export const FORECAST_MODELS: ForecastModel[] = [
  {
    id: "seasonal_naive",
    name: "Seasonal naive baseline",
    family: "Statistical benchmark",
    summary: "Repeats last year's month-on-month movement. Used as the challenger floor every model must beat.",
    pros: ["Trivial to build and explain", "No tuning or feature pipeline", "Useful sanity check for other models"],
    cons: ["Ignores pricing and competitor moves", "No scenario sensitivity", "Weakest accuracy of the pack"],
    mape: 7.8,
    explainability: 5,
    runtime: "Seconds",
    driftPerMonth: -0.0016,
  },
  {
    id: "sarimax",
    name: "SARIMAX with rate exogenous",
    family: "Classical time series",
    summary: "Seasonal ARIMA with base rate, own offer rate and competitor spread as exogenous regressors.",
    pros: ["Transparent coefficients for model risk review", "Handles seasonality cleanly", "Confidence intervals out of the box"],
    cons: ["Assumes linear rate response", "Needs refitting per product cohort", "Struggles with sharp regime shifts"],
    mape: 4.9,
    explainability: 4,
    runtime: "~2 minutes",
    driftPerMonth: -0.0006,
  },
  {
    id: "gbm",
    name: "Gradient boosted trees (LightGBM)",
    family: "Machine learning",
    summary:
      "Cell-level model on behavioural, pricing, macro and campaign features, with SHAP attribution feeding the decision tree.",
    pros: [
      "Best back-test accuracy on this book",
      "Captures non-linear rate and tenure effects",
      "SHAP values map directly onto the driver tree",
    ],
    cons: ["Needs a maintained feature store", "Extrapolates poorly beyond observed rate ranges", "Monthly monitoring required"],
    mape: 3.1,
    explainability: 3,
    runtime: "~12 minutes",
    driftPerMonth: 0,
    champion: true,
  },
  {
    id: "lstm",
    name: "LSTM sequence model",
    family: "Deep learning",
    summary: "Recurrent network over five years of daily balance and transaction sequences per customer cohort.",
    pros: ["Learns long-memory behaviour", "Strong on high-volume current accounts", "Handles irregular flow patterns"],
    cons: ["Opaque for model governance", "Expensive to retrain", "Unstable on thin product cohorts"],
    mape: 3.9,
    explainability: 1,
    runtime: "~2 hours (GPU)",
    driftPerMonth: 0.0008,
  },
  {
    id: "ensemble",
    name: "Hybrid ensemble (GBM + SARIMAX)",
    family: "Ensemble",
    summary: "Weighted blend of the boosted trees and the classical model, weights refreshed each month by recent error.",
    pros: ["Most stable across stress scenarios", "Softens single-model bias", "Retains a statistical fallback"],
    cons: ["Harder to attribute a single driver", "Two pipelines to maintain", "Slower to sign off through governance"],
    mape: 3.3,
    explainability: 2,
    runtime: "~15 minutes",
    driftPerMonth: 0.0003,
  },
];

export const CHAMPION_MODEL = FORECAST_MODELS.find((m) => m.champion)!;

let modelId = CHAMPION_MODEL.id;
const listeners = new Set<() => void>();
const getSnapshot = () => modelId;

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useForecastModel() {
  const id = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const model = FORECAST_MODELS.find((m) => m.id === id) ?? CHAMPION_MODEL;

  const setModel = useCallback((next: string) => {
    modelId = next;
    for (const l of listeners) l();
  }, []);

  return { model, modelId: id, setModel };
}
