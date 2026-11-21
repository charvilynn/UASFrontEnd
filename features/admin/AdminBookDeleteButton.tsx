"use client";

import React, { useState } from "react";
import { Trash2, Check, X } from "lucide-react";
import { deleteBookAdminAction } from "./actions";

interface AdminBookDeleteButtonProps {
  bookId: number;
  bookTitle: string;
}

export function AdminBookDeleteButton({
  bookId,
  bookTitle,
}: AdminBookDeleteButtonProps) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        title={`Hapus buku ${bookTitle}`}
        className="inline-flex items-center gap-1 rounded-lg border border-red-300 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-600 hover:text-white dark:border-red-800/60 dark:bg-red-950/50 dark:text-red-300 dark:hover:bg-red-700"
      >
        <Trash2 className="h-3.5 w-3.5" />
        <span>Hapus</span>
      </button>
    );
  }

  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-red-400 bg-red-50 px-2 py-1 dark:border-red-700 dark:bg-red-950/80">
      <span className="text-[11px] font-semibold text-red-800 dark:text-red-200">
        Yakin?
      </span>
      <form action={deleteBookAdminAction}>
        <input type="hidden" name="bookId" value={bookId} />
        <button
          type="submit"
          className="inline-flex items-center gap-0.5 rounded bg-red-600 px-2 py-0.5 text-[11px] font-bold text-white hover:bg-red-700"
        >
          <Check className="h-3 w-3" />
          <span>Ya</span>
        </button>
      </form>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="inline-flex items-center gap-0.5 rounded bg-[var(--card)] px-1.5 py-0.5 text-[11px] font-medium text-[var(--fg)] hover:bg-[var(--muted)]"
      >
        <X className="h-3 w-3" />
        <span>Batal</span>
      </button>
    </div>
  );
}