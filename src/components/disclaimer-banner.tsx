import { AlertTriangle } from "lucide-react";

export function DisclaimerBanner({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-start gap-2 rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-foreground/80 ${className}`}
      role="note"
    >
      <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-warning" />
      <span>
        <span className="font-medium">Heads up:</span> AI-generated content may require human review.
      </span>
    </div>
  );
}
