import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { getSessionUser } from "@/lib/auth";
import { getServerNavigation } from "@/lib/navigation";

export default async function PetaSitusPage() {
  const sessionUser = await getSessionUser();
  const role: "guest" | "member" | "admin" = sessionUser
    ? sessionUser.role === "admin"
      ? "admin"
      : "member"
    : "guest";

  const navPayload = getServerNavigation(role);

  return (
    <div className="min-h-screen pb-16">
      <PageHeader
        title="Peta Situs"
        subtitle="Daftar halaman di Charvlibrary yang tersedia sesuai hak akses sesi Anda saat ini."
        fallbackHref="/"
        breadcrumbLabel="Peta Situs"
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {navPayload.menuGroups.map((group) => (
            <section
              key={group.key}
              className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm"
            >
              <h2 className="font-serif text-lg font-semibold text-[var(--fg)]">
                {group.label}
              </h2>
              <p className="mt-1 text-xs text-[var(--fg-muted)]">
                {group.subtitle}
              </p>

              <ul className="mt-4 divide-y divide-[var(--border)]">
                {group.routes.map((route) => (
                  <li key={route.id} className="py-2.5 first:pt-0 last:pb-0">
                    <Link
                      href={route.href}
                      className="group flex items-start justify-between gap-3 rounded-lg py-1 transition hover:text-[#8A3B12]"
                    >
                      <div>
                        <span className="block text-sm font-medium text-[var(--fg)] group-hover:text-[#8A3B12]">
                          {route.label}
                        </span>
                        <span className="mt-0.5 block text-xs text-[var(--fg-muted)]">
                          {route.shortDesc}
                        </span>
                      </div>
                      <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-[var(--fg-muted)] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#8A3B12]" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

