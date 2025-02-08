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
      console.log("Sending request with:", { partnerId, approved });
  
      const res = await fetch("/api/admin/approve-partner", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partnerId, approved }),
      });
  
      console.log("Response Status:", res.status);
  
      // Check if response is empty
      const text = await res.text();
      console.log("Raw Response Text:", text);
  
      if (!text) throw new Error("Empty response from server");
  
      const data = JSON.parse(text);
      console.log("Parsed Response Data:", data);
  
      if (!res.ok) {
        throw new Error(data.error || "Failed to update partner approval.");
      }
  
      setPartners(partners.filter((partner) => partner.id !== partnerId));
    } catch (error) {
      console.error("Error in handleApproval:", error);
      alert(error instanceof Error ? error.message : "An unknown error occurred.");
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