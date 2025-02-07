"use client";

import { useSession, signOut } from "next-auth/react";
import { Session } from "next-auth";
import { useRouter } from "next/navigation";
type ExtendedSession = Session & {
    user: {
        role: string;
    };
};
  
export default function PartnerDashboard() {
    const { data: session, status } = useSession() as { data: ExtendedSession | null; status: string };
    const router = useRouter();

    if (status === "loading") {
        return (
            <div className="h-screen flex items-center justify-center">
                <p className="text-gray-600">Loading...</p>
            </div>
        );
    }

    if (!session?.user || session.user.role !== "PARTNER") {
        router.push("/signin");
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-4xl mx-auto p-6">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome, {session.user.email}!</h1>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold mb-3">Partner Profile</h2>
                    <p><strong>Email:</strong> {session.user.email}</p>
                    <p><strong>Role:</strong> Partner</p>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <DashboardCard title="Manage Services" description="Add or update your services." link="/partner/services" />
                        <DashboardCard title="View Orders" description="Check assigned orders and status." link="/partner/orders" />
                    </div>

                    <button 
                        onClick={() => signOut()}
                        className="mt-6 w-full bg-red-600 text-white py-2 rounded-lg text-center"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}

function DashboardCard({ title, description, link }: { title: string; description: string; link: string }) {
    return (
        <a href={link} className="block p-4 bg-gray-200 rounded-lg hover:bg-gray-300 transition">
            <h3 className="text-xl font-semibold">{title}</h3>
            <p className="text-gray-600">{description}</p>
        </a>
    );
}
