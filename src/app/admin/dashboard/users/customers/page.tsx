'use client'
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

interface Transaction {
  id: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT' | 'REFERRAL_BONUS' | 'SIGNUP_BONUS';
  createdAt: string;
}

interface Order {
  id: string;
  status: string;
  amount: number;
  createdAt: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phoneno: string | null;
  createdAt: string;
  wallet: {
    balance: number;
  } | null;
  Order: Order[];
  Transaction: Transaction[];
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/admin/customers');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCustomers(data.customers);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to fetch customers data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const formatDate = (date: string) => {
    return format(new Date(date), 'MMM dd, yyyy HH:mm');
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      ACCEPTED: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-purple-100 text-purple-800',
      SERVICE_COMPLETED: 'bg-green-100 text-green-800',
      PAYMENT_REQUESTED: 'bg-orange-100 text-orange-800',
      PAYMENT_COMPLETED: 'bg-green-100 text-green-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTransactionTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      CREDIT: 'text-green-600',
      DEBIT: 'text-red-600',
      REFERRAL_BONUS: 'text-blue-600',
      SIGNUP_BONUS: 'text-purple-600',
    };
    return colors[type] || 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Customer Management</h1>
      
      <div className="grid gap-6">
        {customers.map((customer) => (
          <div key={customer.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div 
              className="p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => setExpandedCustomer(expandedCustomer === customer.id ? null : customer.id)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold">{customer.name}</h2>
                  <p className="text-gray-600">{customer.email}</p>
                  {customer.phoneno && (
                    <p className="text-gray-600">Phone: {customer.phoneno}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    Joined: {formatDate(customer.createdAt)}
                  </p>
                  <p className="font-semibold">
                    Wallet Balance: ₹{customer.wallet?.balance.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>

              {customer.Order.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium">Latest Order:</p>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      getStatusColor(customer.Order[0].status)
                    }`}>
                      {customer.Order[0].status}
                    </span>
                    <span className="ml-2 text-sm text-gray-600">
                      ₹{customer.Order[0].amount.toFixed(2)} - {formatDate(customer.Order[0].createdAt)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {expandedCustomer === customer.id && customer.Transaction.length > 0 && (
              <div className="border-t px-4 py-3 bg-gray-50">
                <h3 className="text-sm font-medium mb-2">Recent Transactions</h3>
                <div className="space-y-2">
                  {customer.Transaction.map((transaction) => (
                    <div key={transaction.id} className="flex justify-between items-center text-sm">
                      <span className={getTransactionTypeColor(transaction.type)}>
                        {transaction.type}
                      </span>
                      <span className="text-gray-600">
                        ₹{transaction.amount.toFixed(2)}
                      </span>
                      <span className="text-gray-500">
                        {formatDate(transaction.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}