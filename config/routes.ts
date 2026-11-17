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