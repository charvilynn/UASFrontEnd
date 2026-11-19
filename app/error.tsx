"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-amber-300 bg-[var(--card)] p-8 shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-800">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h2 className="font-heading text-2xl font-bold text-[var(--fg)]">
          Terjadi Kendala Saat Memuat Halaman
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-[var(--fg-muted)]">
          {error.message ||
            "Permintaan tidak dapat diproses saat ini. Silakan muat ulang atau kembali ke beranda."}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-2 rounded-lg bg-[#92400E] px-4 py-2 text-xs font-semibold text-white hover:bg-[#78350F]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Coba Muat Ulang</span>
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs font-semibold text-[var(--fg)]"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </div>
    </div>
  );
}