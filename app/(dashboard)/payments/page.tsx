import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { appointments, clients } from "@/lib/schema";
import { eq, and, gte, lte, sum, desc } from "drizzle-orm";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";
import { formatPrice, formatDate, STATUS_LABELS } from "@/lib/utils";
import { Card } from "@/components/ui";
import { TrendingUp, CreditCard, CheckCircle } from "lucide-react";

export default async function PaymentsPage() {
  const session = await auth();
  const userId = session!.user!.id!;
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));

  const [thisMonthRow] = await db.select({ total: sum(appointments.price) }).from(appointments)
    .where(and(eq(appointments.userId, userId), gte(appointments.startAt, monthStart), lte(appointments.startAt, monthEnd)));
  const [lastMonthRow] = await db.select({ total: sum(appointments.price) }).from(appointments)
    .where(and(eq(appointments.userId, userId), gte(appointments.startAt, lastMonthStart), lte(appointments.startAt, lastMonthEnd)));

  const all = await db
    .select({ id: appointments.id, title: appointments.title, startAt: appointments.startAt,
      status: appointments.status, price: appointments.price,
      client: { name: clients.name } })
    .from(appointments)
    .leftJoin(clients, eq(appointments.clientId, clients.id))
    .where(and(eq(appointments.userId, userId)))
    .orderBy(desc(appointments.startAt))
    .limit(50);

  const thisMonthTotal = Number(thisMonthRow.total) || 0;
  const lastMonthTotal = Number(lastMonthRow.total) || 0;
  const delta = lastMonthTotal > 0 ? Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100) : 0;
  const allTimeTotal = all.filter(a => ["CONFIRMED", "DONE"].includes(a.status)).reduce((s, a) => s + (a.price || 0), 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paiements</h1>
        <p className="text-gray-500 text-sm mt-0.5">Suivi de vos revenus</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">Ce mois-ci</span>
            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
              <TrendingUp size={16} className="text-emerald-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatPrice(thisMonthTotal)}</p>
          <p className={`text-xs mt-1 font-medium ${delta >= 0 ? "text-emerald-600" : "text-red-500"}`}>
            {delta >= 0 ? "+" : ""}{delta}% vs mois dernier
          </p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">Mois dernier</span>
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <CreditCard size={16} className="text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatPrice(lastMonthTotal)}</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">Total confirmé</span>
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
              <CheckCircle size={16} className="text-amber-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatPrice(allTimeTotal)}</p>
        </Card>
      </div>

      <Card>
        <div className="p-5 border-b border-gray-50">
          <h2 className="font-semibold text-gray-900">Historique des paiements</h2>
        </div>
        {all.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">Aucun paiement enregistré</div>
        ) : (
          <div className="divide-y divide-gray-50">
            <div className="grid grid-cols-12 gap-4 px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              <div className="col-span-4">Client / Séance</div>
              <div className="col-span-3">Date</div>
              <div className="col-span-2">Statut</div>
              <div className="col-span-3 text-right">Montant</div>
            </div>
            {all.map((apt) => (
              <div key={apt.id} className="grid grid-cols-12 gap-4 px-5 py-3.5 items-center">
                <div className="col-span-4">
                  <p className="text-sm font-medium text-gray-900">{apt.client?.name}</p>
                  <p className="text-xs text-gray-400">{apt.title}</p>
                </div>
                <div className="col-span-3 text-sm text-gray-600">{formatDate(apt.startAt)}</div>
                <div className="col-span-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    apt.status === "DONE" || apt.status === "CONFIRMED" ? "bg-emerald-100 text-emerald-800" :
                    apt.status === "CANCELLED" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-600"
                  }`}>{STATUS_LABELS[apt.status]}</span>
                </div>
                <div className="col-span-3 text-right">
                  <span className={`text-sm font-semibold ${apt.status === "CANCELLED" ? "text-gray-400 line-through" : "text-gray-900"}`}>
                    {apt.price ? formatPrice(apt.price) : "—"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Activer les paiements Stripe</h3>
            <p className="text-sm text-gray-600">Acceptez les paiements en ligne. Configurez vos clés Stripe dans <code className="text-xs bg-white/60 px-1 py-0.5 rounded">.env.local</code></p>
          </div>
          <a href="https://dashboard.stripe.com/register" target="_blank" rel="noopener noreferrer"
            className="shrink-0 ml-6 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">
            Configurer Stripe
          </a>
        </div>
      </Card>
    </div>
  );
}
