import React from 'react';
import {
  Car,
  Zap,
  Shield,
  AlertOctagon,
  Accessibility,
  Clock,
  Navigation,
  CheckCircle2,
  Lock,
  ArrowRightLeft
} from 'lucide-react';

export const SlotCard = ({ slot, onReserve, onToggleStatus }) => {
  const {
    slotNumber,
    floor,
    type,
    status,
    currentVehicle,
    hourlyRate,
    distanceToEntrance,
    distanceToElevator,
    isEvActiveCharging,
    chargingLevel,
    sensorConfidence
  } = slot;

  // Status visual attributes
  let statusBadge = {
    text: 'Available',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    dot: 'bg-emerald-500',
    glow: 'slot-available',
    border: 'border-emerald-500/40'
  };

  if (status === 'occupied') {
    statusBadge = {
      text: 'Occupied',
      bg: 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30',
      dot: 'bg-rose-500',
      glow: 'slot-occupied',
      border: 'border-rose-500/50'
    };
  } else if (status === 'reserved') {
    statusBadge = {
      text: 'Reserved',
      bg: 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30',
      dot: 'bg-amber-500',
      glow: 'slot-reserved',
      border: 'border-amber-500/50'
    };
  }

  // Type styling
  let typeConfig = {
    label: 'Standard',
    icon: Car,
    color: 'text-slate-500 dark:text-slate-400',
    badge: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
  };

  if (type === 'ev') {
    typeConfig = {
      label: 'EV Fast Charge',
      icon: Zap,
      color: 'text-blue-500',
      badge: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-300/40'
    };
  } else if (type === 'women_safety') {
    typeConfig = {
      label: "Women's Safety",
      icon: Shield,
      color: 'text-pink-500',
      badge: 'bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 border-pink-300/40'
    };
  } else if (type === 'emergency') {
    typeConfig = {
      label: 'Emergency / Ambulance',
      icon: AlertOctagon,
      color: 'text-red-600',
      badge: 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-300/40'
    };
  } else if (type === 'handicap') {
    typeConfig = {
      label: 'Accessible / PwD',
      icon: Accessibility,
      color: 'text-sky-500',
      badge: 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border-sky-300/40'
    };
  }

  const TypeIcon = typeConfig.icon;

  return (
    <div
      className={`group relative flex flex-col justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 transition-all duration-300 hover:scale-[1.02] shadow-sm hover:shadow-xl ${statusBadge.glow} ${statusBadge.border}`}
    >
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
              {slotNumber}
            </span>
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${typeConfig.badge}`}>
              {typeConfig.label}
            </span>
          </div>

          {/* Status Dot */}
          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${statusBadge.bg}`}>
            <span className={`w-2 h-2 rounded-full ${statusBadge.dot} ${status === 'available' ? 'animate-ping' : ''}`} />
            <span>{statusBadge.text}</span>
          </div>
        </div>

        {/* Floor and Distance Meta */}
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-3">
          <span className="flex items-center gap-1">
            <Navigation className="w-3.5 h-3.5 text-emerald-500" />
            {distanceToEntrance || 20}m to Gate
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            {floor}
          </span>
        </div>

        {/* Vehicle Occupancy Graphic */}
        <div className="my-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-lg ${
                status === 'occupied'
                  ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400'
                  : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
              }`}
            >
              <TypeIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                {status === 'occupied' ? 'Occupied Vehicle' : 'Status Info'}
              </p>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                {status === 'occupied' ? (currentVehicle || 'Vehicle Parked') : 'Bay Vacant & Clean'}
              </p>
            </div>
          </div>

          {type === 'ev' && status === 'occupied' && (
            <div className="text-right">
              <span className="text-[10px] text-blue-500 font-semibold block">⚡ 60kW Charging</span>
              <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 font-mono">
                {chargingLevel || 65}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Rate and Action Buttons */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Hourly Fee</span>
          <span className="text-sm font-extrabold text-slate-900 dark:text-white">
            {hourlyRate > 0 ? `₹${hourlyRate}/hr` : 'Free Access'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Quick Simulation Toggle */}
          <button
            onClick={() => onToggleStatus(slot)}
            title="Simulate vehicle arrival / departure"
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>

          {/* Reserve CTA */}
          {status === 'available' ? (
            <button
              onClick={() => onReserve(slot)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Reserve</span>
            </button>
          ) : (
            <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed">
              Occupied
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
