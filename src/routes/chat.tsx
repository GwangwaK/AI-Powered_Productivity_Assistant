import { DisclaimerBanner } from "@/components/disclaimer-banner";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
import { useChat } from "@ai-sdk/react";
import { createFileRoute } from "@tanstack/react-router";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Bot, MessageSquare, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Chat with Aria · AI Workplace Assistant" },
      {
        name: "description",
        content:
          "Interactive AI chat for drafting, planning, brainstorming, and workplace Q&A.",
      },
    ],
  }),
  component: ChatPage,
});

const STORAGE_KEY = "aria.chat.v1";

type StoredChat = { id: string; messages: UIMessage[] };

function loadInitial(): StoredChat {
  if (typeof window === "undefined") {
    return { id: crypto.randomUUID(), messages: [] };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StoredChat;
      if (parsed?.id && Array.isArray(parsed.messages)) return parsed;
    }
  } catch {
    // ignore
  }
  return { id: crypto.randomUUID(), messages: [] };
}

const SUGGESTIONS = [
  "Help me draft a polite reply declining a meeting.",
  "Summarize this paragraph in one sentence: …",
  "Give me 5 questions to ask in a 1:1 with my new manager.",
  "Plan my next 2 hours for deep focus.",
];

function ChatPage() {
  const [initial] = useState(loadInitial);
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);
  const { messages, sendMessage, status, setMessages, stop } = useChat({
    id: initial.id,
    messages: initial.messages,
    transport,
    onError: (err) => toast.error(err.message || "Chat error"),
  });

  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Persist messages to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const payload: StoredChat = { id: initial.id, messages };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore
    }
  }, [messages, initial.id]);

  // Focus composer
  useEffect(() => {
    textareaRef.current?.focus();
  }, [status]);

  const isBusy = status === "submitted" || status === "streaming";

  const handleSubmit = async (_message: unknown, e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isBusy) return;
    setInput("");
    await sendMessage({ text });
  };

  const reset = () => {
    setMessages([]);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-3.5rem)] w-full max-w-4xl flex-col px-4 py-4 sm:px-6">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-brand text-brand-foreground shadow-sm">
            <MessageSquare className="size-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              <span className="gradient-text">Chat with Aria</span>
            </h1>
            <p className="text-xs text-muted-foreground">
              Your interactive workplace copilot. Saved in this browser.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DisclaimerBanner />
          {messages.length > 0 && (
            <Button variant="outline" size="sm" onClick={reset}>
              <RotateCcw className="size-3.5" /> New chat
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-card/60 shadow-sm backdrop-blur">
        <Conversation className="flex-1">
          <ConversationContent>
            {messages.length === 0 ? (
              <ConversationEmptyState
                icon={<Bot className="size-8" />}
                title="Say hello to Aria"
                description="Ask anything — drafting, planning, summarizing, brainstorming."
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-brand text-brand-foreground shadow-sm">
                    <Bot className="size-6" />
                  </div>
                  <div className="space-y-1 text-center">
                    <h3 className="text-base font-semibold">Say hello to Aria</h3>
                    <p className="text-sm text-muted-foreground">
                      Try one of these, or type your own question.
                    </p>
                  </div>
                  <div className="grid w-full max-w-md grid-cols-1 gap-2 sm:grid-cols-2">
                    {SUGGESTIONS.map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => {
                          setInput(s);
                          textareaRef.current?.focus();
                        }}
                        className="rounded-lg border border-border bg-background/60 p-3 text-left text-xs text-foreground transition-colors hover:bg-accent/40"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </ConversationEmptyState>
            ) : (
              messages.map((m) => (
                <Message key={m.id} from={m.role}>
                  <MessageContent>
                    {m.parts.map((part, i) => {
                      if (part.type === "text") {
                        return m.role === "assistant" ? (
                          <MessageResponse key={i}>{part.text}</MessageResponse>
                        ) : (
                          <span key={i} className="whitespace-pre-wrap">
                            {part.text}
                          </span>
                        );
                      }
                      return null;
                    })}
                  </MessageContent>
                </Message>
              ))
            )}
            {status === "submitted" && (
              <Message from="assistant">
                <MessageContent>
                  <Shimmer>Thinking…</Shimmer>
                </MessageContent>
              </Message>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <div className="border-t border-border bg-background/60 p-3">
          <PromptInput onSubmit={handleSubmit}>
            <PromptInputTextarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Aria anything about your work…"
              disabled={isBusy}
            />
            <PromptInputFooter className="justify-end">
              <PromptInputSubmit
                status={status}
                onStop={stop}
                disabled={!input.trim() && !isBusy}
              />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}
