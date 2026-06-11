import { AiMarkdown } from "@/components/ai-markdown";
import { ToolPage } from "@/components/tool-page";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { research } from "@/lib/ai.functions";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useServerFn } from "@tanstack/react-router";
import { Copy, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant · Aria" },
      {
        name: "description",
        content:
          "Summarize articles or topics with key insights, recommendations, and plain-language explainers.",
      },
    ],
  }),
  component: ResearchPage,
});

function ResearchPage() {
  const [mode, setMode] = useState<"summarize" | "explain">("summarize");
  const [content, setContent] = useState("");
  const [result, setResult] = useState("");
  const fn = useServerFn(research);
  const mutation = useMutation({
    mutationFn: async () => fn({ data: { mode, content } }),
    onSuccess: (r) => setResult(r.text),
    onError: (err: Error) => toast.error(err.message),
  });

  const copy = async () => {
    await navigator.clipboard.writeText(result);
    toast.success("Briefing copied to clipboard");
  };

  return (
    <ToolPage
      icon={<Sparkles className="size-5" />}
      title="AI Research Assistant"
      description="Paste an article, report, or just name a topic. Aria delivers a clean briefing or a plain-language explainer."
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="surface-card">
          <CardContent className="space-y-4 p-5">
            <div className="space-y-1.5">
              <Label>Mode</Label>
              <Tabs value={mode} onValueChange={(v) => setMode(v as "summarize" | "explain")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="summarize">Summarize &amp; Recommend</TabsTrigger>
                  <TabsTrigger value="explain">Explain Simply</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="space-y-1.5">
              <Label>{mode === "summarize" ? "Article, report, or topic" : "Topic or complex content"}</Label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={14}
                placeholder={
                  mode === "summarize"
                    ? "Paste an article, report, or a topic like 'the impact of GLP-1 drugs on the food industry'…"
                    : "Paste a dense paragraph or just write a topic like 'how does Kubernetes scheduling work?'…"
                }
              />
            </div>
            <Button
              onClick={() => mutation.mutate()}
              disabled={content.trim().length < 10 || mutation.isPending}
              className="w-full"
            >
              {mutation.isPending ? (
                <><Loader2 className="size-4 animate-spin" /> Researching…</>
              ) : (
                <><Sparkles className="size-4" /> {mode === "summarize" ? "Generate Briefing" : "Explain It"}</>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="surface-card">
          <CardContent className="space-y-3 p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">
                {mode === "summarize" ? "Research briefing" : "Plain-language explainer"}
              </h3>
              {result && (
                <Button variant="outline" size="sm" onClick={copy}>
                  <Copy className="size-3.5" /> Copy
                </Button>
              )}
            </div>
            <div className="min-h-[420px] rounded-lg border border-border bg-background/60 p-4">
              {mutation.isPending ? (
                <div className="flex h-full min-h-[380px] items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" /> Pulling key insights together…
                </div>
              ) : result ? (
                <AiMarkdown>{result}</AiMarkdown>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Your briefing will appear here.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolPage>
  );
}
