import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { appointments, clients } from "@/lib/schema";
import { eq, and, gte, lte, lt, count, sum, desc } from "drizzle-orm";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const userId = session.user.id;
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(today.getTime() + 86400000);

  const [totalClients] = await db.select({ count: count() }).from(clients).where(eq(clients.userId, userId));

  const [weekCount] = await db.select({ count: count() }).from(appointments)
    .where(and(eq(appointments.userId, userId), gte(appointments.startAt, weekStart), lte(appointments.startAt, weekEnd)));

  const [monthRev] = await db.select({ total: sum(appointments.price) }).from(appointments)
    .where(and(eq(appointments.userId, userId), gte(appointments.startAt, monthStart), lte(appointments.startAt, monthEnd)));

  const todayApts = await db
    .select({ id: appointments.id, title: appointments.title, startAt: appointments.startAt,
      endAt: appointments.endAt, status: appointments.status, price: appointments.price,
      client: { name: clients.name } })
    .from(appointments)
    .leftJoin(clients, eq(appointments.clientId, clients.id))
    .where(and(eq(appointments.userId, userId), gte(appointments.startAt, today), lt(appointments.startAt, todayEnd)))
    .orderBy(appointments.startAt);

  const recentClients = await db
    .select({ id: clients.id, name: clients.name, email: clients.email, phone: clients.phone, createdAt: clients.createdAt })
    .from(clients)
    .where(eq(clients.userId, userId))
    .orderBy(desc(clients.updatedAt))
    .limit(5);

  const aptsForRate = await db.select({ status: appointments.status, count: count() }).from(appointments)
    .where(and(eq(appointments.userId, userId), gte(appointments.startAt, monthStart), lte(appointments.startAt, monthEnd)))
    .groupBy(appointments.status);

  const total = aptsForRate.reduce((a, b) => a + b.count, 0);
  const done = aptsForRate.find(r => r.status === "DONE")?.count || 0;
  const confirmed = aptsForRate.find(r => r.status === "CONFIRMED")?.count || 0;
  const rate = total > 0 ? Math.round(((done + confirmed) / total) * 100) : 100;

  return NextResponse.json({
    totalClients: totalClients.count,
    weekCount: weekCount.count,
    monthRevenue: Number(monthRev.total) || 0,
    presenceRate: rate,
    todayAppointments: todayApts,
    recentClients,
  });
}
