import React, { useState } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldAlert,
  X,
  PhoneCall,
  MapPin,
  CheckCircle2,
  Volume2,
  AlertTriangle,
  Radio
} from 'lucide-react';

export const WomenSafetySOSModal = ({ isOpen, onClose, slots = [] }) => {
  const { user } = useAuth();
  const [selectedSlot, setSelectedSlot] = useState('A-02');
  const [phone, setPhone] = useState(() => user?.phone || '+91 98765 43210');
  const [sending, setSending] = useState(false);
  const [alertSent, setAlertSent] = useState(false);
  const [activeAlert, setActiveAlert] = useState(null);

  if (!isOpen) return null;

  const womenSlots = slots.filter(s => s.type === 'women_safety');

  const handleTriggerSOS = async () => {
    setSending(true);
    try {
      const data = await api.triggerSOS({
        slotNumber: selectedSlot,
        floor: 'Floor 1',
        phone,
        userName: user?.name || 'Visitor in Women Safety Bay',
        type: 'women_safety_sos',
        locationDetails: `Women Safety Zone Pillar W-${selectedSlot.slice(-1)} (CCTV Monitored)`
      });

      if (data.success) {
        setAlertSent(true);
        setActiveAlert(data.alert);

        // Sound alert
        try {
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = audioCtx.createOscillator();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(800, audioCtx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 1.0);
          osc.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + 1.0);
        } catch (e) {}
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleReset = () => {
    setAlertSent(false);
    setActiveAlert(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-2 border-rose-500/40 overflow-hidden">
        {/* Urgent Header */}
        <div className="p-6 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-widest text-rose-100">
                Women's Safety Priority Zone
              </span>
            </div>
            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <h2 className="text-2xl font-black tracking-tight mt-2">
            Emergency SOS Assistance
          </h2>
          <p className="text-xs text-rose-100 mt-0.5">
            Direct high-priority alert linked to 24x7 Security Command Center & CCTV surveillance
          </p>
        </div>

        <div className="p-6 space-y-5">
          {!alertSent ? (
            <>
              {/* Slot Location Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Confirm Current Parking Bay Location
                </label>
                <select
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                >
                  <option value="A-02">Bay A-02 (Floor 1 - Women Safety Zone)</option>
                  <option value="A-03">Bay A-03 (Floor 1 - Women Safety Zone)</option>
                  <option value="B-02">Bay B-02 (Floor 1 - Women Safety Zone)</option>
                  <option value="C-02">Bay C-02 (Floor 2 - Women Safety Zone)</option>
                  <option value="Entrance Lobby">Main Entrance / Elevator Lobby</option>
                </select>
              </div>

              {/* Contact phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Emergency Callback Phone
                </label>
                <div className="relative">
                  <PhoneCall className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-rose-500 dark:text-white"
                  />
                </div>
              </div>

              {/* Big Red Panic Button */}
              <div className="py-2 text-center">
                <button
                  type="button"
                  disabled={sending}
                  onClick={handleTriggerSOS}
                  className="relative group w-44 h-44 mx-auto rounded-full bg-gradient-to-tr from-rose-700 via-rose-600 to-pink-500 text-white font-black text-xl tracking-wider shadow-2xl shadow-rose-600/50 flex flex-col items-center justify-center gap-1 hover:scale-105 active:scale-95 transition-all border-4 border-white dark:border-slate-900 cursor-pointer"
                >
                  <span className="absolute inset-0 rounded-full border-4 border-rose-400 animate-ping opacity-60 pointer-events-none" />
                  <ShieldAlert className="w-10 h-10" />
                  <span>PRESS SOS</span>
                  <span className="text-[10px] font-semibold text-rose-100 uppercase tracking-normal">
                    {sending ? 'Dispatching...' : 'Tap for Help'}
                  </span>
                </button>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-4 font-medium">
                  Triggers immediate security strobe siren & dispatches on-site guard patrol
                </p>
              </div>
            </>
          ) : (
            /* Emergency Dispatched View */
            <div className="text-center py-4 space-y-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto animate-bounce">
                <Radio className="w-8 h-8" />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-rose-600 text-white tracking-wider">
                  SECURITY DISPATCHED
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-2">
                  Emergency Alert Active
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  On-site patrol unit is en route to <span className="font-bold text-rose-600">{selectedSlot}</span>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-left text-xs space-y-2">
                <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300">
                  <span>Incident Reference:</span>
                  <span className="font-mono font-bold text-rose-600">{activeAlert?.alertId || 'SOS-LIVE'}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Assigned Unit:</span>
                  <span className="font-bold">Rapid Response Patrol Alpha</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Estimated Arrival:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">45 Seconds</span>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-xs text-slate-500 mb-2 font-semibold">
                  Direct Emergency Hotlines:
                </p>
                <div className="flex items-center justify-center gap-3">
                  <a
                    href="tel:1091"
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 border border-pink-300/40"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    Women Helpline: 1091
                  </a>
                  <a
                    href="tel:112"
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300/40"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    Police: 112
                  </a>
                </div>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="w-full py-2.5 px-4 text-xs font-bold rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 transition-colors"
              >
                Close & Return to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
