import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { appointments, clients } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { appointmentSchema } from "@/lib/validations";
import { sendCancellationEmail } from "@/lib/email";
import { formatDate, formatTime } from "@/lib/utils";

type Params = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;

  const [apt] = await db
    .select({ id: appointments.id, title: appointments.title, startAt: appointments.startAt,
      endAt: appointments.endAt, status: appointments.status, notes: appointments.notes,
      price: appointments.price, clientId: appointments.clientId,
      client: { id: clients.id, name: clients.name, email: clients.email, phone: clients.phone } })
    .from(appointments)
    .leftJoin(clients, eq(appointments.clientId, clients.id))
    .where(and(eq(appointments.id, id), eq(appointments.userId, session.user.id)))
    .limit(1);

  if (!apt) return NextResponse.json({ error: "RDV introuvable" }, { status: 404 });
  return NextResponse.json(apt);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;

  const [existing] = await db
    .select({ id: appointments.id, status: appointments.status,
      client: { email: clients.email, name: clients.name } })
    .from(appointments)
    .leftJoin(clients, eq(appointments.clientId, clients.id))
    .where(and(eq(appointments.id, id), eq(appointments.userId, session.user.id)))
    .limit(1);
  if (!existing) return NextResponse.json({ error: "RDV introuvable" }, { status: 404 });

  const body = await req.json();
  const parsed = appointmentSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const [updated] = await db.update(appointments).set({
    title: parsed.data.title, startAt: new Date(parsed.data.startAt),
    endAt: new Date(parsed.data.endAt), status: parsed.data.status,
    notes: parsed.data.notes, price: parsed.data.price,
    clientId: parsed.data.clientId, updatedAt: new Date(),
  }).where(eq(appointments.id, id)).returning();

  if (existing.status !== "CANCELLED" && updated.status === "CANCELLED" && existing.client?.email) {
    await sendCancellationEmail({
      to: existing.client.email, clientName: existing.client.name || "",
      date: formatDate(updated.startAt), time: formatTime(updated.startAt), title: updated.title,
    });
  }
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;

  const [existing] = await db.select({ id: appointments.id }).from(appointments)
    .where(and(eq(appointments.id, id), eq(appointments.userId, session.user.id))).limit(1);
  if (!existing) return NextResponse.json({ error: "RDV introuvable" }, { status: 404 });

  await db.delete(appointments).where(eq(appointments.id, id));
  return NextResponse.json({ success: true });
}
