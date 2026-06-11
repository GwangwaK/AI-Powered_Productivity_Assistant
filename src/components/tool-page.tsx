import { DisclaimerBanner } from "@/components/disclaimer-banner";
import type { ReactNode } from "react";

export function ToolPage({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-10">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-brand text-brand-foreground shadow-sm">
            {icon}
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              <span className="gradient-text">{title}</span>
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <DisclaimerBanner className="sm:max-w-xs" />
      </div>
      {children}
    </div>
  );
}
