"use client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientSchema, type ClientInput } from "@/lib/validations";
import { Modal, Button, Input, Textarea } from "@/components/ui";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  client?: { id: string; name: string; email?: string | null; phone?: string | null; notes?: string | null } | null;
}

export function ClientModal({ open, onClose, onSuccess, client }: Props) {
  const isEdit = !!client;
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ClientInput>({
    resolver: zodResolver(clientSchema),
  });

  useEffect(() => {
    if (open) {
      reset({
        name: client?.name || "",
        email: client?.email || "",
        phone: client?.phone || "",
        notes: client?.notes || "",
      });
    }
  }, [open, client, reset]);

  const onSubmit = async (data: ClientInput) => {
    const url = isEdit ? `/api/clients/${client!.id}` : "/api/clients";
    const method = isEdit ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) onSuccess();
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Modifier le client" : "Ajouter un client"}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          {...register("name")}
          label="Nom complet *"
          placeholder="Sophie Bernard"
          error={errors.name?.message}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            {...register("email")}
            type="email"
            label="Email"
            placeholder="sophie@email.fr"
            error={errors.email?.message}
          />
          <Input
            {...register("phone")}
            label="Téléphone"
            placeholder="06 12 34 56 78"
          />
        </div>
        <Textarea
          {...register("notes")}
          label="Notes"
          placeholder="Informations utiles sur ce client..."
        />
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Annuler</Button>
          <Button type="submit" loading={isSubmitting}>
            {isEdit ? "Enregistrer" : "Ajouter"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
