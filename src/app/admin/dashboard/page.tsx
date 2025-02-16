"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
    const [pendingAdmins, setPendingAdmins] = useState<{ id: string; name: string; email: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [processing, setProcessing] = useState<string | null>(null);
    const router = useRouter();
    useEffect(() => {
        async function fetchPendingAdmins() {
            try {
                const res = await fetch("/api/admin");
                if (!res.ok) throw new Error("Failed to fetch pending admins");

                const data = await res.json();
                setPendingAdmins(data.users || []);
            } catch (err) {
                setError("Error loading pending admins.");  
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        fetchPendingAdmins();
    }, []);

    async function handleAction(userId: string, action: "approve" | "reject") {
        setProcessing(userId);

        try {
            const res = await fetch("/api/admin/make-admin", {
                method: "POST",
                body: JSON.stringify({ userId, action }),
                headers: { "Content-Type": "application/json" },
            });

            if (!res.ok) throw new Error(`Failed to ${action} admin`);

            setPendingAdmins(pendingAdmins.filter((user) => user.id !== userId));
        } catch (err) {
            alert(`Error: Could not ${action} admin.`);
            console.error(err);
        } finally {
            setProcessing(null);
        }
    }

    return (
        <div>
        <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg">
            <h1 className="text-2xl font-bold mb-4">Admin Requests</h1>

            {loading && <p>Loading pending admins...</p>}
            {error && <p className="text-red-500">{error}</p>}

            {pendingAdmins.length === 0 && !loading && (
                <p className="text-gray-500">No pending admin requests.</p>
            )}

            {pendingAdmins.length > 0 && (
                <ul className="space-y-4">
                    {pendingAdmins.map((user) => (
                        <li key={user.id} className="flex justify-between items-center p-3 border rounded-lg">
                            <span>{user.name} ({user.email})</span>
                            <div className="space-x-2">
                                <button 
                                    onClick={() => handleAction(user.id, "approve")}
                                    disabled={processing === user.id}
                                    className={`px-4 py-2 text-white rounded-lg ${
                                        processing === user.id ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
                                    }`}
                                >
                                    {processing === user.id ? "Approving..." : "Approve"}
                                </button>
                                <button 
                                    onClick={() => handleAction(user.id, "reject")}
                                    disabled={processing === user.id}
                                    className={`px-4 py-2 text-white rounded-lg ${
                                        processing === user.id ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
                                    }`}
                                >
                                    {processing === user.id ? "Rejecting..." : "Reject"}
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
            <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
                onClick={() => router.push("/admin/partners")}>
                Go to Partners Approval
            </button>
        </div>
    </div>
    );
}
