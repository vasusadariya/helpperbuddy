'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';

interface Order {
    id: string;
    service: { name: string };
    date: string;
    time: string;
}

export default function Home() {
    const [acceptedOrders, setAcceptedOrders] = useState<Order[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAcceptedOrders = async () => {
            try {
                const response = await fetch('/api/partner/orders');
                const data = await response.json();

                if (!data.success) throw new Error(data.error || "Failed to fetch orders");
                setAcceptedOrders(data.data.orders);
            } catch (err) {
                console.error("Error fetching orders:", err);
                setError("Failed to load orders. Please try again.");
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
            color: eventDate < new Date() ? 'red' : 'green',
        };
    });

    return (
        <div className="bg-white text-black min-h-screen">
            <Navbar />
            <div className="p-6 pt-40">
                <h2 className="text-xl font-semibold mb-4">Accepted Orders Calendar</h2>
                {error && <p className="text-red-500">{error}</p>}
                <FullCalendar plugins={[dayGridPlugin]} initialView="dayGridMonth" events={events} height="auto" />
            </div>
            <Footer />
        </div>
    );
}
