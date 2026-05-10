import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { clients, appointments } from "@/lib/schema";
import { eq, and, ilike, desc, count } from "drizzle-orm";
import { ClientsClient } from "./ClientsClient";

export default async function ClientsPage({ searchParams }: { searchParams: { search?: string } }) {
  const session = await auth();
  const userId = session!.user!.id!;
  const search = searchParams.search || "";

  const rows = await db.select().from(clients)
    .where(search
      ? and(eq(clients.userId, userId), ilike(clients.name, `%${search}%`))
      : eq(clients.userId, userId))
    .orderBy(desc(clients.createdAt));

  const aptCounts = await db.select({ clientId: appointments.clientId, c: count() })
    .from(appointments).where(eq(appointments.userId, userId)).groupBy(appointments.clientId);
  const countMap = Object.fromEntries(aptCounts.map(a => [a.clientId, a.c]));

  const lastApts = await db
    .select({ clientId: appointments.clientId, startAt: appointments.startAt, status: appointments.status, title: appointments.title })
    .from(appointments).where(eq(appointments.userId, userId)).orderBy(desc(appointments.startAt));
  const lastMap: Record<string, any> = {};
  for (const apt of lastApts) { if (!lastMap[apt.clientId]) lastMap[apt.clientId] = apt; }

  const result = rows.map(c => ({
    ...c,
    _count: { appointments: countMap[c.id] || 0 },
    appointments: lastMap[c.id] ? [lastMap[c.id]] : [],
  }));

  return <ClientsClient clients={JSON.parse(JSON.stringify(result))} initialSearch={search} />;
}
