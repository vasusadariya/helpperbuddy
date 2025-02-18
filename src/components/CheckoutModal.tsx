'use client';

import { useState, useEffect } from 'react';
import { format, addDays, parse } from 'date-fns';
import { toast } from 'react-hot-toast';
import { validateDateTime } from '@/lib/utils/validation';

interface CartService {
  id: string;
  name: string;
  threshold: number;
  price: number;
  description: string;
  category: string;
  image?: string;
  quantity: number;
}

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
  cartServices: CartService[];
}

export default function CheckoutModal({
  isOpen,
  isProcessing,
  bookingDetails,
  onClose,
  onConfirm,
  setBookingDetails,
  cartServices
}: CheckoutModalProps) {
  const [minTime, setMinTime] = useState<string>('08:00');
  const [maxTime, setMaxTime] = useState<string>('20:00');
  const [maxThresholdService, setMaxThresholdService] = useState<CartService | null>(null);

  const updateTimeConstraints = (selectedDate: string) => {
    if (!maxThresholdService) return;

    const now = new Date();
    const selectedDateTime = parse(selectedDate, 'yyyy-MM-dd', new Date());
    const isToday = selectedDateTime.toDateString() === now.toDateString();

    if (isToday) {
      const thresholdDate = new Date(now);
      thresholdDate.setHours(thresholdDate.getHours() + maxThresholdService.threshold);

      const minHour = Math.max(8, thresholdDate.getHours());
      const minMinutes = thresholdDate.getMinutes();
      const formattedMinTime = `${minHour.toString().padStart(2, '0')}:${minMinutes.toString().padStart(2, '0')}`;
      setMinTime(formattedMinTime);

      if (bookingDetails.time < formattedMinTime) {
        setBookingDetails({
          ...bookingDetails,
          time: formattedMinTime
        });
      }
    } else {
      setMinTime('08:00');
    }

    const totalServiceTime = cartServices.reduce((total, service) => 
      total + service.threshold + 1, 0);
    const maxHour = Math.min(20 - totalServiceTime, 20);
    setMaxTime(`${Math.max(8, maxHour).toString().padStart(2, '0')}:00`);
  };

  // Find service with maximum threshold hours
  useEffect(() => {
    if (cartServices.length > 0) {
      const serviceWithMaxThreshold = cartServices.reduce((max, service) => 
        service.threshold > max.threshold ? service : max
      , cartServices[0]);
      
      setMaxThresholdService(serviceWithMaxThreshold);
    }
  }, [cartServices]);

  useEffect(() => {
    if (bookingDetails.date && maxThresholdService) {
      updateTimeConstraints(bookingDetails.date);
    }
  }, [bookingDetails.date, maxThresholdService, updateTimeConstraints]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setBookingDetails({ ...bookingDetails, date: newDate });
    updateTimeConstraints(newDate);

    const isValidForAll = cartServices.every(service =>
      validateDateTime(newDate, bookingDetails.time, {
        threshold: service.threshold
      })
    );

    if (!isValidForAll) {
      toast.error(`Booking time must meet threshold requirements for all services`);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setBookingDetails({ ...bookingDetails, time: newTime });

    cartServices.forEach(service => {
      validateDateTime(bookingDetails.date, newTime, {
        threshold: service.threshold
      });
    });
  };

  const getThresholdMessage = () => {
    if (!maxThresholdService) return '';

    const messages = cartServices.map(service => 
      `${service.name}: ${service.threshold} hour${service.threshold > 1 ? 's' : ''}`
    );

    return (
      <div className="text-xs text-blue-600 mt-1">
        <p>Advance booking requirements:</p>
        <ul className="list-disc pl-4">
          {messages.map((msg, index) => (
            <li key={index}>{msg}</li>
          ))}
        </ul>
        <p className="mt-1 font-medium">
          Earliest booking time will be based on the highest threshold ({maxThresholdService.threshold} hours)
        </p>
      </div>
    );
  };

  if (!isOpen) return null;

  const cartTotal = cartServices.reduce((sum, service) => 
    sum + (service.price * service.quantity), 0
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
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

        {/* Services Summary */}
        <div className="mb-6 bg-gray-50 p-3 rounded">
          <h3 className="font-medium mb-2">Services in Cart:</h3>
          <ul className="space-y-1">
            {cartServices.map(service => (
              <li key={service.id} className="text-sm flex justify-between">
                <span>{service.name} x{service.quantity}</span>
                <span>₹{(service.price * service.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-2 pt-2 border-t flex justify-between font-medium">
            <span>Total:</span>
            <span>₹{cartTotal.toFixed(2)}</span>
          </div>
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
              onChange={handleDateChange}
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
              min={minTime}
              max={maxTime}
              value={bookingDetails.time}
              onChange={handleTimeChange}
              className="w-full p-2 border rounded"
              disabled={isProcessing}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Service hours: 8:00 AM to {parseInt(maxTime)}:00 PM
            </p>
            {getThresholdMessage()}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              pattern="[0-9]{10}"
              maxLength={10}
              value={bookingDetails.phoneNo}
              onChange={(e) => setBookingDetails({ ...bookingDetails, phoneNo: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="10-digit mobile number"
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
              placeholder="Complete service address"
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
              pattern="[0-9]{6}"
              maxLength={6}
              value={bookingDetails.pincode}
              onChange={(e) => setBookingDetails({ ...bookingDetails, pincode: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="6-digit pincode"
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
              rows={2}
              placeholder="Any special instructions"
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
              onClick={() => {
                const isValidForAll = cartServices.every(service =>
                  validateDateTime(
                    bookingDetails.date,
                    bookingDetails.time,
                    { threshold: service.threshold }
                  )
                );
                if (isValidForAll) {
                  onConfirm();
                }
              }}
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