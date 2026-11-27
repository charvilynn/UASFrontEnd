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

  const blogPostsData = [
    {
      title: "10 Buku Wajib Mahasiswa Baru untuk Membangun Cara Berpikir Kritis",
      slug: "buku-wajib-mahasiswa",
      category: "Rekomendasi Bacaan",
      authorName: "Aurelia Cheryl Claresta",
      authorRole: "Editor Jurnal Literasi",
      readTimeMinutes: 6,
      isFeatured: true,
      excerpt:
        "Memasuki dunia perkuliahan menuntut perubahan cara belajar dari sekadar menghafal menuju analisis kritis lintas disiplin.",
      content: `Memasuki bangku perguruan tinggi adalah momen terbaik bagi mahasiswa untuk memperluas cakrawala bacaan di luar diktat kuliah. Kebiasaan membaca buku lintas disiplin membantu kita menghubungkan teori di kelas dengan persoalan nyata di masyarakat.\n\nPertama, mulailah dengan buku yang melatih struktur berpikir seperti "Thinking, Fast and Slow" karya Daniel Kahneman dan "Filosofi Teras" karya Henry Manampiring. Kedua buku ini membuka kesadaran kita terhadap bias kognitif sekaligus melatih ketenangan emosional saat menghadapi tekanan tugas akademik.\n\nKedua, jangan lewatkan karya sastra Indonesia seperti "Bumi Manusia" dan "Laskar Pelangi". Sastra mengasah empati sosial dan kepekaan bahasa yang sangat berguna ketika menyusun esai maupun karya ilmiah.\n\nKetiga, bagi mahasiswa rumpun sains dan teknologi, buku klasik seperti "Clean Code" dan "The Pragmatic Programmer" wajib dibaca sejak tahun pertama agar terbiasa menulis kode yang rapi serta mudah dipelihara oleh tim.`,
    },
    {
      title: "Teknik Membaca Aktif dengan Metode Catatan Zettelkasten",
      slug: "teknik-membaca-aktif-zettelkasten",
      category: "Tips Belajar",
      authorName: "Chandra Wijaya",
      authorRole: "Kontributor Akademik",
      readTimeMinutes: 5,
      isFeatured: true,
      excerpt:
        "Bagaimana cara agar isi buku yang kita baca tidak menguap begitu saja setelah halaman terakhir ditutup?",
      content: `Banyak pembaca mengeluhkan lupa isi buku hanya beberapa minggu setelah selesai membacanya. Masalah utamanya terletak pada cara membaca yang pasif tanpa proses sintesis gagasan.\n\nMetode Zettelkasten yang dipopulerkan oleh sosiolog Niklas Luhmann mengajarkan kita membuat catatan atomik menggunakan kalimat sendiri. Setiap kali menemukan ide penting di buku Charvlibrary, tuliskan kembali gagasan tersebut dalam satu kartu ringkas lalu hubungkan dengan catatan lain yang sudah Anda miliki.\n\nDengan cara ini, koleksi bacaan pribadi Anda di fitur Daftar Keinginan dan Jurnal Bacaan Charvlibrary dapat menjadi jaringan pengetahuan yang siap dipakai kapan saja saat menyusun skripsi atau riset.`,
    },
    {
      title: "Menelusuri Jejak Sejarah Nusantara Melalui Novel Pramoedya Ananta Toer",
      slug: "jejak-sejarah-nusantara-pramoedya",
      category: "Esai Sastra",
      authorName: "Aurelia Cheryl Claresta",
      authorRole: "Editor Jurnal Literasi",
      readTimeMinutes: 8,
      isFeatured: false,
      excerpt:
        "Tetralogi Buru bukan sekadar karya fiksi sejarah, melainkan cermin pembentukan kesadaran nasional pada awal abad kedua puluh.",
      content: `Membaca "Bumi Manusia" dan "Anak Semua Bangsa" membawa kita masuk ke ruang batin Minke, seorang pelajar pribumi yang bergulat dengan modernitas Eropa sekaligus ketidakadilan kolonial.\n\nMelalui riset arsip surat kabar lama yang mendalam, Pramoedya berhasil menghidupkan suasana Surabaya dan Batavia pada pergantian abad. Di Charvlibrary, seluruh seri ini menjadi koleksi yang paling sering dipinjam oleh sivitas akademika dan pencinta sastra setiap semester.`,
    },
    {
      title: "Mengapa Insinyur Perangkat Lunak Tetap Perlu Membaca Buku Cetak dan Konseptual",
      slug: "mengapa-insinyur-perlu-buku-konseptual",
      category: "Teknologi & Riset",
      authorName: "Davvin Denielsen Fusta",
      authorRole: "Kurator Katalog Teknologi",
      readTimeMinutes: 7,
      isFeatured: false,
      excerpt:
        "Dokumentasi singkat di internet membantu menyelesaikan bug hari ini, tetapi buku arsitektur membentuk fondasi karier jangka panjang.",
      content: `Di era pencarian instan, banyak mahasiswa pemrograman hanya mengandalkan potongan kode singkat tanpa memahami prinsip dasar di baliknya. Padahal, kerangka kerja berganti setiap beberapa tahun sementara prinsip desain sistem tetap bertahan puluhan tahun.\n\nBuku seperti "Designing Data-Intensive Applications" karya Martin Kleppmann atau "Refactoring" karya Martin Fowler membahas pertukaran desain secara mendalam yang tidak mungkin dirangkum dalam artikel pendek.`,
    },
    {
      title: "Stoikisme di Kampus: Menjaga Fokus di Tengah Banjir Notifikasi Digital",
      slug: "stoikisme-di-kampus-fokus-digital",
      category: "Psikologi & Filsafat",
      authorName: "Liviana Winata",
      authorRole: "Penulis Tamu",
      readTimeMinutes: 5,
      isFeatured: false,
      excerpt:
        "Pelajaran dari Marcus Aurelius dan Epictetus untuk mengelola kecemasan akademik serta membangun kebiasaan kerja mendalam.",
      content: `Dikotomi kendali dalam filsafat Stoik mengajarkan kita membedakan hal yang berada di bawah kendali kita dan hal di luar kendali kita. Usaha belajar dan kejujuran akademik adalah kendali kita, sedangkan komentar orang lain berada di luar kendali kita.\n\nJika digabungkan dengan metode dari buku "Deep Work" karya Cal Newport, mahasiswa dapat menciptakan blok waktu bebas gangguan selama dua jam setiap pagi di ruang baca perpustakaan.`,
    },
    {
      title: "Panduan Memanfaatkan Daftar Keinginan dan Target Baca Tahunan di Charvlibrary",
      slug: "panduan-rak-kustom-dan-target-baca",
      category: "Panduan Platform",
      authorName: "Olivian Cerlindo",
      authorRole: "Koordinator Perpustakaan",
      readTimeMinutes: 4,
      isFeatured: false,
      excerpt:
        "Maksimalkan fitur personalisasi di akun Charvlibrary Anda untuk menyimpan referensi mata kuliah dan memantau progres membaca.",
      content: `Charvlibrary dirancang bukan hanya sebagai katalog pencarian, tetapi juga ruang kerja literasi pribadi. Melalui menu Daftar Keinginan, Anda dapat menyimpan buku incaran berdasarkan prioritas bacaan serta menambahkan catatan riset pribadi.\n\nSelain itu, kunjungi halaman Target Baca untuk menetapkan jumlah buku dan halaman yang ingin Anda selesaikan tahun ini.`,
    },
    {
      title: "Membedah Psikologi Uang dan Keputusan Ekonomi Mahasiswa",
      slug: "psikologi-uang-keputusan-ekonomi",
      category: "Ekonomi & Bisnis",
      authorName: "Aaron Valerio Lieputra",
      authorRole: "Pengulas Buku Bisnis",
      readTimeMinutes: 6,
      isFeatured: false,
      excerpt:
        "Mengelola keuangan pribadi sejak bangku kuliah lebih banyak berkaitan dengan perilaku dibandingkan rumus matematika rumit.",
      content: `Dalam buku "The Psychology of Money", Morgan Housel menekankan bahwa keberhasilan finansial sangat ditentukan oleh kebiasaan mengendalikan ego dan kesabaran jangka panjang.\n\nMelalui koleksi kategori Business di Charvlibrary, anggota dapat mempelajari dasar pengelolaan anggaran, investasi leher ke atas, dan cara kerja insentif ekonomi.`,
    },
    {
      title: "Masa Depan Perpustakaan Kampus sebagai Ruang Kolaborasi Komunitas",
      slug: "masa-depan-perpustakaan-ruang-kolaborasi",
      category: "Komunitas",
      authorName: "Aurelia Cheryl Claresta",
      authorRole: "Editor Jurnal Literasi",
      readTimeMinutes: 5,
      isFeatured: false,
      excerpt:
        "Perpustakaan modern bertransformasi dari gudang penyimpanan buku yang sunyi menjadi pusat diskusi, bedah buku, dan lokakarya penulisan.",
      content: `Perpustakaan abad kedua puluh satu menggabungkan kemudahan akses katalog digital dengan kehangatan pertemuan tatap muka. Setiap bulan, Charvlibrary menyelenggarakan sesi bedah buku, lokakarya penulisan ilmiah, dan diskusi literasi lintas fakultas.`,
    },
  ];

  for (const post of blogPostsData) {
    await prisma.blogPost.create({
      data: post,
    });
  }

  const eventsData = [
    {
      title: "Bedah Buku & Diskusi Sastra: Bumi Manusia dan Kesadaran Sejarah",
      slug: "bedah-buku-bumi-manusia",
      category: "Bedah Buku",
      eventDate: "2026-05-16",
      eventTime: "14:00 - 16:30 WIB",
      location: "Auditorium Lantai 3 Charvlibrary & Zoom Hybrid",
      speakerName: "Prof. Dr. Hendra Wijaya & Aurelia Cheryl Claresta",
      description:
        "Diskusi mendalam mengenai konteks sejarah awal abad ke-20 dalam karya Pramoedya Ananta Toer serta relevansinya bagi generasi muda saat ini.",
      agenda:
        "14:00 Pembukaan oleh Moderator | 14:15 Pemaparan Konteks Sejarah | 15:00 Diskusi Panel & Tanya Jawab | 16:00 Sesi Kurasi Koleksi Sastra",
      maxQuota: 60,
    },
    {
      title: "Workshop Penulisan Karya Ilmiah & Manajemen Referensi",
      slug: "workshop-penulisan-karya-ilmiah",
      category: "Workshop",
      eventDate: "2026-05-23",
      eventTime: "09:30 - 12:00 WIB",
      location: "Ruang Seminar B201 Charvlibrary",
      speakerName: "Olivian Cerlindo",
      description:
        "Pelatihan praktis menyusun tinjauan pustaka, teknik sitasi akademik bebas plagiarisme, dan pemanfaatan katalog Charvlibrary untuk riset skripsi.",
      agenda:
        "09:30 Registrasi Peserta | 09:45 Strategi Pencarian Literatur | 10:45 Praktik Menyusun Sitasi | 11:30 Evaluasi Draf Peserta",
      maxQuota: 45,
    },
    {
      title: "Diskusi Rekayasa Perangkat Lunak: Membedah Clean Code & Refactoring",
      slug: "klub-baca-clean-code-refactoring",
      category: "Bedah Buku",
      eventDate: "2026-05-30",
      eventTime: "15:30 - 17:30 WIB",
      location: "Pojok Kolaborasi Digital Lantai 2",
      speakerName: "Davvin Denielsen Fusta & Tim Rekayasa Perangkat Lunak",
      description:
        "Pertemuan mahasiswa ilmu komputer membedah studi kasus penulisan kode bersih dan arsitektur modular.",
      agenda:
        "15:30 Review Bab 1-4 Clean Code | 16:15 Live Refactoring Studi Kasus | 17:00 Diskusi Terbuka",
      maxQuota: 35,
    },
    {
      title: "Webinar Literasi Finansial & Psikologi Pengambilan Keputusan",
      slug: "webinar-literasi-finansial-psikologi",
      category: "Webinar",
      eventDate: "2026-06-06",
      eventTime: "19:00 - 21:00 WIB",
      location: "Siaran Langsung Ruang Virtual Charvlibrary",
      speakerName: "Aaron Valerio Lieputra & Dr. Nadia Pramesti",
      description:
        "Mengupas isi buku The Psychology of Money dan Thinking, Fast and Slow untuk membantu mahasiswa mengambil keputusan finansial yang bijak.",
      agenda:
        "19:00 Pengantar Ekonomi Perilaku | 19:45 Studi Kasus Keuangan Mahasiswa | 20:30 Tanya Jawab Interaktif",
      maxQuota: 120,
    },
    {
      title: "Bincang Sore Filsafat Stoikisme: Seni Hidup Tenang di Era Digital",
      slug: "bincang-sore-filsafat-stoikisme",
      category: "Bedah Buku",
      eventDate: "2026-06-13",
      eventTime: "16:00 - 18:00 WIB",
      location: "Taman Baca Terbuka Charvlibrary",
      speakerName: "Chandra Wijaya & Liviana Winata",
      description:
        "Sesi berbagi pengalaman menerapkan prinsip Filosofi Teras dan Meditations dalam menghadapi ujian serta tugas akhir.",
      agenda:
        "16:00 Pembacaan Kutipan Pilihan | 16:30 Diskusi Lingkar Kecil | 17:30 Refleksi Penutup",
      maxQuota: 40,
    },
    {
      title: "Pameran Koleksi Langka & Orientasi Anggota Baru Semester Ganjil",
      slug: "pameran-koleksi-langka-orientasi",
      category: "Workshop",
      eventDate: "2026-06-20",
      eventTime: "10:00 - 15:00 WIB",
      location: "Aula Utama Charvlibrary",
      speakerName: "Tim Pustakawan Charvlibrary",
      description:
        "Tur keliling fasilitas perpustakaan, pengenalan sistem peminjaman mandiri, dan pameran edisi cetak perdana sastra Nusantara.",
      agenda:
        "10:00 Tur Katalog & Ruang Baca | 11:30 Demo Peminjaman Digital | 13:30 Sesi Kurasi Bersama Pustakawan",
      maxQuota: 80,
    },
  ];

  for (let i = 0; i < eventsData.length; i++) {
    await prisma.event.create({
      data: eventsData[i],
    });
  }

  const faqsData = [
    {
      question: "Berapa jumlah maksimal buku yang dapat dipinjam secara bersamaan?",
      answer:
        "Setiap anggota aktif Charvlibrary dapat meminjam maksimal 5 buku secara bersamaan dengan durasi peminjaman standar 7, 14, atau 21 hari.",
      category: "Peminjaman",
      sortOrder: 1,
      helpfulYes: 0,
      helpfulNo: 0,
    },
    {
      question: "Bagaimana cara memperpanjang masa pinjam buku yang sedang dipinjam?",
      answer:
        "Buka halaman Pengembalian & Perpanjangan atau Buku Dipinjam, lalu klik tombol Perpanjang 7 Hari selama kuota perpanjangan belum mencapai 2 kali dan buku belum melewati batas jatuh tempo.",
      category: "Peminjaman",
      sortOrder: 2,
      helpfulYes: 0,
      helpfulNo: 0,
    },
    {
      question: "Apa yang terjadi pada status buku ketika sedang dipinjam oleh anggota?",
      answer:
        "Setiap buku yang sedang dipinjam otomatis berubah status menjadi Tidak Tersedia di katalog hingga buku tersebut dikembalikan ke perpustakaan.",
      category: "Layanan",
      sortOrder: 3,
      helpfulYes: 0,
      helpfulNo: 0,
    },
    {
      question: "Bagaimana cara mengusulkan atau menambahkan buku baru ke dalam katalog Charvlibrary?",
      answer:
        "Anggota dapat mengirimkan usulan pengadaan buku melalui formulir Hubungi Pustakawan. Pustakawan (Admin) kemudian menambahkan buku baru beserta sampulnya ke katalog melalui fitur khusus Admin.",
      category: "Koleksi",
      sortOrder: 4,
      helpfulYes: 0,
      helpfulNo: 0,
    },
    {
      question: "Apa yang terjadi jika buku di katalog belum memiliki file gambar sampul?",
      answer:
        "Jika sebuah buku belum memiliki unggahan gambar sampul, sistem Charvlibrary secara otomatis menampilkan sampul buku tipografis lengkap dengan judul, penulis, dan palet warna kategori.",
      category: "Koleksi",
      sortOrder: 5,
      helpfulYes: 0,
      helpfulNo: 0,
    },
    {
      question: "Bagaimana cara menggunakan fitur pencarian cepat di bilah atas?",
      answer:
        "Tekan pintasan keyboard Ctrl+K (atau Cmd+K pada macOS) dari halaman mana saja, lalu ketikkan judul buku, nama penulis, atau nomor ISBN untuk menemukan buku secara instan.",
      category: "Koleksi",
      sortOrder: 6,
      helpfulYes: 0,
      helpfulNo: 0,
    },
    {
      question: "Bagaimana prosedur reset kata sandi jika saya lupa password akun?",
      answer:
        "Klik tautan Lupa Kata Sandi di halaman Masuk, masukkan email kampus Anda, masukkan kode OTP 6 digit pada langkah kedua, lalu buat password baru Anda pada langkah ketiga di halaman yang sama.",
      category: "Akun",
      sortOrder: 7,
      helpfulYes: 0,
      helpfulNo: 0,
    },
    {
      question: "Apakah saya bisa menyimpan daftar buku incaran untuk mata kuliah tertentu?",
      answer:
        "Tentu saja. Gunakan fitur Daftar Keinginan untuk menyimpan buku dari katalog, mengatur tingkat prioritas bacaan, dan menambahkan catatan riset pribadi.",
      category: "Koleksi",
      sortOrder: 8,
      helpfulYes: 0,
      helpfulNo: 0,
    },
    {
      question: "Bagaimana sistem rekomendasi buku bekerja di Charvlibrary?",
      answer:
        "Halaman Rekomendasi menggabungkan preferensi genre yang Anda pilih saat orientasi akun dengan riwayat peminjaman serta peringkat tertinggi di kategori tersebut.",
      category: "Koleksi",
      sortOrder: 9,
      helpfulYes: 0,
      helpfulNo: 0,
    },
    {
      question: "Di mana saya bisa melihat kartu anggota perpustakaan digital saya?",
      answer:
        "Kartu anggota digital lengkap dengan kode unik anggota dan status keanggotaan dapat dilihat melalui halaman Profil Anggota.",
      category: "Akun",
      sortOrder: 10,
      helpfulYes: 0,
      helpfulNo: 0,
    },
    {
      question: "Bagaimana cara mengembalikan buku yang sudah selesai dibaca?",
      answer:
        "Anda dapat mengembalikan buku secara mandiri melalui halaman Pengembalian & Perpanjangan atau menyerahkannya kepada Pustakawan agar status buku kembali menjadi Tersedia.",
      category: "Layanan",
      sortOrder: 11,
      helpfulYes: 0,
      helpfulNo: 0,
    },
    {
      question: "Bagaimana cara mendaftar ke acara bedah buku atau lokakarya literasi?",
      answer:
        "Buka halaman Acara & Kegiatan, pilih acara yang diminati, lalu isi formulir pendaftaran pada halaman detail acara untuk mendapatkan kode tiket kehadiran.",
      category: "Peminjaman",
      sortOrder: 12,
      helpfulYes: 0,
      helpfulNo: 0,
    },
  ];

  await prisma.faq.createMany({ data: faqsData });

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