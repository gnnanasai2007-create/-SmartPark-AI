import React, { useState } from 'react';
import { api } from '../../services/api';
import { Compass, Zap, Shield, Sparkles, Navigation, ArrowRight } from 'lucide-react';

export const NearestSlotFinder = ({ onSelectSlot, currentFloor }) => {
  const [preference, setPreference] = useState('entrance');
  const [slotType, setSlotType] = useState('all');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await api.getNearestSlot({
        type: slotType,
        preference,
        floor: currentFloor || 'all'
      });

      if (data.success) {
        setResult(data.slot);
      } else {
        setError(data.message || 'No available slots matching this criteria.');
      }
    } catch (err) {
      setError(err.message || 'Error searching nearest slot.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-cyan-950/30 border border-emerald-500/20 shadow-lg backdrop-blur">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Title and description */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-500/30">
            <Compass className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span>AI Smart Slot Finder</span>
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Real-Time Route
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Instantly navigates you to the closest vacant bay based on your vehicle and proximity needs
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Preference Pill */}
          <select
            value={preference}
            onChange={(e) => setPreference(e.target.value)}
            className="text-xs font-semibold px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="entrance">Closest to Entrance</option>
            <option value="elevator">Closest to Elevator</option>
          </select>

          {/* Type Pill */}
          <select
            value={slotType}
            onChange={(e) => setSlotType(e.target.value)}
            className="text-xs font-semibold px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Any Vehicle Type</option>
            <option value="ev">⚡ EV Fast Charging</option>
            <option value="women_safety">🌸 Women's Safety Zone</option>
            <option value="handicap">♿ Accessible (PwD)</option>
          </select>

          {/* Action button */}
          <button
            onClick={handleSearch}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <span>{loading ? 'Analyzing...' : 'Find Nearest Slot'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Results banner */}
      {result && (
        <div className="mt-4 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-500/40 flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-mono font-extrabold text-lg">
              {result.slotNumber}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                Best Available Match: <span className="text-emerald-600 dark:text-emerald-400">{result.slotNumber}</span> ({result.floor})
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Only {result.distanceToEntrance || 15}m from entrance • Rate: ₹{result.hourlyRate}/hr
              </p>
            </div>
          </div>
          <button
            onClick={() => onSelectSlot(result)}
            className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-transform hover:scale-105"
          >
            Reserve {result.slotNumber}
          </button>
        </div>
      )}

      {error && (
        <div className="mt-3 text-xs text-rose-500 dark:text-rose-400 font-medium">
          {error}
        </div>
      )}
    </div>
  );
};
