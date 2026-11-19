"use client";

import React, { useState } from "react";

interface GeneratedBookCoverProps {
  title: string;
  author?: string;
  category?: string;
  accentColor?: string;
  coverPath?: string | null;
  className?: string;
  publishYear?: number;
}

const PALETTE_FALLBACKS = [
  "#92400E",
  "#1E40AF",
  "#0F766E",
  "#7C3AED",
  "#B45309",
  "#BE123C",
  "#065F46",
  "#374151",
];

function pickColor(title: string, explicitColor?: string): string {
  if (explicitColor && explicitColor.startsWith("#")) return explicitColor;
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PALETTE_FALLBACKS[Math.abs(hash) % PALETTE_FALLBACKS.length];
}

export function GeneratedBookCover({
  title,
  author = "Koleksi Charvlibrary",
  category = "Literatur",
  accentColor,
  coverPath,
  className = "w-full aspect-[2/3]",
  publishYear,
}: GeneratedBookCoverProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const bg = pickColor(title, accentColor);

  if (coverPath && !imgFailed) {
    return (
      <div
        className={`relative overflow-hidden rounded-lg bg-[#251A13] select-none ${className}`}
      >
        <img
          src={coverPath}
          alt={`Sampul buku ${title} karya ${author}`}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          loading="lazy"
          onError={() => setImgFailed(true)}
        />
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/35 via-white/10 to-transparent"
          aria-hidden="true"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative flex flex-col justify-between overflow-hidden rounded-lg p-4 text-[#FFFBEB] select-none ${className}`}
      style={{
        background: `linear-gradient(155deg, ${bg} 0%, #1C1410 95%)`,
      }}
      role="img"
      aria-label={`Sampul tipografis buku ${title} karya ${author}`}
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-3.5 bg-gradient-to-r from-black/45 via-amber-100/15 to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-2.5 rounded border border-amber-200/25"
        aria-hidden="true"
      />

      <div className="relative z-10 flex items-center justify-between gap-2 pl-2">
        <span className="inline-block truncate rounded bg-black/30 px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase text-amber-200">
          {category}
        </span>
        {publishYear && (
          <span className="text-[10px] font-medium text-amber-100/80">
            {publishYear}
          </span>
        )}
      </div>

      <div className="relative z-10 my-auto py-2 pl-2">
        <p className="font-heading line-clamp-3 text-base leading-snug font-bold tracking-tight text-[#FFFBEB] drop-shadow-sm">
          {title}
        </p>
        <div className="mt-2 h-0.5 w-8 rounded bg-amber-300/70" />
      </div>

      <div className="relative z-10 border-t border-amber-100/20 pt-2 pl-2">
        <p className="truncate text-xs font-medium text-amber-100/90">
          {author}
        </p>
        <p className="text-[9px] tracking-widest uppercase text-amber-200/60">
          Charvlibrary Press
        </p>
      </div>
    </div>
  );
}