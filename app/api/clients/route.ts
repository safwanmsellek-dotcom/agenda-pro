import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { clients, appointments } from "@/lib/schema";
import { eq, and, ilike, desc, count, sql } from "drizzle-orm";
import { clientSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";

  const rows = await db
    .select({
      id: clients.id, name: clients.name, email: clients.email, phone: clients.phone,
      notes: clients.notes, createdAt: clients.createdAt, updatedAt: clients.updatedAt,
      userId: clients.userId,
    })
    .from(clients)
    .where(
      search
        ? and(eq(clients.userId, session.user.id), ilike(clients.name, `%${search}%`))
        : eq(clients.userId, session.user.id)
    )
    .orderBy(desc(clients.createdAt));

  // Get appointment counts for each client
  const counts = await db
    .select({ clientId: appointments.clientId, count: count() })
    .from(appointments)
    .where(eq(appointments.userId, session.user.id))
    .groupBy(appointments.clientId);

  const countMap = Object.fromEntries(counts.map(c => [c.clientId, c.count]));

  // Get last appointment for each client
  const lastApts = await db
    .select({ clientId: appointments.clientId, startAt: appointments.startAt, status: appointments.status, title: appointments.title })
    .from(appointments)
    .where(eq(appointments.userId, session.user.id))
    .orderBy(desc(appointments.startAt));

  const lastMap: Record<string, any> = {};
  for (const apt of lastApts) {
    if (!lastMap[apt.clientId]) lastMap[apt.clientId] = apt;
  }

  const result = rows.map(c => ({
    ...c,
    _count: { appointments: countMap[c.id] || 0 },
    appointments: lastMap[c.id] ? [lastMap[c.id]] : [],
  }));

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  const parsed = clientSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const [client] = await db.insert(clients).values({ ...parsed.data, userId: session.user.id }).returning();
  return NextResponse.json(client, { status: 201 });
}
