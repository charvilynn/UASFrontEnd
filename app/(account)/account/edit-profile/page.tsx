import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  GraduationCap,
  Palette,
  Phone,
  Save,
  Shield,
  Sparkles,
  User,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { updateProfileAction } from "@/features/account/actions";

export const dynamic = "force-dynamic";

const CARD_COLOR_SWATCHES = [
  { hex: "#92400E", label: "Leather Brown (Klasik)" },
  { hex: "#B45309", label: "Amber Brass (Hangat)" },
  { hex: "#065F46", label: "Emerald Archive (Hijau)" },
  { hex: "#1E3A8A", label: "Oxford Navy (Biru)" },
  { hex: "#7C2D12", label: "Mahogany Wood (Kayu)" },
  { hex: "#581C87", label: "Royal Plum (Ungu)" },
  { hex: "#881337", label: "Burgundy Seal (Merah)" },
  { hex: "#334155", label: "Slate Ink (Abu Gelap)" },
];

const FACULTY_SUGGESTIONS = [
  "Fakultas Ilmu Komputer & Teknologi Informasi",
  "Fakultas Ilmu Budaya & Sastra",
  "Fakultas Ekonomi & Bisnis",
  "Fakultas Teknik & Rekayasa",
  "Fakultas Hukum & Kebijakan Publik",
  "Fakultas Ilmu Sosial & Ilmu Politik",
  "Fakultas Desain & Seni Kreatif",
];

export default async function EditProfilePage() {
  const sessionUser = await requireAuth("/account/edit-profile");

  const member = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: {
      preferences: {
        include: { category: true },
      },
    },
  });

  const currentName = member?.name ?? sessionUser.name;
  const currentFaculty = member?.faculty ?? sessionUser.faculty ?? "";
  const currentPhone = member?.phone ?? sessionUser.phone ?? "";
  const currentBio = member?.bio ?? sessionUser.bio ?? "";
  const currentColor =
    member?.avatarColor ?? sessionUser.avatarColor ?? "#92400E";

  return (
    <div className="min-h-screen pb-16">
      <PageHeader
        title="Edit Profil Anggota"
        subtitle="Perbarui identitas akademik, nomor kontak, biografi singkat, dan warna aksen Kartu Anggota Digital Anda."
        fallbackHref="/account/profile"
        actions={
          <Link
            href="/account/profile"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-xs font-semibold text-[var(--fg)] transition-colors hover:border-[#92400E]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Kembali ke Kartu Anggota</span>
          </Link>
        }
      />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <form
              action={updateProfileAction}
              className="space-y-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xs sm:p-8"
            >
              <div className="border-b border-[var(--border)] pb-4">
                <h2 className="font-heading text-xl font-bold text-[var(--fg)]">
                  Formulir Biodata Anggota
                </h2>
                <p className="mt-1 text-xs text-[var(--fg-muted)]">
                  Perubahan yang Anda simpan langsung memperbarui tampilan kartu anggota digital Anda.
                </p>
              </div>

              <div>
                <label
                  htmlFor="name"
                  className="mb-1.5 flex items-center gap-1.5 text-xs font-bold tracking-wide uppercase text-[var(--fg)]"
                >
                  <User className="h-3.5 w-3.5 text-[#92400E]" />
                  <span>Nama Lengkap Anggota</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  minLength={2}
                  maxLength={80}
                  defaultValue={currentName}
                  placeholder="Masukkan nama lengkap sesuai kartu identitas kampus"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)]/60 px-4 py-2.5 text-sm text-[var(--fg)] transition-colors focus:border-[#92400E] focus:bg-[var(--card)]"
                />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="faculty"
                    className="mb-1.5 flex items-center gap-1.5 text-xs font-bold tracking-wide uppercase text-[var(--fg)]"
                  >
                    <GraduationCap className="h-3.5 w-3.5 text-[#92400E]" />
                    <span>Fakultas / Unit Akademik</span>
                  </label>
                  <input
                    id="faculty"
                    name="faculty"
                    type="text"
                    list="faculty-options"
                    defaultValue={currentFaculty}
                    placeholder="Contoh: Fakultas Ilmu Komputer"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)]/60 px-4 py-2.5 text-sm text-[var(--fg)] transition-colors focus:border-[#92400E] focus:bg-[var(--card)]"
                  />
                  <datalist id="faculty-options">
                    {FACULTY_SUGGESTIONS.map((fac) => (
                      <option key={fac} value={fac} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="mb-1.5 flex items-center gap-1.5 text-xs font-bold tracking-wide uppercase text-[var(--fg)]"
                  >
                    <Phone className="h-3.5 w-3.5 text-[#92400E]" />
                    <span>Nomor Telepon / WhatsApp</span>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    defaultValue={currentPhone}
                    placeholder="+62 812-3456-7890"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)]/60 px-4 py-2.5 text-sm text-[var(--fg)] transition-colors focus:border-[#92400E] focus:bg-[var(--card)]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="bio"
                  className="mb-1.5 block text-xs font-bold tracking-wide uppercase text-[var(--fg)]"
                >
                  Catatan Biografi &amp; Fokus Riset Literasi
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  maxLength={400}
                  defaultValue={currentBio}
                  placeholder="Tuliskan minat bacaan, topik riset, atau kutipan buku favorit Anda..."
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)]/60 px-4 py-2.5 text-sm text-[var(--fg)] transition-colors focus:border-[#92400E] focus:bg-[var(--card)]"
                />
                <p className="mt-1 text-[11px] text-[var(--fg-muted)]">
                  Maksimal 400 karakter. Ditampilkan pada Kartu Anggota Digital dan profil publik ulasan.
                </p>
              </div>

              <div>
                <div className="mb-2.5 flex items-center gap-1.5 text-xs font-bold tracking-wide uppercase text-[var(--fg)]">
                  <Palette className="h-3.5 w-3.5 text-[#92400E]" />
                  <span>Tema Warna Kartu Anggota (`avatarColor`)</span>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {CARD_COLOR_SWATCHES.map((swatch) => {
                    const isSelected =
                      currentColor.toUpperCase() === swatch.hex.toUpperCase();
                    return (
                      <label
                        key={swatch.hex}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${
                          isSelected
                            ? "border-[#92400E] bg-[#92400E]/10"
                            : "border-[var(--border)] bg-[var(--surface)]/50 hover:border-[#92400E]/60"
                        }`}
                      >
                        <input
                          type="radio"
                          name="avatarColor"
                          value={swatch.hex}
                          defaultChecked={isSelected}
                          className="h-4 w-4 accent-[#92400E]"
                        />
                        <span
                          className="h-6 w-6 shrink-0 rounded-lg border border-black/15 shadow-xs"
                          style={{ backgroundColor: swatch.hex }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-[var(--fg)]">
                            {swatch.label}
                          </p>
                          <p className="font-mono text-[10px] text-[var(--fg-muted)]">
                            {swatch.hex}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-5">
                <Link
                  href="/account/profile"
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-xs font-semibold text-[var(--fg)] transition-colors hover:border-[#92400E]"
                >
                  Batal
                </Link>
                <button
                  type="submit"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#92400E] px-6 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#78350F]"
                >
                  <Save className="h-4 w-4" />
                  <span>Simpan Perubahan Profil</span>
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-6 lg:col-span-4">
            <div
              className="rounded-2xl border border-amber-200/30 p-6 text-[#FFFBEB] shadow-md"
              style={{
                background: `linear-gradient(145deg, ${currentColor} 0%, #1C1410 95%)`,
              }}
            >
              <p className="text-[10px] font-semibold tracking-widest uppercase text-amber-200/80">
                Pratinjau Kartu Aktif
              </p>
              <h3 className="font-heading mt-1 text-lg font-bold text-white">
                {currentName}
              </h3>
              <p className="mt-0.5 font-mono text-xs text-amber-300">
                {member?.memberCode ?? sessionUser.memberCode}
              </p>
              <p className="mt-3 text-xs text-amber-100/90">
                {currentFaculty || "Fakultas belum diisi"}
              </p>
              <p className="mt-2 line-clamp-3 text-xs text-amber-100/75">
                {currentBio ||
                  "Belum ada deskripsi biografi. Tambahkan catatan singkat melalui formulir di samping."}
              </p>
              <div className="mt-4 flex items-center gap-2 border-t border-amber-100/20 pt-3 text-[11px] text-amber-200">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Tersimpan pada profil anggota</span>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xs">
              <h3 className="font-heading text-base font-bold text-[var(--fg)]">
                Pengaturan Terkait Lainnya
              </h3>
              <ul className="mt-3 space-y-2.5 text-xs">
                <li>
                  <Link
                    href="/onboarding"
                    className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)]/60 p-3 font-semibold text-[var(--fg)] transition-colors hover:border-[#92400E]"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[#92400E]" />
                      Ubah Genre &amp; Minat Baca ({member?.preferences.length ?? 0})
                    </span>
                    <span>&rarr;</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/account/security"
                    className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)]/60 p-3 font-semibold text-[var(--fg)] transition-colors hover:border-[#92400E]"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Shield className="h-4 w-4 text-[#92400E]" />
                      Ubah Kata Sandi &amp; Sesi Login
                    </span>
                    <span>&rarr;</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}