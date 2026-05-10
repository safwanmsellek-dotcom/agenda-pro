"use client";
import { useEffect, useState } from "react";
import { Users, Calendar, TrendingUp, CheckCircle, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";
import { StatCard, StatusBadge, Card, Avatar } from "@/components/ui";
import { formatTime, formatPrice } from "@/lib/utils";
import { AppointmentModal } from "@/components/appointments/AppointmentModal";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { useRouter } from "next/navigation";

interface Props {
  user: { name?: string | null; email?: string | null };
  stats: { totalClients: number; weekCount: number; monthRevenue: number; presenceRate: number; todayCount: number };
  todayAppointments: any[];
  recentClients: any[];
}

export function DashboardClient({ user, stats, todayAppointments, recentClients }: Props) {
  const [showNewApt, setShowNewApt] = useState(false);
  const [chartData, setChartData] = useState([]);
  const router = useRouter();
  const firstName = user.name?.split(" ")[0] || "vous";

  useEffect(() => {
    fetch("/api/stats/chart")
      .then(r => r.json())
      .then(setChartData)
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bonjour, {firstName} 👋</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {stats.todayCount > 0
              ? `${stats.todayCount} rendez-vous aujourd'hui`
              : "Aucun rendez-vous aujourd'hui"}
          </p>
        </div>
        <button
          onClick={() => setShowNewApt(true)}
          className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition shadow-sm"
        >
          <Plus size={16} />
          Nouveau RDV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Clients" value={stats.totalClients} icon={Users} color="emerald" />
        <StatCard label="RDV cette semaine" value={stats.weekCount} icon={Calendar} color="blue" />
        <StatCard label="Revenus du mois" value={formatPrice(stats.monthRevenue)} icon={TrendingUp} color="amber" />
        <StatCard label="Taux de présence" value={`${stats.presenceRate}%`} icon={CheckCircle} color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's appointments */}
        <Card>
          <div className="p-5 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Rendez-vous du jour</h2>
            <Link href="/calendar" className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              Calendrier <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {todayAppointments.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-400 text-sm mb-3">Aucun RDV aujourd'hui</p>
                <button
                  onClick={() => setShowNewApt(true)}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  + Planifier un RDV
                </button>
              </div>
            ) : (
              todayAppointments.map((apt) => (
                <div key={apt.id} className="px-5 py-3 flex items-center gap-3">
                  <div className="text-right min-w-[44px]">
                    <p className="text-xs font-semibold text-gray-900">{formatTime(apt.startAt)}</p>
                    <p className="text-xs text-gray-400">{formatTime(apt.endAt)}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{apt.client.name}</p>
                    <p className="text-xs text-gray-400 truncate">{apt.title}</p>
                  </div>
                  <StatusBadge status={apt.status} />
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Revenue chart */}
        <Card>
          <div className="p-5 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Revenus — 7 derniers jours</h2>
            <Link href="/payments" className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              Voir tout <ArrowRight size={12} />
            </Link>
          </div>
          <div className="p-5">
            <RevenueChart data={chartData} />
          </div>
        </Card>
      </div>

      {/* Recent clients */}
      <Card>
        <div className="p-5 border-b border-gray-50 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Clients récents</h2>
          <Link href="/clients" className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            Voir tous <ArrowRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-x-0 sm:divide-x divide-y sm:divide-y-0 divide-gray-50">
          {recentClients.map((client) => (
            <Link
              key={client.id}
              href={`/clients/${client.id}`}
              className="px-5 py-4 flex items-center gap-3 hover:bg-gray-50 transition group"
            >
              <Avatar name={client.name} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate group-hover:text-emerald-700 transition">
                  {client.name}
                </p>
                <p className="text-xs text-gray-400">
                  {client._count.appointments} séance{client._count.appointments !== 1 ? "s" : ""}
                </p>
              </div>
              <ArrowRight size={14} className="text-gray-300 group-hover:text-emerald-500 transition shrink-0" />
            </Link>
          ))}
        </div>
      </Card>

      <AppointmentModal
        open={showNewApt}
        onClose={() => setShowNewApt(false)}
        onSuccess={() => { setShowNewApt(false); router.refresh(); }}
      />
    </div>
  );
}
