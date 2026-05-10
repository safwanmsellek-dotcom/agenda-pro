import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, verificationTokens } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  token: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

    const { token, email, password } = parsed.data;

    const [record] = await db.select().from(verificationTokens)
      .where(and(eq(verificationTokens.identifier, email), eq(verificationTokens.token, token))).limit(1);

    if (!record) return NextResponse.json({ error: "Lien invalide ou expiré" }, { status: 400 });
    if (record.expires < new Date()) {
      await db.delete(verificationTokens).where(eq(verificationTokens.token, token));
      return NextResponse.json({ error: "Lien expiré, veuillez recommencer" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 12);
    await db.update(users).set({ password: hashed, updatedAt: new Date() }).where(eq(users.email, email));
    await db.delete(verificationTokens).where(eq(verificationTokens.token, token));

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
