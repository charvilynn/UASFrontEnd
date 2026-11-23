import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "node:fs";
import path from "node:path";
import { BOOKS_SEED, GENRES_SEED } from "./books-seed-data";

const prisma = new PrismaClient();

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function downloadCoverIfPossible(
  isbn: string,
  title?: string,
  author?: string
): Promise<string | null> {
  const cleanIsbn = isbn.replace(/[^0-9X]/gi, "");
  if (!cleanIsbn) return null;

  const coversDir = path.join(process.cwd(), "public", "covers");
  if (!fs.existsSync(coversDir)) {
    fs.mkdirSync(coversDir, { recursive: true });
  }

  const fileName = `${cleanIsbn}.jpg`;
  const destPath = path.join(coversDir, fileName);

  if (fs.existsSync(destPath)) {
    const stat = fs.statSync(destPath);
    if (stat.size > 1000) {
      return `/covers/${fileName}`;
    }
  }

  const url = `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-M.jpg?default=false`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      if (
        buffer.byteLength >= 1000 &&
        buffer[0] === 0xff &&
        buffer[1] === 0xd8 &&
        buffer[2] === 0xff
      ) {
        fs.writeFileSync(destPath, buffer);
        return `/covers/${fileName}`;
      }
    }
  } catch {
    clearTimeout(timeout);
  }

  if (title && author) {
    try {
      const searchRes = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(
          `${title} ${author}`
        )}&limit=5`
      );
      if (searchRes.ok) {
        const data = (await searchRes.json()) as {
          docs?: Array<{ cover_i?: number }>;
        };
        const docWithCover = data.docs?.find((d) => d.cover_i);
        if (docWithCover?.cover_i) {
          const imgRes = await fetch(
            `https://covers.openlibrary.org/b/id/${docWithCover.cover_i}-M.jpg`
          );
          if (imgRes.ok) {
            const buf = Buffer.from(await imgRes.arrayBuffer());
            if (buf.byteLength >= 1000 && buf[0] === 0xff && buf[1] === 0xd8) {
              fs.writeFileSync(destPath, buf);
              return `/covers/${fileName}`;
            }
          }
        }
      }
    } catch {
    }
  }

  return null;
}

async function main() {
  console.log("Memulai proses seeding database SQLite Charvlibrary...");

  await prisma.contactMessage.deleteMany();
  await prisma.faq.deleteMany();
  await prisma.clubDiscussion.deleteMany();
  await prisma.readingClub.deleteMany();
  await prisma.eventRsvp.deleteMany();
  await prisma.event.deleteMany();
  await prisma.blogComment.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.fine.deleteMany();
  await prisma.readingHistory.deleteMany();
  await prisma.readingGoal.deleteMany();
  await prisma.shelfBook.deleteMany();
  await prisma.shelf.deleteMany();
  await prisma.review.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.borrowCartItem.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.collectionBook.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.bookCategory.deleteMany();
  await prisma.bookAuthor.deleteMany();
  await prisma.book.deleteMany();
  await prisma.category.deleteMany();
  await prisma.author.deleteMany();
  await prisma.publisher.deleteMany();
  await prisma.otpCode.deleteMany();
  await prisma.loginHistory.deleteMany();
  await prisma.userSession.deleteMany();
  await prisma.userPreference.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$executeRawUnsafe("DELETE FROM sqlite_sequence");

  const adminPasswordHash = await bcrypt.hash("AdminCharv2026!", 10);
  const memberPasswordHash = await bcrypt.hash("MemberCharv2026!", 10);

  const adminUser = await prisma.user.create({
    data: {
      name: "Olivian Cerlindo",
      email: "admin@charvlibrary.ac.id",
      passwordHash: adminPasswordHash,
      role: "admin",
      memberCode: "CHV-2026-0001",
      faculty: "Manajemen Sistem Informasi & Perpustakaan",
      phone: "0812-8800-1001",
      bio: "Koordinator Katalog Digital dan Tata Kelola Koleksi Akademik Charvlibrary.",
      avatarColor: "#92400E",
      isVerified: true,
      onboardingDone: true,
    },
  });

  await prisma.user.create({
    data: {
      name: "Chandra Wijaya",
      email: "mahasiswa@charvlibrary.ac.id",
      passwordHash: memberPasswordHash,
      role: "member",
      memberCode: "CHV-2026-0002",
      faculty: "Fakultas Teknologi Informasi",
      phone: "0813-7700-2002",
      bio: "Mahasiswa semester 4 yang gemar membaca rekayasa perangkat lunak, filsafat Stoikisme, dan fiksi sejarah.",
      avatarColor: "#D97706",
      isVerified: true,
      onboardingDone: true,
    },
  });

  await prisma.user.create({
    data: {
      name: "Davvin Denielsen Fusta",
      email: "davvin@charvlibrary.ac.id",
      passwordHash: memberPasswordHash,
      role: "admin",
      memberCode: "CHV-2026-0003",
      faculty: "Fakultas Ilmu Komputer",
      phone: "0812-9000-3003",
      bio: "Kurator katalog utama dan perancang pengalaman eksplorasi koleksi buku.",
      avatarColor: "#1E40AF",
      isVerified: true,
      onboardingDone: true,
    },
  });

  await prisma.user.create({
    data: {
      name: "Liviana Winata",
      email: "livi@charvlibrary.ac.id",
      passwordHash: memberPasswordHash,
      role: "member",
      memberCode: "CHV-2026-0004",
      faculty: "Fakultas Sistem Informasi",
      phone: "0812-9000-3004",
      bio: "Pencinta novel klasik dunia dan keamanan sistem informasi.",
      avatarColor: "#0F766E",
      isVerified: true,
      onboardingDone: true,
    },
  });

  await prisma.user.create({
    data: {
      name: "Aaron Valerio Lieputra",
      email: "aaron@charvlibrary.ac.id",
      passwordHash: memberPasswordHash,
      role: "member",
      memberCode: "CHV-2026-0005",
      faculty: "Fakultas Teknik",
      phone: "0812-9000-3005",
      bio: "Pengulas aktif buku sains populer, fiksi ilmiah, dan ekonomi perilaku.",
      avatarColor: "#7C3AED",
      isVerified: true,
      onboardingDone: true,
    },
  });

  await prisma.user.create({
    data: {
      name: "Aurelia Cheryl Claresta",
      email: "aurel@charvlibrary.ac.id",
      passwordHash: memberPasswordHash,
      role: "member",
      memberCode: "CHV-2026-0006",
      faculty: "Fakultas Ilmu Budaya & Sastra",
      phone: "0812-9000-3006",
      bio: "Editor jurnal literasi kampus dan kurator kegiatan diskusi literasi.",
      avatarColor: "#BE185D",
      isVerified: true,
      onboardingDone: true,
    },
  });

  const categoryMap = new Map<string, number>();
  for (const genre of GENRES_SEED) {
    const created = await prisma.category.create({
      data: {
        name: genre.name,
        slug: genre.slug,
        description: genre.description,
        iconName: genre.iconName,
        accentColor: genre.accentColor,
      },
    });
    categoryMap.set(genre.name, created.id);
  }

  const publisherMap = new Map<string, number>();
  const uniquePublishers = Array.from(new Set(BOOKS_SEED.map((b) => b.publisher)));
  const cities = ["Jakarta", "Yogyakarta", "Bandung", "London", "New York", "Boston"];

  for (let i = 0; i < uniquePublishers.length; i++) {
    const pubName = uniquePublishers[i];
    const created = await prisma.publisher.create({
      data: {
        name: pubName,
        slug: slugify(pubName) || `publisher-${i + 1}`,
        city: cities[i % cities.length],
        foundedYear: 1965 + (i % 45),
        website: `https://www.${slugify(pubName).replace(/-/g, "")}.org`,
      },
    });
    publisherMap.set(pubName, created.id);
  }

  const authorMap = new Map<string, number>();
  const uniqueAuthors = Array.from(new Set(BOOKS_SEED.map((b) => b.author)));

  for (let i = 0; i < uniqueAuthors.length; i++) {
    const authorName = uniqueAuthors[i];
    const sampleBook = BOOKS_SEED.find((b) => b.author === authorName)!;
    const isIndo =
      sampleBook.language === "Indonesia" || sampleBook.tags.includes("Indonesia");

    const created = await prisma.author.create({
      data: {
        name: authorName,
        slug: slugify(authorName) || `author-${i + 1}`,
        nationality: isIndo ? "Indonesia" : "Internasional",
        birthYear: Math.max(1920, Math.min(1992, sampleBook.year - 34)),
        bio: `${authorName} dikenal luas melalui karya berjudul "${sampleBook.title}" (${sampleBook.year}) dalam ranah ${sampleBook.genre}. Karya-karyanya menjadi rujukan penting bagi pembaca akademik maupun pencinta literasi di Charvlibrary.`,
      },
    });
    authorMap.set(authorName, created.id);
  }

  console.log("Mengunduh sampul buku dari Open Library Covers (dengan fallback lokal)...");
  const coverPaths = new Map<number, string | null>();
  const batchSize = 10;
  for (let i = 0; i < BOOKS_SEED.length; i += batchSize) {
    const chunk = BOOKS_SEED.slice(i, i + batchSize);
    const results = await Promise.all(
      chunk.map(async (book) => {
        const localCover = await downloadCoverIfPossible(
          book.isbn,
          book.title,
          book.author
        );
        return { id: book.id, coverPath: localCover };
      })
    );
    for (const r of results) {
      coverPaths.set(r.id, r.coverPath);
    }
  }

  const createdBookIds: number[] = [];
  const indoLitCategoryId = categoryMap.get("Indonesian Literature");

  for (const rawBook of BOOKS_SEED) {
    const publisherId = publisherMap.get(rawBook.publisher)!;
    const authorId = authorMap.get(rawBook.author)!;
    const primaryCatId = categoryMap.get(rawBook.genre)!;

    const stockTotal = rawBook.featured ? 5 : 3;
    const stockAvailable = stockTotal;

    const baseSlug = slugify(rawBook.title) || `buku-${rawBook.id}`;
    const uniqueSlug = `${baseSlug}-${rawBook.id}`;

    const categoryConnects: { categoryId: number }[] = [{ categoryId: primaryCatId }];
    if (
      indoLitCategoryId &&
      primaryCatId !== indoLitCategoryId &&
      (rawBook.tags.includes("Indonesia") || rawBook.publisher.includes("Gramedia") || rawBook.publisher.includes("Bentang") || rawBook.publisher.includes("Hasta Mitra"))
    ) {
      categoryConnects.push({ categoryId: indoLitCategoryId });
    }

    const createdBook = await prisma.book.create({
      data: {
        id: rawBook.id,
        title: rawBook.title,
        subtitle: rawBook.subtitle ?? `Edisi Koleksi Perpustakaan (${rawBook.tags.join(", ")})`,
        slug: uniqueSlug,
        publisherId,
        publishYear: rawBook.year,
        isbn: rawBook.isbn,
        language: rawBook.language,
        pages: rawBook.pages,
        description: rawBook.synopsis,
        sampleExcerpt: `"Membaca halaman pertama dari ${rawBook.title} karya ${rawBook.author} membuka cakrawala pemikiran baru tentang ${rawBook.tags.join(" dan ").toLowerCase()}. Buku setebal ${rawBook.pages} halaman yang diterbitkan oleh ${rawBook.publisher} pada tahun ${rawBook.year} ini mengajak pembaca menelusuri gagasan secara kritis dan reflektif."`,
        coverPath: coverPaths.get(rawBook.id) ?? null,
        stockTotal,
        stockAvailable,
        isFeatured: rawBook.featured,
        ratingAvg: rawBook.rating,
        ratingCount: 0,
        addedById: adminUser.id,
        source: "openlibrary",
        sourceId: `OL-${rawBook.isbn.replace(/[^0-9X]/gi, "")}`,
        authors: {
          create: [{ authorId, role: "primary" }],
        },
        categories: {
          create: categoryConnects,
        },
      },
    });

    createdBookIds.push(createdBook.id);
  }

  const collectionsData = [
    {
      title: "Mahakarya Sastra Indonesia",
      slug: "sastra-indonesia",
      subtitle: "Jejak Sejarah dan Kemanusiaan Nusantara",
      description:
        "Rangkaian novel terbaik karya penulis Indonesia dari masa kolonial hingga era modern yang membentuk identitas kebudayaan bangsa.",
      curatorName: "Davvin Denielsen Fusta",
      accentColor: "#92400E",
      bookIndices: [0, 1, 8, 9, 10, 14, 15, 29],
    },
    {
      title: "Fondasi Rekayasa Perangkat Lunak",
      slug: "fondasi-rekayasa-perangkat-lunak",
      subtitle: "Pegangan Wajib Mahasiswa Ilmu Komputer",
      description:
        "Kumpulan literatur klasik arsitektur sistem, kode bersih, pola desain, dan algoritma yang menjadi rujukan utama insinyur perangkat lunak.",
      curatorName: "Olivian Cerlindo",
      accentColor: "#1D4ED8",
      bookIndices: [7, 13, 35, 36, 37, 38],
    },
    {
      title: "Filsafat Hidup & Ketangguhan Mental",
      slug: "filsafat-hidup-ketangguhan-mental",
      subtitle: "Stoikisme, Makna Hidup, dan Kebiasaan Baik",
      description:
        "Pilihan buku filsafat praktis dan pengembangan diri untuk membantu mahasiswa menjaga fokus serta ketenangan batin di tengah kesibukan akademik.",
      curatorName: "Chandra Wijaya",
      accentColor: "#0F766E",
      bookIndices: [2, 6, 12, 23, 24, 31, 32],
    },
    {
      title: "Cakrawala Sains & Masa Depan Manusia",
      slug: "cakrawala-sains-masa-depan",
      subtitle: "Dari Kosmologi hingga Sejarah Peradaban",
      description:
        "Penjelajahan ilmiah lintas disiplin yang membedah asal-usul alam semesta, evolusi biologis, dan tantangan masa depan umat manusia.",
      curatorName: "Aaron Valerio Lieputra",
      accentColor: "#0369A1",
      bookIndices: [3, 18, 19, 50, 51, 52, 53],
    },
    {
      title: "Imajinasi Spekulatif & Dunia Distopia",
      slug: "imajinasi-spekulatif-distopia",
      subtitle: "Fiksi Ilmiah dan Kritik Sosial Modern",
      description:
        "Karya fiksi spekulatif dan distopia yang menantang pembaca merenungkan etika teknologi, kekuasaan, dan kebebasan berpikir.",
      curatorName: "Liviana Winata",
      accentColor: "#DC2626",
      bookIndices: [4, 5, 11, 16, 43, 44, 45],
    },
    {
      title: "Strategi Bisnis & Ekonomi Perilaku",
      slug: "strategi-bisnis-ekonomi-perilaku",
      subtitle: "Pengambilan Keputusan Rasional di Dunia Nyata",
      description:
        "Literatur pilihan seputar psikologi uang, inovasi organisasi, kepemimpinan, dan cara kerja ekonomi modern.",
      curatorName: "Aurelia Cheryl Claresta",
      accentColor: "#B45309",
      bookIndices: [17, 25, 67, 68, 69, 70, 71],
    },
  ];

  for (const col of collectionsData) {
    const createdCol = await prisma.collection.create({
      data: {
        title: col.title,
        slug: col.slug,
        subtitle: col.subtitle,
        description: col.description,
        curatorName: col.curatorName,
        accentColor: col.accentColor,
      },
    });

    for (let idx = 0; idx < col.bookIndices.length; idx++) {
      const bookId = createdBookIds[col.bookIndices[idx]];
      if (bookId) {
        await prisma.collectionBook.create({
          data: {
            collectionId: createdCol.id,
            bookId,
            sortOrder: idx + 1,
            curatorNote: `Rekomendasi urutan ke-${idx + 1} dalam kurasi ${col.title}.`,
          },
        });
      }
    }
  }
  const totalBooks = await prisma.book.count();
  const totalCategories = await prisma.category.count();
  const totalUsers = await prisma.user.count();

  console.log(
    `Seeding selesai: ${totalBooks} buku, ${totalCategories} kategori, dan ${totalUsers} pengguna berhasil disimpan.`
  );
}

main()
  .catch((err) => {
    console.error("Gagal menjalankan seed database:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });