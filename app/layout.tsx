import type { Metadata } from "next";
import {
  Playfair_Display,
  Plus_Jakarta_Sans,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getServerNavigation } from "@/lib/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { CustomCursor } from "@/components/motion/CustomCursor";

const headingFont = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const bodyFont = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const monoFont = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "Charvlibrary - Ruang Baca & Perpustakaan Akademik",
    template: "%s | Charvlibrary",
  },
  description:
    "Ruang baca literatur akademik dan sastra Charvlibrary dengan katalog 80 buku kurasi nyata.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sessionUser = await getSessionUser();
  const role: "guest" | "member" | "admin" = sessionUser
    ? sessionUser.role === "admin"
      ? "admin"
      : "member"
    : "guest";

  const navigation = getServerNavigation(role);

  let cartCount = 0;
  let wishlistCount = 0;
  let unreadNotifCount = 0;

  if (sessionUser) {
    try {
      const [cCount, wCount, nCount] = await Promise.all([
        prisma.borrowCartItem.count({ where: { userId: sessionUser.id } }),
        prisma.wishlist.count({ where: { userId: sessionUser.id } }),
        prisma.notification.count({
          where: { userId: sessionUser.id, isRead: false },
        }),
      ]);
      cartCount = cCount;
      wishlistCount = wCount;
      unreadNotifCount = nCount;
    } catch {
    }
  }

  return (
    <html
      lang="id"
      className={`${headingFont.variable} ${bodyFont.variable} ${monoFont.variable}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--fg)] antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-[var(--primary)] focus:px-4 focus:py-2 focus:text-xs focus:font-bold focus:text-white"
        >
          Lewati ke konten utama
        </a>

        <Navbar
          user={
            sessionUser
              ? {
                  id: sessionUser.id,
                  name: sessionUser.name,
                  email: sessionUser.email,
                  role: sessionUser.role,
                  memberCode: sessionUser.memberCode,
                  avatarColor: sessionUser.avatarColor,
                }
              : null
          }
          cartCount={cartCount}
          wishlistCount={wishlistCount}
          unreadNotifCount={unreadNotifCount}
          navigation={navigation}
        />

        <main id="main-content" className="flex-1">
          {children}
        </main>

        <CommandPalette />
        <CustomCursor />
        <Footer />
      </body>
    </html>
  );
}