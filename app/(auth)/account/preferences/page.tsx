import Link from "next/link";
import { CheckCircle2, Shield, Sparkles, User } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { saveUserPreferencesAction } from "@/features/auth/actions";
import { PreferencesClientControls } from "./PreferencesClient";

interface AccountPreferencesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AccountPreferencesPage({
  searchParams,
}: AccountPreferencesPageProps) {
  const user = await requireAuth("/account/preferences");
  const params = await searchParams;
  const saved = params.saved === "1";

  const [categories, userPrefs] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.userPreference.findMany({
      where: { userId: user.id },
      select: { categoryId: true },
    }),
  ]);

  const selectedIds = new Set(userPrefs.map((p) => p.categoryId));

  return (
    <div className="min-h-screen pb-16">
      <PageHeader
        title="Preferensi Tampilan & Minat Baca"
        subtitle="Atur perilaku efek kursor interaktif, suasana warna ruang baca, dan kategori literatur favorit Anda."
        fallbackHref="/account/profile"
        breadcrumbLabel="Preferensi Tampilan"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/account/security"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3.5 py-2 text-xs font-semibold text-[var(--fg)] transition hover:border-[#8A3B12]"
            >
              <Shield className="h-3.5 w-3.5" />
              Keamanan Akun
            </Link>
            <Link
              href="/account/profile"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3.5 py-2 text-xs font-semibold text-[var(--fg)] transition hover:border-[#8A3B12]"
            >
              <User className="h-3.5 w-3.5" />
              Profil Anggota
            </Link>
          </div>
        }
      />

      <div className="mx-auto max-w-5xl space-y-8 px-4 sm:px-6 lg:px-8">
        {saved && (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-600/30 bg-emerald-500/10 px-4 py-3.5 text-sm text-emerald-900 dark:text-emerald-200">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            <span>Preferensi minat baca berhasil disimpan ke akun Anda.</span>
          </div>
        )}

        <PreferencesClientControls />

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
          <h2 className="font-serif text-lg font-semibold text-[var(--fg)]">
            Kategori Literatur Favorit
          </h2>
          <p className="mt-1 text-xs text-[var(--fg-muted)]">
            Pilihan ini digunakan untuk menyusun saran bacaan di halaman Rekomendasi Personal.
          </p>

          <form action={saveUserPreferencesAction} className="mt-5 space-y-6">
            <input type="hidden" name="avatarColor" value={user.avatarColor} />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {categories.map((cat) => {
                const isChecked = selectedIds.has(cat.id);
                return (
                  <label
                    key={cat.id}
                    className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3.5 py-2.5 text-xs font-medium text-[var(--fg)] transition hover:border-[#8A3B12]"
                  >
                    <input
                      type="checkbox"
                      name="categoryIds"
                      value={cat.id}
                      defaultChecked={isChecked}
                      className="accent-[#8A3B12]"
                    />
                    <span className="truncate">{cat.name}</span>
                  </label>
                );
              })}
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-[#8A3B12] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#722F0D]"
            >
              <Sparkles className="h-4 w-4" />
              Simpan Preferensi Genre
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
