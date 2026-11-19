"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { destroySession, getSessionUser } from "@/lib/auth";

export async function logoutAction(): Promise<void> {
  await destroySession();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function toggleWishlistQuickAction(
  bookId: number
): Promise<{ ok: boolean; inWishlist: boolean; message: string }> {
  const user = await getSessionUser();
  if (!user) {
    return {
      ok: false,
      inWishlist: false,
      message: "Silakan masuk akun terlebih dahulu untuk menyimpan ke daftar keinginan.",
    };
  }

  const existing = await prisma.wishlist.findUnique({
    where: {
      userId_bookId: {
        userId: user.id,
        bookId,
      },
    },
  });

  if (existing) {
    await prisma.wishlist.delete({ where: { id: existing.id } });
    revalidatePath("/", "layout");
    return {
      ok: true,
      inWishlist: false,
      message: "Buku dihapus dari Daftar Keinginan.",
    };
  }

  await prisma.wishlist.create({
    data: {
      userId: user.id,
      bookId,
      priority: "normal",
    },
  });

  revalidatePath("/", "layout");
  return {
    ok: true,
    inWishlist: true,
    message: "Buku berhasil disimpan ke Daftar Keinginan.",
  };
}

export async function addToCartQuickAction(
  bookId: number,
  durationDays = 14
): Promise<{ ok: boolean; needLogin?: boolean; message: string }> {
  const user = await getSessionUser();
  if (!user) {
    return {
      ok: false,
      needLogin: true,
      message: "Silakan masuk akun untuk meminjam buku.",
    };
  }

  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book) {
    return { ok: false, message: "Buku tidak ditemukan di katalog." };
  }

  if (book.stockAvailable <= 0) {
    return {
      ok: false,
      message: "Buku sedang tidak tersedia (sedang dipinjam).",
    };
  }

  await prisma.borrowCartItem.upsert({
    where: {
      userId_bookId: {
        userId: user.id,
        bookId,
      },
    },
    update: {
      durationDays,
    },
    create: {
      userId: user.id,
      bookId,
      durationDays,
    },
  });

  revalidatePath("/", "layout");
  return {
    ok: true,
    message: `"${book.title}" ditambahkan ke Keranjang Pinjam (${durationDays} hari).`,
  };
}