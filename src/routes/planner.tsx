import { AiMarkdown } from "@/components/ai-markdown";
import { ToolPage } from "@/components/tool-page";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { generatePlan } from "@/lib/ai.functions";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CalendarRange, Copy, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner · Aria" },
      {
        name: "description",
        content:
          "Generate a prioritized daily or weekly plan with time blocks, an Eisenhower matrix, and optimization tips.",
      },
    ],
  }),
  component: PlannerPage,
});

function PlannerPage() {
  const [horizon, setHorizon] = useState<"daily" | "weekly">("daily");
  const [tasks, setTasks] = useState("");
  const [context, setContext] = useState("");
  const [result, setResult] = useState("");

  const fn = useServerFn(generatePlan);
  const mutation = useMutation({
    mutationFn: async () => fn({ data: { horizon, tasks, context } }),
    onSuccess: (r) => setResult(r.text),
    onError: (err: Error) => toast.error(err.message),
  });

  const copy = async () => {
    await navigator.clipboard.writeText(result);
    toast.success("Plan copied to clipboard");
  };

  return (
    <ToolPage
      icon={<CalendarRange className="size-5" />}
      title="AI Task Planner"
      description="Drop in your tasks. Aria prioritizes them, builds a schedule, and suggests time-saving moves."
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="surface-card">
          <CardContent className="space-y-4 p-5">
            <div className="space-y-1.5">
              <Label>Plan horizon</Label>
              <Tabs value={horizon} onValueChange={(v) => setHorizon(v as "daily" | "weekly")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="daily">Daily</TabsTrigger>
                  <TabsTrigger value="weekly">Weekly</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="space-y-1.5">
              <Label>Your tasks (one per line)</Label>
              <Textarea
                value={tasks}
                onChange={(e) => setTasks(e.target.value)}
                rows={9}
                placeholder={`Finish Q3 board deck\nReview Acme proposal by Thursday\n1:1 with Priya\nClear inbox triage\nDraft hiring plan for engineering`}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Context (optional)</Label>
              <Textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                rows={3}
                placeholder="e.g. I'm most focused in the morning; Wednesday is meeting-heavy."
              />
            </div>
            <Button
              onClick={() => mutation.mutate()}
              disabled={tasks.trim().length < 5 || mutation.isPending}
              className="w-full"
            >
              {mutation.isPending ? (
                <><Loader2 className="size-4 animate-spin" /> Building plan…</>
              ) : (
                <><Sparkles className="size-4" /> Generate Plan</>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="surface-card">
          <CardContent className="space-y-3 p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Your prioritized plan</h3>
              {result && (
                <Button variant="outline" size="sm" onClick={copy}>
                  <Copy className="size-3.5" /> Copy
                </Button>
              )}
            </div>
            <div className="min-h-[420px] rounded-lg border border-border bg-background/60 p-4">
              {mutation.isPending ? (
                <div className="flex h-full min-h-[380px] items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" /> Prioritizing and scheduling…
                </div>
              ) : result ? (
                <AiMarkdown>{result}</AiMarkdown>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Your structured plan will appear here.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolPage>
  );
}
