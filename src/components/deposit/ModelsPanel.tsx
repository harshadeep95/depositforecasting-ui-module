import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FORECAST_MODELS, type ForecastModel } from "@/lib/model-store";

function Rating({ value }: { value: number }) {
  return (
    <span className="inline-flex gap-0.5 align-middle">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={cn("h-1.5 w-3 rounded-sm", i <= value ? "bg-primary" : "bg-secondary")} />
      ))}
    </span>
  );
}

export function ModelsPanel({
  modelId,
  onModel,
}: {
  modelId: string;
  onModel: (id: string) => void;
}) {
  const [pending, setPending] = useState(modelId);
  useEffect(() => setPending(modelId), [modelId]);
  const dirty = pending !== modelId;
  const pendingModel = FORECAST_MODELS.find((m) => m.id === pending);

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Forecasting models — comparison and selection</h2>
          <p className="text-sm text-muted-foreground">
            Five candidate approaches were back-tested on the synthetic book. Pick a model below, then choose Update
            dashboard to re-run the forecast, KPIs and breakdowns with that model&apos;s behaviour.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-xs text-muted-foreground">
            {dirty ? `Pending: ${pendingModel?.name}` : "Dashboard is up to date"}
          </p>
          <Button size="sm" disabled={!dirty} onClick={() => onModel(pending)}>
            Update dashboard
          </Button>
        </div>
      </div>


      <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
        {FORECAST_MODELS.map((m: ForecastModel) => {
          const active = m.id === pending;
          const live = m.id === modelId;
          return (
            <Card
              key={m.id}
              role="radio"
              aria-checked={active}
              tabIndex={0}
              onClick={() => setPending(m.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setPending(m.id);
                }
              }}
              className={cn(
                "cursor-pointer border-border p-4 transition-colors hover:border-primary/60",
                active && "border-primary ring-1 ring-primary",
              )}
            >
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2",
                    active ? "border-primary" : "border-muted-foreground",
                  )}
                >
                  {active && <span className="h-2 w-2 rounded-full bg-primary" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{m.name}</p>
                    {live && (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
                        Model in use
                      </span>
                    )}
                    {!live && active && (
                      <span className="rounded-full border border-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                        Selected — not applied
                      </span>
                    )}
                    {m.champion && !live && (
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Champion
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{m.family}</p>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{m.summary}</p>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
                    <div>
                      <p className="text-muted-foreground">Back-test MAPE</p>
                      <p className="font-semibold tabular-nums text-primary">{m.mape.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Explainability</p>
                      <Rating value={m.explainability} />
                    </div>
                    <div>
                      <p className="text-muted-foreground">Retrain time</p>
                      <p className="font-medium text-foreground">{m.runtime}</p>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-status-go">Pros</p>
                      <ul className="mt-1 space-y-1">
                        {m.pros.map((p) => (
                          <li key={p} className="text-xs leading-snug text-muted-foreground">
                            + {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-status-stop">Cons</p>
                      <ul className="mt-1 space-y-1">
                        {m.cons.map((c) => (
                          <li key={c} className="text-xs leading-snug text-muted-foreground">
                            − {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        Selection rationale: gradient boosted trees were chosen for production because they gave the lowest back-tested
        error while still producing driver-level attribution that maps onto the decision tree. The hybrid ensemble is
        retained as the fallback should monitoring show drift.
      </p>
    </section>
  );
}
