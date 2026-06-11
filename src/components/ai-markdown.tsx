import ReactMarkdown from "react-markdown";

export function AiMarkdown({ children }: { children: string }) {
  return (
    <div className="ai-prose text-sm text-foreground">
      <ReactMarkdown>{children}</ReactMarkdown>
    </div>
  );
}
