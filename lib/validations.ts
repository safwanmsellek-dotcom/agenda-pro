import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  business: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export const clientSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

export const appointmentSchema = z.object({
  title: z.string().min(2, "Le titre est requis"),
  clientId: z.string().min(1, "Sélectionne un client"),
  startAt: z.string().min(1, "La date de début est requise"),
  endAt: z.string().min(1, "La date de fin est requise"),
  status: z.enum(["CONFIRMED", "PENDING", "CANCELLED", "DONE"]).default("CONFIRMED"),
  notes: z.string().optional(),
  price: z.coerce.number().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ClientInput = z.infer<typeof clientSchema>;
export type AppointmentInput = z.infer<typeof appointmentSchema>;
