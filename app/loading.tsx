import React from "react";

export default function GlobalLoading() {
  return (
    <div
      className="mx-auto max-w-7xl animate-pulse space-y-8 px-4 py-10 sm:px-6 lg:px-8"
      role="status"
      aria-label="Memuat konten halaman Charvlibrary"
    >
      <div className="space-y-3 border-b border-[var(--border)] pb-6">
        <div className="h-4 w-48 rounded bg-[var(--muted)]" />
        <div className="h-8 w-80 max-w-full rounded bg-[var(--muted)]" />
        <div className="h-4 w-2/3 rounded bg-[var(--muted)]" />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4"
          >
            <div className="aspect-[2/3] w-full rounded-xl bg-[var(--muted)]" />
            <div className="h-4 w-3/4 rounded bg-[var(--muted)]" />
            <div className="h-3 w-1/2 rounded bg-[var(--muted)]" />
          </div>
        ))}
      </div>
    </div>
  );
}