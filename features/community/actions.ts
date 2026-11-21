"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function addBlogCommentAction(formData: FormData): Promise<void> {
  const postIdRaw = Number(formData.get("postId") || 0);
  const slug = String(formData.get("slug") || "").trim();
  const content = String(formData.get("content") || "").trim();

  if (!postIdRaw || !content) {
    if (slug) {
      redirect(`/blog/${encodeURIComponent(slug)}?commentError=1#komentar`);
    }
    redirect("/blog");
  }

  const activeUser = await getSessionUser();
  if (!activeUser) {
    redirect(`/login?next=${encodeURIComponent(slug ? `/blog/${slug}` : "/blog")}`);
  }

  await prisma.blogComment.create({
    data: {
      postId: postIdRaw,
      userId: activeUser.id,
      content: content.slice(0, 1000),
    },
  });

  revalidatePath("/blog");
  if (slug) {
    revalidatePath(`/blog/${slug}`);
    redirect(`/blog/${encodeURIComponent(slug)}?commentSuccess=1#komentar`);
  }
}

export async function submitEventRsvpAction(formData: FormData): Promise<void> {
  const eventId = Number(formData.get("eventId") || 0);
  const attendeeNameInput = String(formData.get("attendeeName") || "").trim();
  const attendeeEmailInput = String(formData.get("attendeeEmail") || "").trim();
  const notesInput = String(formData.get("notes") || "").trim();

  if (!eventId) {
    redirect("/events");
  }

  const eventRecord = await prisma.event.findUnique({
    where: { id: eventId },
    include: { rsvps: true },
  });

  if (!eventRecord) {
    redirect("/events");
  }

  const activeUser = await getSessionUser();
  if (!activeUser) {
    redirect(`/login?next=${encodeURIComponent(`/events/${eventId}`)}`);
  }

  const attendeeName = attendeeNameInput || activeUser.name;
  const attendeeEmail = attendeeEmailInput || activeUser.email;
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  const generatedTicketCode = `RSVP-2026-${randomDigits}`;

  const existing = await prisma.eventRsvp.findUnique({
    where: {
      eventId_userId: {
        eventId,
        userId: activeUser.id,
      },
    },
  });

  let finalTicketCode = generatedTicketCode;

  if (existing) {
    const updated = await prisma.eventRsvp.update({
      where: { id: existing.id },
      data: {
        attendeeName,
        attendeeEmail,
        notes: notesInput || existing.notes,
        status: "confirmed",
      },
    });
    finalTicketCode = updated.ticketCode;
  } else {
    const created = await prisma.eventRsvp.create({
      data: {
        eventId,
        userId: activeUser.id,
        attendeeName,
        attendeeEmail,
        notes: notesInput || null,
        status: "confirmed",
        ticketCode: generatedTicketCode,
      },
    });
    finalTicketCode = created.ticketCode;
  }

  revalidatePath("/events");
  revalidatePath(`/events/${eventId}`);
  redirect(
    `/events/${eventId}?ticket=${encodeURIComponent(finalTicketCode)}&rsvp=1#tiket-rsvp`
  );
}

export async function voteFaqHelpfulAction(formData: FormData): Promise<void> {
  const faqId = Number(formData.get("faqId") || 0);
  const vote = String(formData.get("vote") || "yes").toLowerCase();

  if (!faqId) {
    return;
  }

  await prisma.faq.update({
    where: { id: faqId },
    data:
      vote === "no"
        ? { helpfulNo: { increment: 1 } }
        : { helpfulYes: { increment: 1 } },
  });

  revalidatePath("/faq");
}