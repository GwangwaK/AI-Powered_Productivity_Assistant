import { AiMarkdown } from "@/components/ai-markdown";
import { ToolPage } from "@/components/tool-page";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { summarizeNotes } from "@/lib/ai.functions";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useServerFn } from "@tanstack/react-router";
import { Copy, Loader2, ScrollText, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/notes")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer · Aria" },
      {
        name: "description",
        content:
          "Turn long meeting notes into a clean summary with key points, decisions, action items, and deadlines.",
      },
    ],
  }),
  component: NotesPage,
});

function NotesPage() {
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState("");
  const fn = useServerFn(summarizeNotes);
  const mutation = useMutation({
    mutationFn: async () => fn({ data: { notes } }),
    onSuccess: (r) => setResult(r.text),
    onError: (err: Error) => toast.error(err.message),
  });

  const copy = async () => {
    await navigator.clipboard.writeText(result);
    toast.success("Summary copied to clipboard");
  };

  return (
    <ToolPage
      icon={<ScrollText className="size-5" />}
      title="Meeting Notes Summarizer"
      description="Paste raw meeting notes. Get a structured recap with decisions, action items, and owners."
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="surface-card">
          <CardContent className="space-y-3 p-5">
            <Label>Raw meeting notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={16}
              placeholder="Paste your meeting notes, transcript, or scratch notes here…"
            />
            <Button
              onClick={() => mutation.mutate()}
              disabled={notes.trim().length < 20 || mutation.isPending}
              className="w-full"
            >
              {mutation.isPending ? (
                <><Loader2 className="size-4 animate-spin" /> Summarizing…</>
              ) : (
                <><Sparkles className="size-4" /> Summarize Notes</>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="surface-card">
          <CardContent className="space-y-3 p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Structured summary</h3>
              {result && (
                <Button variant="outline" size="sm" onClick={copy}>
                  <Copy className="size-3.5" /> Copy
                </Button>
              )}
            </div>
            <div className="min-h-[360px] rounded-lg border border-border bg-background/60 p-4">
              {mutation.isPending ? (
                <div className="flex h-full min-h-[320px] items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" /> Extracting decisions and action items…
                </div>
              ) : result ? (
                <AiMarkdown>{result}</AiMarkdown>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Your structured summary will appear here.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolPage>
  );
}
