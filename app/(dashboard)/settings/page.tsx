import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { SettingsClient } from "./SettingsClient";

export default async function SettingsPage() {
  const session = await auth();
  const [user] = await db
    .select({ id: users.id, name: users.name, email: users.email, business: users.business, phone: users.phone })
    .from(users).where(eq(users.id, session!.user!.id!)).limit(1);
  return <SettingsClient user={JSON.parse(JSON.stringify(user))} />;
}
