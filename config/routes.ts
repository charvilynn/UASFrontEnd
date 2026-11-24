export type NavGroup = "discover" | "borrowing" | "community" | "account" | "support" | "admin";

export type RouteAccess = "public" | "member" | "admin";

export type TeamMember = "Davvin" | "Livi" | "Chandra" | "Aaron" | "Aurel" | "Olivian";

export interface AppRoute {
  id: string;
  path: string;
  defaultHref: string;
  label: string;
  shortDesc: string;
  group: NavGroup;
  access: RouteAccess;
  iconName: string;
  parentPath: string | null;
  owner: TeamMember;
  pillarName: string;
  isDynamic?: boolean;
  requiresAuth?: boolean;
  requiredRole?: "member" | "admin";
  showInNavbar: boolean;
  showInFooter: boolean;
  usesDatabase: boolean;
}

export const NAV_GROUPS: Record<
  NavGroup,
  { label: string; subtitle: string; iconName: string }
> = {
  discover: {
    label: "Jelajah & Katalog",
    subtitle: "Eksplorasi koleksi buku, kategori, dan kurasi tematik",
    iconName: "Compass",
  },
  borrowing: {
    label: "Peminjaman & Sirkulasi",
    subtitle: "Keranjang pinjam, pengembalian, ulasan, dan daftar keinginan",
    iconName: "BookMarked",
  },
  community: {
    label: "Komunitas & Literasi",
    subtitle: "Artikel jurnal, direktori penulis, dan agenda kegiatan",
    iconName: "Users",
  },
  account: {
    label: "Akun & Profil Anggota",
    subtitle: "Profil anggota, pinjaman aktif, riwayat bacaan, dan keamanan sesi",
    iconName: "UserCheck",
  },
  support: {
    label: "Informasi & Bantuan",
    subtitle: "Panduan perpustakaan, tanya jawab, kontak, dan peta situs",
    iconName: "LifeBuoy",
  },
  admin: {
    label: "Admin & Manajemen Koleksi",
    subtitle: "Tambah buku baru, kelola katalog, taksonomi, dan anggota",
    iconName: "ShieldCheck",
  },
};

export const ROUTES: AppRoute[] = [
  {
    id: "home",
    path: "/",
    defaultHref: "/",
    label: "Beranda",
    shortDesc: "Halaman utama perpustakaan digital dan sorotan koleksi",
    group: "discover",
    access: "public",
    iconName: "Home",
    parentPath: null,
    owner: "Davvin",
    pillarName: "Katalog & Eksplorasi",
    showInNavbar: true,
    showInFooter: false,
    usesDatabase: true,
  },
  {
    id: "explore",
    path: "/explore",
    defaultHref: "/explore",
    label: "Jelajah",
    shortDesc: "Telusuri katalog buku dengan filter kategori, bahasa, dan ketersediaan",
    group: "discover",
    access: "public",
    iconName: "Compass",
    parentPath: "/",
    owner: "Davvin",
    pillarName: "Katalog & Eksplorasi",
    showInNavbar: true,
    showInFooter: false,
    usesDatabase: true,
  },
  {
    id: "book-detail",
    path: "/books/[id]",
    defaultHref: "/books/1",
    label: "Detail Buku",
    shortDesc: "Informasi lengkap buku, pratinjau halaman, ulasan, dan stok",
    group: "discover",
    access: "public",
    iconName: "BookOpen",
    parentPath: "/explore",
    owner: "Davvin",
    pillarName: "Katalog & Eksplorasi",
    isDynamic: true,
    showInNavbar: false,
    showInFooter: false,
    usesDatabase: true,
  },
  {
    id: "book-edit",
    path: "/books/[id]/edit",
    defaultHref: "/books/1/edit",
    label: "Edit Buku",
    shortDesc: "Perbarui metadata buku, stok, kategori, dan gambar sampul",
    group: "admin",
    access: "admin",
    iconName: "FileEdit",
    parentPath: "/books/1",
    owner: "Davvin",
    pillarName: "Katalog & Eksplorasi",
    isDynamic: true,
    requiresAuth: true,
    requiredRole: "admin",
    showInNavbar: false,
    showInFooter: false,
    usesDatabase: true,
  },
  {
    id: "categories",
    path: "/categories",
    defaultHref: "/categories",
    label: "Kategori",
    shortDesc: "Jelajahi 16 kategori literatur dan disiplin ilmu",
    group: "discover",
    access: "public",
    iconName: "Layers",
    parentPath: "/explore",
    owner: "Davvin",
    pillarName: "Katalog & Eksplorasi",
    showInNavbar: true,
    showInFooter: false,
    usesDatabase: true,
  },
  {
    id: "search",
    path: "/search",
    defaultHref: "/search",
    label: "Pencarian Lanjutan",
    shortDesc: "Cari judul, penulis, ISBN, penerbit, atau rentang halaman",
    group: "discover",
    access: "public",
    iconName: "Search",
    parentPath: "/explore",
    owner: "Davvin",
    pillarName: "Katalog & Eksplorasi",
    showInNavbar: true,
    showInFooter: false,
    usesDatabase: true,
  },
  {
    id: "trending",
    path: "/trending",
    defaultHref: "/trending",
    label: "Populer & Tren",
    shortDesc: "Peringkat buku paling sering dipinjam dan rating tertinggi",
    group: "discover",
    access: "public",
    iconName: "TrendingUp",
    parentPath: "/explore",
    owner: "Davvin",
    pillarName: "Katalog & Eksplorasi",
    showInNavbar: true,
    showInFooter: false,
    usesDatabase: true,
  },
  {
    id: "collections",
    path: "/collections",
    defaultHref: "/collections",
    label: "Koleksi",
    shortDesc: "Daftar kurasi tematik pilihan pustakawan dan dosen",
    group: "discover",
    access: "public",
    iconName: "Library",
    parentPath: "/explore",
    owner: "Davvin",
    pillarName: "Katalog & Eksplorasi",
    showInNavbar: true,
    showInFooter: false,
    usesDatabase: true,
  },
  {
    id: "collection-detail",
    path: "/collections/[slug]",
    defaultHref: "/collections/sastra-indonesia",
    label: "Detail Koleksi Kurasi",
    shortDesc: "Urutan buku dan catatan kurator pada tema pilihan",
    group: "discover",
    access: "public",
    iconName: "FolderHeart",
    parentPath: "/collections",
    owner: "Davvin",
    pillarName: "Katalog & Eksplorasi",
    isDynamic: true,
    showInNavbar: false,
    showInFooter: false,
    usesDatabase: true,
  },
  {
    id: "login",
    path: "/login",
    defaultHref: "/login",
    label: "Masuk",
    shortDesc: "Masuk ke akun anggota atau pustakawan Charvlibrary",
    group: "account",
    access: "public",
    iconName: "LogIn",
    parentPath: "/",
    owner: "Livi",
    pillarName: "Autentikasi & Keamanan",
    showInNavbar: false,
    showInFooter: false,
    usesDatabase: true,
  },
  {
    id: "register",
    path: "/register",
    defaultHref: "/register",
    label: "Daftar Anggota",
    shortDesc: "Pendaftaran akun anggota baru langsung aktif tanpa OTP",
    group: "account",
    access: "public",
    iconName: "UserPlus",
    parentPath: "/login",
    owner: "Livi",
    pillarName: "Autentikasi & Keamanan",
    showInNavbar: false,
    showInFooter: false,
    usesDatabase: true,
  },
  {
    id: "forgot-password",
    path: "/forgot-password",
    defaultHref: "/forgot-password",
    label: "Reset Password",
    shortDesc: "Alur pemulihan kata sandi 3 langkah menggunakan kode OTP 6 digit",
    group: "account",
    access: "public",
    iconName: "KeyRound",
    parentPath: "/login",
    owner: "Livi",
    pillarName: "Autentikasi & Keamanan",
    showInNavbar: false,
    showInFooter: false,
    usesDatabase: true,
  },
  {
    id: "onboarding",
    path: "/onboarding",
    defaultHref: "/onboarding",
    label: "Orientasi Minat Baca",
    shortDesc: "Pilih genre favorit dan target baca tahunan untuk personalisasi",
    group: "account",
    access: "member",
    iconName: "Sparkles",
    parentPath: "/",
    owner: "Livi",
    pillarName: "Autentikasi & Keamanan",
    requiresAuth: true,
    showInNavbar: true,
    showInFooter: false,
    usesDatabase: true,
  },
  {
    id: "account-security",
    path: "/account/security",
    defaultHref: "/account/security",
    label: "Keamanan Akun",
    shortDesc: "Ubah kata sandi akun dan periksa perlindungan kredensial",
    group: "account",
    access: "member",
    iconName: "Shield",
    parentPath: "/account/profile",
    owner: "Livi",
    pillarName: "Autentikasi & Keamanan",
    requiresAuth: true,
    showInNavbar: true,
    showInFooter: false,
    usesDatabase: true,
  },
  {
    id: "account-sessions",
    path: "/account/sessions",
    defaultHref: "/account/sessions",
    label: "Sesi & Perangkat Aktif",
    shortDesc: "Kelola perangkat yang sedang login dan cabut sesi dari jarak jauh",
    group: "account",
    access: "member",
    iconName: "Laptop",
    parentPath: "/account/security",
    owner: "Livi",
    pillarName: "Autentikasi & Keamanan",
    requiresAuth: true,
    showInNavbar: true,
    showInFooter: false,
    usesDatabase: true,
  },
  {
    id: "account-login-history",
    path: "/account/login-history",
    defaultHref: "/account/login-history",
    label: "Riwayat Login",
    shortDesc: "Catatan aktivitas masuk akun beserta waktu dan perangkat",
    group: "account",
    access: "member",
    iconName: "History",
    parentPath: "/account/security",
    owner: "Livi",
    pillarName: "Autentikasi & Keamanan",
    requiresAuth: true,
    showInNavbar: true,
    showInFooter: false,
    usesDatabase: true,
  },
  {
    id: "account-preferences",
    path: "/account/preferences",
    defaultHref: "/account/preferences",
    label: "Preferensi Tampilan & Minat",
    shortDesc: "Atur efek kursor interaktif, tema ruang baca, dan genre favorit",
    group: "account",
    access: "member",
    iconName: "Sliders",
    parentPath: "/account/profile",
    owner: "Livi",
    pillarName: "Autentikasi & Keamanan",
    requiresAuth: true,
    showInNavbar: true,
    showInFooter: false,
    usesDatabase: true,
  },
  {
    id: "account-profile",
    path: "/account/profile",
    defaultHref: "/account/profile",
    label: "Profil & Kartu Anggota",
    shortDesc: "Kartu anggota digital Charvlibrary dan ringkasan aktivitas",
    group: "account",
    access: "member",
    iconName: "User",
    parentPath: "/",
    owner: "Chandra",
    pillarName: "Profil & Analitik Baca",
    requiresAuth: true,
    showInNavbar: true,
    showInFooter: false,
    usesDatabase: true,
  },
  {
    id: "account-edit-profile",
    path: "/account/edit-profile",
    defaultHref: "/account/edit-profile",
    label: "Edit Profil",
    shortDesc: "Perbarui biodata, fakultas, nomor telepon, dan warna avatar",
    group: "account",
    access: "member",
    iconName: "UserCog",
    parentPath: "/account/profile",
    owner: "Chandra",
    pillarName: "Profil & Analitik Baca",
    requiresAuth: true,
    showInNavbar: true,
    showInFooter: false,
    usesDatabase: true,
  },
  {
    id: "account-borrowed",
    path: "/account/borrowed",
    defaultHref: "/account/borrowed",
    label: "Buku Dipinjam",
    shortDesc: "Daftar buku yang sedang dipinjam beserta hitung mundur tenggat",
    group: "account",
    access: "member",
    iconName: "BookCopy",
    parentPath: "/account/profile",
    owner: "Chandra",
    pillarName: "Profil & Analitik Baca",
    requiresAuth: true,
    showInNavbar: true,
    showInFooter: false,
    usesDatabase: true,
  },
  {
    id: "account-history",
    path: "/account/history",
    defaultHref: "/account/history",
    label: "Riwayat Bacaan",
    shortDesc: "Jurnal buku yang telah selesai dibaca dan catatan refleksi",
    group: "account",
    access: "member",
    iconName: "Clock",
    parentPath: "/account/profile",
    owner: "Chandra",
    pillarName: "Profil & Analitik Baca",
    requiresAuth: true,
    showInNavbar: true,
    showInFooter: false,
    usesDatabase: true,
  },
  {
    id: "account-notifications",
    path: "/account/notifications",
    defaultHref: "/account/notifications",
    label: "Notifikasi",
    shortDesc: "Kotak masuk pengingat jatuh tempo dan pengumuman perpustakaan",
    group: "account",
    access: "member",
    iconName: "Bell",
    parentPath: "/account/profile",
    owner: "Chandra",
    pillarName: "Profil & Riwayat Baca",
    requiresAuth: true,
    showInNavbar: true,
    showInFooter: false,
    usesDatabase: true,
  },
  {
    id: "account-reading-goals",
    path: "/account/reading-goals",
    defaultHref: "/account/reading-goals",
    label: "Target Baca Tahunan",
    shortDesc: "Atur dan pantau progres target buku serta halaman tahun ini",
    group: "account",
    access: "member",
    iconName: "Target",
    parentPath: "/account/profile",
    owner: "Chandra",
    pillarName: "Profil & Riwayat Baca",
    requiresAuth: true,
    showInNavbar: true,
    showInFooter: false,
    usesDatabase: true,
  },
  {
    id: "wishlist",
    path: "/wishlist",
    defaultHref: "/wishlist",
    label: "Daftar Keinginan",
    shortDesc: "Simpan buku incaran dengan tingkat prioritas dan pindahkan ke keranjang",
    group: "borrowing",
    access: "member",
    iconName: "Heart",
    parentPath: "/explore",
    owner: "Aaron",
    pillarName: "Sirkulasi, Rak & Ulasan",
    requiresAuth: true,
    showInNavbar: true,
    showInFooter: false,
    usesDatabase: true,
  },
  {
    id: "cart",
    path: "/cart",
    defaultHref: "/cart",
    label: "Keranjang Pinjam",
    shortDesc: "Kelola daftar buku yang akan dipinjam dan pilih durasi hari",
    group: "borrowing",
    access: "member",
    iconName: "ShoppingBag",
    parentPath: "/explore",
    owner: "Aaron",
    pillarName: "Sirkulasi, Rak & Ulasan",
    requiresAuth: true,
    showInNavbar: true,
    showInFooter: false,
    usesDatabase: true,
  },
  {
    id: "borrow-checkout",
    path: "/borrow/checkout",
    defaultHref: "/borrow/checkout",
    label: "Checkout Peminjaman",
    shortDesc: "Verifikasi kuota pinjam, tanggal kembali, dan konfirmasi transaksi",
    group: "borrowing",
    access: "member",
    iconName: "CheckSquare",
    parentPath: "/cart",
    owner: "Aaron",
    pillarName: "Sirkulasi, Rak & Ulasan",
    requiresAuth: true,
    showInNavbar: true,
    showInFooter: false,
    usesDatabase: true,
  },
  {
    id: "borrow-confirmation",
    path: "/borrow/confirmation",
    defaultHref: "/borrow/confirmation",
    label: "Bukti Peminjaman",
    shortDesc: "Tiket resi peminjaman digital beserta kode transaksi",
    group: "borrowing",
    access: "member",
    iconName: "Ticket",
    parentPath: "/account/borrowed",
    owner: "Aaron",
    pillarName: "Sirkulasi, Rak & Ulasan",
    requiresAuth: true,
    showInNavbar: true,
    showInFooter: false,
    usesDatabase: true,
  },
];

export function canRoleSeeRoute(
  route: AppRoute,
  role: "guest" | "member" | "admin"
): boolean {
  if (route.access === "public") return true;
  if (route.access === "member") return role === "member" || role === "admin";
  if (route.access === "admin") return role === "admin";
  return false;
}

export function filterRoutesForRole(
  role: "guest" | "member" | "admin",
  options?: { includeDynamic?: boolean }
): AppRoute[] {
  const includeDynamic = options?.includeDynamic ?? false;
  return ROUTES.filter((route) => {
    if (!includeDynamic && route.isDynamic) return false;
    return canRoleSeeRoute(route, role);
  });
}

export function matchRoute(pathname: string): AppRoute | undefined {
  const cleanPath = pathname.split(/[?#]/)[0].replace(/\/+$/, "") || "/";

  const exact = ROUTES.find((r) => r.path === cleanPath);
  if (exact) return exact;

  for (const route of ROUTES) {
    if (!route.isDynamic) continue;
    const regexStr =
      "^" +
      route.path
        .replace(/\[[^\]]+\]/g, "[^/]+")
        .replace(/\//g, "\\/") +
      "$";
    const regex = new RegExp(regexStr);
    if (regex.test(cleanPath)) {
      return route;
    }
  }

  return undefined;
}

export function buildBreadcrumbChain(
  pathname: string,
  customCurrentLabel?: string,
  role: "guest" | "member" | "admin" = "guest"
): { label: string; href: string; isCurrent: boolean }[] {
  const currentRoute = matchRoute(pathname);
  if (!currentRoute) {
    return [
      { label: "Beranda", href: "/", isCurrent: false },
      { label: customCurrentLabel || "Halaman", href: pathname, isCurrent: true },
    ];
  }

  const chain: { label: string; href: string; isCurrent: boolean }[] = [];
  const visited = new Set<string>();

  let cursor: AppRoute | undefined = currentRoute;
  while (cursor && !visited.has(cursor.id)) {
    visited.add(cursor.id);
    const isCurrent = cursor.id === currentRoute.id;
    if (isCurrent || canRoleSeeRoute(cursor, role)) {
      chain.unshift({
        label: isCurrent && customCurrentLabel ? customCurrentLabel : cursor.label,
        href: isCurrent ? pathname : cursor.defaultHref,
        isCurrent,
      });
    }

    if (!cursor.parentPath) break;
    cursor = matchRoute(cursor.parentPath);
  }

  if (chain.length > 0 && chain[0].href !== "/") {
    chain.unshift({ label: "Beranda", href: "/", isCurrent: false });
  }

  return chain;
}

export function getRoutesByGroup(
  group: NavGroup,
  role: "guest" | "member" | "admin" = "guest"
): AppRoute[] {
  return ROUTES.filter(
    (r) => r.group === group && r.showInNavbar && canRoleSeeRoute(r, role)
  );
}