import Link from "next/link";
import {
  Bell,
  BellRing,
  CheckCheck,
  Info,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  markAllNotificationsReadAction,
} from "@/features/account/actions";

export const dynamic = "force-dynamic";

interface NotificationsPageProps {
  searchParams: Promise<{ filter?: string; type?: string }>;
}

export default async function NotificationsPage({
  searchParams,
}: NotificationsPageProps) {
  const sessionUser = await requireAuth("/account/notifications");
  const resolvedParams = await searchParams;
  const activeFilter = resolvedParams.filter === "unread" ? "unread" : "all";
  const activeType = resolvedParams.type ?? "all";

  const notifications = await prisma.notification.findMany({
    where: { userId: sessionUser.id },
    orderBy: { createdAt: "desc" },
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen pb-16">
      <PageHeader
        title="Kotak Masuk Notifikasi"
        subtitle={
          sessionUser.role === "admin"
            ? "Pemberitahuan otomatis seputar peminjaman anggota, pengembalian buku, pengingat jatuh tempo, dan agenda komunitas."
            : "Pemberitahuan otomatis seputar peminjaman buku, pengingat jatuh tempo, pengembalian mandiri, dan agenda komunitas."
        }
        fallbackHref={sessionUser.role === "admin" ? "/admin" : "/account/profile"}
        actions={
          unreadCount > 0 ? (
            <form action={markAllNotificationsReadAction}>
              <button
                type="submit"
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#92400E] px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#78350F]"
              >
                <CheckCheck className="h-4 w-4" />
                <span>Tandai Semua Sudah Dibaca ({unreadCount})</span>
              </button>
            </form>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3.5 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              <CheckCheck className="h-4 w-4" />
              <span>Semua Notifikasi Sudah Dibaca</span>
            </span>
          )
        }
      />

      <main className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
        <section className="flex flex-col justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-xs sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={
                activeType === "all"
                  ? "/account/notifications"
                  : `/account/notifications?type=${activeType}`
              }
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                activeFilter === "all"
                  ? "bg-[#92400E] text-white"
                  : "bg-[var(--surface)] text-[var(--fg-muted)] hover:text-[var(--fg)]"
              }`}
            >
              <Bell className="h-3.5 w-3.5" />
              <span>Semua ({notifications.length})</span>
            </Link>
            <Link
              href={
                activeType === "all"
                  ? "/account/notifications?filter=unread"
                  : `/account/notifications?filter=unread&type=${activeType}`
              }
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                activeFilter === "unread"
                  ? "bg-[#92400E] text-white"
                  : "bg-[var(--surface)] text-[var(--fg-muted)] hover:text-[var(--fg)]"
              }`}
            >
              <BellRing className="h-3.5 w-3.5" />
              <span>Belum Dibaca ({unreadCount})</span>
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { key: "all", label: "Semua Kategori" },
              { key: "borrow", label: "Peminjaman" },
              { key: "reminder", label: "Pengingat" },
              { key: "event", label: "Acara" },
              { key: "info", label: "Info Akun" },
            ].map((cat) => {
              const isSelected = activeType === cat.key;
              const href =
                cat.key === "all"
                  ? activeFilter === "unread"
                    ? "/account/notifications?filter=unread"
                    : "/account/notifications"
                  : activeFilter === "unread"
                    ? `/account/notifications?filter=unread&type=${cat.key}`
                    : `/account/notifications?type=${cat.key}`;

              return (
                <Link
                  key={cat.key}
                  href={href}
                  className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                    isSelected
                      ? "border-[#92400E] bg-[#92400E]/15 text-[#92400E] dark:text-amber-300"
                      : "border-[var(--border)] bg-[var(--surface)]/60 text-[var(--fg-muted)] hover:border-[#92400E]/60"
                  }`}
                >
                  {cat.label}
                </Link>
              );
            })}
          </div>
        </section>

      </main>
    </div>
  );
}