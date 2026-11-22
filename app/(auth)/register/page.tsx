import Link from "next/link";
import { UserPlus, AlertCircle } from "lucide-react";
import { registerUserAction } from "@/features/auth/actions";

interface RegisterPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const FACULTY_OPTIONS = [
  "Fakultas Ilmu Komputer & Teknologi Informasi",
  "Fakultas Ilmu Pengetahuan Budaya & Sastra",
  "Fakultas Ekonomi & Bisnis",
  "Fakultas Teknik & Rekayasa",
  "Fakultas Ilmu Sosial & Ilmu Politik",
  "Fakultas Hukum & Tata Negara",
  "Fakultas Kedokteran & Ilmu Kesehatan",
  "Fakultas Matematika & Ilmu Pengetahuan Alam",
  "Fakultas Psikologi & Pendidikan",
];

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  const errorMsg = typeof params.error === "string" ? params.error : null;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-12rem)] max-w-md flex-col justify-center px-4 py-12">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xs sm:p-8">
        <div className="mb-6">
          <h1 className="font-serif text-2xl font-semibold text-[var(--fg)]">Daftar Akun Baru</h1>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Buat akun anggota untuk langsung meminjam dan menyimpan buku.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-red-600/30 bg-red-500/10 px-4 py-3 text-xs font-medium text-red-900 dark:text-red-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form action={registerUserAction} className="space-y-4">
          <input type="hidden" name="avatarColor" value="#8B3A1E" />

          <div>
            <label htmlFor="name" className="mb-1.5 block text-xs font-medium text-[var(--fg)]">
              Nama Lengkap
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="Mis. Livi Pratama"
              className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3.5 text-sm text-[var(--fg)] placeholder:text-[var(--fg-muted)] focus:border-[var(--primary)] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-[var(--fg)]">
              Alamat Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="nama@untar.ac.id"
              className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3.5 text-sm text-[var(--fg)] placeholder:text-[var(--fg-muted)] focus:border-[var(--primary)] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="faculty" className="mb-1.5 block text-xs font-medium text-[var(--fg)]">
              Fakultas
            </label>
            <select
              id="faculty"
              name="faculty"
              defaultValue={FACULTY_OPTIONS[0]}
              className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3.5 text-sm text-[var(--fg)] focus:border-[var(--primary)] focus:outline-none"
            >
              {FACULTY_OPTIONS.map((fac) => (
                <option key={fac} value={fac}>
                  {fac}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-[var(--fg)]">
              Password (Minimal 8 Karakter)
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              placeholder="Minimal 8 karakter"
              className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3.5 text-sm text-[var(--fg)] placeholder:text-[var(--fg-muted)] focus:border-[var(--primary)] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-fg)] transition-colors hover:bg-[var(--primary-hover)]"
          >
            <UserPlus className="h-4 w-4" />
            <span>Buat Akun &amp; Masuk</span>
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[var(--fg-muted)]">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-medium text-[var(--primary)] hover:underline">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
