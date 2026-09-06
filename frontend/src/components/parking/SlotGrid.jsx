import React, { useState } from 'react';
import { SlotCard } from './SlotCard';
import { Layers, Filter, CheckCircle2, Car, Zap, Shield, AlertOctagon } from 'lucide-react';

export const SlotGrid = ({ slots, onReserve, onToggleStatus, selectedFloor, setSelectedFloor }) => {
  const [filterType, setFilterType] = useState('all');

  const floors = ['Floor 1', 'Floor 2'];

  const filterOptions = [
    { id: 'all', label: 'All Bays', count: slots.length },
    { id: 'available', label: '🟢 Available', count: slots.filter(s => s.status === 'available').length },
    { id: 'occupied', label: '🔴 Occupied', count: slots.filter(s => s.status === 'occupied').length },
    { id: 'ev', label: '⚡ EV Charging', count: slots.filter(s => s.type === 'ev').length },
    { id: 'women_safety', label: "🌸 Women's Safety", count: slots.filter(s => s.type === 'women_safety').length },
    { id: 'emergency', label: '🚨 Emergency Only', count: slots.filter(s => s.type === 'emergency').length },
  ];

  const filteredSlots = slots.filter((slot) => {
    // Floor filter
    if (selectedFloor && slot.floor.toLowerCase() !== selectedFloor.toLowerCase()) {
      return false;
    }

    // Type or status filter
    if (filterType === 'all') return true;
    if (filterType === 'available') return slot.status === 'available';
    if (filterType === 'occupied') return slot.status === 'occupied';
    return slot.type === filterType;
  });

  return (
    <div className="space-y-5">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl glass-panel">
        {/* Floor Selection Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
          <div className="flex items-center gap-1 px-2.5 text-xs font-bold text-slate-500 uppercase">
            <Layers className="w-3.5 h-3.5" />
            <span>Floor:</span>
          </div>
          {floors.map((fl) => (
            <button
              key={fl}
              onClick={() => setSelectedFloor(fl)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                selectedFloor === fl
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {fl}
            </button>
          ))}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {filterOptions.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`whitespace-nowrap px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                filterType === f.id
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>
      </div>

      {/* Visual Color Status Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-xs rounded-xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
        <span className="font-bold text-slate-500 text-[11px] uppercase tracking-wider">
          Color Status Key:
        </span>
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" /> Green = Available
          </span>
          <span className="flex items-center gap-1.5 font-medium text-rose-600 dark:text-rose-400">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm" /> Red = Occupied
          </span>
          <span className="flex items-center gap-1.5 font-medium text-amber-600 dark:text-amber-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm" /> Yellow = Reserved
          </span>
          <span className="flex items-center gap-1.5 font-medium text-blue-600 dark:text-blue-400">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm" /> Blue = EV Fast Charging
          </span>
          <span className="flex items-center gap-1.5 font-medium text-pink-600 dark:text-pink-400">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500 shadow-sm" /> Pink = Women Safety
          </span>
          <span className="flex items-center gap-1.5 font-medium text-red-600 dark:text-red-400">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-sm" /> Red = Emergency Bay
          </span>
        </div>
      </div>

      {/* Slots Grid */}
      {filteredSlots.length === 0 ? (
        <div className="p-12 text-center rounded-2xl glass-panel">
          <Car className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-50" />
          <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">
            No parking slots found matching your filter.
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Try switching floors or clearing your vehicle type filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredSlots.map((slot) => (
            <SlotCard
              key={slot._id || slot.slotNumber}
              slot={slot}
              onReserve={onReserve}
              onToggleStatus={onToggleStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
};
