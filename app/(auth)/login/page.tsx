import Link from "next/link";
import { LogIn, CheckCircle2, AlertCircle, ArrowRight, UserCheck } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { logoutAction } from "@/features/shared/actions";
import { loginUserAction } from "@/features/auth/actions";

interface LoginPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextRaw = typeof params.next === "string" ? params.next : "/";
  const nextUrl = nextRaw.startsWith("/") ? nextRaw : "/";
  const errorMsg = typeof params.error === "string" ? params.error : null;
  const resetSuccess = params.reset === "1" || params.reset === "success";

  const sessionUser = await getSessionUser();

  return (
    <div className="mx-auto flex min-h-[calc(100vh-12rem)] max-w-md flex-col justify-center px-4 py-12">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xs sm:p-8">
        <div className="mb-6">
          <h1 className="font-serif text-2xl font-semibold text-[var(--fg)]">
            Masuk ke Charvlibrary
          </h1>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Gunakan email akun Anda untuk melanjutkan membaca dan meminjam.
          </p>
        </div>

        {sessionUser && (
          <div className="mb-6 rounded-xl border border-emerald-600/30 bg-emerald-500/10 p-4 text-xs">
            <div className="flex items-start gap-2.5">
              <UserCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400" />
              <div>
                <p className="font-semibold text-[var(--fg)]">Aktif sebagai {sessionUser.name}</p>
                <p className="mt-0.5 text-[var(--fg-muted)]">{sessionUser.email}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Link
                href={nextUrl !== "/" ? nextUrl : "/account/profile"}
                className="inline-flex items-center gap-1 rounded-lg bg-[var(--primary)] px-3 py-1.5 font-medium text-[var(--primary-fg)]"
              >
                Lanjutkan
                <ArrowRight className="h-3 w-3" />
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-1.5 font-medium text-[var(--fg)]"
                >
                  Keluar Sesi
                </button>
              </form>
            </div>
          </div>
        )}

        {resetSuccess && (
          <div
            data-testid="reset-password-success-toast"
            className="mb-5 flex items-center gap-2.5 rounded-xl border border-emerald-600/30 bg-emerald-500/10 px-4 py-3 text-xs font-medium text-emerald-900 dark:text-emerald-200"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>Password diperbarui. Silakan masuk.</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-red-600/30 bg-red-500/10 px-4 py-3 text-xs font-medium text-red-900 dark:text-red-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form action={loginUserAction} className="space-y-4">
          <input type="hidden" name="next" value={nextUrl} />

          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-[var(--fg)]">
              Alamat Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="nama@email.com"
              className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3.5 text-sm text-[var(--fg)] placeholder:text-[var(--fg-muted)] focus:border-[var(--primary)] focus:outline-none"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="password" className="block text-xs font-medium text-[var(--fg)]">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-[var(--primary)] hover:underline"
              >
                Lupa password?
              </Link>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Masukkan password"
              className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3.5 text-sm text-[var(--fg)] placeholder:text-[var(--fg-muted)] focus:border-[var(--primary)] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-fg)] transition-colors hover:bg-[var(--primary-hover)]"
          >
            <LogIn className="h-4 w-4" />
            <span>Masuk ke Akun Sekarang</span>
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[var(--fg-muted)]">
          Belum punya akun?{" "}
          <Link href="/register" className="font-medium text-[var(--primary)] hover:underline">
            Daftar sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}
