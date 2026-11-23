import Link from "next/link";
import {
  BookCopy,
  Edit3,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const sessionUser = await requireAuth("/account/profile");

  const member = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: {
      preferences: {
        include: {
          category: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
      loans: {
        include: {
          book: {
            include: {
              authors: {
                include: { author: true },
              },
              categories: {
                include: { category: true },
              },
            },
          },
        },
        orderBy: {
          borrowedAt: "desc",
        },
      },
      readingHistory: {
        include: {
          book: true,
        },
        orderBy: {
          startedAt: "desc",
        },
      },
      reviews: {
        orderBy: {
          createdAt: "desc",
        },
      },
      wishlists: {
        orderBy: {
          createdAt: "desc",
        },
      },
      readingGoals: {
        where: { year: 2026 },
      },
      notifications: {
        where: { isRead: false },
        orderBy: { createdAt: "desc" },
        take: 4,
      },
    },
  });

  if (!member) {
    return (
      <div className="min-h-screen pb-16">
        <PageHeader
          title="Profil & Kartu Anggota"
          subtitle="Kartu anggota digital Charvlibrary dan ringkasan aktivitas"
          fallbackHref="/"
        />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <EmptyState
            title="Data Anggota Tidak Ditemukan"
            description="Sesi akun Anda tidak dapat dimuat. Silakan masuk kembali untuk mengakses kartu anggota digital."
            actionLabel="Masuk Kembali"
            actionHref="/login"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      <PageHeader
        title="Profil & Kartu Anggota"
        subtitle="Kartu anggota perpustakaan digital Charvlibrary, preferensi genre, statistik literasi, dan navigasi akun."
        fallbackHref="/"
        actions={
          <>
            <Link
              href="/account/edit-profile"
              className="inline-flex items-center gap-2 rounded-lg bg-[#92400E] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#78350F]"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Edit Profil</span>
            </Link>
            <Link
              href="/account/borrowed"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-xs font-semibold text-[var(--fg)] transition-colors hover:border-[#92400E]"
            >
              <BookCopy className="h-3.5 w-3.5 text-[#92400E]" />
              <span>Pinjaman Saya</span>
            </Link>
          </>
        }
      />

      <main className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
      </main>
    </div>
  );
}