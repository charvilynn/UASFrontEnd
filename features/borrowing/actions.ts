"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import {
  notifyAdminsBookBorrowed,
  notifyAdminsBookReturned,
} from "@/lib/notifications";

function generateLoanCode(): string {
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `LN-202605-${randomDigits}`;
}

export async function removeFromWishlistAction(formData: FormData): Promise<void> {
  const user = await requireAuth("/wishlist");
  const wishlistId = Number(formData.get("wishlistId"));
  const bookId = Number(formData.get("bookId"));

  if (wishlistId) {
    await prisma.wishlist.deleteMany({
      where: { id: wishlistId, userId: user.id },
    });
  } else if (bookId) {
    await prisma.wishlist.deleteMany({
      where: { userId: user.id, bookId },
    });
  }

  revalidatePath("/wishlist");
  revalidatePath("/explore");
}

export async function updateWishlistPriorityAction(formData: FormData): Promise<void> {
  const user = await requireAuth("/wishlist");
  const wishlistId = Number(formData.get("wishlistId"));
  const rawPriority = String(formData.get("priority") || "normal");
  const noteRaw = formData.get("note");

  const validPriorities = ["high", "normal", "low"];
  const priority = validPriorities.includes(rawPriority) ? rawPriority : "normal";

  if (!wishlistId) return;

  const updateData: { priority: string; note?: string | null } = { priority };
  if (noteRaw !== null) {
    const trimmed = String(noteRaw).trim();
    updateData.note = trimmed.length > 0 ? trimmed : null;
  }

  await prisma.wishlist.updateMany({
    where: { id: wishlistId, userId: user.id },
    data: updateData,
  });

  revalidatePath("/wishlist");
}

export async function moveWishlistToCartAction(formData: FormData): Promise<void> {
  const user = await requireAuth("/wishlist");
  const wishlistId = Number(formData.get("wishlistId"));
  const bookId = Number(formData.get("bookId"));
  const durationDays = Number(formData.get("durationDays")) || 14;

  if (!bookId) return;

  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book || book.stockAvailable <= 0) {
    redirect("/wishlist?error=Stok+buku+sedang+kosong+untuk+dipinjam");
  }

  await prisma.$transaction(async (tx) => {
    await tx.borrowCartItem.upsert({
      where: {
        userId_bookId: {
          userId: user.id,
          bookId,
        },
      },
      update: {
        durationDays: [7, 14, 21].includes(durationDays) ? durationDays : 14,
      },
      create: {
        userId: user.id,
        bookId,
        durationDays: [7, 14, 21].includes(durationDays) ? durationDays : 14,
      },
    });

    if (wishlistId) {
      await tx.wishlist.deleteMany({
        where: { id: wishlistId, userId: user.id },
      });
    } else {
      await tx.wishlist.deleteMany({
        where: { userId: user.id, bookId },
      });
    }
  });

  revalidatePath("/wishlist");
  revalidatePath("/cart");
  redirect("/cart?moved=1");
}

export async function addBookToWishlistFormAction(formData: FormData): Promise<void> {
  const user = await requireAuth("/wishlist");
  const bookId = Number(formData.get("bookId"));
  const rawPriority = String(formData.get("priority") || "normal");
  const note = String(formData.get("note") || "").trim();

  if (!bookId) return;

  const validPriorities = ["high", "normal", "low"];
  const priority = validPriorities.includes(rawPriority) ? rawPriority : "normal";

  await prisma.wishlist.upsert({
    where: {
      userId_bookId: {
        userId: user.id,
        bookId,
      },
    },
    update: {
      priority,
      note: note.length > 0 ? note : null,
    },
    create: {
      userId: user.id,
      bookId,
      priority,
      note: note.length > 0 ? note : null,
    },
  });

  revalidatePath("/wishlist");
}

export async function updateCartDurationAction(formData: FormData): Promise<void> {
  const user = await requireAuth("/cart");
  const cartItemId = Number(formData.get("cartItemId"));
  const rawDuration = Number(formData.get("durationDays"));
  const durationDays = [7, 14, 21].includes(rawDuration) ? rawDuration : 14;

  if (!cartItemId) return;

  await prisma.borrowCartItem.updateMany({
    where: { id: cartItemId, userId: user.id },
    data: { durationDays },
  });

  revalidatePath("/cart");
  revalidatePath("/borrow/checkout");
}

export async function removeFromCartAction(formData: FormData): Promise<void> {
  const user = await requireAuth("/cart");
  const cartItemId = Number(formData.get("cartItemId"));
  const bookId = Number(formData.get("bookId"));

  if (cartItemId) {
    await prisma.borrowCartItem.deleteMany({
      where: { id: cartItemId, userId: user.id },
    });
  } else if (bookId) {
    await prisma.borrowCartItem.deleteMany({
      where: { userId: user.id, bookId },
    });
  }

  revalidatePath("/cart");
  revalidatePath("/borrow/checkout");
}

export async function confirmCheckoutAction(formData: FormData): Promise<void> {
  const user = await requireAuth("/borrow/checkout");
  const notesRaw = String(formData.get("notes") || "").trim();
  const notes = notesRaw.length > 0 ? notesRaw : null;

  const cartItems = await prisma.borrowCartItem.findMany({
    where: { userId: user.id },
    include: { book: true },
    orderBy: { addedAt: "asc" },
  });

  if (cartItems.length === 0) {
    redirect("/cart?error=Keranjang+pinjam+masih+kosong");
  }

  const activeLoansCount = await prisma.loan.count({
    where: {
      userId: user.id,
      status: { in: ["borrowed", "overdue"] },
    },
  });

  const maxQuota = 5;
  const remainingQuota = Math.max(0, maxQuota - activeLoansCount);

  if (remainingQuota <= 0) {
    redirect("/cart?error=Kuota+pinjam+aktif+Anda+sudah+mencapai+batas+maksimal+5+buku");
  }

  const itemsToProcess = cartItems
    .filter((item) => item.book.stockAvailable > 0)
    .slice(0, remainingQuota);

  if (itemsToProcess.length === 0) {
    redirect("/cart?error=Stok+buku+di+keranjang+sedang+tidak+tersedia");
  }

  let lastLoanCode = "";
  const createdCodes: string[] = [];
  const borrowedBookTitles: string[] = [];
  const dueDates: Date[] = [];

  await prisma.$transaction(async (tx) => {
    for (const item of itemsToProcess) {
      let code = generateLoanCode();
      const existing = await tx.loan.findUnique({ where: { loanCode: code } });
      if (existing) {
        code = `LN-202605-${Math.floor(1000 + Math.random() * 8999)}`;
      }

      const now = new Date();
      const dueDate = new Date(
        now.getTime() + item.durationDays * 24 * 60 * 60 * 1000
      );

      await tx.loan.create({
        data: {
          loanCode: code,
          userId: user.id,
          bookId: item.bookId,
          borrowedAt: now,
          dueDate,
          status: "borrowed",
          notes,
        },
      });

      await tx.book.update({
        where: { id: item.bookId },
        data: {
          stockAvailable: 0,
        },
      });

      await tx.borrowCartItem.delete({
        where: { id: item.id },
      });

      lastLoanCode = code;
      createdCodes.push(code);
      borrowedBookTitles.push(item.book.title);
      dueDates.push(dueDate);
    }

    await tx.notification.create({
      data: {
        userId: user.id,
        type: "borrow",
        title: "Bukti Peminjaman Buku Berhasil Diterbitkan",
        message: `Anda berhasil meminjam ${createdCodes.length} buku dengan kode transaksi ${createdCodes.join(", ")}. Harap kembalikan tepat waktu.`,
        actionHref: `/borrow/confirmation?code=${encodeURIComponent(lastLoanCode)}`,
      },
    });

    await notifyAdminsBookBorrowed(
      {
        borrowerName: user.name,
        borrowerEmail: user.email,
        borrowerCode: user.memberCode,
        bookTitles: borrowedBookTitles,
        loanCodes: createdCodes,
        dueDates,
      },
      tx
    );
  });

  revalidatePath("/admin");
  revalidatePath("/admin/books");
  revalidatePath("/account/notifications");
  revalidatePath("/explore");
  revalidatePath("/", "layout");
  redirect(`/borrow/confirmation?code=${encodeURIComponent(lastLoanCode)}`);
}

export async function returnLoanItemAction(formData: FormData): Promise<void> {
  const user = await requireAuth("/borrow/returns");
  const loanId = Number(formData.get("loanId"));

  if (!loanId) return;

  const loan = await prisma.loan.findFirst({
    where: { id: loanId, userId: user.id },
    include: { book: true },
  });

  if (!loan || loan.status === "returned") {
    redirect("/borrow/returns");
  }

  const now = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.loan.update({
      where: { id: loan.id },
      data: {
        status: "returned",
        returnedAt: now,
      },
    });

    const nextAvailable = Math.max(1, loan.book.stockTotal);

    await tx.book.update({
      where: { id: loan.bookId },
      data: {
        stockAvailable: nextAvailable,
      },
    });

    await tx.readingHistory.create({
      data: {
        userId: user.id,
        bookId: loan.bookId,
        loanId: loan.id,
        pagesRead: loan.book.pages,
        startedAt: loan.borrowedAt,
        finishedAt: now,
        status: "completed",
        reflection: `Dikembalikan secara mandiri melalui pusat sirkulasi (${loan.loanCode}).`,
      },
    });

    await tx.notification.create({
      data: {
        userId: user.id,
        type: "info",
        title: "Pengembalian Buku Berhasil Dicatat",
        message: `Buku "${loan.book.title}" (${loan.loanCode}) telah berhasil dikembalikan ke rak perpustakaan.`,
        actionHref: "/borrow/returns",
      },
    });

    await notifyAdminsBookReturned(
      {
        borrowerName: user.name,
        borrowerEmail: user.email,
        bookTitle: loan.book.title,
        loanCode: loan.loanCode,
      },
      tx
    );
  });

  revalidatePath("/borrow/returns");
  revalidatePath("/account/borrowed");
  revalidatePath("/account/history");
  revalidatePath("/account/notifications");
  revalidatePath("/admin");
  revalidatePath("/admin/books");
  revalidatePath("/explore");
  revalidatePath("/", "layout");
  redirect(`/borrow/returns?status=returned&code=${encodeURIComponent(loan.loanCode)}`);
}