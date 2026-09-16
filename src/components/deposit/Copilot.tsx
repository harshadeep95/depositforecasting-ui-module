import { useState } from "react";
import { Bot, Send, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { askDepositCopilot } from "@/lib/qa.functions";
import { fmtGBP, fmtPct, type Breakdown, type Insight, type Kpis, type Scenario } from "@/lib/deposit-data";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Why is the forecast moving away from baseline?",
  "What if the base rate rises 50bps?",
  "Which segment is most at risk of outflow?",
  "Summarise this for the board in three bullets",
];

export function buildContext(
  kpis: Kpis,
  scenario: Scenario,
  bySegment: Breakdown[],
  byProduct: Breakdown[],
  insights: Insight[],
  personaRole: string,
) {
  return [
    `Viewer persona: ${personaRole}`,
    `Horizon: ${scenario.horizon} months`,
    `Scenario: base rate ${scenario.baseRateBps}bps, own offer ${scenario.offerRateBps}bps, competitor pressure ${scenario.competitorPressureBps}bps, acquisition uplift ${scenario.marketingUplift}%, attrition shock ${scenario.attritionShock}%, seasonality ${scenario.seasonality}x`,
    `Current deposit balance: ${fmtGBP(kpis.balance)} (${fmtPct(kpis.deltaPct)} YoY) across ${kpis.accounts} accounts / ${kpis.customers} customers`,
    `Forecast at horizon: ${fmtGBP(kpis.forecast)} vs baseline ${fmtGBP(kpis.baselineForecast)} (${fmtPct(kpis.vsBaselinePct)})`,
    `Net flow 12m: ${fmtGBP(kpis.netFlow)}; cost of funds ${kpis.costOfFunds.toFixed(2)}%; attrition ${(kpis.attritionRate * 100).toFixed(1)}% annualised; MAPE ${kpis.mape.toFixed(1)}%`,
    `By segment: ${bySegment.map((s) => `${s.name} ${fmtGBP(s.balance)} -> ${fmtGBP(s.forecast)} (${fmtPct(s.deltaPct)})`).join("; ")}`,
    `By product: ${byProduct.map((p) => `${p.name} ${fmtGBP(p.balance)} -> ${fmtGBP(p.forecast)} (${fmtPct(p.deltaPct)})`).join("; ")}`,
    `Current insights: ${insights.map((i) => i.title).join("; ")}`,
  ].join("\n");
}

function localAnswer(question: string, kpis: Kpis, scenario: Scenario, bySegment: Breakdown[]) {
  const q = question.toLowerCase();
  const worst = [...bySegment].sort((a, b) => a.deltaPct - b.deltaPct)[0];
  const best = [...bySegment].sort((a, b) => b.deltaPct - a.deltaPct)[0];
  if (q.includes("risk") || q.includes("outflow") || q.includes("attrition")) {
    return `**${worst?.name ?? "No segment"}** carries the greatest outflow risk: forecast ${fmtPct(worst?.deltaPct ?? 0)} to ${fmtGBP(worst?.forecast ?? 0)}, against blended attrition of ${(kpis.attritionRate * 100).toFixed(1)}% annualised.\n\n- Competitor pressure is set at ${scenario.competitorPressureBps}bps\n- Attrition shock is set at ${scenario.attritionShock}%`;
  }
  if (q.includes("what if") || q.includes("rate") || q.includes("price") || q.includes("bps")) {
    return `At the current settings the book lands at **${fmtGBP(kpis.forecast)}**, ${fmtPct(kpis.vsBaselinePct)} against baseline.\n\n- Base rate ${scenario.baseRateBps}bps, own offer ${scenario.offerRateBps}bps, competitor pressure ${scenario.competitorPressureBps}bps\n- Move the *Own savings offer* slider to test repricing; the model responds roughly ${(kpis.vsBaselinePct / Math.max(1, Math.abs(scenario.offerRateBps) || 1)).toFixed(3)}% of balance per bps\n- Every 10bps costs about ${fmtGBP(kpis.balance * 0.001)} a year in interest expense`;
  }
  if (q.includes("cost of funds") || q.includes("margin") || q.includes("nim")) {
    return `Blended cost of funds is **${kpis.costOfFunds.toFixed(2)}%** on ${fmtGBP(kpis.balance)} of balances.\n\n- Annual interest expense is around ${fmtGBP((kpis.balance * kpis.costOfFunds) / 100)}\n- Matching a 25bps competitor move across the book would add roughly ${fmtGBP(kpis.balance * 0.0025)} a year`;
  }
  if (q.includes("accuracy") || q.includes("mape") || q.includes("confidence") || q.includes("model")) {
    return `Back-test **MAPE is ${kpis.mape.toFixed(1)}%**, inside the 5% tolerance band.\n\n- The confidence band widens to about ±${(1.2 + scenario.horizon * 0.42).toFixed(1)}% by month ${scenario.horizon}\n- Drivers are trend, seasonality, rate elasticity and attrition, fitted on 60 months of synthetic flow data`;
  }
  if (q.includes("grow") || q.includes("best") || q.includes("win") || q.includes("opportunit")) {
    return `**${best?.name}** is the strongest performer at ${fmtPct(best?.deltaPct ?? 0)}, reaching ${fmtGBP(best?.forecast ?? 0)} at horizon.\n\n- It is the most rate-elastic cohort in the filtered book, so repricing lands hardest here\n- ${worst?.name} lags at ${fmtPct(worst?.deltaPct ?? 0)} and needs a retention rather than acquisition play`;
  }
  if (q.includes("board") || q.includes("summar") || q.includes("exec")) {
    return `- Deposits at **${fmtGBP(kpis.balance)}**, forecast **${fmtGBP(kpis.forecast)}** over ${scenario.horizon} months (${fmtPct(kpis.vsBaselinePct)} vs baseline)\n- **${best?.name}** is the growth engine at ${fmtPct(best?.deltaPct ?? 0)}; **${worst?.name}** is the drag at ${fmtPct(worst?.deltaPct ?? 0)}\n- Cost of funds ${kpis.costOfFunds.toFixed(2)}%, model MAPE ${kpis.mape.toFixed(1)}%`;
  }

  return `Under the active filters and scenario the book moves from **${fmtGBP(kpis.balance)}** to **${fmtGBP(kpis.forecast)}** (${fmtPct(kpis.vsBaselinePct)} vs baseline).\n\n- Strongest: ${best?.name} ${fmtPct(best?.deltaPct ?? 0)}\n- Weakest: ${worst?.name} ${fmtPct(worst?.deltaPct ?? 0)}\n- Net flow over the last 12 months: ${fmtGBP(kpis.netFlow)}`;
}

function Markdown({ text }: { text: string }) {
  const render = (line: string) =>
    line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**"))
        return (
          <strong key={i} className="font-semibold text-foreground">
            {part.slice(2, -2)}
          </strong>
        );
      if (part.startsWith("*") && part.endsWith("*") && part.length > 2)
        return <em key={i}>{part.slice(1, -1)}</em>;
      return <span key={i}>{part}</span>;
    });

  return (
    <div className="space-y-1.5">
      {text.split("\n").map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return null;
        if (trimmed.startsWith("###")) return <p key={i} className="font-semibold">{render(trimmed.replace(/^#+\s*/, ""))}</p>;
        if (/^[-*]\s/.test(trimmed))
          return (
            <p key={i} className="flex gap-2">
              <span className="text-primary">•</span>
              <span>{render(trimmed.slice(2))}</span>
            </p>
          );
        return <p key={i}>{render(trimmed)}</p>;
      })}
    </div>
  );
}

export function Copilot({
  context,
  kpis,
  scenario,
  bySegment,
}: {
  context: string;
  kpis: Kpis;
  scenario: Scenario;
  bySegment: Breakdown[];
}) {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "I'm Sterling, the DepositIQ analyst. Ask me about the book, the drivers behind the forecast, or any what-if scenario. Everything I see reflects your current filters and sliders — all synthetic demo data.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  const send = async (question: string) => {
    if (!question.trim() || busy) return;
    const history = messages.slice(1).map((m) => ({ role: m.role, content: m.content }));
    setMessages((m) => [...m, { role: "user", content: question }]);
    setInput("");
    setBusy(true);
    let answer = "";
    try {
      const res = await askDepositCopilot({ question, context, history });
      answer = res.ok ? res.answer! : localAnswer(question, kpis, scenario, bySegment);
    } catch {
      answer = localAnswer(question, kpis, scenario, bySegment);
    }
    setMessages((m) => [...m, { role: "assistant", content: answer }]);
    setBusy(false);
  };

  return (
    <Card className="flex h-[540px] flex-col overflow-hidden border-border p-0">
      <div className="gradient-brand flex items-center gap-2 px-4 py-3">
        <Bot className="h-4 w-4 text-primary-foreground" />
        <div>
          <p className="text-sm font-semibold text-primary-foreground">Ask Sterling</p>
          <p className="text-[11px] text-primary-foreground/75">DepositIQ AI analyst · grounded in your filters and scenario</p>
        </div>
      </div>

      <ScrollArea className="flex-1 px-4 py-3">
        <div className="space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={cn("flex gap-2", m.role === "user" && "flex-row-reverse")}>
              <div
                className={cn(
                  "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                  m.role === "user" ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground",
                )}
              >
                {m.role === "user" ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
              </div>
              <div
                className={cn(
                  "max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed",
                  m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                )}
              >
                {m.role === "user" ? m.content : <Markdown text={m.content} />}
              </div>
            </div>
          ))}
          {busy && <p className="pl-8 text-xs text-muted-foreground">Analysing the book…</p>}
        </div>
      </ScrollArea>

      <div className="border-t border-border p-3">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => void send(s)}
              className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              {s}
            </button>
          ))}
        </div>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the deposit book…"
            className="h-9 text-sm"
          />
          <Button type="submit" size="sm" className="h-9" disabled={busy}>
            <Send className="h-3.5 w-3.5" />
          </Button>
        </form>
      </div>
    </Card>
  );
}
