import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  X,
  Clock,
  Car,
  CreditCard,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export const ReservationModal = ({ isOpen, onClose, slot, onBookingSuccess }) => {
  const { user } = useAuth();
  const [durationHours, setDurationHours] = useState(2);
  const [vehicleNumber, setVehicleNumber] = useState(() => user?.vehicleNumber || 'KA-05-AB-7788');
  const [paymentMethod, setPaymentMethod] = useState('UPI / SmartPay');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !slot) return null;

  const hourlyRate = slot.hourlyRate || 40;
  const baseTotal = hourlyRate * durationHours;
  const evCharge = slot.type === 'ev' ? 20 : 0;
  const totalAmount = baseTotal + evCharge;

  const handleConfirmReservation = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await api.createBooking({
        slotId: slot._id || slot.slotNumber,
        durationHours,
        vehicleNumber: vehicleNumber.toUpperCase().trim(),
        paymentMethod,
        userName: user?.name || 'Guest Driver',
        userEmail: user?.email || ''
      });

      if (data.success) {
        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });

        onBookingSuccess(data.booking);
        onClose();
      } else {
        setError(data.message || 'Failed to complete reservation.');
      }
    } catch (err) {
      setError(err.message || 'Reservation error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Instant Smart Booking
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
                <span>Reserve Bay</span>
                <span className="px-2.5 py-0.5 rounded-lg bg-emerald-600 text-white font-mono text-base">
                  {slot.slotNumber}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {slot.floor} • Type: {slot.type.replace('_', ' ').toUpperCase()} • {slot.distanceToEntrance || 20}m from Gate
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleConfirmReservation} className="p-6 space-y-5">
          {error && (
            <div className="p-3 text-xs rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 font-medium">
              {error}
            </div>
          )}

          {/* Vehicle Plate Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Vehicle License Plate
            </label>
            <div className="relative">
              <Car className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                placeholder="e.g. KA-04-MB-2210"
                className="w-full pl-10 pr-4 py-2.5 text-sm font-mono font-bold uppercase rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 dark:text-white"
              />
            </div>
          </div>

          {/* Duration Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Parking Duration
              </label>
              <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                {durationHours} {durationHours === 1 ? 'Hour' : 'Hours'}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 4, 8].map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setDurationHours(h)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    durationHours === h
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/30'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {h} {h === 1 ? 'hr' : 'hrs'}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {['UPI / SmartPay', 'Credit / Debit', 'Fastag / Wallet'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPaymentMethod(m)}
                  className={`py-2 px-2 text-center font-semibold rounded-xl border transition-all ${
                    paymentMethod === m
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Pricing Calculation Summary Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Base Rate ({durationHours}h × ₹{hourlyRate})</span>
              <span className="font-mono">₹{baseTotal}</span>
            </div>
            {slot.type === 'ev' && (
              <div className="flex justify-between text-blue-600 dark:text-blue-400 font-medium">
                <span className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" />
                  EV Fast Charge Connection Surcharge
                </span>
                <span className="font-mono">+₹{evCharge}</span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-sm font-extrabold text-slate-900 dark:text-white">
              <span>Total Estimated Fee</span>
              <span className="text-base text-emerald-600 dark:text-emerald-400 font-mono">
                ₹{totalAmount}
              </span>
            </div>
          </div>

          {/* Action CTA */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 text-sm font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{loading ? 'Confirming Reservation...' : `Pay ₹${totalAmount} & Generate QR Pass`}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
