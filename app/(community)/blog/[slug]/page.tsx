import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Clock,
  MessageSquare,
  Calendar,
  UserCheck,
  Send,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { addBlogCommentAction } from "@/features/community/actions";

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    commentSuccess?: string;
    commentError?: string;
  }>;
}

export default async function BlogDetailPage({
  params,
  searchParams,
}: BlogDetailPageProps) {
  const { slug } = await params;
  const resolvedSearch = await searchParams;
  const sessionUser = await getSessionUser();

  let post = await prisma.blogPost.findUnique({
    where: { slug },
    include: {
      comments: {
        include: {
          user: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!post) {
    post = await prisma.blogPost.findFirst({
      orderBy: [{ isFeatured: "desc" }, { id: "asc" }],
      include: {
        comments: {
          include: {
            user: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  if (!post) {
    notFound();
  }

  const relatedPosts = await prisma.blogPost.findMany({
    where: {
      id: { not: post.id },
    },
    include: {
      _count: {
        select: { comments: true },
      },
    },
    orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
    take: 3,
  });

  const paragraphs = post.content
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const formattedDate = new Date(post.publishedAt).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen pb-16">
      <PageHeader
        title={post.title}
        subtitle={post.excerpt}
        fallbackHref="/blog"
        breadcrumbLabel={post.title}
        actions={
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3.5 py-2 text-xs font-semibold text-[var(--fg)] transition-colors hover:border-[#92400E] hover:text-[#92400E]"
          >
            <BookOpen className="h-3.5 w-3.5" />
            Semua Artikel Jurnal
          </Link>
        }
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <main className="lg:col-span-8">
            <article className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xs sm:p-8">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#92400E] text-sm font-bold text-white">
                    {post.authorName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[var(--fg)]">
                      {post.authorName}
                    </p>
                    <p className="text-xs text-[var(--fg-muted)]">
                      {post.authorRole}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--fg-muted)]">
                  <span className="rounded-full bg-[#92400E]/15 px-3 py-1 font-semibold text-[#92400E] dark:text-amber-300">
                    {post.category}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {formattedDate}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    Estimasi {post.readTimeMinutes} menit baca
                  </span>
                </div>
              </div>

              <div className="mb-6 rounded-xl border border-[var(--border)] bg-[var(--surface)]/70 p-4">
                <div className="flex items-center justify-between text-xs font-semibold text-[var(--fg)]">
                  <span className="inline-flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-[#D97706]" />
                    Intisari Jurnal Literasi
                  </span>
                  <span className="text-[var(--fg-muted)]">
                    {paragraphs.length} Paragraf Kuratorial
                  </span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-[var(--fg-muted)]">
                  {post.excerpt}
                </p>
              </div>

              <div className="space-y-4 text-base leading-relaxed text-[var(--fg)]">
                {paragraphs.map((paragraph, index) => (
                  <p
                    key={index}
                    className={
                      index === 0
                        ? "first-letter:font-heading first-letter:float-left first-letter:mr-3 first-letter:text-4xl first-letter:font-bold first-letter:text-[#92400E]"
                        : ""
                    }
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                <div>
                  <p className="text-xs font-bold text-[var(--fg)]">
                    Ingin mendiskusikan tema ini bersama rekan sivitas?
                  </p>
                  <p className="text-xs text-[var(--fg-muted)]">
                    Jelajahi koleksi buku terkait di katalog atau ikuti agenda
                    kegiatan literasi kampus.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href="/explore"
                    className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs font-semibold text-[var(--fg)] hover:border-[#92400E]"
                  >
                    Eksplorasi Katalog
                  </Link>
                  <Link
                    href="/events"
                    className="rounded-lg bg-[#92400E] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#78350F]"
                  >
                    Lihat Agenda Acara
                  </Link>
                </div>
              </div>
            </article>

            <section
              id="komentar"
              aria-label="Diskusi dan Komentar Pembaca"
              className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xs sm:p-8"
            >
              <div className="mb-6 flex items-center justify-between gap-2">
                <div>
                  <h2 className="font-heading flex items-center gap-2 text-xl font-bold text-[var(--fg)]">
                    <MessageSquare className="h-5 w-5 text-[#92400E]" />
                    Diskusi & Tanggapan Pembaca ({post.comments.length})
                  </h2>
                  <p className="mt-1 text-xs text-[var(--fg-muted)]">
                    Bagikan pandangan akademik, kutipan favorit, atau rekomendasi
                    bacaan tambahan.
                  </p>
                </div>
              </div>

              {resolvedSearch.commentSuccess === "1" && (
                <div
                  role="status"
                  className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  Komentar Anda berhasil diterbitkan ke diskusi artikel ini.
                </div>
              )}

              {!sessionUser ? (
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)]/70 p-4">
                  <div>
                    <p className="text-xs font-semibold text-[var(--fg)]">
                      Masuk Akun untuk Berdiskusi
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--fg-muted)]">
                      Silakan masuk menggunakan akun Anda untuk mengirim tanggapan atau komentar pada artikel ini.
                    </p>
                  </div>
                  <Link
                    href={`/login?next=${encodeURIComponent(`/blog/${post.slug}`)}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#92400E] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#78350F]"
                  >
                    <span>Masuk Akun</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ) : (
                <form
                  action={addBlogCommentAction}
                  className="mb-8 rounded-xl border border-[var(--border)] bg-[var(--surface)]/70 p-4"
                >
                  <input type="hidden" name="postId" value={post.id} />
                  <input type="hidden" name="slug" value={post.slug} />

                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--fg)]">
                      <UserCheck className="h-4 w-4 text-[#92400E]" />
                      {`Masuk sebagai: ${sessionUser.name} (${sessionUser.memberCode})`}
                    </span>
                  </div>

                  <label
                    htmlFor="blog-comment-input"
                    className="sr-only"
                  >
                    Tulis komentar Anda
                  </label>
                  <textarea
                    id="blog-comment-input"
                    name="content"
                    rows={3}
                    required
                    placeholder="Tulis tanggapan, analisis singkat, atau pertanyaan diskusi..."
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 text-sm text-[var(--fg)] placeholder:text-[var(--fg-muted)] focus:border-[#92400E]"
                  />

                  <div className="mt-3 flex justify-end">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#92400E] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#78350F]"
                    >
                      <Send className="h-3.5 w-3.5" />
                      Kirim Komentar
                    </button>
                  </div>
                </form>
              )}

              {post.comments.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[var(--border)] p-6 text-center text-sm text-[var(--fg-muted)]">
                  Belum ada tanggapan pada artikel ini. Jadilah pembaca pertama
                  yang memulai diskusi!
                </div>
              ) : (
                <div className="space-y-4">
                  {post.comments.map((comment) => {
                    const commentDate = new Date(
                      comment.createdAt
                    ).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    });

                    return (
                      <div
                        key={comment.id}
                        className="rounded-xl border border-[var(--border)] bg-[var(--surface)]/40 p-4"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span
                              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                              style={{
                                backgroundColor:
                                  comment.user.avatarColor || "#92400E",
                              }}
                            >
                              {comment.user.name.charAt(0).toUpperCase()}
                            </span>
                            <div>
                              <p className="text-xs font-bold text-[var(--fg)]">
                                {comment.user.name}
                              </p>
                              <p className="text-[11px] text-[var(--fg-muted)]">
                                {comment.user.faculty || "Anggota Charvlibrary"}{" "}
                                &bull; {comment.user.memberCode}
                              </p>
                            </div>
                          </div>
                          <span className="text-[11px] text-[var(--fg-muted)]">
                            {commentDate}
                          </span>
                        </div>
                        <p className="mt-2.5 text-sm leading-relaxed text-[var(--fg)]">
                          {comment.content}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </main>

          <aside className="space-y-6 lg:col-span-4">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-xs">
              <h2 className="font-heading text-base font-bold text-[var(--fg)]">
                Rekomendasi Artikel Terkait
              </h2>
              <p className="mt-1 text-xs text-[var(--fg-muted)]">
                Bacaan kuratorial lain dari jurnal literasi Charvlibrary.
              </p>

              <div className="mt-4 space-y-3.5">
                {relatedPosts.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-[var(--border)] bg-[var(--surface)]/50 p-3.5 transition-colors hover:border-[#92400E]"
                  >
                    <div className="flex items-center justify-between text-[11px] text-[var(--fg-muted)]">
                      <span className="font-semibold text-[#92400E] dark:text-amber-400">
                        {item.category}
                      </span>
                      <span>{item.readTimeMinutes} menit baca</span>
                    </div>
                    <h3 className="font-heading mt-1 text-sm font-bold text-[var(--fg)]">
                      <Link
                        href={`/blog/${item.slug}`}
                        className="hover:text-[#92400E] hover:underline"
                      >
                        {item.title}
                      </Link>
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs text-[var(--fg-muted)]">
                      {item.excerpt}
                    </p>
                  </div>
                ))}
              </div>

              <Link
                href="/blog"
                className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-semibold text-[var(--fg)] hover:border-[#92400E] hover:text-[#92400E]"
              >
                Lihat Indeks Jurnal Lengkap
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <h2 className="font-heading text-base font-bold text-[var(--fg)]">
                Jelajahi Ekosistem Literasi
              </h2>
              <p className="mt-1 text-xs text-[var(--fg-muted)]">
                Temukan profil penulis buku, jadwal bedah buku, dan pusat
                bantuan perpustakaan.
              </p>
              <div className="mt-4 space-y-2">
                <Link
                  href="/authors"
                  className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--card)] px-3.5 py-2.5 text-xs font-semibold text-[var(--fg)] hover:border-[#92400E]"
                >
                  <span>Direktori Penulis Nusantara & Dunia</span>
                  <ArrowRight className="h-3.5 w-3.5 text-[#92400E]" />
                </Link>
                <Link
                  href="/events"
                  className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--card)] px-3.5 py-2.5 text-xs font-semibold text-[var(--fg)] hover:border-[#92400E]"
                >
                  <span>Jadwal Acara & Bedah Buku</span>
                  <ArrowRight className="h-3.5 w-3.5 text-[#92400E]" />
                </Link>
                <Link
                  href="/faq"
                  className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--card)] px-3.5 py-2.5 text-xs font-semibold text-[var(--fg)] hover:border-[#92400E]"
                >
                  <span>Tanya Jawab Interaktif (FAQ)</span>
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