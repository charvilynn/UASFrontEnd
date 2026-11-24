"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSessionUser, requireAuth } from "@/lib/auth";
import { saveUploadedCover, deleteUploadedCover } from "@/lib/uploads";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function updateBookAction(
  bookId: number,
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  const user = await requireAuth(`/books/${bookId}/edit`);
  const existingBook = await prisma.book.findUnique({
    where: { id: bookId },
    select: { addedById: true },
  });
  if (!existingBook) {
    return { ok: false, error: "Buku tidak ditemukan di database." };
  }
  const isOwner =
    existingBook.addedById !== null && existingBook.addedById === user.id;
  if (user.role !== "admin" && !isOwner) {
    return {
      ok: false,
      error:
        "Hanya Pustakawan Admin atau pemilik yang menambahkan buku ini yang dapat mengubahnya.",
    };
  }

  const title = String(formData.get("title") || "").trim();
  const subtitle = String(formData.get("subtitle") || "").trim() || null;
  const isbn = String(formData.get("isbn") || "").trim();
  const language = String(formData.get("language") || "Indonesia").trim();
  const publishYear = Number(formData.get("publishYear") || 2024);
  const pages = Number(formData.get("pages") || 200);
  const stockTotal = Math.max(1, Number(formData.get("stockTotal") || 3));
  const stockAvailable = Math.max(
    0,
    Math.min(stockTotal, Number(formData.get("stockAvailable") ?? stockTotal))
  );
  const description = String(formData.get("description") || "").trim();
  const sampleExcerpt =
    String(formData.get("sampleExcerpt") || "").trim() || null;
  const isFeatured = formData.get("isFeatured") === "on";

  const authorId = Number(formData.get("authorId") || 0);
  const categoryId = Number(formData.get("categoryId") || 0);
  const publisherId = Number(formData.get("publisherId") || 0);

  if (title.length < 2) {
    return { ok: false, error: "Judul buku minimal terdiri dari 2 karakter." };
  }
  if (!isbn || isbn.length < 8) {
    return { ok: false, error: "Nomor ISBN wajib diisi dengan benar." };
  }
  if (description.length < 15) {
    return {
      ok: false,
      error: "Deskripsi atau sinopsis buku minimal 15 karakter.",
    };
  }

  const duplicateIsbn = await prisma.book.findFirst({
    where: {
      isbn,
      NOT: { id: bookId },
    },
  });
  if (duplicateIsbn) {
    return {
      ok: false,
      error: `ISBN ${isbn} sudah digunakan oleh buku "${duplicateIsbn.title}".`,
    };
  }

  const coverFile = formData.get("coverFile") as File | null;
  let newCoverPath: string | undefined;

  if (coverFile && coverFile.size > 0) {
    const uploadRes = await saveUploadedCover(coverFile, slugify(title));
    if (!uploadRes.ok) {
      return { ok: false, error: uploadRes.error };
    }
    if (uploadRes.coverPath) {
      newCoverPath = uploadRes.coverPath;
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.book.update({
      where: { id: bookId },
      data: {
        title,
        subtitle,
        isbn,
        language,
        publishYear,
        pages,
        stockTotal,
        stockAvailable,
        description,
        sampleExcerpt,
        isFeatured,
        ...(publisherId > 0 ? { publisherId } : {}),
        ...(newCoverPath ? { coverPath: newCoverPath } : {}),
      },
    });

    if (authorId > 0) {
      await tx.bookAuthor.deleteMany({ where: { bookId } });
      await tx.bookAuthor.create({
        data: { bookId, authorId, role: "primary" },
      });
    }

    if (categoryId > 0) {
      await tx.bookCategory.deleteMany({ where: { bookId } });
      await tx.bookCategory.create({
        data: { bookId, categoryId },
      });
    }
  });

  revalidatePath("/");
  revalidatePath("/explore");
  revalidatePath("/categories");
  revalidatePath("/search");
  revalidatePath("/trending");
  revalidatePath(`/books/${bookId}`);
  revalidatePath(`/books/${bookId}/edit`);
  revalidatePath("/admin/books");

  redirect(`/books/${bookId}?updated=1`);
}

export async function deleteBookFromEditAction(bookId: number): Promise<void> {
  const user = await requireAuth(`/books/${bookId}/edit`);
  const existingBook = await prisma.book.findUnique({
    where: { id: bookId },
    select: { addedById: true, coverPath: true },
  });
  const isOwner =
    existingBook?.addedById !== null && existingBook?.addedById === user.id;
  if (user.role !== "admin" && !isOwner) {
    redirect(`/books/${bookId}/edit`);
  }

  await prisma.book.delete({ where: { id: bookId } });
  deleteUploadedCover(existingBook?.coverPath);

  revalidatePath("/");
  revalidatePath("/explore");
  revalidatePath("/categories");
  revalidatePath("/search");
  revalidatePath("/admin/books");

  redirect("/explore?deleted=1");
}

export async function addReviewOnDetailAction(
  bookId: number,
  formData: FormData
): Promise<void> {
  const user = await getSessionUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/books/${bookId}`)}`);
  }

  const rating = Math.min(5, Math.max(1, Number(formData.get("rating") || 5)));
  const title =
    String(formData.get("title") || "").trim() || "Ulasan Pembaca Charvlibrary";
  const comment = String(formData.get("comment") || "").trim();

  if (comment.length < 5) {
    redirect(`/books/${bookId}`);
  }

  await prisma.review.upsert({
    where: {
      userId_bookId: {
        userId: user.id,
        bookId,
      },
    },
    update: {
      rating,
      title,
      comment,
    },
    create: {
      userId: user.id,
      bookId,
      rating,
      title,
      comment,
    },
  });

  const stats = await prisma.review.aggregate({
    where: { bookId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.book.update({
    where: { id: bookId },
    data: {
      ratingAvg: Number((stats._avg.rating || rating).toFixed(1)),
      ratingCount: stats._count.rating,
    },
  });

  revalidatePath(`/books/${bookId}`);
  revalidatePath("/reviews");
}