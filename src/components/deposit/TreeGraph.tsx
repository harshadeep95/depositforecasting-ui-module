import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { fmtGBP } from "@/lib/deposit-data";

export type GraphNode = {
  id: string;
  label: string;
  value: number;
  unit?: string;
  sign?: string | undefined;
  note?: string | undefined;
  formula?: string | undefined;
  kind: "calculation" | "predictive" | "baseline" | "manual" | "external";
  share?: number | undefined;
  impact?: number | undefined;
  assumption?: string | undefined;
  children?: GraphNode[] | undefined;
};

export const KIND_STYLE: Record<GraphNode["kind"], string> = {
  calculation: "bg-pacific-soft border-pacific",
  predictive: "bg-cobalt-soft border-cobalt",
  baseline: "bg-secondary border-border",
  manual: "bg-kpmg-soft border-kpmg",
  external: "bg-plum-soft border-plum",
};

export const KIND_LABEL: Record<GraphNode["kind"], string> = {
  calculation: "Calculation",
  predictive: "Predictive",
  baseline: "Baseline",
  manual: "Manual overlay",
  external: "External",
};

export function fmtNodeValue(n: GraphNode) {
  if (n.unit === "count") return Math.round(n.value).toLocaleString();
  if (n.unit === "pct") return `${n.value.toFixed(2)}%`;
  return `${n.value < 0 ? "−" : ""}${fmtGBP(Math.abs(n.value))}`;
}

function ImpactChip({ impact }: { impact: number }) {
  if (Math.abs(impact) < 1) {
    return (
      <span className="rounded bg-background/70 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
        At default
      </span>
    );
  }
  return (
    <span
      className={cn(
        "rounded px-1.5 py-0.5 text-[9px] font-semibold tabular-nums",
        impact >= 0 ? "bg-status-go/12 text-status-go" : "bg-status-stop/12 text-status-stop",
      )}
    >
      {impact >= 0 ? "+" : "−"}
      {fmtGBP(Math.abs(impact))}
    </span>
  );
}

function NodeCard({
  node,
  root,
  open,
  onToggle,
  hasChildren,
}: {
  node: GraphNode;
  root?: boolean;
  open: boolean;
  onToggle: () => void;
  hasChildren: boolean;
}) {
  return (
    <div
      className={cn(
        "w-[268px] shrink-0 rounded-lg border px-3 py-2 shadow-sm",
        root ? "border-primary bg-primary/5" : KIND_STYLE[node.kind],
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={onToggle}
          disabled={!hasChildren}
          className="flex min-w-0 flex-1 items-start gap-1 text-left"
        >
          {hasChildren ? (
            open ? (
              <ChevronDown className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-60" />
            ) : (
              <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-60" />
            )
          ) : (
            <span className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          )}
          <span className="min-w-0">
            <span className="block text-xs font-semibold leading-tight text-navy">
              {node.sign ? <span className="mr-1 opacity-60">{node.sign}</span> : null}
              {node.label}
            </span>
            {node.formula ? (
              <span className="mt-0.5 block text-[10px] leading-snug text-navy/60">{node.formula}</span>
            ) : node.note ? (
              <span className="mt-0.5 block text-[10px] leading-snug text-navy/60">{node.note}</span>
            ) : null}
          </span>
        </button>
        <div className="shrink-0 text-right">
          <p className="whitespace-nowrap text-sm font-semibold tabular-nums text-navy">{fmtNodeValue(node)}</p>
          {typeof node.share === "number" ? (
            <p className="text-[9px] text-navy/60">{node.share.toFixed(1)}% of closing</p>
          ) : null}
        </div>
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
        <span className="rounded bg-background/70 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wider text-navy/70">
          {KIND_LABEL[node.kind]}
        </span>
        {typeof node.impact === "number" ? <ImpactChip impact={node.impact} /> : null}
        {node.assumption ? (
          <span className="rounded bg-background/70 px-1.5 py-0.5 text-[9px] font-semibold text-primary">
            Adjustable
          </span>
        ) : null}
      </div>
    </div>
  );
}

function Branch({ node, depth, defaultDepth }: { node: GraphNode; depth: number; defaultDepth: number }) {
  const children = node.children ?? [];
  const [open, setOpen] = useState(depth < defaultDepth);
  return (
    <div className="flex items-start">
      <NodeCard
        node={node}
        root={depth === 0}
        open={open}
        hasChildren={children.length > 0}
        onToggle={() => setOpen((o) => !o)}
      />
      {children.length > 0 && open ? (
        <div className="tree-children">
          {children.map((c) => (
            <div key={c.id} className="tree-child">
              <Branch node={c} depth={depth + 1} defaultDepth={defaultDepth} />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function TreeGraph({ root, defaultDepth = 2 }: { root: GraphNode; defaultDepth?: number }) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="min-w-max py-1">
        <Branch node={root} depth={0} defaultDepth={defaultDepth} />
      </div>
    </div>
  );
}

export function TreeLegend() {
  return (
    <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
      {(Object.keys(KIND_LABEL) as GraphNode["kind"][]).map((k) => (
        <span key={k} className="flex items-center gap-1.5">
          <span className={cn("h-2.5 w-2.5 rounded-sm border", KIND_STYLE[k])} />
          {KIND_LABEL[k]}
        </span>
      ))}
    </div>
  );
}
