export interface RawBookSeed {
  id: number;
  title: string;
  subtitle?: string;
  author: string;
  genre: string;
  rating: number;
  ratingCount: number;
  year: number;
  pages: number;
  synopsis: string;
  isbn: string;
  publisher: string;
  language: string;
  available: boolean;
  featured: boolean;
  tags: string[];
}

export interface RawGenreSeed {
  slug: string;
  name: string;
  iconName: string;
  accentColor: string;
  description: string;
}

export const GENRES_SEED: RawGenreSeed[] = [
  { slug: "literary-fiction", name: "Literary Fiction", iconName: "feather", accentColor: "#92400E", description: "Novel penuh makna kemanusiaan dan kekayaan gaya bahasa sastra." },
  { slug: "science-fiction", name: "Science Fiction", iconName: "telescope", accentColor: "#1E40AF", description: "Eksplorasi masa depan, antariksa, teknologi, dan imajinasi ilmiah." },
  { slug: "self-help", name: "Self-Help", iconName: "lightbulb", accentColor: "#D97706", description: "Pengembangan diri, pembentukan kebiasaan baik, dan psikologi praktis." },
  { slug: "non-fiction", name: "Non-Fiction", iconName: "newspaper", accentColor: "#7C3AED", description: "Fakta sejarah, antropologi, sains populer, dan perspektif dunia nyata." },
  { slug: "fantasy", name: "Fantasy", iconName: "sparkles", accentColor: "#B45309", description: "Dunia magis, mitologi, dan petualangan epik lintas semesta." },
  { slug: "historical-fiction", name: "Historical Fiction", iconName: "clock", accentColor: "#BE123C", description: "Peristiwa sejarah dunia yang dihidupkan kembali lewat narasi fiksi." },
  { slug: "philosophy", name: "Philosophy", iconName: "brain", accentColor: "#0F766E", description: "Refleksi mendalam tentang etika, eksistensi, logika, dan makna hidup." },
  { slug: "technology", name: "Technology", iconName: "cpu", accentColor: "#1D4ED8", description: "Rekayasa perangkat lunak, arsitektur sistem, algoritma, dan dunia digital." },
  { slug: "mystery", name: "Mystery", iconName: "search", accentColor: "#374151", description: "Teka-teki detektif, investigasi kriminal, dan ketegangan psikologis." },
  { slug: "dystopian", name: "Dystopian", iconName: "shield-alert", accentColor: "#DC2626", description: "Potret masyarakat masa depan sebagai kritik sosial dan politik." },
  { slug: "biography", name: "Biography", iconName: "user", accentColor: "#065F46", description: "Kisah perjalanan hidup tokoh nyata, ilmuwan, dan pemimpin dunia." },
  { slug: "science", name: "Science", iconName: "atom", accentColor: "#0369A1", description: "Penemuan kosmologi, biologi molekuler, genetika, dan hukum alam." },
  { slug: "romance", name: "Romance", iconName: "heart", accentColor: "#BE185D", description: "Kisah relasi manusia, kasih sayang, dan dinamika perasaan." },
  { slug: "horror", name: "Horror", iconName: "flame", accentColor: "#1F2937", description: "Atmosfer mencekam, misteri supranatural, dan sisi gelap psikologi." },
  { slug: "business", name: "Business", iconName: "briefcase", accentColor: "#78350F", description: "Manajemen organisasi, inovasi startup, ekonomi perilaku, dan finansial." },
  { slug: "indonesian-literature", name: "Indonesian Literature", iconName: "book-open", accentColor: "#166534", description: "Karya sastra terbaik penulis Nusantara dari era klasik hingga kontemporer." }
];

export const BOOKS_SEED: RawBookSeed[] = [
  {
    id: 1, title: "Laskar Pelangi", author: "Andrea Hirata", genre: "Literary Fiction",
    rating: 4.8, ratingCount: 2341, year: 2005, pages: 529,
    synopsis: "Kisah sepuluh anak dari keluarga kurang mampu yang berjuang menggapai pendidikan di sekolah Muhammadiyah Belitung.",
    isbn: "978-979-3062-79-2", publisher: "Bentang Pustaka", language: "Indonesia",
    available: true, featured: true, tags: ["Indonesia", "Drama", "Pendidikan"]
  },
  {
    id: 2, title: "Bumi Manusia", author: "Pramoedya Ananta Toer", genre: "Literary Fiction",
    rating: 4.9, ratingCount: 3102, year: 1980, pages: 535,
    synopsis: "Buku pertama Tetralogi Buru yang mengisahkan kehidupan Hindia Belanda awal abad ke-20 melalui perjuangan Minke dan Nyai Ontosoroh.",
    isbn: "978-979-461-216-3", publisher: "Hasta Mitra", language: "Indonesia",
    available: true, featured: true, tags: ["Indonesia", "Sejarah", "Kolonialisme"]
  },
  {
    id: 3, title: "The Great Gatsby", author: "F. Scott Fitzgerald", genre: "Literary Fiction",
    rating: 4.4, ratingCount: 4201, year: 1925, pages: 180,
    synopsis: "Kemewahan, obsesi cinta, dan kerapuhan Mimpi Amerika pada era Jazz tahun 1920-an di Long Island.",
    isbn: "978-0-7432-7356-5", publisher: "Scribner", language: "English",
    available: true, featured: false, tags: ["Amerika", "Klasik", "Drama"]
  },
  {
    id: 4, title: "The Kite Runner", author: "Khaled Hosseini", genre: "Literary Fiction",
    rating: 4.7, ratingCount: 4567, year: 2003, pages: 371,
    synopsis: "Persahabatan, pengkhianatan, dan penebusan dosa antara dua anak laki-laki dari Kabul hingga California.",
    isbn: "978-1-59448-000-3", publisher: "Riverhead Books", language: "English",
    available: true, featured: false, tags: ["Afghanistan", "Drama", "Persahabatan"]
  },
  {
    id: 5, title: "Norwegian Wood", author: "Haruki Murakami", genre: "Literary Fiction",
    rating: 4.5, ratingCount: 3456, year: 1987, pages: 296,
    synopsis: "Roman melankolis yang mengikuti perjalanan batin Toru Watanabe sebagai mahasiswa di Tokyo akhir 1960-an.",
    isbn: "978-0-375-70402-4", publisher: "Vintage", language: "Japanese",
    available: true, featured: false, tags: ["Jepang", "Romansa", "Dewasa Muda"]
  },
  {
    id: 6, title: "To Kill a Mockingbird", author: "Harper Lee", genre: "Literary Fiction",
    rating: 4.8, ratingCount: 7829, year: 1960, pages: 324,
    synopsis: "Potret ketidakadilan rasial dan keberanian moral pengacara Atticus Finch di Amerika Selatan melalui sudut pandang Scout.",
    isbn: "978-0-06-193546-6", publisher: "HarperCollins", language: "English",
    available: true, featured: false, tags: ["Amerika", "Keadilan", "Klasik"]
  },
  {
    id: 7, title: "One Hundred Years of Solitude", author: "Gabriel Garcia Marquez", genre: "Literary Fiction",
    rating: 4.7, ratingCount: 5312, year: 1967, pages: 417,
    synopsis: "Tujuh generasi keluarga Buendia di desa fiksi Macondo dalam mahakarya epik realisme magis Amerika Latin.",
    isbn: "978-0-06-088328-7", publisher: "Harper Perennial", language: "Spanish",
    available: false, featured: false, tags: ["Amerika Latin", "Realisme Magis", "Epik"]
  },
  {
    id: 8, title: "The Midnight Library", author: "Matt Haig", genre: "Literary Fiction",
    rating: 4.4, ratingCount: 5691, year: 2020, pages: 304,
    synopsis: "Di antara hidup dan mati terdapat perpustakaan ajaib berisi jutaan buku kemungkinan hidup yang bisa dijalani Nora Seed.",
    isbn: "978-0-525-55947-4", publisher: "Viking", language: "English",
    available: true, featured: true, tags: ["Kontemporer", "Fantasi", "Filosofi"]
  },
  {
    id: 9, title: "Dune", author: "Frank Herbert", genre: "Science Fiction",
    rating: 4.8, ratingCount: 6782, year: 1965, pages: 896,
    synopsis: "Epik di planet gurun Arrakis yang memadukan intrik politik antarbintang, ekologi, dan perjuangan Paul Atreides.",
    isbn: "978-0-441-17271-9", publisher: "Ace Books", language: "English",
    available: true, featured: true, tags: ["Fiksi Ilmiah", "Epik", "Politik"]
  },
  {
    id: 10, title: "Project Hail Mary", author: "Andy Weir", genre: "Science Fiction",
    rating: 4.9, ratingCount: 3201, year: 2021, pages: 476,
    synopsis: "Ryland Grace terbangun sendirian di pesawat antariksa dan harus memecahkan teka-teki ilmiah demi menyelamatkan Bumi.",
    isbn: "978-0-593-13520-4", publisher: "Ballantine Books", language: "English",
    available: true, featured: true, tags: ["Fiksi Ilmiah", "Petualangan", "Sains"]
  },
  {
    id: 11, title: "The Hitchhiker's Guide to the Galaxy", author: "Douglas Adams", genre: "Science Fiction",
    rating: 4.7, ratingCount: 8103, year: 1979, pages: 224,
    synopsis: "Perjalanan kosmik penuh humor bersama Arthur Dent dan Ford Prefect setelah Bumi digusur untuk jalan tol antargalaksi.",
    isbn: "978-0-345-39180-3", publisher: "Del Rey", language: "English",
    available: true, featured: false, tags: ["Fiksi Ilmiah", "Komedi", "Petualangan"]
  },
  {
    id: 12, title: "Ender's Game", author: "Orson Scott Card", genre: "Science Fiction",
    rating: 4.6, ratingCount: 5892, year: 1985, pages: 352,
    synopsis: "Anak berbakat strategi dilatih di stasiun orbit Battle School untuk mempertahankan umat manusia dari ancaman alien.",
    isbn: "978-0-8125-5070-2", publisher: "Tor Books", language: "English",
    available: false, featured: false, tags: ["Fiksi Ilmiah", "Militer", "Remaja"]
  },
  {
    id: 13, title: "Brave New World", author: "Aldous Huxley", genre: "Science Fiction",
    rating: 4.5, ratingCount: 6321, year: 1932, pages: 311,
    synopsis: "Masyarakat masa depan yang dikondisikan secara genetik agar tampak bahagia namun kehilangan kebebasan sejati.",
    isbn: "978-0-06-085052-4", publisher: "Harper Perennial", language: "English",
    available: true, featured: false, tags: ["Distopia", "Klasik", "Teknologi"]
  },
  {
    id: 14, title: "The Martian", author: "Andy Weir", genre: "Science Fiction",
    rating: 4.6, ratingCount: 7234, year: 2011, pages: 369,
    synopsis: "Astronaut Mark Watney tertinggal sendirian di permukaan Mars dan memanfaatkan ilmu botani serta teknik untuk bertahan hidup.",
    isbn: "978-0-553-41802-6", publisher: "Crown", language: "English",
    available: true, featured: false, tags: ["Fiksi Ilmiah", "Survival", "Sains"]
  },
  {
    id: 15, title: "Foundation", author: "Isaac Asimov", genre: "Science Fiction",
    rating: 4.7, ratingCount: 4901, year: 1951, pages: 244,
    synopsis: "Matematikawan Hari Seldon meramalkan keruntuhan kekaisaran galaksi dengan psikosejarah dan mendirikan ensiklopedia penyelamat.",
    isbn: "978-0-553-29335-7", publisher: "Bantam Spectra", language: "English",
    available: false, featured: false, tags: ["Fiksi Ilmiah", "Epik", "Psikosejarah"]
  },
  {
    id: 16, title: "Atomic Habits", author: "James Clear", genre: "Self-Help",
    rating: 4.7, ratingCount: 8921, year: 2018, pages: 320,
    synopsis: "Panduan praktis membangun kebiasaan baik dan menghentikan kebiasaan buruk melalui perbaikan satu persen setiap hari.",
    isbn: "978-0-7352-1129-2", publisher: "Avery", language: "English",
    available: true, featured: true, tags: ["Produktivitas", "Psikologi", "Kebiasaan"]
  },
];