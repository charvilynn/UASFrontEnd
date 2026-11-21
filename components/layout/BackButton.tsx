"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { matchRoute } from "@/config/routes";

interface BackButtonProps {
  fallbackHref?: string;
  label?: string;
  className?: string;
}

const HISTORY_STORAGE_KEY = "charv_internal_nav_stack";

export function BackButton({
  fallbackHref,
  label = "Kembali",
  className = "",
}: BackButtonProps) {
  const router = useRouter();
  const pathname = usePathname();

  const matched = matchRoute(pathname);
  const resolvedFallback = fallbackHref || matched?.parentPath || "/";

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(HISTORY_STORAGE_KEY);
      const stack: string[] = raw ? JSON.parse(raw) : [];
      if (stack[stack.length - 1] !== pathname) {
        stack.push(pathname);
        sessionStorage.setItem(
          HISTORY_STORAGE_KEY,
          JSON.stringify(stack.slice(-25))
        );
      }
    } catch {
    }
  }, [pathname]);

  function handleBack() {
    try {
      const raw = sessionStorage.getItem(HISTORY_STORAGE_KEY);
      const stack: string[] = raw ? JSON.parse(raw) : [];
      const sameOriginReferrer =
        typeof document !== "undefined" &&
        document.referrer.startsWith(window.location.origin);

      const canGoBack =
        stack.length > 1 || (window.history.length > 1 && sameOriginReferrer);

      if (canGoBack && stack.length > 1) {
        stack.pop();
        sessionStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(stack));
        router.back();
        return;
      }
    } catch {
    }
    router.push(resolvedFallback);
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      data-testid="smart-back-button"
      data-fallback-href={resolvedFallback}
      className={`inline-flex items-center gap-1.5 text-xs font-medium text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)] ${className}`}
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      <span>{label}</span>
    </button>
  );
}