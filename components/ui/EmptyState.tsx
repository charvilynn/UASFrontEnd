import React from "react";
import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
}

export function EmptyState({
  title,
  description,
  actionLabel = "Jelajahi Katalog Buku",
  actionHref = "/explore",
  secondaryActionLabel,
  secondaryActionHref,
}: EmptyStateProps) {
  return (
    <div className="my-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)]/60 px-6 py-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#92400E]/15 text-[#92400E] dark:text-amber-400">
        <BookOpen className="h-6 w-6" />
      </div>
      <h3 className="font-heading text-lg font-bold text-[var(--fg)]">
        {title}
      </h3>
      <p className="mt-1.5 max-w-md text-sm text-[var(--fg-muted)]">
        {description}
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <Link
          href={actionHref}
          className="inline-flex items-center gap-2 rounded-lg bg-[#92400E] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#78350F]"
        >
          <span>{actionLabel}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        {secondaryActionLabel && secondaryActionHref && (
          <Link
            href={secondaryActionHref}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-xs font-semibold text-[var(--fg)] transition-colors hover:border-[#92400E]"
          >
            {secondaryActionLabel}
          </Link>
        )}
      </div>
    </div>
  );
}