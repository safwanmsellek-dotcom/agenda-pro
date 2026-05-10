"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Modal, Button, Input, Textarea, Select } from "@/components/ui";
import { format } from "date-fns";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  appointment?: any;
  defaultClientId?: string;
  defaultDate?: Date;
}

export function AppointmentModal({ open, onClose, onSuccess, appointment, defaultClientId, defaultDate }: Props) {
  const isEdit = !!appointment;
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, reset, formState: { errors } } = useForm<any>();

  useEffect(() => {
    if (open) {
      fetch("/api/clients").then(r => r.json()).then(setClients).catch(() => {});
      const defaultStart = defaultDate || new Date();
      // Round to next hour
      defaultStart.setMinutes(0, 0, 0);
      const defaultEnd = new Date(defaultStart.getTime() + 3600000);
      reset({
        title: appointment?.title || "",
        clientId: appointment?.clientId || defaultClientId || "",
        startAt: appointment?.startAt
          ? format(new Date(appointment.startAt), "yyyy-MM-dd'T'HH:mm")
          : format(defaultStart, "yyyy-MM-dd'T'HH:mm"),
        endAt: appointment?.endAt
          ? format(new Date(appointment.endAt), "yyyy-MM-dd'T'HH:mm")
          : format(defaultEnd, "yyyy-MM-dd'T'HH:mm"),
        status: appointment?.status || "CONFIRMED",
        notes: appointment?.notes || "",
        price: appointment?.price ?? "",
      });
      setError("");
    }
  }, [open, appointment, defaultClientId, defaultDate, reset]);

  const onSubmit = async (data: any) => {
    setSubmitting(true);
    setError("");
    try {
      const url = isEdit ? `/api/appointments/${appointment.id}` : "/api/appointments";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, price: data.price ? parseFloat(data.price) : undefined }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || "Erreur lors de la sauvegarde"); return; }
      onSuccess();
    } catch {
      setError("Erreur réseau");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Modifier le RDV" : "Nouveau rendez-vous"}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
        )}
        <Input
          {...register("title", { required: "Le titre est requis" })}
          label="Titre / Type de séance *"
          placeholder="Consultation, Suivi, Coaching..."
          error={errors.title?.message as string}
        />
        <Select
          {...register("clientId", { required: "Sélectionne un client" })}
          label="Client *"
          error={errors.clientId?.message as string}
        >
          <option value="">Sélectionner un client...</option>
          {clients.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>
        <div className="grid grid-cols-2 gap-4">
          <Input
            {...register("startAt", { required: "Date de début requise" })}
            type="datetime-local"
            label="Début *"
            error={errors.startAt?.message as string}
          />
          <Input
            {...register("endAt", { required: "Date de fin requise" })}
            type="datetime-local"
            label="Fin *"
            error={errors.endAt?.message as string}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select {...register("status")} label="Statut">
            <option value="CONFIRMED">Confirmé</option>
            <option value="PENDING">En attente</option>
            <option value="CANCELLED">Annulé</option>
            <option value="DONE">Terminé</option>
          </Select>
          <Input
            {...register("price")}
            type="number"
            step="0.01"
            min="0"
            label="Tarif (€)"
            placeholder="80"
          />
        </div>
        <Textarea
          {...register("notes")}
          label="Notes"
          placeholder="Informations sur ce rendez-vous..."
        />
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Annuler</Button>
          <Button type="submit" loading={submitting}>
            {isEdit ? "Enregistrer" : "Créer le RDV"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
