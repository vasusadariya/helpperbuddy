"use client";

import { useEffect, useState } from 'react';
import { Copy, Share2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ReferralStats {
  referralCode: string;
  referredUsers: number;
  totalEarnings: number;
}

export default function ReferralCodeCard() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<ReferralStats | null>(null);

  // Fetch referral stats
  const fetchReferralStats = async () => {
    try {
      const response = await fetch('/api/refferals', {
        headers: {
          'x-timestamp': '2025-02-19 17:41:24'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch referral data');
      }

      const data = await response.json();
      
      if (data.success) {
        setStats({
          referralCode: data.data.referralCode,
          referredUsers: data.data.statistics.referredUsers,
          totalEarnings: data.data.statistics.totalEarnings
        });
      }
    } catch (error) {
      console.error('Error fetching referral stats:', error);
      toast.error('Failed to load referral information');
    } finally {
      setIsLoading(false);
    }
  };

  // Copy referral code to clipboard
  const copyReferralCode = async () => {
    if (!stats?.referralCode) return;
    
    try {
      await navigator.clipboard.writeText(stats.referralCode);
      toast.success('Referral code copied to clipboard!');
    } catch (err) {
        console.log(err);
      toast.error('Failed to copy referral code');
    }
  };

  // Share referral code
  const shareReferralCode = async () => {
    if (!stats?.referralCode) return;

    const shareData = {
      title: 'Join HelperBuddy',
      text: `Use my referral code ${stats.referralCode} to get ₹100 bonus when you sign up on HelperBuddy!`,
      url: window.location.origin
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await copyReferralCode();
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  // Fetch stats on component mount
  useEffect(() => {
      fetchReferralStats();
    }, []);

  if (isLoading) {
    return (
      <div className="animate-pulse bg-white rounded-lg shadow-sm p-6">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!stats?.referralCode) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Your Referral Program
        </h3>

        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800">Your Referral Code</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.referralCode}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={copyReferralCode}
                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full transition-colors"
                title="Copy referral code"
              >
                <Copy className="w-5 h-5" />
              </button>
              <button
                onClick={shareReferralCode}
                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full transition-colors"
                title="Share referral code"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Total Referrals</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {stats.referredUsers}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Total Earnings</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              ₹{stats.totalEarnings}
            </p>
          </div>
        </div>

        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            How it works
          </h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center">
              <span className="mr-2">1.</span>
              Share your referral code with friends
            </li>
            <li className="flex items-center">
              <span className="mr-2">2.</span>
              They get ₹100 bonus on signup
            </li>
            <li className="flex items-center">
              <span className="mr-2">3.</span>
              You earn ₹100 when they make their first payment
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
