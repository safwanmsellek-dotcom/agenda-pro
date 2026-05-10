import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { clients, appointments } from "@/lib/schema";
import { eq, and, desc } from "drizzle-orm";
import { clientSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;

  const [client] = await db.select().from(clients)
    .where(and(eq(clients.id, id), eq(clients.userId, session.user.id))).limit(1);
  if (!client) return NextResponse.json({ error: "Client introuvable" }, { status: 404 });

  const apts = await db.select({
    id: appointments.id, title: appointments.title, startAt: appointments.startAt,
    endAt: appointments.endAt, status: appointments.status, price: appointments.price, notes: appointments.notes,
  }).from(appointments)
    .where(and(eq(appointments.clientId, id), eq(appointments.userId, session.user.id)))
    .orderBy(desc(appointments.startAt));

  return NextResponse.json({ ...client, appointments: apts, _count: { appointments: apts.length } });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;

  const body = await req.json();
  const parsed = clientSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const [existing] = await db.select({ id: clients.id }).from(clients)
    .where(and(eq(clients.id, id), eq(clients.userId, session.user.id))).limit(1);
  if (!existing) return NextResponse.json({ error: "Client introuvable" }, { status: 404 });

  const [updated] = await db.update(clients).set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(clients.id, id)).returning();
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;

  const [existing] = await db.select({ id: clients.id }).from(clients)
    .where(and(eq(clients.id, id), eq(clients.userId, session.user.id))).limit(1);
  if (!existing) return NextResponse.json({ error: "Client introuvable" }, { status: 404 });

  await db.delete(clients).where(eq(clients.id, id));
  return NextResponse.json({ success: true });
}
