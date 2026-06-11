import { AiMarkdown } from "@/components/ai-markdown";
import { ToolPage } from "@/components/tool-page";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { generateEmail } from "@/lib/ai.functions";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { Copy, Loader2, Mail, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator · Aria" },
      {
        name: "description",
        content: "Generate context-aware professional emails by tone and audience.",
      },
    ],
  }),
  component: EmailPage,
});

type Tone = "formal" | "informal" | "persuasive";
type Audience = "client" | "manager" | "team";

function EmailPage() {
  const [tone, setTone] = useState<Tone>("formal");
  const [audience, setAudience] = useState<Audience>("client");
  const [context, setContext] = useState("");
  const [result, setResult] = useState("");

  const fn = useServerFn(generateEmail);
  const mutation = useMutation({
    mutationFn: async () => fn({ data: { tone, audience, context } }),
    onSuccess: (r) => setResult(r.text),
    onError: (err: Error) => toast.error(err.message),
  });

  const copy = async () => {
    await navigator.clipboard.writeText(result);
    toast.success("Email copied to clipboard");
  };

  return (
    <ToolPage
      icon={<Mail className="size-5" />}
      title="Smart Email Generator"
      description="Choose tone and audience, describe the situation, and Aria writes a polished email."
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="surface-card">
          <CardContent className="space-y-4 p-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Tone</Label>
                <Select value={tone} onValueChange={(v) => setTone(v as Tone)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="informal">Informal</SelectItem>
                    <SelectItem value="persuasive">Persuasive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Audience</Label>
                <Select value={audience} onValueChange={(v) => setAudience(v as Audience)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="team">Team</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>What is the email about?</Label>
              <Textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                rows={10}
                placeholder="e.g. Follow up with Acme about the delayed Q3 deliverables, reassure them, and propose a new timeline by Friday."
              />
            </div>
            <Button
              onClick={() => mutation.mutate()}
              disabled={context.trim().length < 5 || mutation.isPending}
              className="w-full"
            >
              {mutation.isPending ? (
                <><Loader2 className="size-4 animate-spin" /> Generating…</>
              ) : (
                <><Sparkles className="size-4" /> Generate Email</>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="surface-card">
          <CardContent className="space-y-3 p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Generated email</h3>
              {result && (
                <Button variant="outline" size="sm" onClick={copy}>
                  <Copy className="size-3.5" /> Copy
                </Button>
              )}
            </div>
            <div className="min-h-[280px] rounded-lg border border-border bg-background/60 p-4">
              {mutation.isPending ? (
                <div className="flex h-full min-h-[260px] items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" /> Drafting your email…
                </div>
              ) : result ? (
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
                  {result}
                </pre>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Your email will appear here.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolPage>
  );
}
