import React from "react";
import Link from "next/link";
import { Home, ShieldAlert } from "lucide-react";

interface ForbiddenViewProps {
  requestedPath?: string;
  userName?: string;
}

export function ForbiddenView({ userName }: ForbiddenViewProps) {
  return (
    <div className="flex min-h-[calc(100vh-var(--nav-h,64px)-160px)] items-center justify-center px-4 py-12">
      <div
        data-testid="forbidden-403-card"
        className="w-full max-w-md rounded-2xl border border-[#E5DEC9] bg-[#F7F2E7] p-8 text-center shadow-sm"
      >
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#8A3B12]/10 text-[#8A3B12]">
          <ShieldAlert className="h-6 w-6" />
        </div>

        <span className="inline-block rounded-full bg-[#EFE8D8] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#5A5044]">
          403 · Akses Ditolak
        </span>

        <h1 className="mt-3 font-serif text-2xl font-semibold text-[#18130E]">
          Halaman Tidak Tersedia
        </h1>

        <p className="mt-2 text-sm leading-relaxed text-[#5A5044]">
          {userName
            ? `Halo ${userName}, akun Anda tidak memiliki izin untuk membuka halaman ini.`
            : "Akun Anda saat ini tidak memiliki izin untuk membuka halaman ini."}
        </p>

        <div className="mt-6 flex items-center justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-[#8A3B12] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#722F0D]"
          >
            <Home className="h-4 w-4" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
