'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';

interface Order {
    id: string;
    service: {
        name: string;
    };
    date: string;
    time: string;
}

export default function Home() {
    const [acceptedOrders, setAcceptedOrders] = useState<Order[]>([]);

    useEffect(() => {
        const fetchAcceptedOrders = async () => {
            try {
                const response = await fetch('/api/partner/orders');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                if (data.success) {
                    setAcceptedOrders(data.data.orders);
                } else {
                    throw new Error(data.error || 'Failed to fetch orders');
                }
            } catch (err) {
                console.error('Error fetching accepted orders:', err);
            }
        };
        fetchAcceptedOrders();
    }, []);

    // Convert orders to FullCalendar event format
    const events = acceptedOrders.map((order) => {
        const eventDate = new Date(order.date + 'T' + order.time);
        const isPast = eventDate < new Date();

        return {
            id: order.id,
            title: order.service.name,
            start: eventDate,
            color: isPast ? 'red' : 'green',
        };
    });

    return (
        <div className="bg-white text-black min-h-screen">
            <Navbar />
            <div className="p-6 pt-40">
                <h2 className="text-xl font-semibold mb-4">Accepted Orders Calendar</h2>
                <FullCalendar
                    plugins={[dayGridPlugin]}
                    initialView="dayGridMonth"
                    events={events}
                    height="auto"
                />
            </div>
            <Footer />
        </div>
    );
}
