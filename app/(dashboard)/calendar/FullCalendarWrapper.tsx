"use client";
import { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import frLocale from "@fullcalendar/core/locales/fr";

const STATUS_BG: Record<string, string> = {
  CONFIRMED: "#16a34a",
  PENDING: "#d97706",
  CANCELLED: "#dc2626",
  DONE: "#2563eb",
};

interface Props {
  onEventClick: (appointment: any) => void;
  onDateClick: (date: Date) => void;
  refreshKey: number;
}

export default function FullCalendarWrapper({ onEventClick, onDateClick, refreshKey }: Props) {
  const [events, setEvents] = useState<any[]>([]);

  const fetchEvents = async (start: Date, end: Date) => {
    try {
      const res = await fetch(`/api/appointments?start=${start.toISOString()}&end=${end.toISOString()}`);
      const data = await res.json();
      const mapped = data.map((apt: any) => ({
        id: apt.id,
        title: `${apt.client.name} — ${apt.title}`,
        start: apt.startAt,
        end: apt.endAt,
        backgroundColor: STATUS_BG[apt.status] || "#16a34a",
        borderColor: "transparent",
        extendedProps: apt,
      }));
      setEvents(mapped);
    } catch (e) {
      console.error("Failed to fetch appointments:", e);
    }
  };

  useEffect(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 2, 1);
    fetchEvents(start, end);
  }, [refreshKey]);

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="timeGridWeek"
      locale={frLocale}
      headerToolbar={{
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay",
      }}
      slotMinTime="07:00:00"
      slotMaxTime="21:00:00"
      allDaySlot={false}
      events={events}
      eventClick={(info) => {
        onEventClick(info.event.extendedProps);
      }}
      dateClick={(info) => {
        onDateClick(new Date(info.dateStr));
      }}
      datesSet={(dateInfo) => {
        fetchEvents(dateInfo.start, dateInfo.end);
      }}
      height="auto"
      eventClassNames={(arg) => {
        return [`fc-event-${arg.event.extendedProps.status?.toLowerCase() || "confirmed"}`];
      }}
      nowIndicator
      businessHours={{ daysOfWeek: [1, 2, 3, 4, 5], startTime: "08:00", endTime: "19:00" }}
    />
  );
}
