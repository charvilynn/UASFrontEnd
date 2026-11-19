import "server-only";
import {
  NAV_GROUPS,
  NavGroup,
  RouteAccess,
  canRoleSeeRoute,
  filterRoutesForRole,
} from "@/config/routes";

export interface SanitizedNavLink {
  id: string;
  label: string;
  shortDesc: string;
  href: string;
  group: NavGroup;
  groupLabel: string;
  access: RouteAccess;
}

export interface SanitizedNavGroup {
  key: NavGroup;
  label: string;
  subtitle: string;
  routes: SanitizedNavLink[];
}

export interface ServerNavigationPayload {
  role: "guest" | "member" | "admin";
  primaryLinks: Array<{ label: string; href: string }>;
  menuGroups: SanitizedNavGroup[];
  searchableRoutes: SanitizedNavLink[];
}

const PRIMARY_NAV_LINKS: Array<{ label: string; href: string }> = [
  { label: "Beranda", href: "/" },
  { label: "Jelajah", href: "/explore" },
  { label: "Kategori", href: "/categories" },
  { label: "Koleksi", href: "/collections" },
  { label: "Jurnal", href: "/blog" },
];

const GROUP_ORDER: NavGroup[] = [
  "discover",
  "community",
  "borrowing",
  "account",
  "support",
  "admin",
];

export function getServerNavigation(
  role: "guest" | "member" | "admin"
): ServerNavigationPayload {
  const allowedStaticRoutes = filterRoutesForRole(role, { includeDynamic: false });

  const menuGroups: SanitizedNavGroup[] = [];

  for (const groupKey of GROUP_ORDER) {
    if (groupKey === "admin" && role !== "admin") {
      continue;
    }

    const groupMeta = NAV_GROUPS[groupKey];
    const groupRoutes = allowedStaticRoutes
      .filter((r) => r.group === groupKey && r.showInNavbar)
      .map((r) => ({
        id: r.id,
        label: r.label,
        shortDesc: r.shortDesc,
        href: r.defaultHref,
        group: r.group,
        groupLabel: groupMeta.label,
        access: r.access,
      }));

    if (groupRoutes.length > 0) {
      menuGroups.push({
        key: groupKey,
        label: groupMeta.label,
        subtitle: groupMeta.subtitle,
        routes: groupRoutes,
      });
    }
  }

  const searchableRoutes: SanitizedNavLink[] = allowedStaticRoutes
    .filter((r) => canRoleSeeRoute(r, role))
    .map((r) => ({
      id: r.id,
      label: r.label,
      shortDesc: r.shortDesc,
      href: r.defaultHref,
      group: r.group,
      groupLabel: NAV_GROUPS[r.group].label,
      access: r.access,
    }));

  return {
    role,
    primaryLinks: PRIMARY_NAV_LINKS,
    menuGroups,
    searchableRoutes,
  };
}