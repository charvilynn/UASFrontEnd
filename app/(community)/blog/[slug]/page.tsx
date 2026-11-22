import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Clock,
  Calendar,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";

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
          </main>

        </div>
      </div>
    </div>
  );
}