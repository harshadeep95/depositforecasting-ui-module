import { z } from "zod";

export interface QaTurn {
  role: "user" | "assistant";
  content: string;
}

export interface AskDepositCopilotInput {
  question: string;
  context: string;
  history?: QaTurn[];
}

export interface AskDepositCopilotResult {
  ok: boolean;
  reason?: "unavailable" | "unconfigured" | "rate_limited" | "no_credits" | string;
  answer?: string;
}

const schema = z.object({
  question: z.string().min(1).max(2000),
  context: z.string().max(8000),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(4000) }))
    .max(12)
    .default([]),
});

/**
 * Client-side AI question handler for DepositIQ.
 *
 * This function attempts to get AI-generated answers using one of these methods (in order):
 * 1. OpenAI API (if VITE_OPENAI_API_KEY is configured)
 * 2. Custom backend API (if available)
 * 3. Falls back to disabled (returns unconfigured)
 *
 * In the free version, AI analysis is optional. The Copilot UI will gracefully
 * disable the AI features if no API key is configured.
 */
export async function askDepositCopilot(
  input: unknown,
): Promise<AskDepositCopilotResult> {
  try {
    const validated = schema.parse(input) as AskDepositCopilotInput;

    // Try OpenAI API if key is configured
    const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (openaiKey) {
      return await askOpenAI(openaiKey, validated);
    }

    // Try custom backend if available
    const backendUrl = import.meta.env.VITE_QA_BACKEND_URL;
    if (backendUrl) {
      return await askBackend(backendUrl, validated);
    }

    // No API configured
    return { ok: false, reason: "unconfigured" };
  } catch (error) {
    console.error("Error in askDepositCopilot:", error);
    return { ok: false, reason: "unavailable" };
  }
}

async function askOpenAI(
  apiKey: string,
  input: AskDepositCopilotInput,
): Promise<AskDepositCopilotResult> {
  const QA_SYSTEM_PROMPT = `You are Sterling, the AI analyst inside DepositIQ, an advisory prototype for a UK retail bank.
You answer questions about the deposit book, the forecast model and what-if scenarios.

Rules:
- ALL data is synthetic and generated for a demo. Never claim it is real, and never reference live or production systems.
- Ground every number in the CONTEXT block provided with the question. Never invent figures that contradict it.
- Be concise and executive-ready: 2-5 short bullets or a short paragraph. Use GBP, bps and percentages.
- When asked "what if", explain the direction and rough magnitude using the elasticity and scenario values in context, and suggest the slider the user should move.
- Use markdown (bold, bullets). No headings larger than ###.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: QA_SYSTEM_PROMPT },
          ...(input.history ?? []).slice(-8),
          {
            role: "user",
            content: `CONTEXT (synthetic demo data, current filters applied):\n${input.context}\n\nQUESTION: ${input.question}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return { ok: false, reason: "rate_limited" };
      }
      if (response.status === 401 || response.status === 403) {
        return { ok: false, reason: "unconfigured" };
      }
      return { ok: false, reason: "unavailable" };
    }

    const json = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = json.choices?.[0]?.message?.content;

    if (content) {
      return { ok: true, answer: content };
    }

    return { ok: false, reason: "unavailable" };
  } catch (error) {
    console.error("OpenAI API error:", error);
    return { ok: false, reason: "unavailable" };
  }
}

async function askBackend(
  backendUrl: string,
  input: AskDepositCopilotInput,
): Promise<AskDepositCopilotResult> {
  try {
    const response = await fetch(`${backendUrl}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      return { ok: false, reason: "unavailable" };
    }

    const result = (await response.json()) as AskDepositCopilotResult;
    return result;
  } catch (error) {
    console.error("Backend API error:", error);
    return { ok: false, reason: "unavailable" };
  }
}
