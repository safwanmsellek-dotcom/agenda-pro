"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Phone, FileText, Edit, Trash2, Plus, Calendar } from "lucide-react";
import Link from "next/link";
import { Avatar, StatusBadge, Button, Card } from "@/components/ui";
import { ClientModal } from "@/components/clients/ClientModal";
import { AppointmentModal } from "@/components/appointments/AppointmentModal";
import { formatDateTime, formatPrice, getDuration } from "@/lib/utils";

export function ClientDetailClient({ client }: { client: any }) {
  const router = useRouter();
  const [showEdit, setShowEdit] = useState(false);
  const [showNewApt, setShowNewApt] = useState(false);

  const totalRevenue = client.appointments
    .filter((a: any) => ["CONFIRMED", "DONE"].includes(a.status) && a.price)
    .reduce((sum: number, a: any) => sum + a.price, 0);

  const handleDelete = async () => {
    if (!confirm("Supprimer ce client ? Tous ses RDV seront supprimés.")) return;
    await fetch(`/api/clients/${client.id}`, { method: "DELETE" });
    router.push("/clients");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back */}
      <Link href="/clients" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition">
        <ArrowLeft size={16} /> Retour aux clients
      </Link>

      {/* Header */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar name={client.name} size="lg" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">{client.name}</h1>
              <div className="flex flex-wrap gap-3 mt-1.5">
                {client.email && (
                  <a href={`mailto:${client.email}`} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-emerald-700 transition">
                    <Mail size={14} /> {client.email}
                  </a>
                )}
                {client.phone && (
                  <a href={`tel:${client.phone}`} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-emerald-700 transition">
                    <Phone size={14} /> {client.phone}
                  </a>
                )}
              </div>
              {client.notes && (
                <p className="text-sm text-gray-500 mt-2 flex items-start gap-1.5">
                  <FileText size={14} className="mt-0.5 shrink-0" /> {client.notes}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setShowEdit(true)}>
              <Edit size={14} /> Modifier
            </Button>
            <Button variant="danger" size="sm" onClick={handleDelete}>
              <Trash2 size={14} /> Supprimer
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-gray-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{client._count.appointments}</p>
            <p className="text-xs text-gray-500 mt-0.5">Séances</p>
          </div>
          <div className="text-center border-x border-gray-100">
            <p className="text-2xl font-bold text-gray-900">{formatPrice(totalRevenue)}</p>
            <p className="text-xs text-gray-500 mt-0.5">Revenus générés</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {client.appointments.filter((a: any) => a.status === "DONE").length}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Séances terminées</p>
          </div>
        </div>
      </Card>

      {/* Appointments */}
      <Card>
        <div className="p-5 border-b border-gray-50 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Calendar size={16} className="text-emerald-600" />
            Historique des rendez-vous
          </h2>
          <Button size="sm" onClick={() => setShowNewApt(true)}>
            <Plus size={14} /> Nouveau RDV
          </Button>
        </div>

        {client.appointments.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">Aucun rendez-vous pour ce client</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {client.appointments.map((apt: any) => (
              <div key={apt.id} className="px-5 py-3.5 flex items-center gap-4">
                <div className="min-w-[140px]">
                  <p className="text-sm font-medium text-gray-900">{formatDateTime(apt.startAt)}</p>
                  <p className="text-xs text-gray-400">{getDuration(apt.startAt, apt.endAt)}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 truncate">{apt.title}</p>
                  {apt.notes && <p className="text-xs text-gray-400 truncate">{apt.notes}</p>}
                </div>
                {apt.price && (
                  <p className="text-sm font-medium text-gray-900 hidden sm:block">{formatPrice(apt.price)}</p>
                )}
                <StatusBadge status={apt.status} />
              </div>
            ))}
          </div>
        )}
      </Card>

      <ClientModal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        onSuccess={() => { setShowEdit(false); router.refresh(); }}
        client={client}
      />
      <AppointmentModal
        open={showNewApt}
        onClose={() => setShowNewApt(false)}
        onSuccess={() => { setShowNewApt(false); router.refresh(); }}
        defaultClientId={client.id}
      />
    </div>
  );
}
