import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM || "Agenda Pro <noreply@agendapro.fr>";

export async function sendAppointmentConfirmation(opts: {
  to: string;
  clientName: string;
  professionalName: string;
  date: string;
  time: string;
  duration: string;
  title: string;
}) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.startsWith("re_xxx")) {
    console.log("[Email] RESEND_API_KEY not set, skipping confirmation email");
    return;
  }
  try {
    await resend.emails.send({
      from: FROM,
      to: opts.to,
      subject: `✅ RDV confirmé — ${opts.title} le ${opts.date}`,
      html: `
        <div style="font-family:sans-serif; max-width:520px; margin:auto; background:#f9fafb; padding:32px; border-radius:12px;">
          <h2 style="color:#0F6E56; margin-bottom:8px;">Rendez-vous confirmé !</h2>
          <p style="color:#374151;">Bonjour <strong>${opts.clientName}</strong>,</p>
          <p style="color:#374151;">Votre rendez-vous <strong>${opts.title}</strong> avec <strong>${opts.professionalName}</strong> est confirmé.</p>
          <div style="background:#fff; border-radius:8px; padding:20px; margin:20px 0; border:1px solid #e5e7eb;">
            <p style="margin:0 0 8px; color:#6b7280; font-size:14px;">📅 Date</p>
            <p style="margin:0 0 16px; font-weight:600; font-size:16px;">${opts.date}</p>
            <p style="margin:0 0 8px; color:#6b7280; font-size:14px;">🕐 Heure</p>
            <p style="margin:0 0 16px; font-weight:600; font-size:16px;">${opts.time}</p>
            <p style="margin:0 0 8px; color:#6b7280; font-size:14px;">⏱ Durée</p>
            <p style="margin:0; font-weight:600; font-size:16px;">${opts.duration}</p>
          </div>
          <p style="color:#6b7280; font-size:13px;">En cas d'empêchement, merci de nous prévenir le plus tôt possible.</p>
          <p style="color:#6b7280; font-size:13px; margin-top:24px;">L'équipe Agenda Pro</p>
        </div>
      `,
    });
  } catch (e) {
    console.error("[Email] Failed to send confirmation:", e);
  }
}

export async function sendAppointmentReminder(opts: {
  to: string;
  clientName: string;
  professionalName: string;
  date: string;
  time: string;
  title: string;
}) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.startsWith("re_xxx")) {
    console.log("[Email] RESEND_API_KEY not set, skipping reminder email");
    return;
  }
  try {
    await resend.emails.send({
      from: FROM,
      to: opts.to,
      subject: `⏰ Rappel — ${opts.title} demain à ${opts.time}`,
      html: `
        <div style="font-family:sans-serif; max-width:520px; margin:auto; background:#f9fafb; padding:32px; border-radius:12px;">
          <h2 style="color:#0F6E56; margin-bottom:8px;">Rappel de rendez-vous</h2>
          <p style="color:#374151;">Bonjour <strong>${opts.clientName}</strong>,</p>
          <p style="color:#374151;">Rappel : vous avez un rendez-vous <strong>${opts.title}</strong> demain avec <strong>${opts.professionalName}</strong>.</p>
          <div style="background:#fff; border-radius:8px; padding:20px; margin:20px 0; border:1px solid #e5e7eb;">
            <p style="margin:0 0 8px; color:#6b7280; font-size:14px;">📅 Date</p>
            <p style="margin:0 0 16px; font-weight:600;">${opts.date}</p>
            <p style="margin:0 0 8px; color:#6b7280; font-size:14px;">🕐 Heure</p>
            <p style="margin:0; font-weight:600;">${opts.time}</p>
          </div>
          <p style="color:#6b7280; font-size:13px;">L'équipe Agenda Pro</p>
        </div>
      `,
    });
  } catch (e) {
    console.error("[Email] Failed to send reminder:", e);
  }
}

export async function sendCancellationEmail(opts: {
  to: string;
  clientName: string;
  date: string;
  time: string;
  title: string;
}) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.startsWith("re_xxx")) return;
  try {
    await resend.emails.send({
      from: FROM,
      to: opts.to,
      subject: `❌ RDV annulé — ${opts.title} le ${opts.date}`,
      html: `
        <div style="font-family:sans-serif; max-width:520px; margin:auto; background:#f9fafb; padding:32px; border-radius:12px;">
          <h2 style="color:#A32D2D; margin-bottom:8px;">Rendez-vous annulé</h2>
          <p style="color:#374151;">Bonjour <strong>${opts.clientName}</strong>,</p>
          <p style="color:#374151;">Votre rendez-vous <strong>${opts.title}</strong> du <strong>${opts.date}</strong> à <strong>${opts.time}</strong> a été annulé.</p>
          <p style="color:#6b7280; font-size:13px;">N'hésitez pas à reprendre rendez-vous.</p>
          <p style="color:#6b7280; font-size:13px; margin-top:24px;">L'équipe Agenda Pro</p>
        </div>
      `,
    });
  } catch (e) {
    console.error("[Email] Failed to send cancellation:", e);
  }
}
