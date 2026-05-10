import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, verificationTokens } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email requis" }, { status: 400 });

    const [user] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (!user) return NextResponse.json({ success: true });

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000);

    await db.delete(verificationTokens).where(eq(verificationTokens.identifier, email));
    await db.insert(verificationTokens).values({ identifier: email, token, expires });

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    if (process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.startsWith("re_xxx")) {
      await resend.emails.send({
        from: process.env.RESEND_FROM || "Agenda Pro <noreply@agendapro.fr>",
        to: email,
        subject: "Réinitialisation de votre mot de passe — Agenda Pro",
        html: `<div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px;">
          <h2 style="color:#0F6E56;">Réinitialiser votre mot de passe</h2>
          <p>Cliquez sur ce lien pour créer un nouveau mot de passe :</p>
          <a href="${resetUrl}" style="display:inline-block;background:#1D9E75;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:500;margin:16px 0;">
            Réinitialiser mon mot de passe
          </a>
          <p style="color:#6b7280;font-size:13px;">Ce lien expire dans 1 heure.</p>
        </div>`,
      });
    } else {
      console.log(`[Dev] Reset URL for ${email}: ${resetUrl}`);
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
