"use client";

import React, { useState } from "react";

interface BookDetailTabsProps {
  reviewCount: number;
  metadataContent: React.ReactNode;
  reviewsContent: React.ReactNode;
}

export function BookDetailTabs({
  reviewCount,
  metadataContent,
  reviewsContent,
}: BookDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<"metadata" | "reviews">("metadata");

  return (
    <section className="border-t border-[var(--border)] pt-10">
      <div
        role="tablist"
        aria-label="Informasi detail buku"
        className="flex items-center gap-6 border-b border-[var(--border)]"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "metadata"}
          onClick={() => setActiveTab("metadata")}
          className={`relative pb-3.5 text-sm font-medium transition-colors ${
            activeTab === "metadata"
              ? "text-[var(--fg)]"
              : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
          }`}
        >
          Metadata &amp; Spesifikasi
          {activeTab === "metadata" && (
            <span className="absolute right-0 bottom-0 left-0 h-0.5 bg-[var(--primary)]" />
          )}
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "reviews"}
          onClick={() => setActiveTab("reviews")}
          className={`relative pb-3.5 text-sm font-medium transition-colors ${
            activeTab === "reviews"
              ? "text-[var(--fg)]"
              : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
          }`}
        >
          Ulasan Pembaca ({reviewCount})
          {activeTab === "reviews" && (
            <span className="absolute right-0 bottom-0 left-0 h-0.5 bg-[var(--primary)]" />
          )}
        </button>
      </div>

      <div className="pt-8">
        <div className={activeTab === "metadata" ? "block" : "hidden"}>
          {metadataContent}
        </div>
        <div className={activeTab === "reviews" ? "block" : "hidden"}>
          {reviewsContent}
        </div>
      </div>
    </section>
  );
}