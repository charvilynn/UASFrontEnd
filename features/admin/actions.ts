"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { deleteUploadedCover } from "@/lib/uploads";

function slugifyAdmin(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function assertAdminSession() {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    throw new Error("Akses ditolak: Diperlukan hak akses Pustakawan Admin.");
  }
  return user;
}

export async function adminReturnLoanAction(formData: FormData): Promise<void> {
  await assertAdminSession();

  const loanId = Number(formData.get("loanId") || 0);
  if (!loanId) return;

  const loan = await prisma.loan.findUnique({
    where: { id: loanId },
    include: { book: true },
  });
  if (!loan || loan.status === "returned") return;

  const now = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.loan.update({
      where: { id: loan.id },
      data: {
        status: "returned",
        returnedAt: now,
      },
    });

    await tx.book.update({
      where: { id: loan.bookId },
      data: {
        stockAvailable: Math.max(1, loan.book.stockTotal),
      },
    });

    await tx.notification.create({
      data: {
        userId: loan.userId,
        type: "info",
        title: "Pengembalian Buku Dikonfirmasi Pustakawan",
        message: `Buku "${loan.book.title}" (${loan.loanCode}) telah ditandai dikembalikan oleh pustakawan.`,
        actionHref: "/account/borrowed",
      },
    });
  });

  revalidatePath("/admin");
  revalidatePath("/admin/books");
  revalidatePath("/explore");
  revalidatePath("/");
  revalidatePath(`/books/${loan.bookId}`);
  revalidatePath("/borrow/returns");
  revalidatePath("/account/borrowed");
  revalidatePath("/account/notifications");
  revalidatePath("/", "layout");
}

export async function deleteBookAdminAction(formData: FormData): Promise<void> {
  await assertAdminSession();

  const bookId = Number(formData.get("bookId") || 0);
  if (!bookId) return;

  const existing = await prisma.book.findUnique({
    where: { id: bookId },
    select: { coverPath: true },
  });

  await prisma.book.delete({
    where: { id: bookId },
  });
  deleteUploadedCover(existing?.coverPath);

  revalidatePath("/admin/books");
  revalidatePath("/admin");
  revalidatePath("/explore");
  revalidatePath("/categories");
  revalidatePath("/");
}

export async function createCategoryAdminAction(
  formData: FormData
): Promise<void> {
  await assertAdminSession();

  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const accentColor =
    String(formData.get("accentColor") || "#92400E").trim() || "#92400E";

  if (name.length < 2) {
    redirect(
      "/admin/taxonomies?error=" +
        encodeURIComponent("Nama kategori minimal 2 karakter.")
    );
  }

  const baseSlug = slugifyAdmin(name) || "kategori-baru";
  const existing = await prisma.category.findFirst({
    where: { OR: [{ name }, { slug: baseSlug }] },
  });

  const slug = existing
    ? `${baseSlug}-${Date.now().toString(36).slice(-4)}`
    : baseSlug;

  await prisma.category.create({
    data: {
      name: existing ? `${name} (${slug.slice(-3)})` : name,
      slug,
      description:
        description ||
        `Koleksi literatur dan referensi akademik bidang ${name} di Charvlibrary.`,
      iconName: "book-open",
      accentColor,
    },
  });

  revalidatePath("/admin/taxonomies");
  revalidatePath("/categories");
  revalidatePath("/books/new");
  redirect("/admin/taxonomies?created=category");
}

export async function createAuthorAdminAction(
  formData: FormData
): Promise<void> {
  await assertAdminSession();

  const name = String(formData.get("name") || "").trim();
  const nationality =
    String(formData.get("nationality") || "Indonesia").trim() || "Indonesia";
  const birthYearRaw = String(formData.get("birthYear") || "").trim();
  const bio = String(formData.get("bio") || "").trim();

  if (name.length < 2) {
    redirect(
      "/admin/taxonomies?error=" +
        encodeURIComponent("Nama penulis minimal 2 karakter.")
    );
  }

  const baseSlug = slugifyAdmin(name) || "penulis-baru";
  const existing = await prisma.author.findUnique({
    where: { slug: baseSlug },
  });
  const slug = existing
    ? `${baseSlug}-${Date.now().toString(36).slice(-4)}`
    : baseSlug;

  const birthYear = birthYearRaw ? Number(birthYearRaw) : null;

  await prisma.author.create({
    data: {
      name,
      slug,
      nationality,
      birthYear:
        birthYear && Number.isInteger(birthYear) && birthYear > 1000
          ? birthYear
          : null,
      bio:
        bio ||
        `${name} adalah penulis dan cendekiawan yang karyanya terindeks dalam direktori penulis Charvlibrary.`,
    },
  });

  revalidatePath("/admin/taxonomies");
  revalidatePath("/authors");
  revalidatePath("/books/new");
  redirect("/admin/taxonomies?created=author");
}

export async function createPublisherAdminAction(
  formData: FormData
): Promise<void> {
  await assertAdminSession();

  const name = String(formData.get("name") || "").trim();
  const city = String(formData.get("city") || "Jakarta").trim() || "Jakarta";
  const website = String(formData.get("website") || "").trim() || null;
  const foundedYearRaw = String(formData.get("foundedYear") || "").trim();

  if (name.length < 2) {
    redirect(
      "/admin/taxonomies?error=" +
        encodeURIComponent("Nama penerbit minimal 2 karakter.")
    );
  }

  const baseSlug = slugifyAdmin(name) || "penerbit-baru";
  const existing = await prisma.publisher.findFirst({
    where: { OR: [{ name }, { slug: baseSlug }] },
  });

  if (existing) {
    redirect(
      "/admin/taxonomies?error=" +
        encodeURIComponent(`Penerbit "${name}" sudah terdaftar di database.`)
    );
  }

  const foundedYear = foundedYearRaw ? Number(foundedYearRaw) : 2005;

  await prisma.publisher.create({
    data: {
      name,
      slug: baseSlug,
      city,
      website,
      foundedYear:
        foundedYear && Number.isInteger(foundedYear) ? foundedYear : 2005,
    },
  });

  revalidatePath("/admin/taxonomies");
  revalidatePath("/books/new");
  redirect("/admin/taxonomies?created=publisher");
}

export async function toggleUserRoleAdminAction(
  formData: FormData
): Promise<void> {
  const adminUser = await assertAdminSession();

  const targetUserId = Number(formData.get("userId") || 0);
  const nextRole = String(formData.get("nextRole") || "member");

  if (!targetUserId || (nextRole !== "admin" && nextRole !== "member")) {
    return;
  }

  if (targetUserId === adminUser.id && nextRole !== "admin") {
    redirect(
      "/admin/users?error=" +
        encodeURIComponent(
          "Anda tidak dapat menurunkan peran akun Admin yang sedang Anda gunakan sendiri."
        )
    );
  }

  await prisma.user.update({
    where: { id: targetUserId },
    data: { role: nextRole },
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin");
}

export async function replyContactTicketAction(
  formData: FormData
): Promise<void> {
  await assertAdminSession();

  const ticketId = Number(formData.get("ticketId") || 0);
  const adminReply = String(formData.get("adminReply") || "").trim();
  const nextStatus =
    String(formData.get("status") || "replied") === "resolved"
      ? "resolved"
      : "replied";

  if (!ticketId || adminReply.length < 5) {
    redirect(
      "/admin/users?error=" +
        encodeURIComponent("Balasan pustakawan wajib diisi minimal 5 karakter.")
    );
  }

  const updatedTicket = await prisma.contactMessage.update({
    where: { id: ticketId },
    data: {
      adminReply,
      status: nextStatus,
      repliedAt: new Date(),
    },
  });

  if (updatedTicket.userId) {
    await prisma.notification.create({
      data: {
        userId: updatedTicket.userId,
        type: "info",
        title: `Balasan Tiket ${updatedTicket.ticketNumber}`,
        message: `Pustakawan telah membalas pesan Anda perihal "${updatedTicket.subject}": ${adminReply}`,
        actionHref: "/contact",
      },
    });
  }

  revalidatePath("/admin/users");
  revalidatePath("/contact");
  revalidatePath("/account/notifications");
  redirect("/admin/users?replied=" + encodeURIComponent(updatedTicket.ticketNumber));
}