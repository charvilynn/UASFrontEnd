"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BookOpen,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import { logoutAction } from "@/features/shared/actions";
import type { ServerNavigationPayload } from "@/lib/navigation";

export interface NavbarUser {
  id: number;
  name: string;
  email: string;
  role: "member" | "admin";
  memberCode: string;
  avatarColor: string;
}

interface NavbarProps {
  user: NavbarUser | null;
  cartCount: number;
  wishlistCount: number;
  unreadNotifCount: number;
  navigation: ServerNavigationPayload;
}

export function Navbar({
  user,
  cartCount,
  unreadNotifCount,
  navigation,
}: NavbarProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setAccountOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function openSearchPalette() {
    window.dispatchEvent(new CustomEvent("charv:open-command-palette"));
  }

  return (
    <>
      <header
        data-testid="global-navbar"
        className="sticky top-0 w-full border-b border-[var(--border)] bg-[var(--bg)]/95 backdrop-blur-md"
        style={{ height: "var(--nav-h, 64px)", zIndex: "var(--z-sticky, 20)" }}
      >
        <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between gap-2 px-3 sm:gap-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            onClick={() => {
              setMenuOpen(false);
              setAccountOpen(false);
            }}
            className="flex shrink-0 items-center gap-2"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--primary)] text-[var(--primary-fg)] sm:h-9 sm:w-9">
              <BookOpen className="h-4 w-4" />
            </div>
            <span className="font-serif text-base font-semibold tracking-tight text-[var(--fg)] sm:text-lg">
              Charvlibrary
            </span>
          </Link>

          <nav
            aria-label="Navigasi Utama"
            className="hidden items-center gap-1 lg:flex"
          >
            {navigation.primaryLinks.slice(0, 5).map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors xl:px-3.5 ${
                    isActive
                      ? "bg-[var(--muted)] font-semibold text-[var(--primary)]"
                      : "text-[var(--fg-muted)] hover:bg-[var(--surface)] hover:text-[var(--fg)]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={openSearchPalette}
              data-testid="open-command-palette"
              aria-label="Cari buku di katalog (Ctrl+K)"
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-2.5 text-xs font-medium text-[var(--fg-muted)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--fg)] sm:px-3"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Cari</span>
              <kbd className="hidden rounded border border-[var(--border)] bg-[var(--card)] px-1.5 py-0.5 font-mono text-[10px] xl:inline">
                Ctrl K
              </kbd>
            </button>

            {user ? (
              <>
                <Link
                  href="/cart"
                  aria-label="Keranjang Pinjam"
                  className="relative hidden h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)] sm:inline-flex"
                >
                  <ShoppingBag className="h-4 w-4" />
                  {cartCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--primary)] px-1 text-[10px] font-bold text-white">
                      {cartCount}
                    </span>
                  )}
                </Link>

                <Link
                  href="/account/notifications"
                  aria-label={`Notifikasi (${unreadNotifCount} belum dibaca)`}
                  data-testid="navbar-notifications-link"
                  className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)]"
                >
                  <Bell className="h-4 w-4" />
                  {unreadNotifCount > 0 && (
                    <span
                      data-testid="navbar-unread-notif-badge"
                      className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--primary)] px-1 text-[10px] font-bold text-white"
                    >
                      {unreadNotifCount}
                    </span>
                  )}
                </Link>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setAccountOpen((prev) => !prev)}
                    aria-expanded={accountOpen}
                    data-testid="navbar-account-button"
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-2 text-xs font-semibold text-[var(--fg)] transition-colors hover:border-[var(--border-strong)] sm:gap-2 sm:px-2.5"
                  >
                    <span
                      className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold text-white"
                      style={{ backgroundColor: user.avatarColor || "#8A3B12" }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="hidden max-w-[100px] truncate sm:inline">
                      {user.name.split(" ")[0]}
                    </span>
                    <ChevronDown className="hidden h-3.5 w-3.5 text-[var(--fg-muted)] sm:inline" />
                  </button>

                  {accountOpen && (
                    <div
                      className="absolute right-0 mt-2 w-60 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-2 shadow-lg"
                      style={{ zIndex: "var(--z-dropdown, 30)" }}
                    >
                      <div className="border-b border-[var(--border)] px-3 py-2.5">
                        <p className="truncate text-xs font-semibold text-[var(--fg)]">
                          {user.name}
                        </p>
                        <p className="truncate text-[11px] text-[var(--fg-muted)]">
                          {user.email}
                        </p>
                      </div>

                      <div className="py-1.5 text-xs">
                        <Link
                          href="/account/profile"
                          onClick={() => setAccountOpen(false)}
                          className="block rounded-lg px-3 py-2 font-medium text-[var(--fg)] hover:bg-[var(--muted)]"
                        >
                          Profil & Kartu Anggota
                        </Link>
                        <Link
                          href="/account/borrowed"
                          onClick={() => setAccountOpen(false)}
                          className="block rounded-lg px-3 py-2 font-medium text-[var(--fg)] hover:bg-[var(--muted)]"
                        >
                          Buku Dipinjam
                        </Link>
                        <Link
                          href="/wishlist"
                          onClick={() => setAccountOpen(false)}
                          className="block rounded-lg px-3 py-2 font-medium text-[var(--fg)] hover:bg-[var(--muted)]"
                        >
                          Daftar Keinginan
                        </Link>
                        <Link
                          href="/account/notifications"
                          onClick={() => setAccountOpen(false)}
                          className="flex items-center justify-between rounded-lg px-3 py-2 font-medium text-[var(--fg)] hover:bg-[var(--muted)]"
                        >
                          <span>Notifikasi</span>
                          {unreadNotifCount > 0 && (
                            <span className="rounded-full bg-[var(--primary)] px-1.5 py-0.5 text-[10px] font-bold text-white">
                              {unreadNotifCount}
                            </span>
                          )}
                        </Link>
                        <Link
                          href="/account/preferences"
                          onClick={() => setAccountOpen(false)}
                          className="block rounded-lg px-3 py-2 font-medium text-[var(--fg)] hover:bg-[var(--muted)]"
                        >
                          Preferensi & Kursor
                        </Link>
                        <Link
                          href="/account/security"
                          onClick={() => setAccountOpen(false)}
                          className="block rounded-lg px-3 py-2 font-medium text-[var(--fg)] hover:bg-[var(--muted)]"
                        >
                          Keamanan & Sesi
                        </Link>

                        {user.role === "admin" && (
                          <div className="mt-1.5 border-t border-[var(--border)] pt-1.5">
                            <Link
                              href="/admin"
                              onClick={() => setAccountOpen(false)}
                              className="block rounded-lg px-3 py-2 font-semibold text-[var(--primary)] hover:bg-[var(--muted)]"
                            >
                              Dasbor Admin
                            </Link>
                            <Link
                              href="/books/new"
                              onClick={() => setAccountOpen(false)}
                              className="block rounded-lg px-3 py-2 font-semibold text-[var(--primary)] hover:bg-[var(--muted)]"
                            >
                              Tambah Buku Baru
                            </Link>
                          </div>
                        )}
                      </div>

                      <div className="border-t border-[var(--border)] pt-1.5">
                        <form action={logoutAction}>
                          <button
                            type="submit"
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-[#9E2A2B] hover:bg-[#9E2A2B]/10"
                          >
                            <LogOut className="h-3.5 w-3.5" />
                            <span>Keluar Sesi</span>
                          </button>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link
                  href="/login"
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold text-[var(--fg)] transition-colors hover:bg-[var(--surface)]"
                >
                  <User className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Masuk</span>
                </Link>
                <Link
                  href="/register"
                  className="hidden h-9 items-center rounded-xl bg-[var(--primary)] px-3.5 text-xs font-semibold text-[var(--primary-fg)] transition-colors hover:bg-[var(--primary-hover)] sm:inline-flex"
                >
                  Daftar
                </Link>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setAccountOpen(false);
                setMenuOpen((prev) => !prev);
              }}
              aria-expanded={menuOpen}
              aria-label="Buka menu navigasi lengkap"
              data-testid="navbar-menu-button"
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--card)] px-2.5 text-xs font-semibold text-[var(--fg)] transition-colors hover:border-[var(--primary)] sm:px-3"
            >
              {menuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
              <span>Menu</span>
            </button>
          </div>
        </div>
      </header>

    </>
  );
}