import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  Tags,
  Users,
  Bell,
} from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ForbiddenView } from "@/components/auth/ForbiddenView";

const ADMIN_NAV_ITEMS = [
  {
    href: "/admin",
    label: "Ringkasan Admin",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/books",
    label: "Kelola Katalog Buku",
    icon: BookOpen,
  },
  {
    href: "/books/new",
    label: "Tambah Buku Baru",
    icon: PlusCircle,
  },
  {
    href: "/admin/taxonomies",
    label: "Kategori & Penerbit",
    icon: Tags,
  },
  {
    href: "/admin/users",
    label: "Anggota & Pesan",
    icon: Users,
  },
  {
    href: "/account/notifications",
    label: "Notifikasi",
    icon: Bell,
  },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  if (user.role !== "admin") {
    return <ForbiddenView userName={user.name} />;
  }

  const unreadNotifCount = await prisma.notification.count({
    where: { userId: user.id, isRead: false },
  });

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/80 px-4 py-3">
        <div className="flex items-center gap-2 text-xs font-medium text-[var(--fg)]">
          <span className="inline-block h-2 w-2 rounded-full bg-[var(--primary)]" />
          <span>Ruang Pengurus Perpustakaan ({user.name})</span>
        </div>

        <nav
          aria-label="Navigasi Ruang Pengurus"
          className="flex flex-wrap items-center gap-1.5"
        >
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const showUnreadBadge =
              item.href === "/account/notifications" && unreadNotifCount > 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs font-medium text-[var(--fg)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
              >
                <Icon className="h-3.5 w-3.5 text-[var(--primary)]" />
                <span>{item.label}</span>
                {showUnreadBadge && (
                  <span
                    data-testid="admin-layout-unread-notif-badge"
                    className="inline-flex min-w-[18px] items-center justify-center rounded-full bg-[var(--primary)] px-1.5 py-0.5 text-[10px] font-bold leading-none text-white"
                  >
                    {unreadNotifCount > 99 ? "99+" : unreadNotifCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div>{children}</div>
    </div>
  );
}