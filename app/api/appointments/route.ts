import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { appointments, clients, users } from "@/lib/schema";
import { eq, and, gte, lte, asc } from "drizzle-orm";
import { appointmentSchema } from "@/lib/validations";
import { sendAppointmentConfirmation } from "@/lib/email";
import { formatDate, formatTime, getDuration } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const clientId = searchParams.get("clientId");

  let conditions = [eq(appointments.userId, session.user.id)];
  if (start && end) {
    conditions.push(gte(appointments.startAt, new Date(start)));
    conditions.push(lte(appointments.startAt, new Date(end)));
  }
  if (clientId) conditions.push(eq(appointments.clientId, clientId));

  const rows = await db
    .select({
      id: appointments.id, title: appointments.title, startAt: appointments.startAt,
      endAt: appointments.endAt, status: appointments.status, notes: appointments.notes,
      price: appointments.price, clientId: appointments.clientId, userId: appointments.userId,
      client: { id: clients.id, name: clients.name, email: clients.email, phone: clients.phone },
    })
    .from(appointments)
    .leftJoin(clients, eq(appointments.clientId, clients.id))
    .where(and(...conditions))
    .orderBy(asc(appointments.startAt));

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  const parsed = appointmentSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const [client] = await db.select().from(clients)
    .where(and(eq(clients.id, parsed.data.clientId), eq(clients.userId, session.user.id))).limit(1);
  if (!client) return NextResponse.json({ error: "Client introuvable" }, { status: 404 });

  const [apt] = await db.insert(appointments).values({
    title: parsed.data.title,
    startAt: new Date(parsed.data.startAt),
    endAt: new Date(parsed.data.endAt),
    status: parsed.data.status,
    notes: parsed.data.notes,
    price: parsed.data.price,
    clientId: parsed.data.clientId,
    userId: session.user.id,
  }).returning();

  if (client.email && apt.status === "CONFIRMED") {
    const [user] = await db.select({ name: users.name }).from(users).where(eq(users.id, session.user.id)).limit(1);
    await sendAppointmentConfirmation({
      to: client.email, clientName: client.name,
      professionalName: user?.name || "Votre prestataire",
      date: formatDate(apt.startAt), time: formatTime(apt.startAt),
      duration: getDuration(apt.startAt, apt.endAt), title: apt.title,
    });
  }

  return NextResponse.json({ ...apt, client }, { status: 201 });
}
