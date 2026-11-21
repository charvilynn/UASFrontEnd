import { BookCardData } from "@/components/books/BookCard";

export function mapPrismaBookToCard(book: any, wishlistBookIds?: Set<number>): BookCardData {
  const primaryAuthor = book.authors?.[0]?.author;
  const primaryCategory = book.categories?.[0]?.category;

  return {
    id: book.id,
    title: book.title,
    subtitle: book.subtitle,
    publishYear: book.publishYear,
    pages: book.pages,
    isbn: book.isbn,
    coverPath: book.coverPath,
    stockAvailable: book.stockAvailable,
    stockTotal: book.stockTotal,
    ratingAvg: book.ratingAvg,
    ratingCount: book.ratingCount,
    authorName: primaryAuthor?.name || "Penulis Katalog",
    authorSlug: primaryAuthor?.slug,
    categoryName: primaryCategory?.name || "Literatur Umum",
    categorySlug: primaryCategory?.slug,
    accentColor: primaryCategory?.accentColor || "#92400E",
    inWishlist: wishlistBookIds ? wishlistBookIds.has(book.id) : false,
  };
}