import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  Mic,
  Users,
  Ticket,
  ListChecks,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    ticket?: string;
    rsvp?: string;
  }>;
}

export default async function EventDetailPage({
  params,
  searchParams,
}: EventDetailPageProps) {
  const { id } = await params;
  const sessionUser = await getSessionUser();

  const numericId = Number(id);
  const includeConfig = {
    rsvps: {
      include: {
        user: true,
      },
      orderBy: { createdAt: "desc" as const },
    },
  };

  let eventRecord = !Number.isNaN(numericId)
    ? await prisma.event.findUnique({
        where: { id: numericId },
        include: includeConfig,
      })
    : await prisma.event.findUnique({
        where: { slug: id },
        include: includeConfig,
      });

  if (!eventRecord) {
    eventRecord = await prisma.event.findFirst({
      orderBy: { id: "asc" },
      include: includeConfig,
    });
  }

  if (!eventRecord) {
    notFound();
  }

  const agendaItems = eventRecord.agenda
    .split(/\n|;/)
    .map((line) => line.trim())
    .filter(Boolean);

  const registeredCount = eventRecord.rsvps.length;
  const remainingSeats = Math.max(0, eventRecord.maxQuota - registeredCount);

  const userExistingRsvp = sessionUser
    ? eventRecord.rsvps.find((r) => r.userId === sessionUser.id)
    : null;


  return (
    <div className="min-h-screen pb-16">
      <PageHeader
        title={eventRecord.title}
        subtitle={`${eventRecord.category} bersama ${eventRecord.speakerName} di ${eventRecord.location}`}
        fallbackHref="/events"
        breadcrumbLabel={eventRecord.title}
        actions={
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3.5 py-2 text-xs font-semibold text-[var(--fg)] transition-colors hover:border-[#92400E] hover:text-[#92400E]"
          >
            <Calendar className="h-3.5 w-3.5" />
            Semua Jadwal Acara
          </Link>
        }
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <main className="space-y-8 lg:col-span-7">
            <section
              aria-label="Informasi Lengkap Acara"
              className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xs sm:p-8"
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="rounded-full bg-[#92400E]/15 px-3 py-1 font-semibold text-[#92400E] dark:text-amber-300">
                  Kategori: {eventRecord.category}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 font-semibold text-emerald-800 dark:text-emerald-300">
                  <Ticket className="h-3.5 w-3.5" />
                  Sisa Kuota: {remainingSeats} dari {eventRecord.maxQuota} Kursi
                </span>
              </div>

              <h2 className="font-heading text-xl font-bold text-[var(--fg)] sm:text-2xl">
                Deskripsi Kegiatan
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--fg)] sm:text-base">
                {eventRecord.description}
              </p>

              <div className="mt-6 grid grid-cols-1 gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)]/80 p-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-[#92400E]" />
                  <div>
                    <p className="text-xs font-semibold tracking-wider uppercase text-[var(--fg-muted)]">
                      Tanggal Pelaksanaan
                    </p>
                    <p className="mt-0.5 text-sm font-bold text-[var(--fg)]">
                      {eventRecord.eventDate}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-5 w-5 shrink-0 text-[#92400E]" />
                  <div>
                    <p className="text-xs font-semibold tracking-wider uppercase text-[var(--fg-muted)]">
                      Waktu Sesi
                    </p>
                    <p className="mt-0.5 text-sm font-bold text-[var(--fg)]">
                      {eventRecord.eventTime}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#D97706]" />
                  <div>
                    <p className="text-xs font-semibold tracking-wider uppercase text-[var(--fg-muted)]">
                      Lokasi & Ruang
                    </p>
                    <p className="mt-0.5 text-sm font-bold text-[var(--fg)]">
                      {eventRecord.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mic className="mt-0.5 h-5 w-5 shrink-0 text-[#D97706]" />
                  <div>
                    <p className="text-xs font-semibold tracking-wider uppercase text-[var(--fg-muted)]">
                      Narasumber Utama
                    </p>
                    <p className="mt-0.5 text-sm font-bold text-[var(--fg)]">
                      {eventRecord.speakerName}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section
              aria-label="Susunan Agenda Kegiatan"
              className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xs sm:p-8"
            >
              <h2 className="font-heading flex items-center gap-2 text-xl font-bold text-[var(--fg)]">
                <ListChecks className="h-5 w-5 text-[#92400E]" />
                Susunan Agenda Kegiatan
              </h2>
              <p className="mt-1 text-xs text-[var(--fg-muted)]">
                Rangkaian sesi diskusi, pemaparan materi, dan tanya jawab
                interaktif peserta.
              </p>

              <ol className="mt-5 space-y-3">
                {agendaItems.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface)]/50 p-3.5"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#92400E] text-xs font-bold text-white">
                      {idx + 1}
                    </span>
                    <p className="pt-0.5 text-sm font-medium text-[var(--fg)]">
                      {item}
                    </p>
                  </li>
                ))}
              </ol>
            </section>

            <section
              aria-label="Daftar Peserta Terdaftar"
              className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xs sm:p-8"
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="font-heading flex items-center gap-2 text-xl font-bold text-[var(--fg)]">
                    <Users className="h-5 w-5 text-[#92400E]" />
                    Peserta Terdaftar ({eventRecord.rsvps.length})
                  </h2>
                  <p className="mt-1 text-xs text-[var(--fg-muted)]">
                    Daftar anggota yang telah memiliki kode tiket RSVP aktif.
                  </p>
                </div>
              </div>

              {eventRecord.rsvps.length === 0 ? (
                <div className="mt-4 rounded-xl border border-dashed border-[var(--border)] p-6 text-center text-sm text-[var(--fg-muted)]">
                  Belum ada peserta terdaftar. Silakan isi formulir RSVP di
                  samping untuk mengamankan kursi pertama.
                </div>
              ) : (
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {eventRecord.rsvps.map((rsvp) => (
                    <div
                      key={rsvp.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)]/50 p-3.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-[var(--fg)]">
                          {rsvp.attendeeName}
                        </p>
                        <p className="truncate text-[11px] text-[var(--fg-muted)]">
                          {rsvp.user?.faculty || "Sivitas Charvlibrary"}
                        </p>
                        {rsvp.notes && (
                          <p className="mt-1 truncate text-[11px] italic text-[var(--fg-muted)]">
                            Catatan: {rsvp.notes}
                          </p>
                        )}
                      </div>
                      <span className="shrink-0 rounded-md border border-[#92400E]/30 bg-[#92400E]/10 px-2 py-1 font-mono text-[11px] font-bold text-[#92400E] dark:text-amber-300">
                        {rsvp.ticketCode}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </main>

        </div>
      </div>
    </div>
  );
}