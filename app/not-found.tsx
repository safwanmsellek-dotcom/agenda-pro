import Link from "next/link";
import { Calendar } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-2xl mb-6">
          <Calendar className="w-8 h-8 text-emerald-600" />
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-3">404</h1>
        <p className="text-gray-500 mb-8">Cette page n'existe pas.</p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition"
        >
          Retour au tableau de bord
        </Link>
      </div>
    </div>
  );
}
