"use client";

import { useState } from "react";

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-pattern opacity-5"></div>

      <div className="container mx-auto px-4 py-8 relative">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Request New Service
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Submit your request for a new service category
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl p-8 transform transition-all animate-fadeIn">
            {error && (
              <div className="mb-6 rounded-lg bg-red-50 p-4 animate-shake">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Name
                </label>
                <input
                  type="text"
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  className="block w-full rounded-lg border-0 px-4 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-black-600 sm:text-sm transition-all duration-200"
                  placeholder="Enter service name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="block w-full rounded-lg border-0 px-4 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-black-600 sm:text-sm transition-all duration-200"
                  rows={4}
                  placeholder="Enter service description"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Provide a detailed description of the service you&#39;d like to offer
                </p>
              </div>

              <button
                onClick={handleRequestService}
                className="group relative flex w-full justify-center rounded-lg bg-black px-3 py-3 text-sm font-semibold text-white transition-all duration-200 ease-in-out hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform hover:scale-[1.02]"
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