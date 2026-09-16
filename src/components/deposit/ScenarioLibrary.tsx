import { useState } from "react";
import { BookmarkPlus, Check, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useScenarioLibrary, BUILT_IN_SCENARIOS, type SavedScenario } from "@/lib/assumption-store";
import { ASSUMPTION_CONTROLS, DEFAULT_ASSUMPTIONS, type TreeAssumptions } from "@/lib/deposit-data";

function sameAssumptions(a: TreeAssumptions, b: TreeAssumptions) {
  return ASSUMPTION_CONTROLS.every((c) => a[c.key] === b[c.key]);
}

function changedCount(a: TreeAssumptions) {
  return ASSUMPTION_CONTROLS.filter((c) => a[c.key] !== DEFAULT_ASSUMPTIONS[c.key]).length;
}

export function ScenarioLibrary({
  assumptions,
  onApply,
}: {
  assumptions: TreeAssumptions;
  onApply: (a: TreeAssumptions) => void;
}) {
  const { userScenarios, saveScenario, deleteScenario } = useScenarioLibrary();
  const [name, setName] = useState("");

  const all: SavedScenario[] = [...BUILT_IN_SCENARIOS, ...userScenarios];

  return (
    <Card className="border-border p-4">
      <div>
        <p className="text-sm font-semibold text-foreground">Scenario library</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Apply a saved set of assumptions in one click, or store the current sliders for reuse.
        </p>
      </div>

      <div className="mt-3 space-y-1.5">
        {all.map((s) => {
          const active = sameAssumptions(assumptions, s.assumptions);
          return (
            <div
              key={s.id}
              className={cn(
                "flex items-start gap-2 rounded-md border px-2.5 py-2 transition-colors",
                active ? "border-primary bg-primary/5" : "border-border hover:bg-secondary",
              )}
            >
              <button type="button" onClick={() => onApply(s.assumptions)} className="min-w-0 flex-1 text-left">
                <span className="flex items-center gap-1.5">
                  {active ? <Check className="h-3.5 w-3.5 shrink-0 text-primary" /> : null}
                  <span className="truncate text-xs font-semibold text-foreground">{s.name}</span>
                  {s.builtIn ? (
                    <span className="shrink-0 rounded bg-secondary px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Preset
                    </span>
                  ) : null}
                </span>
                <span className="mt-0.5 block text-[10px] leading-snug text-muted-foreground">
                  {s.note ?? `${changedCount(s.assumptions)} driver${changedCount(s.assumptions) === 1 ? "" : "s"} off default`}
                </span>
              </button>
              {s.builtIn ? null : (
                <button
                  type="button"
                  aria-label={`Delete ${s.name}`}
                  onClick={() => deleteScenario(s.id)}
                  className="mt-0.5 shrink-0 text-muted-foreground hover:text-status-stop"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          saveScenario(name, assumptions);
          setName("");
        }}
      >
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name current assumptions"
          className="h-8 text-xs"
        />
        <Button type="submit" size="sm" disabled={!name.trim()}>
          <BookmarkPlus className="mr-1.5 h-3.5 w-3.5" />
          Save
        </Button>
      </form>
    </Card>
  );
}
