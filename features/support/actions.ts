"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { saveUploadedCover } from "@/lib/uploads";

function slugifyText(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function createBookAction(formData: FormData): Promise<void> {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?next=/books/new");
  }
  if (user.role !== "admin") {
    redirect("/?error=" + encodeURIComponent("Akses ditolak: fitur khusus Admin."));
  }

  const title = String(formData.get("title") || "").trim();
  const subtitle = String(formData.get("subtitle") || "").trim() || null;
  const authorIdRaw = String(formData.get("authorId") || "").trim();
  const newAuthorName = String(formData.get("newAuthorName") || "").trim();
  const newAuthorNationality =
    String(formData.get("newAuthorNationality") || "Indonesia").trim() ||
    "Indonesia";
  const publisherIdRaw = String(formData.get("publisherId") || "").trim();
  const newPublisherName = String(formData.get("newPublisherName") || "").trim();
  const newPublisherCity =
    String(formData.get("newPublisherCity") || "Jakarta").trim() || "Jakarta";

  const categoryIdsRaw = formData
    .getAll("categoryIds")
    .map((v) => Number(v))
    .filter((n) => Number.isInteger(n) && n > 0);
  const singleCategoryId = Number(formData.get("categoryId") || 0);
  const categoryIds = Array.from(
    new Set(
      singleCategoryId > 0
        ? [singleCategoryId, ...categoryIdsRaw]
        : categoryIdsRaw
    )
  );

  const publishYear = Number(formData.get("publishYear") || 2024);
  const rawIsbn = String(formData.get("isbn") || "").trim();
  const language = String(formData.get("language") || "Indonesia").trim() || "Indonesia";
  const pages = Number(formData.get("pages") || 200);
  const stockTotal = Number(formData.get("stockTotal") || 3);
  const description = String(formData.get("description") || "").trim();
  const sampleExcerpt =
    String(formData.get("sampleExcerpt") || "").trim() || null;
  const isFeatured = formData.get("isFeatured") === "on";

  if (title.length < 2) {
    redirect(
      "/books/new?error=" +
        encodeURIComponent("Judul buku wajib diisi minimal 2 karakter.")
    );
  }

  if (description.length < 20) {
    redirect(
      "/books/new?error=" +
        encodeURIComponent(
          "Sinopsis atau deskripsi buku wajib diisi minimal 20 karakter."
        )
    );
  }

  if (categoryIds.length === 0) {
    redirect(
      "/books/new?error=" +
        encodeURIComponent("Pilih minimal 1 kategori literatur untuk buku ini.")
    );
  }

  if (
    !Number.isInteger(publishYear) ||
    publishYear < 1450 ||
    publishYear > 2026
  ) {
    redirect(
      "/books/new?error=" +
        encodeURIComponent("Tahun terbit harus berada di rentang 1450 hingga 2026.")
    );
  }

  if (!Number.isInteger(pages) || pages <= 0) {
    redirect(
      "/books/new?error=" +
        encodeURIComponent("Jumlah halaman harus berupa angka lebih dari 0.")
    );
  }

  if (!Number.isInteger(stockTotal) || stockTotal < 1) {
    redirect(
      "/books/new?error=" +
        encodeURIComponent("Jumlah eksemplar stok minimal adalah 1 buku.")
    );
  }

  let resolvedAuthorId = Number(authorIdRaw || 0);
  if (newAuthorName.length >= 2) {
    const baseAuthorSlug = slugifyText(newAuthorName) || "penulis-baru";
    const existingAuthor = await prisma.author.findFirst({
      where: {
        OR: [{ name: newAuthorName }, { slug: baseAuthorSlug }],
      },
    });

    if (existingAuthor) {
      resolvedAuthorId = existingAuthor.id;
    } else {
      const createdAuthor = await prisma.author.create({
        data: {
          name: newAuthorName,
          slug: `${baseAuthorSlug}-${Date.now().toString(36).slice(-4)}`,
          bio: `${newAuthorName} adalah penulis yang karyanya tercatat dalam koleksi katalog Charvlibrary.`,
          nationality: newAuthorNationality,
        },
      });
      resolvedAuthorId = createdAuthor.id;
    }
  }

  if (!resolvedAuthorId || resolvedAuthorId <= 0) {
    const fallbackAuthor = await prisma.author.findFirst({
      orderBy: { id: "asc" },
    });
    if (!fallbackAuthor) {
      redirect(
        "/books/new?error=" +
          encodeURIComponent(
            "Pilih penulis dari daftar atau ketik nama penulis baru."
          )
      );
    }
    resolvedAuthorId = fallbackAuthor.id;
  }

  let resolvedPublisherId = Number(publisherIdRaw || 0);
  if (newPublisherName.length >= 2) {
    const basePubSlug = slugifyText(newPublisherName) || "penerbit-baru";
    const existingPub = await prisma.publisher.findFirst({
      where: {
        OR: [{ name: newPublisherName }, { slug: basePubSlug }],
      },
    });

    if (existingPub) {
      resolvedPublisherId = existingPub.id;
    } else {
      const createdPub = await prisma.publisher.create({
        data: {
          name: newPublisherName,
          slug: `${basePubSlug}-${Date.now().toString(36).slice(-4)}`,
          city: newPublisherCity,
          foundedYear: 2000,
        },
      });
      resolvedPublisherId = createdPub.id;
    }
  }

  if (!resolvedPublisherId || resolvedPublisherId <= 0) {
    const fallbackPub = await prisma.publisher.findFirst({
      orderBy: { id: "asc" },
    });
    if (!fallbackPub) {
      redirect(
        "/books/new?error=" +
          encodeURIComponent(
            "Pilih penerbit dari daftar atau ketik nama penerbit baru."
          )
      );
    }
    resolvedPublisherId = fallbackPub.id;
  }

  let finalIsbn =
    rawIsbn.length >= 10
      ? rawIsbn
      : `978-602-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(
          10 + Math.random() * 89
        )}-${Math.floor(Math.random() * 9)}`;

  const duplicateIsbn = await prisma.book.findUnique({
    where: { isbn: finalIsbn },
  });
  if (duplicateIsbn) {
    finalIsbn = `${finalIsbn}-${Math.floor(10 + Math.random() * 89)}`;
  }

  const baseBookSlug = slugifyText(title) || "koleksi-buku";
  let finalSlug = baseBookSlug;
  const existingSlug = await prisma.book.findUnique({
    where: { slug: finalSlug },
  });
  if (existingSlug) {
    finalSlug = `${baseBookSlug}-${Date.now().toString(36).slice(-5)}`;
  }

  const coverEntry = formData.get("coverFile");
  const coverFile = coverEntry instanceof File ? coverEntry : null;
  const uploadResult = await saveUploadedCover(coverFile, finalSlug);

  if (!uploadResult.ok) {
    redirect(
      "/books/new?error=" + encodeURIComponent(uploadResult.error)
    );
  }

  const createdBook = await prisma.book.create({
    data: {
      title,
      subtitle,
      slug: finalSlug,
      publisherId: resolvedPublisherId,
      publishYear,
      isbn: finalIsbn,
      language,
      pages,
      description,
      sampleExcerpt:
        sampleExcerpt ||
        `Kutipan pembuka dari "${title}": Ilmu pengetahuan tumbuh ketika gagasan dibaca, diuji, dan didiskusikan lintas generasi pembaca.`,
      coverPath: uploadResult.coverPath,
      stockTotal,
      stockAvailable: stockTotal,
      isFeatured,
      ratingAvg: 4.7,
      ratingCount: 1,
      addedById: user ? user.id : null,
      source: "manual",
    },
  });

  await prisma.bookAuthor.create({
    data: {
      bookId: createdBook.id,
      authorId: resolvedAuthorId,
      role: "primary",
    },
  });

  for (const catId of categoryIds) {
    await prisma.bookCategory.create({
      data: {
        bookId: createdBook.id,
        categoryId: catId,
      },
    });
  }

  revalidatePath("/");
  revalidatePath("/explore");
  revalidatePath("/categories");
  revalidatePath("/search");
  revalidatePath("/admin/books");
  revalidatePath("/admin");

  redirect(`/books/${createdBook.id}?created=1`);
}

export async function submitContactMessageAction(
  formData: FormData
): Promise<void> {
  const user = await getSessionUser();

  const name = String(formData.get("name") || user?.name || "").trim();
  const email = String(formData.get("email") || user?.email || "").trim();
  const category =
    String(formData.get("category") || "Pertanyaan Umum").trim() ||
    "Pertanyaan Umum";
  const subject = String(formData.get("subject") || "").trim();
  const message = String(formData.get("message") || "").trim();

  if (name.length < 2 || !email.includes("@")) {
    redirect(
      "/contact?error=" +
        encodeURIComponent("Nama lengkap dan alamat email valid wajib diisi.")
    );
  }

  if (subject.length < 4 || message.length < 15) {
    redirect(
      "/contact?error=" +
        encodeURIComponent(
          "Subjek (minimal 4 karakter) dan isi pesan (minimal 15 karakter) wajib dilengkapi."
        )
    );
  }

  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  const ticketNumber = `TCK-2026-${randomDigits}`;

  await prisma.contactMessage.create({
    data: {
      ticketNumber,
      userId: user ? user.id : null,
      name,
      email,
      category,
      subject,
      message,
      status: "open",
    },
  });

  revalidatePath("/contact");
  revalidatePath("/admin/users");

  redirect(`/contact?ticket=${encodeURIComponent(ticketNumber)}`);
}