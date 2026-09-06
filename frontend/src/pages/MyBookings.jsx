import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { QRCodePass } from '../components/booking/QRCodePass';
import { ParkingTimer } from '../components/booking/ParkingTimer';
import { Ticket, History, CheckCircle2, AlertCircle, Car, ArrowRight } from 'lucide-react';

export const MyBookings = ({ activePass, onNavigateSlots }) => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      if (user) {
        const res = await api.getMyBookings();
        if (res.success) setBookings(res.bookings);
      } else {
        // Fallback demo bookings
        const res = await api.getAllBookings();
        if (res.success) setBookings(res.bookings.slice(0, 5));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user, activePass]);

  // Determine current active booking pass
  const activeBooking = activePass || bookings.find(b => b.status === 'active');

  return (
    <div className="space-y-8 py-4 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl glass-panel">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Ticket className="w-6 h-6 text-emerald-500" />
            <span>Smart Digital Passes & Parking History</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Access your active QR code barrier entry passes, live parking timer, and automated receipts
          </p>
        </div>

        <button
          onClick={onNavigateSlots}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30 transition-all hover:scale-105"
        >
          <Car className="w-4 h-4" />
          <span>Book Another Bay</span>
        </button>
      </div>

      {/* Active Session & Live Timer */}
      {activeBooking && (
        <div className="space-y-6">
          <ParkingTimer
            activeBooking={activeBooking}
            onCheckout={() => fetchBookings()}
          />

          <div className="max-w-md mx-auto">
            <QRCodePass
              booking={activeBooking}
              onStatusChange={() => fetchBookings()}
            />
          </div>
        </div>
      )}

      {/* Past Parking Sessions Table */}
      <div className="rounded-3xl glass-panel p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-500" />
            <span>Parking Session History</span>
          </h3>
          <span className="text-xs text-slate-400">Past Verified Sessions</span>
        </div>

        {bookings.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No previous parking passes found. Reserve a slot to generate your first pass!
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-500 font-bold uppercase">
                <tr>
                  <th className="p-3.5">Booking Ref</th>
                  <th className="p-3.5">Bay</th>
                  <th className="p-3.5">Vehicle</th>
                  <th className="p-3.5">Date & Time</th>
                  <th className="p-3.5">Duration</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {bookings.map((b) => (
                  <tr key={b._id || b.bookingId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">
                      {b.bookingId}
                    </td>
                    <td className="p-3.5 font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      {b.slotNumber}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-slate-700 dark:text-slate-300">
                      {b.vehicleNumber}
                    </td>
                    <td className="p-3.5 text-slate-500">
                      {new Date(b.startTime).toLocaleDateString()} {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-400 font-medium">
                      {b.durationHours || 1} hr(s)
                    </td>
                    <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">
                      ₹{b.totalAmount}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          b.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
