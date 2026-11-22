import React from "react";
import Link from "next/link";
import { Compass, Home, Search } from "lucide-react";
import { BackButton } from "@/components/layout/BackButton";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-sm sm:p-12">
        <span className="inline-block rounded-full bg-amber-100 px-3.5 py-1 text-xs font-bold tracking-wider uppercase text-amber-900 dark:bg-amber-950 dark:text-amber-300">
          404 Halaman Tidak Ditemukan
        </span>
        <h1 className="font-heading mt-4 text-3xl font-bold text-[var(--fg)] sm:text-4xl">
          Rak atau Halaman Ini Belum Tersedia
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-[var(--fg-muted)] sm:text-base">
          Alamat yang Anda tuju mungkin telah dipindahkan atau nomor identifikasi buku tidak terdaftar di katalog Charvlibrary.
        </p>

        <form
          action="/search"
          method="get"
          className="mx-auto mt-6 flex max-w-md items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--fg-muted)]" />
            <input
              type="text"
              name="q"
              placeholder="Cari judul buku, penulis, atau ISBN..."
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] py-2.5 pr-3 pl-9 text-xs text-[var(--fg)] focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-[#92400E] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#78350F]"
          >
            Cari
          </button>
        </form>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <BackButton fallbackHref="/" label="Kembali ke Halaman Sebelumnya" />
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-[#92400E] px-4 py-2 text-xs font-semibold text-white hover:bg-[#78350F]"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Ke Beranda</span>
          </Link>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs font-semibold text-[var(--fg)] hover:border-[#92400E]"
          >
            <Compass className="h-3.5 w-3.5" />
            <span>Eksplorasi Katalog</span>
          </Link>
        </div>
      </div>
    </div>
  );
}