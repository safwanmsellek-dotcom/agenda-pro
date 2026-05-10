"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { AppointmentModal } from "@/components/appointments/AppointmentModal";
import { Button } from "@/components/ui";

// Dynamic import to avoid SSR issues
import dynamic from "next/dynamic";

const FullCalendarWrapper = dynamic(() => import("./FullCalendarWrapper"), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] flex items-center justify-center bg-white rounded-xl border border-gray-100">
      <div className="text-gray-400 text-sm">Chargement du calendrier...</div>
    </div>
  ),
});

export function CalendarClient() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [editAppointment, setEditAppointment] = useState<any>(null);
  const [defaultDate, setDefaultDate] = useState<Date | undefined>();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendrier</h1>
          <p className="text-gray-500 text-sm mt-0.5">Gérez vos rendez-vous</p>
        </div>
        <Button onClick={() => { setEditAppointment(null); setDefaultDate(undefined); setShowModal(true); }}>
          <Plus size={16} />
          Nouveau RDV
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <FullCalendarWrapper
          onEventClick={(apt: any) => { setEditAppointment(apt); setShowModal(true); }}
          onDateClick={(date: Date) => { setDefaultDate(date); setEditAppointment(null); setShowModal(true); }}
          refreshKey={showModal ? 0 : 1}
        />
      </div>

      <AppointmentModal
        open={showModal}
        onClose={() => { setShowModal(false); setEditAppointment(null); }}
        onSuccess={() => { setShowModal(false); setEditAppointment(null); router.refresh(); }}
        appointment={editAppointment}
        defaultDate={defaultDate}
      />
    </div>
  );
}
