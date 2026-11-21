import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") || "").trim().toLowerCase();

  const allBooks = await prisma.book.findMany({
    orderBy: [{ isFeatured: "desc" }, { ratingAvg: "desc" }, { title: "asc" }],
    include: {
      publisher: true,
      authors: { include: { author: true } },
      categories: { include: { category: true } },
    },
  });

  const tokens = q ? q.split(/\s+/).filter(Boolean) : [];

  const matched =
    tokens.length === 0
      ? allBooks.slice(0, 8)
      : allBooks
          .filter((b) => {
            const authorText = b.authors.map((a) => a.author.name).join(" ");
            const categoryText = b.categories
              .map((c) => c.category.name)
              .join(" ");
            const haystack = [
              b.title,
              b.subtitle || "",
              b.isbn,
              b.isbn.replace(/[^0-9xX]/g, ""),
              authorText,
              categoryText,
              b.publisher.name,
            ]
              .join(" ")
              .toLowerCase();

            return tokens.every((tok) => haystack.includes(tok));
          })
          .sort((a, b) => {
            const aStarts = a.title.toLowerCase().startsWith(q) ? 0 : 1;
            const bStarts = b.title.toLowerCase().startsWith(q) ? 0 : 1;
            if (aStarts !== bStarts) return aStarts - bStarts;
            const aContains = a.title.toLowerCase().includes(q) ? 0 : 1;
            const bContains = b.title.toLowerCase().includes(q) ? 0 : 1;
            return aContains - bContains;
          })
          .slice(0, 12);

  const formattedBooks = matched.map((b) => ({
    id: b.id,
    title: b.title,
    isbn: b.isbn,
    publishYear: b.publishYear,
    coverPath: b.coverPath,
    stockAvailable: b.stockAvailable,
    authorName: b.authors[0]?.author.name || "Penulis Katalog",
    categoryName: b.categories[0]?.category.name || "Literatur",
    accentColor: b.categories[0]?.category.accentColor || "#92400E",
    href: `/books/${b.id}`,
  }));

  return NextResponse.json({ books: formattedBooks });
}