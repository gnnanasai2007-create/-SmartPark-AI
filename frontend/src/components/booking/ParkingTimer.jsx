import React, { useState, useEffect } from 'react';
import { Timer, IndianRupee, AlertCircle, CheckCircle } from 'lucide-react';

export const ParkingTimer = ({ activeBooking, onCheckout }) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!activeBooking) return;

    const startTime = activeBooking.entryTime
      ? new Date(activeBooking.entryTime).getTime()
      : new Date(activeBooking.startTime).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diffSec = Math.max(0, Math.floor((now - startTime) / 1000));
      setElapsedSeconds(diffSec);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeBooking]);

  if (!activeBooking || activeBooking.status === 'completed') return null;

  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;

  // Live progressive fee calculation (minimum 1 hour rate)
  const billedHours = Math.max(1, Math.ceil(elapsedSeconds / 3600));
  const liveFee = billedHours * (activeBooking.hourlyRate || 40);

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
      <div className="flex items-center gap-4">
        <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 backdrop-blur border border-white/20">
          <Timer className="w-7 h-7 text-emerald-200 animate-spin-slow" />
          <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-300"></span>
          </span>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
              Active Parking Session
            </span>
            <span className="px-2 py-0.5 rounded bg-white/20 text-[10px] font-bold font-mono">
              Bay {activeBooking.slotNumber}
            </span>
          </div>

          <div className="text-2xl font-extrabold font-mono tracking-tight mt-0.5">
            {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
          </div>
          <p className="text-xs text-emerald-100">
            Vehicle: <span className="font-mono font-bold">{activeBooking.vehicleNumber}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <span className="text-xs text-emerald-200 uppercase font-semibold block">
            Accrued Auto-Fee
          </span>
          <span className="text-2xl font-black font-mono tracking-tight text-white">
            ₹{liveFee}
          </span>
        </div>

        {onCheckout && (
          <button
            onClick={() => onCheckout(activeBooking)}
            className="px-4 py-2.5 rounded-xl bg-white text-emerald-800 font-bold text-xs shadow-lg hover:bg-emerald-50 transition-all hover:scale-105 active:scale-95"
          >
            Exit & Pay
          </button>
        )}
      </div>
    </div>
  );
};
