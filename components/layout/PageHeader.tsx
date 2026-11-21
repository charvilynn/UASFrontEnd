import React from "react";
import { Breadcrumbs } from "./Breadcrumbs";
import { BackButton } from "./BackButton";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  fallbackHref?: string;
  breadcrumbLabel?: string;
  actions?: React.ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  fallbackHref,
  breadcrumbLabel,
  actions,
}: PageHeaderProps) {
  return (
    <div className="mx-auto max-w-[1280px] px-4 pt-8 pb-6 sm:px-6 lg:px-8">
      <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-[var(--fg-muted)]">
        <BackButton fallbackHref={fallbackHref} />
        <Breadcrumbs currentLabel={breadcrumbLabel} />
      </div>

      <div className="flex flex-col justify-between gap-4 border-b border-[var(--border)] pb-6 md:flex-row md:items-end">
        <div>
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-[var(--fg)] sm:text-3xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-[var(--fg-muted)]">
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}