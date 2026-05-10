"use client";
import { Bell } from "lucide-react";
import { getInitials, getAvatarColor } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface TopbarProps {
  user: { name?: string | null; email?: string | null; image?: string | null };
}

export function Topbar({ user }: TopbarProps) {
  const name = user.name || user.email || "Utilisateur";
  const initials = getInitials(name);
  const avatarColor = getAvatarColor(name);
  const today = format(new Date(), "EEEE d MMMM yyyy", { locale: fr });

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0">
      <p className="text-sm text-gray-500 capitalize">{today}</p>
      <div className="flex items-center gap-3">
        <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition">
          <Bell size={18} />
        </button>
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${avatarColor}`}>
            {initials}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900 leading-none">{user.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
