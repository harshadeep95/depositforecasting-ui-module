import { Card } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { TreeGraph, TreeLegend, type GraphNode } from "@/components/deposit/TreeGraph";
import type { DriverNode } from "@/lib/deposit-data";

export function DriverTree({ tree }: { tree: DriverNode }) {
  return (
    <section className="min-w-0 space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Forecast decision tree</h2>
          <p className="text-sm text-muted-foreground">
            How the closing deposit balance is built up. Click a node to expand or collapse its drivers.
          </p>
        </div>
        <Link
          to="/decision-tree"
          className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-primary hover:bg-secondary"
        >
          Open full tree &amp; assumptions
        </Link>
      </div>

      <Card className="min-w-0 gradient-wash border-border p-4">
        <div className="pr-1">
          <TreeGraph root={tree as unknown as GraphNode} defaultDepth={2} />
        </div>
        <div className="mt-3">
          <TreeLegend />
        </div>
      </Card>
    </section>
  );
}
