"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { buildBreadcrumbChain } from "@/config/routes";

interface BreadcrumbsProps {
  currentLabel?: string;
}

export function Breadcrumbs({ currentLabel }: BreadcrumbsProps) {
  const pathname = usePathname();
  const items = buildBreadcrumbChain(pathname, currentLabel);
  const depth = pathname.split("/").filter(Boolean).length;

  if (pathname === "/" || (depth < 2 && items.length < 3)) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      data-testid="breadcrumbs"
      className="flex flex-wrap items-center gap-1.5 border-l border-[var(--border)] pl-3 text-xs text-[var(--fg-muted)]"
    >
      {items.map((item, idx) => (
        <React.Fragment key={`${item.href}-${idx}`}>
          {idx > 0 && (
            <ChevronRight
              className="h-3 w-3 shrink-0 text-[var(--fg-muted)]/60"
              aria-hidden="true"
            />
          )}
          {item.isCurrent ? (
            <span
              aria-current="page"
              className="font-medium text-[var(--fg)]"
            >
              {item.label}
            </span>
          ) : (
            <Link
              href={item.href}
              className="transition-colors hover:text-[var(--fg)] hover:underline"
            >
              {item.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}