import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  BellRing,
  BookCopy,
  Calendar,
  Check,
  CheckCheck,
  Clock,
  Info,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/features/account/actions";

export const dynamic = "force-dynamic";

interface NotificationsPageProps {
  searchParams: Promise<{ filter?: string; type?: string }>;
}

function resolveNotificationStyle(type: string) {
  switch (type) {
    case "borrow":
      return {
        label: "Sirkulasi Pinjam",
        badgeClass: "bg-[#92400E]/15 text-[#92400E] dark:text-amber-300",
        Icon: BookCopy,
      };
    case "reminder":
      return {
        label: "Pengingat Tenggat",
        badgeClass: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
        Icon: Clock,
      };
    case "event":
      return {
        label: "Acara Literasi",
        badgeClass: "bg-emerald-600/15 text-emerald-700 dark:text-emerald-300",
        Icon: Calendar,
      };
    default:
      return {
        label: "Info Sistem",
        badgeClass: "bg-blue-600/15 text-blue-700 dark:text-blue-300",
        Icon: Info,
      };
  }
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

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === "unread" && n.isRead) return false;
    if (activeType !== "all" && n.type !== activeType) return false;
    return true;
  });

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

        <section aria-label="Daftar Notifikasi Anggota">
          {filteredNotifications.length > 0 ? (
            <div className="space-y-3">
              {filteredNotifications.map((item) => {
                const { label, badgeClass, Icon } = resolveNotificationStyle(
                  item.type
                );
                const safeActionHref =
                  item.actionHref && item.actionHref.startsWith("/")
                    ? item.actionHref
                    : "/account/borrowed";

                return (
                  <article
                    key={item.id}
                    className={`rounded-2xl border p-5 transition-colors ${
                      item.isRead
                        ? "border-[var(--border)] bg-[var(--card)]"
                        : "border-[#92400E]/50 bg-[var(--surface)] shadow-xs"
                    }`}
                  >
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                      <div className="flex items-start gap-4">
                        <div
                          className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${badgeClass}`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${badgeClass}`}
                            >
                              {label}
                            </span>
                            {!item.isRead && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-[#92400E] px-2 py-0.5 text-[10px] font-bold text-white">
                                Baru
                              </span>
                            )}
                            <span className="text-xs text-[var(--fg-muted)]">
                              {item.createdAt.toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>

                          <h3 className="font-heading text-base font-bold text-[var(--fg)]">
                            {item.title}
                          </h3>
                          <p className="text-xs leading-relaxed text-[var(--fg-muted)] sm:text-sm">
                            {item.message}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                        <Link
                          href={safeActionHref}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs font-semibold text-[#92400E] transition-colors hover:border-[#92400E] dark:text-amber-300"
                        >
                          <span>Tindak Lanjuti</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>

                        {!item.isRead && (
                          <form action={markNotificationReadAction}>
                            <input
                              type="hidden"
                              name="notificationId"
                              value={item.id}
                            />
                            <button
                              type="submit"
                              className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-[#92400E]/10 px-3 py-1.5 text-xs font-semibold text-[#92400E] transition-colors hover:bg-[#92400E] hover:text-white dark:text-amber-300"
                            >
                              <Check className="h-3.5 w-3.5" />
                              <span>Tandai Sudah Dibaca</span>
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="Tidak Ada Notifikasi pada Filter Ini"
              description="Kotak masuk pemberitahuan Anda bersih. Anda dapat melihat seluruh riwayat notifikasi atau kembali ke profil anggota."
              actionLabel="Tampilkan Semua Notifikasi"
              actionHref="/account/notifications"
              secondaryActionLabel="Kembali ke Profil"
              secondaryActionHref="/account/profile"
            />
          )}
        </section>
      </main>
    </div>
  );
}
