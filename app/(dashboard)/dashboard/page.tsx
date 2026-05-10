import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { clients, appointments } from "@/lib/schema";
import { eq, and, gte, lte, lt, count, sum, desc } from "drizzle-orm";
import { DashboardClient } from "./DashboardClient";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id!;
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(today.getTime() + 86400000);

  const [totalRow] = await db.select({ count: count() }).from(clients).where(eq(clients.userId, userId));
  const [weekRow] = await db.select({ count: count() }).from(appointments)
    .where(and(eq(appointments.userId, userId), gte(appointments.startAt, weekStart), lte(appointments.startAt, weekEnd)));
  const [revRow] = await db.select({ total: sum(appointments.price) }).from(appointments)
    .where(and(eq(appointments.userId, userId), gte(appointments.startAt, monthStart), lte(appointments.startAt, monthEnd)));

  const todayApts = await db
    .select({ id: appointments.id, title: appointments.title, startAt: appointments.startAt,
      endAt: appointments.endAt, status: appointments.status,
      client: { name: clients.name } })
    .from(appointments)
    .leftJoin(clients, eq(appointments.clientId, clients.id))
    .where(and(eq(appointments.userId, userId), gte(appointments.startAt, today), lt(appointments.startAt, todayEnd)))
    .orderBy(appointments.startAt);

  const recentClients = await db
    .select({ id: clients.id, name: clients.name, email: clients.email })
    .from(clients).where(eq(clients.userId, userId)).orderBy(desc(clients.updatedAt)).limit(5);

  const aptsForRate = await db.select({ status: appointments.status, c: count() }).from(appointments)
    .where(and(eq(appointments.userId, userId), gte(appointments.startAt, monthStart), lte(appointments.startAt, monthEnd)))
    .groupBy(appointments.status);

  const total = aptsForRate.reduce((a, b) => a + b.c, 0);
  const done = aptsForRate.find(r => r.status === "DONE")?.c || 0;
  const confirmed = aptsForRate.find(r => r.status === "CONFIRMED")?.c || 0;
  const rate = total > 0 ? Math.round(((done + confirmed) / total) * 100) : 100;

  // Count appointments per recent client
  const aptCounts = await db.select({ clientId: appointments.clientId, c: count() })
    .from(appointments).where(eq(appointments.userId, userId)).groupBy(appointments.clientId);
  const countMap = Object.fromEntries(aptCounts.map(a => [a.clientId, a.c]));

  return (
    <DashboardClient
      user={session!.user!}
      stats={{ totalClients: totalRow.count, weekCount: weekRow.count, monthRevenue: Number(revRow.total) || 0, presenceRate: rate, todayCount: todayApts.length }}
      todayAppointments={JSON.parse(JSON.stringify(todayApts))}
      recentClients={JSON.parse(JSON.stringify(recentClients.map(c => ({ ...c, _count: { appointments: countMap[c.id] || 0 } }))))}
    />
  );
}
