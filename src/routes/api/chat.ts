import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

type ChatRequestBody = { messages?: unknown };

const SYSTEM_PROMPT = `You are Aria, a friendly and highly capable AI workplace productivity assistant.
Your job is to help professionals work smarter: drafting communications, summarizing information, planning tasks, brainstorming ideas, and answering work-related questions.

Guidelines:
- Be concise, structured, and action-oriented. Prefer short paragraphs, bullet lists, and tables when helpful.
- When the user asks for something open-ended, ask one clarifying question before diving in, unless the request is already clear.
- Always end actionable outputs with a brief "Next step" suggestion when appropriate.
- Format responses in Markdown.
- If you don't know something or it depends on private context, say so.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as ChatRequestBody;
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        const key = process.env.LOVABLE_API_KEY;
        if (!key) {
          return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        }

        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-3-flash-preview");
        const result = streamText({
          model,
          system: SYSTEM_PROMPT,
          messages: await convertToModelMessages(messages as UIMessage[]),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages as UIMessage[],
        });
      },
    },
  },
});
