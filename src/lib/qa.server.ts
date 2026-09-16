export interface QaTurn {
  role: "user" | "assistant";
  content: string;
}

export const QA_SYSTEM_PROMPT = `You are Sterling, the AI analyst inside DepositIQ, an advisory prototype for a UK retail bank.
You answer questions about the deposit book, the forecast model and what-if scenarios.

Rules:
- ALL data is synthetic and generated for a demo. Never claim it is real, and never reference live or production systems.
- Ground every number in the CONTEXT block provided with the question. Never invent figures that contradict it.
- Be concise and executive-ready: 2-5 short bullets or a short paragraph. Use GBP, bps and percentages.
- When asked "what if", explain the direction and rough magnitude using the elasticity and scenario values in context, and suggest the slider the user should move.
- Use markdown (bold, bullets). No headings larger than ###.`;

export async function askGateway(context: string, history: QaTurn[], question: string) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return null;

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: QA_SYSTEM_PROMPT },
        ...history.slice(-8),
        { role: "user", content: `CONTEXT (synthetic demo data, current filters applied):\n${context}\n\nQUESTION: ${question}` },
      ],
    }),
  });

  if (!res.ok) {
    return { error: res.status === 429 ? "rate_limited" : res.status === 402 ? "no_credits" : "unavailable" as const };
  }
  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = json.choices?.[0]?.message?.content;
  return content ? { content } : { error: "unavailable" as const };
}
