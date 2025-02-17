"use client";

import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { Calendar as CalendarIcon, AlertCircle } from "lucide-react";

interface Order {
  id: string;
  service: { name: string };
  date: string;
  time: string;
}

export default function CalendarPage() {
  const [acceptedOrders, setAcceptedOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAcceptedOrders = async () => {
      try {
        const response = await fetch("/api/partner/orders");
        const data = await response.json();

        if (!data.success) throw new Error(data.error || "Failed to fetch orders");
        setAcceptedOrders(data.data.orders);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load orders. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAcceptedOrders();
  }, []);

  // Convert orders to FullCalendar event format
  const events = acceptedOrders.map((order) => {
    const eventDate = new Date(`${order.date}T${order.time}`);
    return {
      id: order.id,
      title: order.service.name,
      start: isNaN(eventDate.getTime()) ? new Date() : eventDate,
      color: eventDate < new Date() ? "#EF4444" : "#059669", // Red for past events, Green for upcoming
    };
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <CalendarIcon className="w-6 h-6 mr-3" />
          <h1 className="text-2xl font-bold">Service Calendar</h1>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {error ? (
          <div className="flex items-center p-4 mb-4 text-red-800 bg-red-100 rounded-lg">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
        ) : (
          <div className="calendar-container">
            <style jsx global>{`
              .fc {
                max-width: 100%;
                background: white;
              }
              .fc .fc-toolbar-title {
                font-size: 1.2rem;
                font-weight: 600;
              }
              .fc .fc-button {
                background-color: black;
                border-color: black;
              }
              .fc .fc-button:hover {
                background-color: #333;
                border-color: #333;
              }
              .fc .fc-button-primary:not(:disabled).fc-button-active,
              .fc .fc-button-primary:not(:disabled):active {
                background-color: #666;
                border-color: #666;
              }
              .fc-event {
                cursor: pointer;
                padding: 2px 4px;
              }
              .fc-daygrid-day.fc-day-today {
                background-color: #f3f4f6 !important;
              }
            `}</style>
            <FullCalendar
              plugins={[dayGridPlugin]}
              initialView="dayGridMonth"
              events={events}
              height="auto"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,dayGridWeek"
              }}
              eventClick={(info) => {
                // Handle event click - you can add modal or navigation here
                console.log("Event clicked:", info.event);
              }}
            />
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-6 bg-white rounded-lg shadow p-4">
        <h2 className="text-sm font-semibold mb-3">Legend</h2>
        <div className="flex space-x-6">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-[#059669] mr-2"></div>
            <span className="text-sm">Upcoming Services</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-[#EF4444] mr-2"></div>
            <span className="text-sm">Past Services</span>
          </div>
        </div>
      </div>
    </div>
  );
}