"use client";

import { useState } from "react";
import Link from "next/link";

export default function RequestNewService() {
  const [newService, setNewService] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleRequestService = async () => {
    if (!newService.trim()) {
      setError("Please enter a service name");
      return;
    }

    if (!description.trim()) {
      setError("Please enter a service description");
      return;
    }

    try {
      const response = await fetch("/api/partner", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceName: newService.trim(),
          description: description.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setNewService("");
        setDescription("");
        setError(null);
        // Optionally redirect to dashboard after successful submission
        window.location.href = "/partner/dashboard";
      } else {
        throw new Error(data.error || "Failed to request service");
      }
    } catch (err) {
      console.error("Error requesting service:", err);
      setError(err instanceof Error ? err.message : "Failed to submit service request");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-black">Request New Service</h1>
          <Link
            href="/partner/dashboard"
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
          >
            Back to Dashboard
          </Link>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Service Name
                </label>
                <input
                  type="text"
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="Enter service name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  rows={4}
                  placeholder="Enter service description"
                />
              </div>

              <button
                onClick={handleRequestService}
                className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}