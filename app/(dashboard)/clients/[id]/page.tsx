import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { clients, appointments } from "@/lib/schema";
import { eq, and, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ClientDetailClient } from "./ClientDetailClient";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const userId = session!.user!.id!;
  const { id } = await params;

  const [client] = await db.select().from(clients)
    .where(and(eq(clients.id, id), eq(clients.userId, userId))).limit(1);
  if (!client) notFound();

  const apts = await db
    .select({ id: appointments.id, title: appointments.title, startAt: appointments.startAt,
      endAt: appointments.endAt, status: appointments.status, price: appointments.price, notes: appointments.notes })
    .from(appointments)
    .where(and(eq(appointments.clientId, id), eq(appointments.userId, userId)))
    .orderBy(desc(appointments.startAt));

  return <ClientDetailClient client={JSON.parse(JSON.stringify({ ...client, appointments: apts, _count: { appointments: apts.length } }))} />;
}
