import React from "react";
import Link from "next/link";
import {
  HelpCircle,
  Search,
  ThumbsUp,
  ThumbsDown,
  Mail,
  LifeBuoy,
  BookOpen,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { voteFaqHelpfulAction } from "@/features/community/actions";

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

  const filteredFaqs = allFaqs.filter((item) => {
    const matchCategory =
      !activeCategory ||
      item.category.toLowerCase() === activeCategory.toLowerCase();
    const matchQuery =
      !query ||
      item.question.toLowerCase().includes(query.toLowerCase()) ||
      item.answer.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase());
    return matchCategory && matchQuery;
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

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <main className="space-y-4 lg:col-span-8">
            {filteredFaqs.length === 0 ? (
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-10 text-center">
                <HelpCircle className="mx-auto h-10 w-10 text-[var(--fg-muted)]" />
                <h2 className="font-heading mt-3 text-lg font-bold text-[var(--fg)]">
                  Pertanyaan Tidak Ditemukan
                </h2>
                <p className="mt-1 text-sm text-[var(--fg-muted)]">
                  Tidak ada butir FAQ yang cocok dengan kata kunci atau kategori
                  pilihan Anda.
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <Link
                    href="/faq"
                    className="rounded-lg bg-[#92400E] px-4 py-2 text-xs font-semibold text-white hover:bg-[#78350F]"
                  >
                    Tampilkan Semua FAQ
                  </Link>
                  <Link
                    href="/contact"
                    className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs font-semibold text-[var(--fg)] hover:border-[#92400E]"
                  >
                    Kirim Pertanyaan ke Pustakawan
                  </Link>
                </div>
              </div>
            ) : (
              filteredFaqs.map((faq, idx) => (
                <article
                  key={faq.id}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xs"
                >
                  <div className="mb-2 flex items-center justify-between gap-2 text-xs">
                    <span className="rounded-full bg-[#92400E]/15 px-3 py-0.5 font-semibold text-[#92400E] dark:text-amber-300">
                      Kategori: {faq.category}
                    </span>
                    <span className="font-mono text-[11px] text-[var(--fg-muted)]">
                      #FAQ-{String(idx + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <h2 className="font-heading text-lg font-bold text-[var(--fg)]">
                    {faq.question}
                  </h2>

                  <p className="mt-2.5 text-sm leading-relaxed text-[var(--fg-muted)]">
                    {faq.answer}
                  </p>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-3.5">
                    <span className="text-xs font-medium text-[var(--fg-muted)]">
                      Apakah jawaban ini membantu Anda?
                    </span>

                    <div className="flex items-center gap-2">
                      <form action={voteFaqHelpfulAction}>
                        <input type="hidden" name="faqId" value={faq.id} />
                        <input type="hidden" name="vote" value="yes" />
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-emerald-800 transition-colors hover:border-emerald-600 hover:bg-emerald-600 hover:text-white dark:text-emerald-300"
                        >
                          <ThumbsUp className="h-3.5 w-3.5" />
                          Ya ({faq.helpfulYes})
                        </button>
                      </form>

                      <form action={voteFaqHelpfulAction}>
                        <input type="hidden" name="faqId" value={faq.id} />
                        <input type="hidden" name="vote" value="no" />
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--fg-muted)] transition-colors hover:border-red-600 hover:bg-red-600 hover:text-white"
                        >
                          <ThumbsDown className="h-3.5 w-3.5" />
                          Tidak ({faq.helpfulNo})
                        </button>
                      </form>
                    </div>
                  </div>
                </article>
              ))
            )}
          </main>

          <aside className="space-y-6 lg:col-span-4">
            <div className="rounded-2xl border border-[#92400E]/30 bg-gradient-to-br from-[#251A13] to-[#1C1410] p-6 text-[#FFFBEB] shadow-md">
              <h2 className="font-heading text-lg font-bold text-[#FFFBEB]">
                Belum Menemukan Jawaban?
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-amber-100/85">
                Jika Anda memiliki kendala khusus terkait perpanjangan masa
                pinjam, verifikasi akun, atau usulan pengadaan buku baru, tim
                pustakawan kami siap membantu.
              </p>

              <div className="mt-5 space-y-2.5">
                <Link
                  href="/contact"
                  className="flex w-full items-center justify-between rounded-xl bg-amber-500 px-4 py-3 text-xs font-bold text-[#1C1410] transition-colors hover:bg-amber-400"
                >
                  <span className="inline-flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Hubungi Pustakawan
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/help"
                  className="flex w-full items-center justify-between rounded-xl border border-amber-200/25 bg-black/30 px-4 py-3 text-xs font-semibold text-amber-100 transition-colors hover:bg-black/50"
                >
                  <span className="inline-flex items-center gap-2">
                    <LifeBuoy className="h-4 w-4" />
                    Buka Pusat Bantuan
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-xs">
              <h2 className="font-heading text-base font-bold text-[var(--fg)]">
                Pintasan Layanan Terkait
              </h2>
              <p className="mt-1 text-xs text-[var(--fg-muted)]">
                Akses langsung ke halaman operasional yang sering ditanyakan.
              </p>

              <div className="mt-4 space-y-2">
                <Link
                  href="/borrow/returns"
                  className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)]/60 px-3.5 py-2.5 text-xs font-semibold text-[var(--fg)] hover:border-[#92400E]"
                >
                  <span>Pengembalian & Perpanjangan Mandiri</span>
                  <ArrowRight className="h-3.5 w-3.5 text-[#92400E]" />
                </Link>
                <Link
                  href="/account/borrowed"
                  className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)]/60 px-3.5 py-2.5 text-xs font-semibold text-[var(--fg)] hover:border-[#92400E]"
                >
                  <span>Pantau Pinjaman Aktif Saya</span>
                  <ArrowRight className="h-3.5 w-3.5 text-[#92400E]" />
                </Link>
                <Link
                  href="/contact"
                  className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)]/60 px-3.5 py-2.5 text-xs font-semibold text-[var(--fg)] hover:border-[#92400E]"
                >
                  <span>Usulkan Buku Baru ke Pustakawan</span>
                  <ArrowRight className="h-3.5 w-3.5 text-[#92400E]" />
                </Link>
                <Link
                  href="/terms"
                  className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)]/60 px-3.5 py-2.5 text-xs font-semibold text-[var(--fg)] hover:border-[#92400E]"
                >
                  <span>Syarat, Ketentuan & Tata Tertib</span>
                  <ArrowRight className="h-3.5 w-3.5 text-[#92400E]" />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}