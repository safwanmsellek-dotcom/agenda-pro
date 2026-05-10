import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import { createId } from "@paralleldrive/cuid2";
import { users, clients, appointments } from "../lib/schema";
import { eq } from "drizzle-orm";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

async function main() {
  console.log("🌱 Seeding database...");

  const hashedPassword = await bcrypt.hash("demo1234", 12);

  // Upsert demo user
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, "demo@agendapro.fr")).limit(1);

  let userId: string;
  if (existing.length > 0) {
    userId = existing[0].id;
    await db.update(users).set({ name: "Marie Leclerc", password: hashedPassword, business: "Coach de vie & bien-être" }).where(eq(users.id, userId));
    console.log("✅ User updated");
  } else {
    const [user] = await db.insert(users).values({
      name: "Marie Leclerc",
      email: "demo@agendapro.fr",
      password: hashedPassword,
      business: "Coach de vie & bien-être",
      role: "USER",
    }).returning({ id: users.id });
    userId = user.id;
    console.log("✅ User created");
  }

  // Delete existing data
  await db.delete(appointments).where(eq(appointments.userId, userId));
  await db.delete(clients).where(eq(clients.userId, userId));

  // Create clients
  const clientsData = [
    { name: "Sophie Bernard", email: "sophie.b@email.fr", phone: "06 12 34 56 78", notes: "Cliente VIP, préfère les matins" },
    { name: "Marc Dupont", email: "m.dupont@gmail.com", phone: "06 98 76 54 32", notes: "Suivi mensuel" },
    { name: "Isabelle Roy", email: "i.roy@yahoo.fr", phone: "07 11 22 33 44", notes: "Nouvelle cliente" },
    { name: "Thomas Klein", email: "t.klein@pro.fr", phone: "06 55 44 33 22", notes: "Coaching professionnel" },
    { name: "Léa Martin", email: "lea.m@hotmail.fr", phone: "06 77 88 99 00", notes: "" },
    { name: "Antoine Durand", email: "a.durand@gmail.com", phone: "06 33 44 55 66", notes: "Référé par Sophie" },
  ];

  const createdClients = await db.insert(clients).values(
    clientsData.map(c => ({ ...c, userId }))
  ).returning({ id: clients.id, name: clients.name });

  console.log(`✅ ${createdClients.length} clients created`);

  // Create appointments
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const t = (h: number) => new Date(today.getTime() + h * 3600000);
  const d = (days: number, h: number) => new Date(today.getTime() + days * 86400000 + h * 3600000);

  const [sophie, marc, isabelle, thomas, lea, antoine] = createdClients;

  const aptsData = [
    // Today
    { title: "Consultation initiale", clientId: sophie.id, startAt: t(9), endAt: t(10), status: "CONFIRMED" as const, price: 80 },
    { title: "Suivi mensuel", clientId: marc.id, startAt: t(10.5), endAt: t(11), status: "DONE" as const, price: 60 },
    { title: "Séance coaching", clientId: isabelle.id, startAt: t(14), endAt: t(15), status: "PENDING" as const, price: 90 },
    { title: "Bilan trimestriel", clientId: thomas.id, startAt: t(16), endAt: t(16.75), status: "CONFIRMED" as const, price: 75 },
    { title: "Consultation", clientId: lea.id, startAt: t(17.5), endAt: t(18.5), status: "CANCELLED" as const, price: 80 },
    // Past
    { title: "Séance coaching", clientId: sophie.id, startAt: d(-7, 9), endAt: d(-7, 10), status: "DONE" as const, price: 90 },
    { title: "Bilan", clientId: antoine.id, startAt: d(-3, 11), endAt: d(-3, 12), status: "DONE" as const, price: 80 },
    { title: "Suivi", clientId: marc.id, startAt: d(-14, 10), endAt: d(-14, 10.5), status: "DONE" as const, price: 60 },
    { title: "Coaching", clientId: thomas.id, startAt: d(-5, 14), endAt: d(-5, 15.5), status: "DONE" as const, price: 120 },
    // Future
    { title: "Consultation", clientId: sophie.id, startAt: d(3, 10), endAt: d(3, 11), status: "CONFIRMED" as const, price: 80 },
    { title: "Coaching pro", clientId: thomas.id, startAt: d(5, 14), endAt: d(5, 15.5), status: "CONFIRMED" as const, price: 120 },
    { title: "Suivi", clientId: marc.id, startAt: d(7, 11), endAt: d(7, 11.5), status: "CONFIRMED" as const, price: 60 },
  ];

  await db.insert(appointments).values(aptsData.map(a => ({ ...a, userId })));
  console.log(`✅ ${aptsData.length} appointments created`);

  console.log("\n🎉 Seeding terminé !");
  console.log("📧 Email : demo@agendapro.fr");
  console.log("🔑 Mot de passe : demo1234");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => pool.end());
