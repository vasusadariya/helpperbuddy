'use client'
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import dynamic from 'next/dynamic';
import { format } from 'date-fns';

interface User {
  id: string;
  name: string;
  email: string;
  referralCode: string;
}

interface ReferralData {
  id: string;
  referrer: User | null;
  referred: User & {
    createdAt: string;
  };
  amount: number;
  description: string;
  createdAt: string;
  walletBalance: number;
}

interface WalletStats {
  totalReferralAmount: number;
  totalUsers: number;
  totalActiveReferrals: number;
}

function WalletStatistics() {
  const [referralAmount, setReferralAmount] = useState<number>(0);
  const [referrals, setReferrals] = useState<ReferralData[]>([]);
  const [stats, setStats] = useState<WalletStats>({
    totalReferralAmount: 0,
    totalUsers: 0,
    totalActiveReferrals: 0,
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy-MM-dd HH:mm:ss');
    } catch (error) {
      console.error('Error formatting date:', error); // Log the error
      return 'Invalid date';
    }
  };

  const fetchReferralAmount = async () => {
    try {
      const response = await fetch('/api/admin/systemconfig/referral');
      if (!response.ok) throw new Error('Failed to fetch referral amount');
      const amount = await response.json();
      setReferralAmount(amount);
    } catch (error) {
      console.error('Error fetching referral amount:', error);
      toast.error('Failed to fetch referral amount');
    }
  };

  const fetchReferralData = async () => {
    try {
      const response = await fetch('/api/admin/wallet/referrals');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch referral data');
      }
      const data = await response.json();
      console.log('Referral data:', data); // Debug log
      setReferrals(data.referrals);
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching referral data:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to fetch referral data');
    }
  };

  const updateReferralAmount = async () => {
    if (!referralAmount || referralAmount < 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      setUpdating(true);
      const response = await fetch('/api/admin/systemconfig/referral', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ variable_value: referralAmount }),
      });

      if (!response.ok) throw new Error('Failed to update referral amount');
      
      const newAmount = await response.json();
      setReferralAmount(newAmount);
      toast.success('Referral amount updated successfully');
    } catch (error) {
      console.error('Error updating referral amount:', error);
      toast.error('Failed to update referral amount');
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchReferralAmount(), fetchReferralData()]);
      } catch (error) {
        console.error('Error in initial data fetch:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Wallet & Referral Management</h1>
        <button
          onClick={() => Promise.all([fetchReferralAmount(), fetchReferralData()])}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
        >
          Refresh Data
        </button>
      </div>

      {/* Referral Configuration */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Referral System Configuration</h2>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label htmlFor="referralAmount" className="block text-sm font-medium text-gray-700">
              Referral Amount (₹)
            </label>
            <input
              type="number"
              id="referralAmount"
              value={referralAmount}
              onChange={(e) => setReferralAmount(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              min="0"
            />
          </div>
          <button
            onClick={updateReferralAmount}
            disabled={updating}
            className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            {updating ? 'Updating...' : 'Update Amount'}
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700">Total Referral Amount</h3>
          <p className="text-3xl font-bold mt-2">₹{stats.totalReferralAmount.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700">Total Users</h3>
          <p className="text-3xl font-bold mt-2">{stats.totalUsers}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700">Active Referrals</h3>
          <p className="text-3xl font-bold mt-2">{stats.totalActiveReferrals}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Referral History</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Referrer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Referred User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount / Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {referrals.map((referral) => (
                <tr key={referral.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      {referral.referrer ? (
                        <>
                          <div className="text-sm font-medium text-gray-900">{referral.referrer.name}</div>
                          <div className="text-sm text-gray-500">{referral.referrer.email}</div>
                          <div className="text-xs text-gray-400">Code: {referral.referrer.referralCode}</div>
                        </>
                      ) : (
                        <div className="text-sm text-gray-500">No referrer</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900">{referral.referred.name}</div>
                      <div className="text-sm text-gray-500">{referral.referred.email}</div>
                      <div className="text-xs text-gray-400">Code: {referral.referred.referralCode}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-green-600">+₹{referral.amount.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">Balance: ₹{referral.walletBalance.toFixed(2)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {referral.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(referral.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Disable SSR for this component
const WalletPage = dynamic(() => Promise.resolve(WalletStatistics), {
  ssr: false,
});

export default WalletPage;