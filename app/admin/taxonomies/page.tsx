import Link from "next/link";
import {
  Layers,
  Feather,
  Building2,
  PlusCircle,
  CheckCircle2,
  BookPlus,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { ForbiddenView } from "@/components/auth/ForbiddenView";
import {
  createCategoryAdminAction,
  createAuthorAdminAction,
  createPublisherAdminAction,
} from "@/features/admin/actions";

interface AdminTaxonomiesPageProps {
  searchParams: Promise<{
    created?: string;
    error?: string;
  }>;
}

export default async function AdminTaxonomiesPage({
  searchParams,
}: AdminTaxonomiesPageProps) {
  const user = await requireAuth("/admin/taxonomies");
  if (user.role !== "admin") {
    return (
      <ForbiddenView requestedPath="/admin/taxonomies" userName={user.name} />
    );
  }

  const resolvedParams = await searchParams;
  const createdType = resolvedParams.created;
  const errorMessage = resolvedParams.error;

  const [categories, authors, publishers] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { books: true } },
      },
    }),
    prisma.author.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { books: true } },
      },
    }),
    prisma.publisher.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { books: true } },
      },
    }),
  ]);

  return (
    <div className="pb-16">
      <PageHeader
        title="Kelola Kategori, Penulis & Penerbit"
        subtitle="Manajemen taksonomi master data perpustakaan untuk menjaga konsistensi klasifikasi katalog."
        fallbackHref="/admin"
        actions={
          <Link
            href="/books/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[#92400E] px-4 py-2 text-xs font-semibold text-white hover:bg-[#78350F]"
          >
            <BookPlus className="h-4 w-4" />
            <span>Tambah Buku Baru</span>
          </Link>
        }
      />

      <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        {createdType && (
          <div className="flex items-center gap-2.5 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm font-medium text-emerald-900 dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-200">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            <span>
              Data{" "}
              <strong>
                {createdType === "category"
                  ? "Kategori Literatur"
                  : createdType === "author"
                  ? "Profil Penulis"
                  : "Penerbit"}
              </strong>{" "}
              baru berhasil ditambahkan ke katalog dan siap digunakan pada formulir buku!
            </span>
          </div>
        )}

        {errorMessage && (
          <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm font-medium text-red-900 dark:border-red-800/60 dark:bg-red-950/50 dark:text-red-200">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <form
            action={createCategoryAdminAction}
            className="flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
                <Layers className="h-5 w-5 text-[#92400E] dark:text-amber-400" />
                <h2 className="font-heading text-base font-bold text-[var(--fg)]">
                  Tambah Kategori Baru
                </h2>
              </div>

              <div>
                <label
                  htmlFor="cat-name"
                  className="block text-xs font-semibold text-[var(--fg)]"
                >
                  Nama Kategori <span className="text-red-600">*</span>
                </label>
                <input
                  id="cat-name"
                  name="name"
                  type="text"
                  required
                  minLength={2}
                  placeholder="Mis. Bioinformatika & Genomik"
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--fg)]"
                />
              </div>

              <div>
                <label
                  htmlFor="cat-color"
                  className="block text-xs font-semibold text-[var(--fg)]"
                >
                  Warna Aksen Kartu
                </label>
                <select
                  id="cat-color"
                  name="accentColor"
                  defaultValue="#92400E"
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--fg)]"
                >
                  <option value="#92400E">Cokelat Kulit (#92400E)</option>
                  <option value="#0F766E">Hijau Zamrud (#0F766E)</option>
                  <option value="#1E40AF">Biru Akademik (#1E40AF)</option>
                  <option value="#7C3AED">Ungu Klasik (#7C3AED)</option>
                  <option value="#B45309">Amber Kuningan (#B45309)</option>
                  <option value="#BE123C">Merah Marun (#BE123C)</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="cat-desc"
                  className="block text-xs font-semibold text-[var(--fg)]"
                >
                  Deskripsi Singkat Kategori
                </label>
                <textarea
                  id="cat-desc"
                  name="description"
                  rows={2}
                  placeholder="Penjelasan cakupan keilmuan kategori ini..."
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--fg)]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#92400E] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#78350F]"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Simpan Kategori</span>
            </button>
          </form>

          <form
            action={createAuthorAdminAction}
            className="flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
                <Feather className="h-5 w-5 text-[#92400E] dark:text-amber-400" />
                <h2 className="font-heading text-base font-bold text-[var(--fg)]">
                  Tambah Penulis Baru
                </h2>
              </div>

              <div>
                <label
                  htmlFor="author-name"
                  className="block text-xs font-semibold text-[var(--fg)]"
                >
                  Nama Lengkap Penulis <span className="text-red-600">*</span>
                </label>
                <input
                  id="author-name"
                  name="name"
                  type="text"
                  required
                  minLength={2}
                  placeholder="Mis. Dr. Kartika Kusuma, M.Hum."
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--fg)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="author-nat"
                    className="block text-xs font-semibold text-[var(--fg)]"
                  >
                    Kebangsaan
                  </label>
                  <input
                    id="author-nat"
                    name="nationality"
                    type="text"
                    defaultValue="Indonesia"
                    className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--fg)]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="author-birth"
                    className="block text-xs font-semibold text-[var(--fg)]"
                  >
                    Tahun Lahir
                  </label>
                  <input
                    id="author-birth"
                    name="birthYear"
                    type="number"
                    placeholder="1978"
                    className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--fg)]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="author-bio"
                  className="block text-xs font-semibold text-[var(--fg)]"
                >
                  Biografi Singkat
                </label>
                <textarea
                  id="author-bio"
                  name="bio"
                  rows={2}
                  placeholder="Latar belakang akademik dan fokus karya tulis..."
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--fg)]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#92400E] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#78350F]"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Simpan Penulis</span>
            </button>
          </form>

          <form
            action={createPublisherAdminAction}
            className="flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
                <Building2 className="h-5 w-5 text-[#92400E] dark:text-amber-400" />
                <h2 className="font-heading text-base font-bold text-[var(--fg)]">
                  Tambah Penerbit Baru
                </h2>
              </div>

              <div>
                <label
                  htmlFor="pub-name"
                  className="block text-xs font-semibold text-[var(--fg)]"
                >
                  Nama Lembaga Penerbit <span className="text-red-600">*</span>
                </label>
                <input
                  id="pub-name"
                  name="name"
                  type="text"
                  required
                  minLength={2}
                  placeholder="Mis. Balai Pustaka Akademika"
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--fg)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="pub-city"
                    className="block text-xs font-semibold text-[var(--fg)]"
                  >
                    Kota Kedudukan
                  </label>
                  <input
                    id="pub-city"
                    name="city"
                    type="text"
                    defaultValue="Yogyakarta"
                    className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--fg)]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="pub-year"
                    className="block text-xs font-semibold text-[var(--fg)]"
                  >
                    Tahun Berdiri
                  </label>
                  <input
                    id="pub-year"
                    name="foundedYear"
                    type="number"
                    defaultValue={2010}
                    className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--fg)]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="pub-web"
                  className="block text-xs font-semibold text-[var(--fg)]"
                >
                  Situs Web Resmi (Opsional)
                </label>
                <input
                  id="pub-web"
                  name="website"
                  type="text"
                  placeholder="https://penerbit.ac.id"
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--fg)]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#92400E] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#78350F]"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Simpan Penerbit</span>
            </button>
          </form>
        </div>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-lg font-bold text-[var(--fg)]">
              Daftar Kategori Literatur ({categories.length})
            </h2>
            <Link
              href="/categories"
              className="text-xs font-semibold text-[#92400E] hover:underline dark:text-amber-300"
            >
              Lihat Halaman Kategori Publik
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex flex-col justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)]/60 p-3.5"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="inline-block h-3 w-3 rounded-full"
                      style={{ backgroundColor: cat.accentColor }}
                    />
                  </div>
                  <h3 className="font-heading mt-1.5 text-sm font-bold text-[var(--fg)]">
                    {cat.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs text-[var(--fg-muted)]">
                    {cat.description}
                  </p>
                </div>
                <div className="mt-3 border-t border-[var(--border)] pt-2 text-right text-xs font-semibold text-[#92400E] dark:text-amber-300">
                  {cat._count.books} Buku Terhubung
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}