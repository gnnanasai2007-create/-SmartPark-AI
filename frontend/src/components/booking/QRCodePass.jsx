import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { api } from '../../services/api';
import {
  QrCode,
  Car,
  Clock,
  MapPin,
  CheckCircle2,
  Download,
  ArrowRight,
  ShieldCheck,
  DoorOpen,
  LogOut
} from 'lucide-react';

export const QRCodePass = ({ booking, onStatusChange }) => {
  const canvasRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState('');

  useEffect(() => {
    if (booking && canvasRef.current) {
      const qrData = booking.entryQrCode || booking.bookingId;
      QRCode.toCanvas(canvasRef.current, qrData, {
        width: 180,
        margin: 1,
        color: {
          dark: '#0F172A',
          light: '#FFFFFF'
        }
      }, (error) => {
        if (error) console.error('QR Gen error:', error);
      });
    }
  }, [booking]);

  if (!booking) return null;

  const handleSimulateScan = async (action) => {
    setScanning(true);
    setScanMessage('');
    try {
      const data = await api.verifyQrPass(booking.entryQrCode || booking.bookingId, action);
      if (data.success) {
        setScanMessage(data.message);
        if (onStatusChange) onStatusChange(data.booking);
      } else {
        setScanMessage(data.message || 'Scan failed.');
      }
    } catch (err) {
      setScanMessage(err.message || 'Scan network error.');
    } finally {
      setScanning(false);
    }
  };

  const isCheckedIn = !!booking.entryTime;
  const isCompleted = booking.status === 'completed';

  return (
    <div className="relative max-w-md mx-auto rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Boarding Pass Header */}
      <div className="p-5 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-200" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">
              SmartPark Digital Pass
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-white/20 backdrop-blur">
            {booking.status}
          </span>
        </div>

        <div className="mt-3 flex items-baseline justify-between">
          <div>
            <p className="text-[11px] text-emerald-100 font-medium">Assigned Bay</p>
            <h2 className="text-3xl font-extrabold font-mono tracking-tight">{booking.slotNumber}</h2>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-emerald-100 font-medium">Pass Code</p>
            <p className="text-base font-extrabold font-mono">{booking.bookingId}</p>
          </div>
        </div>
      </div>

      {/* Perforated ticket divider line */}
      <div className="relative flex items-center justify-between px-2 bg-slate-50 dark:bg-slate-800/40 py-2 border-y border-dashed border-slate-300 dark:border-slate-700">
        <div className="w-4 h-4 rounded-full bg-slate-50 dark:bg-slate-950 -ml-4 border-r border-slate-300 dark:border-slate-700" />
        <span className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-widest">
          • SCAN AT PARKING BARRIER •
        </span>
        <div className="w-4 h-4 rounded-full bg-slate-50 dark:bg-slate-950 -mr-4 border-l border-slate-300 dark:border-slate-700" />
      </div>

      {/* Ticket Body with QR code */}
      <div className="p-6 space-y-4">
        {/* QR Code Canvas */}
        <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-slate-200 shadow-inner w-fit mx-auto">
          <canvas ref={canvasRef} className="rounded-lg shadow-sm" />
          <p className="text-[10px] font-mono text-slate-400 mt-1 uppercase">
            Valid For Vehicle: {booking.vehicleNumber}
          </p>
        </div>

        {/* Pass Details Table */}
        <div className="grid grid-cols-2 gap-3 text-xs p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Vehicle Plate</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
              {booking.vehicleNumber}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Driver Name</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
              {booking.userName || 'Driver'}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Entry Time</span>
            <span className="font-mono text-slate-700 dark:text-slate-300">
              {booking.entryTime ? new Date(booking.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pending Check-in'}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Fee</span>
            <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
              ₹{booking.totalAmount} ({booking.paymentStatus})
            </span>
          </div>
        </div>

        {/* Live Gate Scanner Simulator */}
        <div className="pt-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 text-center">
            Gate Barrier Scanner Simulators:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={scanning || isCheckedIn || isCompleted}
              onClick={() => handleSimulateScan('entry')}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <DoorOpen className="w-4 h-4" />
              <span>Simulate Entry Gate</span>
            </button>

            <button
              type="button"
              disabled={scanning || !isCheckedIn || isCompleted}
              onClick={() => handleSimulateScan('exit')}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <LogOut className="w-4 h-4" />
              <span>Simulate Exit Gate</span>
            </button>
          </div>

          {scanMessage && (
            <div className="mt-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs font-medium text-emerald-700 dark:text-emerald-300 text-center animate-fadeIn">
              {scanMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
