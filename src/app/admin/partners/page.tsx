'use client';

import { useState, useEffect } from "react";

interface Partner {
  id: string;
  name: string;
  email: string;
  service: string[];
}

export default function AdminApprovals() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  useEffect(() => {
    fetchPartners();
  }, []);

  async function fetchPartners() {
    try {
      const res = await fetch("/api/admin/pending-partners");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPartners(data.partners);
    } catch (error) {
      console.error(error);
      alert("Failed to fetch partners");
    }
  }

  async function handleApproval(partnerId: string, approved: boolean) {
    setActionInProgress(partnerId);
    try {
      const res = await fetch("/api/admin/approve-partner", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partnerId, approved })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setPartners(partners.filter(p => p.id !== partnerId));
      alert(approved ? "Partner approved" : "Partner rejected");
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Operation failed");
    } finally {
      setActionInProgress(null);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Partner Approvals</h1>
      {partners.length === 0 ? (
        <p className="text-gray-500">No pending approvals</p>
      ) : (
        <div className="space-y-4">
          {partners.map((partner) => (
            <div key={partner.id} className="p-4 bg-white shadow rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{partner.name}</p>
                  <p className="text-gray-500">{partner.email}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApproval(partner.id, true)}
                    disabled={!!actionInProgress}
                    className="bg-green-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
                  >
                    {actionInProgress === partner.id ? "Processing..." : "Approve"}
                  </button>
                  <button
                    onClick={() => handleApproval(partner.id, false)}
                    disabled={!!actionInProgress}
                    className="bg-red-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
                  >
                    {actionInProgress === partner.id ? "Processing..." : "Reject"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}