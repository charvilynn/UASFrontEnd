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
  {
    id: 17, title: "Ikigai", author: "Hector Garcia & Francesc Miralles", genre: "Self-Help",
    rating: 4.4, ratingCount: 2890, year: 2016, pages: 194,
    synopsis: "Rahasia umur panjang dan kebahagiaan warga Okinawa Jepang dalam menemukan alasan untuk bangun dengan semangat setiap pagi.",
    isbn: "978-0-14-313072-7", publisher: "Penguin Life", language: "Spanish",
    available: true, featured: true, tags: ["Jepang", "Filosofi", "Kebahagiaan"]
  },
  {
    id: 18, title: "Think and Grow Rich", author: "Napoleon Hill", genre: "Self-Help",
    rating: 4.3, ratingCount: 7124, year: 1937, pages: 320,
    synopsis: "Tiga belas prinsip pencapaian tujuan hidup berdasarkan studi selama dua dekade terhadap para tokoh sukses.",
    isbn: "978-1-59330-200-9", publisher: "Tarcher Perigee", language: "English",
    available: false, featured: false, tags: ["Bisnis", "Motivasi", "Sukses"]
  },
  {
    id: 19, title: "Deep Work", author: "Cal Newport", genre: "Self-Help",
    rating: 4.6, ratingCount: 4512, year: 2016, pages: 304,
    synopsis: "Strategi melatih konsentrasi penuh tanpa distraksi untuk menghasilkan karya bernilai tinggi di tengah kebisingan digital.",
    isbn: "978-1-4555-8669-1", publisher: "Grand Central", language: "English",
    available: true, featured: false, tags: ["Produktivitas", "Fokus", "Karir"]
  },
  {
    id: 20, title: "Mindset: The New Psychology of Success", author: "Carol S. Dweck", genre: "Self-Help",
    rating: 4.5, ratingCount: 5678, year: 2006, pages: 277,
    synopsis: "Penelitian psikologi tentang perbedaan pola pikir tetap (fixed mindset) dan pola pikir bertumbuh (growth mindset).",
    isbn: "978-0-345-47232-8", publisher: "Ballantine Books", language: "English",
    available: true, featured: false, tags: ["Psikologi", "Pertumbuhan", "Pendidikan"]
  },
  {
    id: 21, title: "Filosofi Teras", author: "Henry Manampiring", genre: "Self-Help",
    rating: 4.6, ratingCount: 1893, year: 2019, pages: 262,
    synopsis: "Penerapan filsafat Stoa Yunani-Romawi kuno dengan bahasa populer untuk menjaga ketenangan mental di masa kini.",
    isbn: "978-602-06-3475-3", publisher: "Penerbit Buku Kompas", language: "Indonesia",
    available: true, featured: true, tags: ["Filsafat", "Stoikisme", "Indonesia"]
  },
  {
    id: 22, title: "Grit: The Power of Passion and Perseverance", author: "Angela Duckworth", genre: "Self-Help",
    rating: 4.4, ratingCount: 3901, year: 2016, pages: 352,
    synopsis: "Mengapa perpaduan antara hasrat jangka panjang dan ketekunan lebih menentukan keberhasilan dibandingkan bakat semata.",
    isbn: "978-1-5011-1111-2", publisher: "Scribner", language: "English",
    available: true, featured: false, tags: ["Psikologi", "Kegigihan", "Sukses"]
  },
  {
    id: 23, title: "The Power of Now", author: "Eckhart Tolle", genre: "Self-Help",
    rating: 4.5, ratingCount: 6234, year: 1997, pages: 229,
    synopsis: "Panduan kesadaran diri untuk melepaskan kecemasan masa depan dan penyesalan masa lalu dengan hadir di saat ini.",
    isbn: "978-1-57731-480-6", publisher: "New World Library", language: "English",
    available: false, featured: false, tags: ["Spiritual", "Mindfulness", "Kesadaran"]
  },
  {
    id: 24, title: "Sapiens: A Brief History of Humankind", author: "Yuval Noah Harari", genre: "Non-Fiction",
    rating: 4.6, ratingCount: 5473, year: 2011, pages: 443,
    synopsis: "Penelusuran sejarah Homo sapiens mulai dari revolusi kognitif, revolusi agrikultur, hingga revolusi ilmiah modern.",
    isbn: "978-0-06-231609-7", publisher: "Harper", language: "English",
    available: false, featured: false, tags: ["Sejarah", "Antropologi", "Filsafat"]
  },
  {
    id: 25, title: "Educated", author: "Tara Westover", genre: "Non-Fiction",
    rating: 4.7, ratingCount: 4321, year: 2018, pages: 334,
    synopsis: "Memoar perjuangan seorang perempuan yang baru menginjak ruang kelas pada usia 17 tahun hingga meraih gelar doktor di Cambridge.",
    isbn: "978-0-399-59050-4", publisher: "Random House", language: "English",
    available: true, featured: false, tags: ["Memoar", "Pendidikan", "Inspirasi"]
  },
  {
    id: 26, title: "Brief Answers to the Big Questions", author: "Stephen Hawking", genre: "Non-Fiction",
    rating: 4.5, ratingCount: 3210, year: 2018, pages: 256,
    synopsis: "Pemikiran terakhir fisikawan Stephen Hawking menjawab sepuluh pertanyaan mendasar tentang alam semesta dan masa depan manusia.",
    isbn: "978-1-473-69570-2", publisher: "John Murray", language: "English",
    available: true, featured: false, tags: ["Sains", "Fisika", "Kosmologi"]
  },
  {
    id: 27, title: "Thinking, Fast and Slow", author: "Daniel Kahneman", genre: "Non-Fiction",
    rating: 4.6, ratingCount: 7890, year: 2011, pages: 499,
    synopsis: "Peraih Nobel Ekonomi membedah Sistem 1 (cepat dan intuitif) serta Sistem 2 (lambat dan logis) beserta bias kognitif manusia.",
    isbn: "978-0-374-53355-7", publisher: "Farrar, Straus and Giroux", language: "English",
    available: true, featured: false, tags: ["Psikologi", "Ekonomi Perilaku", "Keputusan"]
  },
  {
    id: 28, title: "Zero to One", author: "Peter Thiel", genre: "Non-Fiction",
    rating: 4.5, ratingCount: 4512, year: 2014, pages: 224,
    synopsis: "Catatan kuliah kewirausahaan Stanford tentang cara menciptakan terobosan teknologi baru, bukan sekadar menyalin model yang sudah ada.",
    isbn: "978-0-8041-3902-1", publisher: "Crown Business", language: "English",
    available: true, featured: false, tags: ["Startup", "Inovasi", "Bisnis"]
  },
  {
    id: 29, title: "The Body: A Guide for Occupants", author: "Bill Bryson", genre: "Non-Fiction",
    rating: 4.5, ratingCount: 2901, year: 2019, pages: 464,
    synopsis: "Tur anatomi dan fisiologi yang hangat serta jenaka mengenai cara kerja organ, sistem imun, dan otak manusia.",
    isbn: "978-0-385-53930-2", publisher: "Doubleday", language: "English",
    available: true, featured: false, tags: ["Biologi", "Kesehatan", "Sains"]
  },
  {
    id: 30, title: "Homo Deus: A Brief History of Tomorrow", author: "Yuval Noah Harari", genre: "Non-Fiction",
    rating: 4.4, ratingCount: 3102, year: 2015, pages: 450,
    synopsis: "Eksplorasi masa depan kemanusiaan ketika bioteknologi, algoritma, dan kecerdasan buatan mengubah tatanan masyarakat.",
    isbn: "978-0-06-246431-6", publisher: "Harper", language: "English",
    available: false, featured: false, tags: ["Futurisme", "Teknologi", "Filsafat"]
  },
  {
    id: 31, title: "Harry Potter and the Philosopher's Stone", author: "J.K. Rowling", genre: "Fantasy",
    rating: 4.8, ratingCount: 12450, year: 1997, pages: 309,
    synopsis: "Harry Potter mengetahui bahwa dirinya adalah penyihir pada ulang tahun kesebelasnya dan memulai tahun pertama di Hogwarts.",
    isbn: "978-0-590-35342-7", publisher: "Bloomsbury", language: "English",
    available: false, featured: false, tags: ["Fantasi", "Petualangan", "Anak-anak"]
  },
  {
    id: 32, title: "The Hobbit", author: "J.R.R. Tolkien", genre: "Fantasy",
    rating: 4.7, ratingCount: 9832, year: 1937, pages: 310,
    synopsis: "Bilbo Baggins meninggalkan liang hobbit yang nyaman untuk membantu Thorin Oakenshield merebut kembali Erebor dari naga Smaug.",
    isbn: "978-0-547-92822-7", publisher: "Houghton Mifflin", language: "English",
    available: true, featured: false, tags: ["Fantasi", "Petualangan", "Epik"]
  },
  {
    id: 33, title: "The Name of the Wind", author: "Patrick Rothfuss", genre: "Fantasy",
    rating: 4.8, ratingCount: 6721, year: 2007, pages: 662,
    synopsis: "Riwayat hidup Kvothe dari rombongan seniman keliling hingga menjadi mahasiswa termuda di Universitas Sihir.",
    isbn: "978-0-7564-0407-9", publisher: "DAW Books", language: "English",
    available: true, featured: false, tags: ["Fantasi", "Epik", "Musik"]
  },
  {
    id: 34, title: "The Alchemist", author: "Paulo Coelho", genre: "Fantasy",
    rating: 4.5, ratingCount: 8923, year: 1988, pages: 197,
    synopsis: "Pengembaraan Santiago, gembala muda Andalusia, melintasi gurun Sahara demi mengejar legenda pribadinya.",
    isbn: "978-0-06-231500-7", publisher: "HarperOne", language: "Portuguese",
    available: true, featured: true, tags: ["Inspirasi", "Petualangan", "Spiritual"]
  },
  {
    id: 35, title: "A Game of Thrones", author: "George R.R. Martin", genre: "Fantasy",
    rating: 4.7, ratingCount: 11234, year: 1996, pages: 694,
    synopsis: "Keluarga bangsawan Stark, Lannister, dan Targaryen bertarung memperebutkan Iron Throne menjelang datangnya musim dingin panjang.",
    isbn: "978-0-553-38168-9", publisher: "Bantam", language: "English",
    available: false, featured: false, tags: ["Fantasi", "Epik", "Politik"]
  },
  {
    id: 36, title: "The Pillars of the Earth", author: "Ken Follett", genre: "Historical Fiction",
    rating: 4.8, ratingCount: 7823, year: 1989, pages: 973,
    synopsis: "Kisah pembangunan katedral Gotik di Kingsbridge Inggris abad ke-12 di tengah gejolak perang saudara dan ambisi manusia.",
    isbn: "978-0-451-16689-0", publisher: "Signet", language: "English",
    available: true, featured: false, tags: ["Inggris Abad Pertengahan", "Arsitektur", "Epik"]
  },
  {
    id: 37, title: "All the Light We Cannot See", author: "Anthony Doerr", genre: "Historical Fiction",
    rating: 4.7, ratingCount: 6341, year: 2014, pages: 531,
    synopsis: "Gadis Prancis tunanetra Marie-Laure dan teknisi radio muda Jerman Werner bertemu di kota Saint-Malo pada masa Perang Dunia II.",
    isbn: "978-1-5011-7321-9", publisher: "Scribner", language: "English",
    available: true, featured: false, tags: ["Perang Dunia II", "Prancis", "Drama"]
  },
];