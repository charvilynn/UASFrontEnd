import React from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";

const FOOTER_LINKS: Array<{ label: string; href: string }> = [
  { label: "Tentang", href: "/about" },
  { label: "Bantuan", href: "/help" },
  { label: "Kontak", href: "/contact" },
  { label: "Syarat & Privasi", href: "/terms" },
  { label: "Peta Situs", href: "/peta-situs" },
];

export function Footer() {
  return (
    <footer
      data-testid="global-footer"
      className="mt-20 border-t border-[var(--border)] bg-[var(--surface)]"
    >
      <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)] text-[var(--primary-fg)]">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <span className="font-serif text-base font-semibold text-[var(--fg)]">
                Charvlibrary
              </span>
              <span className="ml-2 text-xs text-[var(--fg-muted)]">
                Ruang Baca & Literatur Akademik
              </span>
            </div>
          </Link>

          <nav
            aria-label="Navigasi Footer"
            className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-[var(--fg-muted)]"
          >
            {FOOTER_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-[var(--primary)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-6 flex flex-col justify-between gap-2 border-t border-[var(--border)] pt-5 text-xs text-[var(--fg-subtle)] sm:flex-row sm:items-center">
          <p>© 2026 Charvlibrary. Ruang baca literatur akademik dan sastra.</p>
          <p>Atribusi metadata & sampul buku: Open Library.</p>
        </div>
      </div>
    </footer>
  );
}
