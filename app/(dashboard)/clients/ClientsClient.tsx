"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Users, Phone, Mail, MoreVertical, Edit, Trash2, Calendar } from "lucide-react";
import Link from "next/link";
import { Avatar, StatusBadge, EmptyState, Button } from "@/components/ui";
import { ClientModal } from "@/components/clients/ClientModal";
import { formatDate } from "@/lib/utils";

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  _count: { appointments: number };
  appointments: { startAt: string; status: string; title: string }[];
}

export function ClientsClient({ clients, initialSearch }: { clients: Client[]; initialSearch: string }) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const [showModal, setShowModal] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const handleSearch = (v: string) => {
    setSearch(v);
    const url = v ? `/clients?search=${encodeURIComponent(v)}` : "/clients";
    router.push(url);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce client ? Tous ses RDV seront supprimés.")) return;
    await fetch(`/api/clients/${id}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-500 text-sm mt-0.5">{clients.length} client{clients.length > 1 ? "s" : ""}</p>
        </div>
        <Button onClick={() => { setEditClient(null); setShowModal(true); }}>
          <Plus size={16} />
          Ajouter un client
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Rechercher un client..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
        />
      </div>

      {/* List */}
      {clients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Aucun client"
          description={search ? "Aucun client ne correspond à votre recherche." : "Ajoutez votre premier client pour commencer."}
          action={!search ? <Button onClick={() => setShowModal(true)}><Plus size={14} />Ajouter un client</Button> : undefined}
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            <div className="col-span-4">Client</div>
            <div className="col-span-3 hidden md:block">Contact</div>
            <div className="col-span-2 hidden lg:block">Séances</div>
            <div className="col-span-2 hidden lg:block">Dernier RDV</div>
            <div className="col-span-1"></div>
          </div>
          {clients.map((client) => (
            <div key={client.id} className="grid grid-cols-12 gap-4 px-5 py-3.5 items-center hover:bg-gray-50 transition group">
              {/* Name */}
              <div className="col-span-4 flex items-center gap-3">
                <Avatar name={client.name} size="sm" />
                <div className="min-w-0">
                  <Link href={`/clients/${client.id}`} className="text-sm font-medium text-gray-900 hover:text-emerald-700 transition truncate block">
                    {client.name}
                  </Link>
                  {client.notes && <p className="text-xs text-gray-400 truncate">{client.notes}</p>}
                </div>
              </div>
              {/* Contact */}
              <div className="col-span-3 hidden md:block space-y-0.5">
                {client.email && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Mail size={11} className="shrink-0" /> <span className="truncate">{client.email}</span>
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Phone size={11} className="shrink-0" /> {client.phone}
                  </div>
                )}
              </div>
              {/* Count */}
              <div className="col-span-2 hidden lg:block">
                <span className="inline-flex items-center gap-1 text-sm text-gray-700">
                  <Calendar size={13} className="text-gray-400" />
                  {client._count.appointments}
                </span>
              </div>
              {/* Last appt */}
              <div className="col-span-2 hidden lg:block">
                {client.appointments[0] ? (
                  <div>
                    <p className="text-xs text-gray-600">{formatDate(client.appointments[0].startAt)}</p>
                    <StatusBadge status={client.appointments[0].status} />
                  </div>
                ) : (
                  <span className="text-xs text-gray-400">—</span>
                )}
              </div>
              {/* Actions */}
              <div className="col-span-1 flex justify-end">
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(menuOpen === client.id ? null : client.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition opacity-0 group-hover:opacity-100"
                  >
                    <MoreVertical size={16} />
                  </button>
                  {menuOpen === client.id && (
                    <div className="absolute right-0 top-8 bg-white border border-gray-100 rounded-lg shadow-lg z-10 w-40 py-1">
                      <Link
                        href={`/clients/${client.id}`}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setMenuOpen(null)}
                      >
                        <Calendar size={14} /> Voir les RDV
                      </Link>
                      <button
                        onClick={() => { setEditClient(client); setShowModal(true); setMenuOpen(null); }}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full"
                      >
                        <Edit size={14} /> Modifier
                      </button>
                      <button
                        onClick={() => { handleDelete(client.id); setMenuOpen(null); }}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                      >
                        <Trash2 size={14} /> Supprimer
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ClientModal
        open={showModal}
        onClose={() => { setShowModal(false); setEditClient(null); }}
        onSuccess={() => { setShowModal(false); setEditClient(null); router.refresh(); }}
        client={editClient}
      />
    </div>
  );
}
