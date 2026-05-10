import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { appointments } from "@/lib/schema";
import { eq, and, gte, lte, sum } from "drizzle-orm";
import { subDays, startOfDay, endOfDay, format } from "date-fns";
import { fr } from "date-fns/locale";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const userId = session.user.id;
  const days = [];

  for (let i = 6; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const start = startOfDay(date);
    const end = endOfDay(date);

    const [row] = await db.select({ total: sum(appointments.price) })
      .from(appointments)
      .where(and(eq(appointments.userId, userId), gte(appointments.startAt, start), lte(appointments.startAt, end)));

    days.push({
      label: format(date, "EEE", { locale: fr }),
      date: format(date, "yyyy-MM-dd"),
      revenue: Number(row?.total) || 0,
    });
  }

  return NextResponse.json(days);
}
