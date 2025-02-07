"use client";

import { useEffect, useState } from "react";

export default function AdminApprovals() {
  interface Partner {
    id: string;
    name: string;
    email: string;
  }

  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchPartners() {
      try {
        const res = await fetch("/api/admin/pending-partners");
        if (!res.ok) throw new Error("Failed to fetch partners");
        const data = await res.json();
        setPartners(data.partners);
      } catch (error) {
        console.error(error);
        alert("Error fetching partners. Please try again.");
      }
    }
    fetchPartners();
  }, []);

  async function handleApproval(partnerId: string, approved: boolean) {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/approve-partner", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partnerId, approved }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update partner approval.");
      }

      setPartners(partners.filter((partner) => partner.id !== partnerId));
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Admin Panel - Approve Partners</h1>
      {partners.length === 0 ? (
        <p className="text-gray-500 mt-4">No pending approvals.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {partners.map((partner) => (
            <li key={partner.id} className="p-4 bg-white shadow rounded-lg flex justify-between items-center">
              <div>
                <p className="font-semibold">{partner.name}</p>
                <p className="text-gray-500">{partner.email}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleApproval(partner.id, true)}
                  disabled={loading}
                  className="bg-green-500 text-white px-3 py-1 rounded"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleApproval(partner.id, false)}
                  disabled={loading}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
