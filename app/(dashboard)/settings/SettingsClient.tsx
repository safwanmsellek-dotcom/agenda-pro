"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Button, Input } from "@/components/ui";
import { User, Lock, Bell, CheckCircle } from "lucide-react";

interface UserData {
  id: string;
  name: string;
  email: string;
  business: string | null;
  phone: string | null;
}

export function SettingsClient({ user }: { user: UserData }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: user.name || "",
    email: user.email || "",
    business: user.business || "",
    phone: user.phone || "",
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-500 text-sm mt-0.5">Gérez votre compte</p>
      </div>

      <Card>
        <div className="p-5 border-b border-gray-50 flex items-center gap-2">
          <User size={16} className="text-emerald-600" />
          <h2 className="font-semibold text-gray-900">Profil</h2>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nom complet"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Activité"
              placeholder="Coach, coiffeur..."
              value={form.business}
              onChange={e => setForm(f => ({ ...f, business: e.target.value }))}
            />
            <Input
              label="Téléphone"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSave} loading={saving}>
              {saved ? <><CheckCircle size={14} /> Enregistré !</> : "Enregistrer"}
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-5 border-b border-gray-50 flex items-center gap-2">
          <Bell size={16} className="text-emerald-600" />
          <h2 className="font-semibold text-gray-900">Notifications email</h2>
        </div>
        <div className="p-5 space-y-4">
          {[
            { label: "Confirmation de RDV", desc: "Email envoyé automatiquement au client à la création d'un RDV" },
            { label: "Rappel 24h avant", desc: "Rappel automatique envoyé la veille du RDV" },
            { label: "Email d'annulation", desc: "Notification au client en cas d'annulation" },
          ].map(({ label, desc }) => (
            <label key={label} className="flex items-start gap-3 cursor-pointer group">
              <input type="checkbox" defaultChecked className="mt-0.5 accent-emerald-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">{label}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </label>
          ))}
          <p className="text-xs text-gray-400 pt-2 border-t border-gray-50">
            Les emails sont envoyés via Resend. Configurez votre clé API dans le fichier .env.local
          </p>
        </div>
      </Card>

      <Card>
        <div className="p-5 border-b border-gray-50 flex items-center gap-2">
          <Lock size={16} className="text-emerald-600" />
          <h2 className="font-semibold text-gray-900">Sécurité</h2>
        </div>
        <div className="p-5 space-y-4">
          <Input label="Nouveau mot de passe" type="password" placeholder="••••••••" />
          <Input label="Confirmer le mot de passe" type="password" placeholder="••••••••" />
          <div className="flex justify-end">
            <Button variant="secondary">Changer le mot de passe</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
