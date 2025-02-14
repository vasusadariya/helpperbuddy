'use client';

import { useState } from 'react';
import { format, addDays } from 'date-fns';
import { toast } from 'react-hot-toast';
import { validateDateTime } from '@/lib/utils/validation';

interface BookingDetails {
  date: string;
  time: string;
  address: string;
  phoneNo: string;
  pincode: string;
  remarks: string;
}

interface CheckoutModalProps {
  isOpen: boolean;
  isProcessing: boolean;
  bookingDetails: BookingDetails;
  onClose: () => void;
  onConfirm: () => void;
  setBookingDetails: (details: BookingDetails) => void;
}


export default function CheckoutModal({
  isOpen,
  isProcessing,
  bookingDetails,
  onClose,
  onConfirm,
  setBookingDetails,
}: CheckoutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Booking Details</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isProcessing}
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              min={format(new Date(), "yyyy-MM-dd")}
              max={format(addDays(new Date(), 30), "yyyy-MM-dd")}
              value={bookingDetails.date}
              onChange={(e) => {
                const newDate = e.target.value;
                setBookingDetails({ ...bookingDetails, date: newDate });
                validateDateTime(newDate, bookingDetails.time);
              }}
              className="w-full p-2 border rounded"
              disabled={isProcessing}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Select a date within the next 30 days
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time
            </label>
            <input
              type="time"
              min="08:00"
              max="20:00"
              value={bookingDetails.time}
              onChange={(e) => {
                const newTime = e.target.value;
                setBookingDetails({ ...bookingDetails, time: newTime });
                validateDateTime(bookingDetails.date, newTime);
              }}
              className="w-full p-2 border rounded"
              disabled={isProcessing}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Service hours: 8:00 AM to 8:00 PM
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={bookingDetails.phoneNo}
              onChange={(e) => setBookingDetails({ ...bookingDetails, phoneNo: e.target.value })}
              className="w-full p-2 border rounded"
              disabled={isProcessing}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              value={bookingDetails.address}
              onChange={(e) => setBookingDetails({ ...bookingDetails, address: e.target.value })}
              className="w-full p-2 border rounded"
              rows={3}
              disabled={isProcessing}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pincode
            </label>
            <input
              type="text"
              value={bookingDetails.pincode}
              onChange={(e) => setBookingDetails({ ...bookingDetails, pincode: e.target.value })}
              pattern="[0-9]*"
              maxLength={6}
              className="w-full p-2 border rounded"
              disabled={isProcessing}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Remarks (Optional)
            </label>
            <textarea
              value={bookingDetails.remarks}
              onChange={(e) => setBookingDetails({ ...bookingDetails, remarks: e.target.value })}
              className="w-full p-2 border rounded"
              rows={3}
              disabled={isProcessing}
            />
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isProcessing}
              className={`px-4 py-2 rounded text-white ${
                isProcessing ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isProcessing ? 'Processing...' : 'Confirm Booking'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}