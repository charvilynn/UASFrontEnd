import "server-only";
import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/db";

type DbClient = PrismaClient | Prisma.TransactionClient;

export interface AdminBorrowNotificationInput {
  borrowerName: string;
  borrowerEmail: string;
  borrowerCode: string;
  bookTitles: string[];
  loanCodes: string[];
  dueDates: Date[];
}

export interface AdminReturnNotificationInput {
  borrowerName: string;
  borrowerEmail: string;
  bookTitle: string;
  loanCode: string;
}

/**
 * Mengirim notifikasi peminjaman buku baru ke seluruh akun pustakawan admin.
 */
export async function notifyAdminsBookBorrowed(
  input: AdminBorrowNotificationInput,
  db: DbClient = prisma
): Promise<void> {
  const admins = await db.user.findMany({
    where: { role: "admin" },
    select: { id: true },
  });

  if (admins.length === 0 || input.bookTitles.length === 0) {
    return;
  }

  const latestDue = input.dueDates[0]
    ? input.dueDates[0].toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "-";

  const booksLabel =
    input.bookTitles.length === 1
      ? `"${input.bookTitles[0]}"`
      : `${input.bookTitles.length} buku (${input.bookTitles.map((t) => `"${t}"`).join(", ")})`;

  const title = `Peminjaman Baru oleh ${input.borrowerName}`;
  const message = `${input.borrowerName} (${input.borrowerEmail} • ${input.borrowerCode}) meminjam ${booksLabel} [Kode: ${input.loanCodes.join(", ")}], tenggat kembali ${latestDue}. Status buku kini Tidak Tersedia.`;

  await db.notification.createMany({
    data: admins.map((admin) => ({
      userId: admin.id,
      type: "borrow",
      title,
      message,
      actionHref: "/admin/books?status=borrowed",
      isRead: false,
    })),
  });
}

/**
 * Mengirim notifikasi pengembalian buku ke seluruh akun pustakawan admin.
 */
export async function notifyAdminsBookReturned(
  input: AdminReturnNotificationInput,
  db: DbClient = prisma
): Promise<void> {
  const admins = await db.user.findMany({
    where: { role: "admin" },
    select: { id: true },
  });

  if (admins.length === 0) {
    return;
  }

  await db.notification.createMany({
    data: admins.map((admin) => ({
      userId: admin.id,
      type: "info",
      title: `Pengembalian Buku oleh ${input.borrowerName}`,
      message: `${input.borrowerName} (${input.borrowerEmail}) telah mengembalikan buku "${input.bookTitle}" (${input.loanCode}). Status buku kembali Tersedia.`,
      actionHref: "/admin/books",
      isRead: false,
    })),
  });
}