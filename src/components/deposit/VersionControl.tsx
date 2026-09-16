import { Card } from "@/components/ui/card";
import { useAuditLog } from "@/lib/audit-store";

const timeFmt = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

const AREA_TONE: Record<string, string> = {
  Persona: "bg-secondary text-secondary-foreground",
  Filters: "bg-secondary text-secondary-foreground",
  Horizon: "bg-secondary text-secondary-foreground",
  Scenario: "bg-secondary text-secondary-foreground",
  Model: "bg-primary text-primary-foreground",
  Assumptions: "bg-secondary text-secondary-foreground",
};

export function VersionControl() {
  const entries = useAuditLog();

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Version control — change log</h2>
        <p className="text-sm text-muted-foreground">
          Every scenario, model, filter and assumption change made in this session, recorded against the persona that
          made it. In a deployed build this log is written to the audit store alongside the model run reference.
        </p>
      </div>

      <Card className="overflow-x-auto border-border p-0">
        <table className="w-full min-w-[680px] text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/60 text-left">
              <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Version</th>
              <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">When</th>
              <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Persona</th>
              <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Area</th>
              <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Change</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-sm text-muted-foreground">
                  No changes recorded yet. Switch persona, adjust the horizon, change the model or move a what-if
                  control and the change will appear here.
                </td>
              </tr>
            )}
            {entries.map((e, i) => (
              <tr key={e.id} className="border-b border-border last:border-0">
                <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                  v{(entries.length - i).toString().padStart(3, "0")}
                </td>
                <td className="px-3 py-2 whitespace-nowrap tabular-nums text-muted-foreground">{timeFmt.format(e.ts)}</td>
                <td className="px-3 py-2">
                  <span className="font-medium text-foreground">{e.persona}</span>
                  <span className="block text-xs text-muted-foreground">{e.role}</span>
                </td>
                <td className="px-3 py-2">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                      AREA_TONE[e.area] ?? "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {e.area}
                  </span>
                </td>
                <td className="px-3 py-2 text-muted-foreground">{e.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </section>
  );
}
