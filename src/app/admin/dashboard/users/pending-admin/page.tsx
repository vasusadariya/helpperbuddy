'use client'
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import dynamic from 'next/dynamic';

interface PendingAdmin {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  phoneno: string | null;
}

function PendingAdminsList() {
  const [pendingAdmins, setPendingAdmins] = useState<PendingAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchPendingAdmins = async () => {
    try {
      const response = await fetch('/api/admin/pending-admins');
      if (!response.ok) {
        throw new Error('Failed to fetch pending admins');
      }
      const data = await response.json();
      setPendingAdmins(data.pendingAdmins || []);
    } catch (error) {
      console.error('Error fetching pending admins:', error);
      toast.error('Failed to fetch pending admins');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminAction = async (userId: string, action: 'approve' | 'reject') => {
    try {
      setProcessing(userId);
      const response = await fetch('/api/admin/make-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, action }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to process request');
      }

      const data = await response.json();
      toast.success(data.message);
      await fetchPendingAdmins(); // Refresh the list
    } catch (error) {
      console.error('Error processing admin action:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process request');
    } finally {
      setProcessing(null);
    }
  };

  useEffect(() => {
    fetchPendingAdmins();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Pending Admin Requests</h1>
        <button
          onClick={() => fetchPendingAdmins()}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      {/* Content */}
      {pendingAdmins.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No pending requests</h3>
          <p className="mt-1 text-sm text-gray-500">There are no pending admin requests at the moment.</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul role="list" className="divide-y divide-gray-200">
            {pendingAdmins.map((admin) => (
              <li key={admin.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <span className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                            <span className="text-xl font-medium text-gray-600">
                              {admin.name.charAt(0).toUpperCase()}
                            </span>
                          </span>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900 truncate">{admin.name}</h3>
                          <div className="mt-1">
                            <p className="text-sm text-gray-500">
                              {admin.email}
                            </p>
                            {admin.phoneno && (
                              <p className="text-sm text-gray-500">
                                Phone: {admin.phoneno}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAdminAction(admin.id, 'approve')}
                        disabled={!!processing}
                        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                          processing === admin.id ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {processing === admin.id ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleAdminAction(admin.id, 'reject')}
                        disabled={!!processing}
                        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                          processing === admin.id ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {processing === admin.id ? 'Processing...' : 'Reject'}
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    Requested on {new Date(admin.createdAt).toLocaleDateString()} at{' '}
                    {new Date(admin.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Disable SSR for this component
const PendingAdminPage = dynamic(() => Promise.resolve(PendingAdminsList), {
  ssr: false,
});

export default PendingAdminPage;