import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarRange,
  Mail,
  MessageSquare,
  ScrollText,
  Sparkles,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aria — AI Workplace Productivity Assistant" },
      {
        name: "description",
        content:
          "Aria is your AI workplace copilot: draft emails, summarize meetings, plan tasks, research topics, and chat with an always-on assistant.",
      },
    ],
  }),
  component: Index,
});

const features = [
  {
    title: "Smart Email Generator",
    description: "Pick a tone and audience. Get a polished, ready-to-send email in seconds.",
    icon: Mail,
    href: "/email" as const,
    accent: "from-sky-500/15 to-cyan-400/10",
  },
  {
    title: "Meeting Notes Summarizer",
    description: "Turn raw notes into key points, decisions, action items, and deadlines.",
    icon: ScrollText,
    href: "/notes" as const,
    accent: "from-amber-400/20 to-orange-300/10",
  },
  {
    title: "AI Task Planner",
    description:
      "Build a daily or weekly plan, prioritize by urgency and importance, and free up focus time.",
    icon: CalendarRange,
    href: "/planner" as const,
    accent: "from-emerald-400/20 to-teal-300/10",
  },
  {
    title: "AI Research Assistant",
    description: "Summarize articles or topics with key insights, recommendations, and plain-language explainers.",
    icon: Sparkles,
    href: "/research" as const,
    accent: "from-violet-500/15 to-fuchsia-400/10",
  },
  {
    title: "Chat with Aria",
    description: "Open-ended chat for brainstorming, drafting, decisions, and anything else workplace-related.",
    icon: MessageSquare,
    href: "/chat" as const,
    accent: "from-rose-400/15 to-pink-400/10",
  },
];

function Index() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <section className="mb-10 flex flex-col gap-6">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-brand/30 bg-brand-soft px-3 py-1 text-xs font-medium text-brand">
          <Zap className="size-3.5" />
          AI-powered workplace copilot
        </div>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Get an hour back, <span className="gradient-text">every day.</span>
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
          Aria drafts your emails, summarizes your meetings, plans your week, and researches whatever
          you throw at it — so you can spend your time on the work that actually moves the needle.
        </p>
        <DisclaimerBanner className="max-w-md" />
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <Link key={f.href} to={f.href} className="group block">
            <Card className="surface-card relative h-full overflow-hidden transition-transform duration-200 hover:-translate-y-0.5">
              <div
                className={`absolute inset-0 -z-10 bg-gradient-to-br ${f.accent} opacity-60`}
                aria-hidden
              />
              <CardHeader>
                <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-card text-brand shadow-sm ring-1 ring-border">
                  <f.icon className="size-5" />
                </div>
                <CardTitle className="text-base">{f.title}</CardTitle>
                <CardDescription className="text-sm">{f.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-brand">
                  Open <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  );
}
