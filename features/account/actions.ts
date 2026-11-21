"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { notifyAdminsBookReturned } from "@/lib/notifications";

export async function updateProfileAction(formData: FormData): Promise<void> {
  const sessionUser = await requireAuth("/account/edit-profile");

  const rawName = String(formData.get("name") ?? "").trim();
  const rawFaculty = String(formData.get("faculty") ?? "").trim();
  const rawPhone = String(formData.get("phone") ?? "").trim();
  const rawBio = String(formData.get("bio") ?? "").trim();
  const rawAvatarColor = String(formData.get("avatarColor") ?? "").trim();

  const name = rawName.length >= 2 ? rawName : sessionUser.name;
  const avatarColor = /^#[0-9A-Fa-f]{6}$/.test(rawAvatarColor)
    ? rawAvatarColor
    : sessionUser.avatarColor || "#92400E";

  await prisma.user.update({
    where: { id: sessionUser.id },
    data: {
      name,
      faculty: rawFaculty || null,
      phone: rawPhone || null,
      bio: rawBio || null,
      avatarColor,
    },
  });

  await prisma.notification.create({
    data: {
      userId: sessionUser.id,
      type: "info",
      title: "Profil Anggota Diperbarui",
      message: `Biodata profil dan kartu anggota digital untuk ${name} telah berhasil disimpan.`,
      actionHref: "/account/profile",
    },
  });

  revalidatePath("/account/profile");
  revalidatePath("/account/edit-profile");
  revalidatePath("/account/notifications");
  revalidatePath("/", "layout");
}

export async function extendLoanAction(formData: FormData): Promise<void> {
  const sessionUser = await requireAuth("/account/borrowed");
  const loanId = Number(formData.get("loanId"));

  if (!Number.isInteger(loanId) || loanId <= 0) {
    return;
  }

  const loan = await prisma.loan.findFirst({
    where: {
      id: loanId,
      userId: sessionUser.id,
    },
    include: {
      book: true,
    },
  });

  if (!loan || loan.status === "returned" || loan.extendedCount >= 2) {
    return;
  }

  const baseDate =
    loan.dueDate.getTime() > Date.now() ? loan.dueDate : new Date();
  const newDueDate = new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000);
  const nextExtendedCount = loan.extendedCount + 1;

  await prisma.loan.update({
    where: { id: loan.id },
    data: {
      dueDate: newDueDate,
      extendedCount: nextExtendedCount,
      status: newDueDate > new Date() ? "borrowed" : loan.status,
    },
  });

  await prisma.notification.create({
    data: {
      userId: sessionUser.id,
      type: "borrow",
      title: "Masa Pinjam Diperpanjang 7 Hari",
      message: `Pinjaman buku "${loan.book.title}" (Kode: ${loan.loanCode}) diperpanjang hingga ${newDueDate.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}. Kuota perpanjangan terpakai: ${nextExtendedCount}/2.`,
      actionHref: "/account/borrowed",
    },
  });

  revalidatePath("/account/borrowed");
  revalidatePath("/account/profile");
  revalidatePath("/account/notifications");
  revalidatePath("/borrow/returns");
}

export async function returnBookAction(formData: FormData): Promise<void> {
  const sessionUser = await requireAuth("/account/borrowed");
  const loanId = Number(formData.get("loanId"));

  if (!Number.isInteger(loanId) || loanId <= 0) {
    return;
  }

  const loan = await prisma.loan.findFirst({
    where: {
      id: loanId,
      userId: sessionUser.id,
    },
    include: {
      book: true,
    },
  });

  if (!loan || loan.status === "returned") {
    return;
  }

  const now = new Date();

  await prisma.loan.update({
    where: { id: loan.id },
    data: {
      status: "returned",
      returnedAt: now,
    },
  });

  await prisma.book.update({
    where: { id: loan.bookId },
    data: {
      stockAvailable: Math.max(1, loan.book.stockTotal),
    },
  });

  const existingHistory = await prisma.readingHistory.findFirst({
    where: {
      userId: sessionUser.id,
      loanId: loan.id,
    },
  });

  if (existingHistory) {
    await prisma.readingHistory.update({
      where: { id: existingHistory.id },
      data: {
        pagesRead: loan.book.pages,
        finishedAt: now,
        status: "completed",
        reflection:
          existingHistory.reflection ||
          `Menyelesaikan bacaan buku "${loan.book.title}" dari sirkulasi pinjaman ${loan.loanCode}.`,
      },
    });
  } else {
    await prisma.readingHistory.create({
      data: {
        userId: sessionUser.id,
        bookId: loan.bookId,
        loanId: loan.id,
        pagesRead: loan.book.pages,
        startedAt: loan.borrowedAt,
        finishedAt: now,
        status: "completed",
        reflection: `Menyelesaikan bacaan buku "${loan.book.title}" melalui peminjaman ${loan.loanCode}.`,
      },
    });
  }

  const allHistory = await prisma.readingHistory.findMany({
    where: { userId: sessionUser.id },
  });
  const completedBooks = allHistory.filter(
    (entry) => entry.status === "completed"
  ).length;
  const totalPages = allHistory.reduce(
    (sum, entry) => sum + Math.max(0, entry.pagesRead),
    0
  );

  await prisma.readingGoal.upsert({
    where: {
      userId_year: {
        userId: sessionUser.id,
        year: 2026,
      },
    },
    update: {
      currentBooks: completedBooks,
      currentPages: totalPages,
    },
    create: {
      userId: sessionUser.id,
      year: 2026,
      targetBooks: 12,
      targetPages: 3600,
      currentBooks: completedBooks,
      currentPages: totalPages,
    },
  });

  await prisma.notification.create({
    data: {
      userId: sessionUser.id,
      type: "borrow",
      title: "Pengembalian Buku Berhasil Dicatat",
      message: `Buku "${loan.book.title}" (${loan.loanCode}) telah dikembalikan ke rak sirkulasi dan dicatat ke jurnal riwayat bacaan Anda.`,
      actionHref: "/account/history",
    },
  });

  await notifyAdminsBookReturned({
    borrowerName: sessionUser.name,
    borrowerEmail: sessionUser.email,
    bookTitle: loan.book.title,
    loanCode: loan.loanCode,
  });

  revalidatePath("/account/borrowed");
  revalidatePath("/account/history");
  revalidatePath("/account/reading-goals");
  revalidatePath("/account/profile");
  revalidatePath("/account/notifications");
  revalidatePath("/borrow/returns");
  revalidatePath("/admin");
  revalidatePath("/admin/books");
  revalidatePath("/explore");
  revalidatePath("/", "layout");
}

export async function logReadingHistoryAction(
  formData: FormData
): Promise<void> {
  const sessionUser = await requireAuth("/account/history");

  const historyId = Number(formData.get("historyId") ?? 0);
  const bookId = Number(formData.get("bookId") ?? 0);
  const rawPages = Number(formData.get("pagesRead") ?? 0);
  const rawStatus = String(formData.get("status") ?? "reading").trim();
  const rawReflection = String(formData.get("reflection") ?? "").trim();

  const validStatuses = ["reading", "completed", "dropped"];
  const status = validStatuses.includes(rawStatus) ? rawStatus : "reading";

  if (Number.isInteger(historyId) && historyId > 0) {
    const existing = await prisma.readingHistory.findFirst({
      where: {
        id: historyId,
        userId: sessionUser.id,
      },
      include: { book: true },
    });

    if (!existing) {
      return;
    }

    const pagesRead =
      status === "completed" && rawPages <= 0
        ? existing.book.pages
        : Math.max(0, Math.min(rawPages, existing.book.pages * 2));

    await prisma.readingHistory.update({
      where: { id: existing.id },
      data: {
        pagesRead,
        status,
        reflection: rawReflection || existing.reflection,
        finishedAt:
          status === "completed" ? existing.finishedAt ?? new Date() : null,
      },
    });
  } else if (Number.isInteger(bookId) && bookId > 0) {
    const book = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      return;
    }

    const pagesRead =
      status === "completed" && rawPages <= 0
        ? book.pages
        : Math.max(1, Math.min(rawPages > 0 ? rawPages : book.pages, book.pages));

    const existingForBook = await prisma.readingHistory.findFirst({
      where: {
        userId: sessionUser.id,
        bookId: book.id,
      },
      orderBy: { startedAt: "desc" },
    });

    if (existingForBook) {
      await prisma.readingHistory.update({
        where: { id: existingForBook.id },
        data: {
          pagesRead,
          status,
          reflection: rawReflection || existingForBook.reflection,
          finishedAt: status === "completed" ? new Date() : null,
        },
      });
    } else {
      await prisma.readingHistory.create({
        data: {
          userId: sessionUser.id,
          bookId: book.id,
          pagesRead,
          startedAt: new Date(),
          finishedAt: status === "completed" ? new Date() : null,
          status,
          reflection:
            rawReflection ||
            `Mencatat progres bacaan untuk buku "${book.title}".`,
        },
      });
    }
  } else {
    return;
  }

  const allHistory = await prisma.readingHistory.findMany({
    where: { userId: sessionUser.id },
  });
  const completedBooks = allHistory.filter(
    (entry) => entry.status === "completed"
  ).length;
  const totalPages = allHistory.reduce(
    (sum, entry) => sum + Math.max(0, entry.pagesRead),
    0
  );

  await prisma.readingGoal.upsert({
    where: {
      userId_year: {
        userId: sessionUser.id,
        year: 2026,
      },
    },
    update: {
      currentBooks: completedBooks,
      currentPages: totalPages,
    },
    create: {
      userId: sessionUser.id,
      year: 2026,
      targetBooks: 12,
      targetPages: 3600,
      currentBooks: completedBooks,
      currentPages: totalPages,
    },
  });

  revalidatePath("/account/history");
  revalidatePath("/account/reading-goals");
  revalidatePath("/account/profile");
}

export async function markNotificationReadAction(
  formData: FormData
): Promise<void> {
  const sessionUser = await requireAuth("/account/notifications");
  const notificationId = Number(formData.get("notificationId"));

  if (!Number.isInteger(notificationId) || notificationId <= 0) {
    return;
  }

  await prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId: sessionUser.id,
    },
    data: {
      isRead: true,
    },
  });

  revalidatePath("/account/notifications");
  revalidatePath("/account/profile");
  revalidatePath("/", "layout");
}

export async function markAllNotificationsReadAction(): Promise<void> {
  const sessionUser = await requireAuth("/account/notifications");

  await prisma.notification.updateMany({
    where: {
      userId: sessionUser.id,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });

  revalidatePath("/account/notifications");
  revalidatePath("/account/profile");
  revalidatePath("/", "layout");
}

export async function updateReadingGoalAction(
  formData: FormData
): Promise<void> {
  const sessionUser = await requireAuth("/account/reading-goals");

  const existingGoal = await prisma.readingGoal.findUnique({
    where: {
      userId_year: {
        userId: sessionUser.id,
        year: 2026,
      },
    },
  });

  const rawTargetBooks = Number(
    formData.get("targetBooks") ?? existingGoal?.targetBooks ?? 12
  );
  const rawTargetPages = Number(
    formData.get("targetPages") ?? existingGoal?.targetPages ?? 3600
  );
  const rawCurrentBooks = Number(
    formData.get("currentBooks") ?? existingGoal?.currentBooks ?? 0
  );
  const rawCurrentPages = Number(
    formData.get("currentPages") ?? existingGoal?.currentPages ?? 0
  );

  const targetBooks = Number.isFinite(rawTargetBooks)
    ? Math.max(1, Math.min(200, Math.round(rawTargetBooks)))
    : 12;
  const targetPages = Number.isFinite(rawTargetPages)
    ? Math.max(100, Math.min(100000, Math.round(rawTargetPages)))
    : 3600;
  const currentBooks = Number.isFinite(rawCurrentBooks)
    ? Math.max(0, Math.min(500, Math.round(rawCurrentBooks)))
    : 0;
  const currentPages = Number.isFinite(rawCurrentPages)
    ? Math.max(0, Math.min(200000, Math.round(rawCurrentPages)))
    : 0;

  await prisma.readingGoal.upsert({
    where: {
      userId_year: {
        userId: sessionUser.id,
        year: 2026,
      },
    },
    update: {
      targetBooks,
      targetPages,
      currentBooks,
      currentPages,
    },
    create: {
      userId: sessionUser.id,
      year: 2026,
      targetBooks,
      targetPages,
      currentBooks,
      currentPages,
    },
  });

  await prisma.notification.create({
    data: {
      userId: sessionUser.id,
      type: "info",
      title: "Target Baca Tahunan 2026 Diperbarui",
      message: `Target literasi 2026 disesuaikan menjadi ${targetBooks} buku (${targetPages.toLocaleString("id-ID")} halaman) dengan realisasi saat ini ${currentBooks} buku (${currentPages.toLocaleString("id-ID")} halaman).`,
      actionHref: "/account/reading-goals",
    },
  });

  revalidatePath("/account/reading-goals");
  revalidatePath("/account/profile");
  revalidatePath("/account/notifications");
}