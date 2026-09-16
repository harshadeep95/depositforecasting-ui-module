import { useState } from "react";
import { MessageSquare, X } from "lucide-react";
import { Copilot } from "@/components/deposit/Copilot";
import { cn } from "@/lib/utils";
import type { Breakdown, Kpis, Scenario } from "@/lib/deposit-data";

interface Props {
  context: string;
  kpis: Kpis;
  scenario: Scenario;
  bySegment: Breakdown[];
}

export function FloatingCopilot(props: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      <div
        className={cn(
          "pointer-events-auto w-[min(92vw,400px)] origin-bottom-right transition-all duration-200",
          open ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0",
        )}
        aria-hidden={!open}
      >
        <div className="overflow-hidden rounded-xl shadow-2xl ring-1 ring-border">
          <Copilot {...props} />
        </div>
      </div>

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close Sterling" : "Ask Sterling"}
        className="pointer-events-auto flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-xl transition-transform hover:scale-105"
      >
        {open ? <X className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
        {open ? "Close" : "Ask Sterling"}
      </button>
    </div>
  );
}
