import Link from "next/link";
import {
  HelpCircle,
  Search,
  Mail,
  LifeBuoy,
  BookOpen,
  CheckCircle2,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";

interface FaqPageProps {
  searchParams: Promise<{
    category?: string;
    q?: string;
  }>;
}

const FAQ_CATEGORIES = ["Peminjaman", "Akun", "Layanan", "Koleksi"];

export default async function FaqPage({ searchParams }: FaqPageProps) {
  const resolvedParams = await searchParams;
  const activeCategory = (resolvedParams.category || "").trim();
  const query = (resolvedParams.q || "").trim();

  const allFaqs = await prisma.faq.findMany({
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });

  const totalHelpfulVotes = allFaqs.reduce(
    (sum, item) => sum + item.helpfulYes,
    0
  );

  return (
    <div className="min-h-screen pb-16">
      <PageHeader
        title="Tanya Jawab Interaktif (FAQ)"
        subtitle="Temukan jawaban resmi seputar prosedur peminjaman buku, manajemen akun, ketentuan layanan sirkulasi, dan kurasi koleksi Charvlibrary."
        fallbackHref="/help"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/help"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3.5 py-2 text-xs font-semibold text-[var(--fg)] transition-colors hover:border-[#92400E] hover:text-[#92400E]"
            >
              <LifeBuoy className="h-3.5 w-3.5" />
              Pusat Bantuan
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#92400E] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#78350F]"
            >
              <Mail className="h-3.5 w-3.5" />
              Hubungi Pustakawan
            </Link>
          </div>
        }
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <section
          aria-label="Statistik Tanya Jawab"
          className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider uppercase text-[var(--fg-muted)]">
                Basis Pengetahuan
              </span>
              <HelpCircle className="h-4 w-4 text-[#92400E]" />
            </div>
            <p className="font-heading mt-2 text-2xl font-bold text-[var(--fg)]">
              {allFaqs.length} Panduan Tanya Jawab
            </p>
            <p className="mt-0.5 text-xs text-[var(--fg-muted)]">
              Disusun langsung oleh tim layanan sirkulasi & pustakawan
            </p>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider uppercase text-[var(--fg-muted)]">
                Kategori Layanan
              </span>
              <BookOpen className="h-4 w-4 text-[#D97706]" />
            </div>
            <p className="font-heading mt-2 text-2xl font-bold text-[var(--fg)]">
              4 Topik Utama
            </p>
            <p className="mt-0.5 text-xs text-[var(--fg-muted)]">
              Peminjaman, Akun, Layanan, dan Koleksi
            </p>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider uppercase text-[var(--fg-muted)]">
                Apresiasi Terbantu
              </span>
              <CheckCircle2 className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
            </div>
            <p className="font-heading mt-2 text-2xl font-bold text-[var(--fg)]">
              {totalHelpfulVotes} Suara Positif
            </p>
            <p className="mt-0.5 text-xs text-[var(--fg-muted)]">
              Dinilai membantu oleh anggota perpustakaan
            </p>
          </div>
        </section>

        <section
          aria-label="Filter dan Pencarian FAQ"
          className="mb-8 rounded-xl border border-[var(--border)] bg-[var(--surface)]/80 p-4"
        >
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={query ? `/faq?q=${encodeURIComponent(query)}` : "/faq"}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  !activeCategory
                    ? "bg-[#92400E] text-white"
                    : "border border-[var(--border)] bg-[var(--card)] text-[var(--fg-muted)] hover:border-[#92400E] hover:text-[var(--fg)]"
                }`}
              >
                Semua Topik ({allFaqs.length})
              </Link>

              {FAQ_CATEGORIES.map((cat) => {
                const count = allFaqs.filter(
                  (f) => f.category.toLowerCase() === cat.toLowerCase()
                ).length;
                const isSelected =
                  activeCategory.toLowerCase() === cat.toLowerCase();
                const targetHref = query
                  ? `/faq?category=${encodeURIComponent(cat)}&q=${encodeURIComponent(query)}`
                  : `/faq?category=${encodeURIComponent(cat)}`;

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
              action="/faq"
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
                  placeholder="Cari pertanyaan atau kata kunci..."
                  aria-label="Cari pertanyaan FAQ"
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
                  href="/faq"
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