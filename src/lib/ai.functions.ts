import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";

const MODEL = "google/gemini-3-flash-preview";

async function runPrompt(system: string, prompt: string) {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  const { createLovableAiGatewayProvider } = await import("@/lib/ai-gateway.server");
  const gateway = createLovableAiGatewayProvider(key);
  try {
    const { text } = await generateText({
      model: gateway(MODEL),
      system,
      prompt,
    });
    return { text };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("429")) {
      throw new Error("Rate limit exceeded. Please try again in a moment.");
    }
    if (message.includes("402")) {
      throw new Error("AI credits exhausted. Please add credits in your workspace billing.");
    }
    throw new Error(message);
  }
}

// ---------- Email Generator ----------
const EmailInput = z.object({
  tone: z.enum(["formal", "informal", "persuasive"]),
  audience: z.enum(["client", "manager", "team"]),
  context: z.string().min(5).max(4000),
});

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => EmailInput.parse(input))
  .handler(async ({ data }) => {
    const system = `You are an expert workplace communication assistant. Write polished, context-aware professional emails.
Output format:
- First line: "Subject: <concise subject line>"
- Blank line
- Body of the email with appropriate greeting and sign-off
Style guide:
- Tone: ${data.tone}
- Audience: ${data.audience}
- Be clear, respectful, and action-oriented.
- Do not include any commentary or markdown headings; just the email itself.`;
    const prompt = `Write an email about the following situation:\n\n${data.context}`;
    return runPrompt(system, prompt);
  });

// ---------- Notes Summarizer ----------
const NotesInput = z.object({
  notes: z.string().min(20).max(20000),
});

export const summarizeNotes = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => NotesInput.parse(input))
  .handler(async ({ data }) => {
    const system = `You are an expert meeting-notes summarizer. Read the raw meeting notes and produce a concise, well-structured summary in Markdown.
Use exactly these sections (omit a section only if there is genuinely nothing for it):

## Summary
A 2-4 sentence executive summary.

## Key Points
- Bulleted main discussion points.

## Decisions
- Bulleted decisions made.

## Action Items
| Action | Owner | Deadline |
|---|---|---|
| ... | ... | ... |

## Open Questions
- Bulleted unresolved items.

Be faithful to the source notes. If an owner or deadline is not specified, write "Unassigned" or "TBD".`;
    return runPrompt(system, `Meeting notes:\n\n${data.notes}`);
  });

// ---------- Task Planner ----------
const PlannerInput = z.object({
  horizon: z.enum(["daily", "weekly"]),
  tasks: z.string().min(5).max(10000),
  context: z.string().max(2000).optional().default(""),
});

export const generatePlan = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => PlannerInput.parse(input))
  .handler(async ({ data }) => {
    const system = `You are an elite productivity coach. Build a structured ${data.horizon} plan from the user's task list.

Output format (Markdown):

## Prioritized Schedule
${data.horizon === "daily"
  ? "Group tasks into time blocks (Morning / Midday / Afternoon / End of day). For each block, list tasks with estimated duration."
  : "Group tasks by day (Mon-Fri). For each day, list 3-5 priority tasks with estimated duration."}

## Priority Matrix
Classify each task using Eisenhower quadrants:
- **Do First** (urgent + important)
- **Schedule** (important, not urgent)
- **Delegate** (urgent, not important)
- **Eliminate** (neither)

## Time Optimization Tips
3-5 concrete suggestions tailored to these tasks (batching, focus blocks, reducing context switching, etc.).

Be specific and actionable. Never invent tasks not provided by the user, but you may break large tasks into substeps.`;
    const prompt = `Tasks:\n${data.tasks}\n\nAdditional context:\n${data.context || "(none)"}`;
    return runPrompt(system, prompt);
  });

// ---------- Research Assistant ----------
const ResearchInput = z.object({
  mode: z.enum(["summarize", "explain"]),
  content: z.string().min(10).max(20000),
});

export const research = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ResearchInput.parse(input))
  .handler(async ({ data }) => {
    const system = data.mode === "summarize"
      ? `You are an AI research analyst. Given the article, report, or topic below, produce a structured briefing in Markdown:

## TL;DR
2-3 sentence summary.

## Key Insights
- 4-6 substantive insights or findings.

## Implications & Recommendations
- 3-5 concrete recommendations or "so what" implications for a workplace audience.

## Open Questions / Caveats
- 2-4 things worth verifying or exploring further.

Stay grounded in the provided content; flag clearly if a claim is your inference.`
      : `You are an AI explainer that simplifies complex information for busy professionals. Given the content or topic below, produce in Markdown:

## In Plain Words
A clear 3-5 sentence explanation any professional can understand.

## Why It Matters
- 3-4 bullets on real-world relevance.

## Analogy
A short, memorable analogy that captures the core idea.

## Quick Reference
- 4-6 key terms with one-line definitions.`;
    return runPrompt(system, data.content);
  });
