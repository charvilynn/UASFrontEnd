import Link from "next/link";
import {
  Calendar,
  Users,
  Ticket,
  Search,
  Sparkles,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";

interface EventsPageProps {
  searchParams: Promise<{
    category?: string;
    q?: string;
  }>;
}

const EVENT_CATEGORIES = [
  "Bedah Buku",
  "Workshop",
  "Webinar",
];

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const resolvedParams = await searchParams;
  const activeCategory = (resolvedParams.category || "").trim();
  const query = (resolvedParams.q || "").trim();

  const allEvents = await prisma.event.findMany({
    include: {
      rsvps: true,
    },
    orderBy: { id: "asc" },
  });

  const filteredEvents = allEvents.filter((ev) => {
    const matchCategory =
      !activeCategory ||
      ev.category.toLowerCase() === activeCategory.toLowerCase();
    const matchQuery =
      !query ||
      ev.title.toLowerCase().includes(query.toLowerCase()) ||
      ev.speakerName.toLowerCase().includes(query.toLowerCase()) ||
      ev.location.toLowerCase().includes(query.toLowerCase()) ||
      ev.description.toLowerCase().includes(query.toLowerCase());
    return matchCategory && matchQuery;
  });

  const totalRsvps = allEvents.reduce((sum, ev) => sum + ev.rsvps.length, 0);
  const totalRemainingSeats = allEvents.reduce(
    (sum, ev) => sum + Math.max(0, ev.maxQuota - ev.rsvps.length),
    0
  );

  return (
    <div className="min-h-screen pb-16">
      <PageHeader
        title="Jadwal Acara & Kegiatan Literasi"
        subtitle="Ikuti sesi bedah buku bersama penulis, lokakarya penulisan akademik, diskusi terbuka, dan webinar sivitas Charvlibrary."
        fallbackHref="/"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#92400E] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#78350F]"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Jurnal Literasi
            </Link>
          </div>
        }
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <section
          aria-label="Statistik Kegiatan Literasi"
          className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider uppercase text-[var(--fg-muted)]">
                Agenda Terjadwal
              </span>
              <Calendar className="h-4 w-4 text-[#92400E]" />
            </div>
            <p className="font-heading mt-2 text-2xl font-bold text-[var(--fg)]">
              {allEvents.length} Kegiatan Aktif
            </p>
            <p className="mt-0.5 text-xs text-[var(--fg-muted)]">
              Terbuka untuk mahasiswa, dosen, dan anggota umum
            </p>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider uppercase text-[var(--fg-muted)]">
                Peserta Terdaftar
              </span>
              <Users className="h-4 w-4 text-[#D97706]" />
            </div>
            <p className="font-heading mt-2 text-2xl font-bold text-[var(--fg)]">
              {totalRsvps} Tiket RSVP
            </p>
            <p className="mt-0.5 text-xs text-[var(--fg-muted)]">
              Konfirmasi kehadiran otomatis dengan kode tiket unik
            </p>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider uppercase text-[var(--fg-muted)]">
                Sisa Kuota Kursi
              </span>
              <Ticket className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
            </div>
            <p className="font-heading mt-2 text-2xl font-bold text-[var(--fg)]">
              {totalRemainingSeats} Kursi Tersedia
            </p>
            <p className="mt-0.5 text-xs text-[var(--fg-muted)]">
              Segera klaim kursi sebelum batas pendaftaran ditutup
            </p>
          </div>
        </section>

        <section
          aria-label="Filter Kategori Kegiatan"
          className="mb-8 rounded-xl border border-[var(--border)] bg-[var(--surface)]/80 p-4"
        >
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={query ? `/events?q=${encodeURIComponent(query)}` : "/events"}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  !activeCategory
                    ? "bg-[#92400E] text-white"
                    : "border border-[var(--border)] bg-[var(--card)] text-[var(--fg-muted)] hover:border-[#92400E] hover:text-[var(--fg)]"
                }`}
              >
                Semua Kategori ({allEvents.length})
              </Link>
              {EVENT_CATEGORIES.map((cat) => {
                const count = allEvents.filter(
                  (ev) => ev.category.toLowerCase() === cat.toLowerCase()
                ).length;
                const isSelected =
                  activeCategory.toLowerCase() === cat.toLowerCase();
                const targetHref = query
                  ? `/events?category=${encodeURIComponent(cat)}&q=${encodeURIComponent(query)}`
                  : `/events?category=${encodeURIComponent(cat)}`;

                return (
                  <Link
                    key={cat}
                    href={targetHref}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                      isSelected
                        ? "bg-[#92400E] text-white"
                        : "border border-[var(--border)] bg-[var(--card)] text-[var(--fg-muted)] hover:border-[#92400E] hover:text-[var(--fg)]"
                    }`}
                  >
                    {cat} ({count})
                  </Link>
                );
              })}
            </div>

            <form
              action="/events"
              method="get"
              className="flex w-full items-center gap-2 lg:w-80"
            >
              {activeCategory && (
                <input type="hidden" name="category" value={activeCategory} />
              )}
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--fg-muted)]" />
                <input
                  type="search"
                  name="q"
                  defaultValue={query}
                  placeholder="Cari acara, pembicara, lokasi..."
                  aria-label="Cari kegiatan literasi"
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] py-2 pr-3 pl-9 text-xs text-[var(--fg)] placeholder:text-[var(--fg-muted)] focus:border-[#92400E]"
                />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-[#92400E] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#78350F]"
              >
                Cari
              </button>
              {(query || activeCategory) && (
                <Link
                  href="/events"
                  className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-2.5 py-2 text-xs font-medium text-[var(--fg-muted)] hover:text-[var(--fg)]"
                >
                  Reset
                </Link>
              )}
            </form>
          </div>
        </section>

      </div>
    </div>
  );
}