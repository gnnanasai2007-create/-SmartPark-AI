import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  TrendingUp,
  BrainCircuit,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Info
} from 'lucide-react';

export const PredictiveAvailability = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadForecast() {
      try {
        const res = await api.getPredictiveAvailability();
        if (res.success) {
          setData(res);
        }
      } catch (e) {
        console.error('Failed to load forecast:', e);
      } finally {
        setLoading(false);
      }
    }
    loadForecast();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center glass-panel rounded-2xl animate-pulse">
        <BrainCircuit className="w-8 h-8 text-emerald-500 mx-auto mb-2 animate-spin-slow" />
        <p className="text-xs text-slate-500">Running AI occupancy prediction model...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-6 rounded-3xl glass-panel space-y-5 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-lg shadow-purple-500/25">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                AI Predictive Parking Availability
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-300/40">
                Machine Learning Forecast
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Heuristic neural model forecasting slot vacancy rates based on day, hour, and traffic patterns
            </p>
          </div>
        </div>

        {/* Congestion Index Tag */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Current Lot Congestion
            </span>
            <span
              className={`text-sm font-extrabold font-mono ${
                data.congestionIndex === 'HIGH'
                  ? 'text-rose-500'
                  : data.congestionIndex === 'MODERATE'
                  ? 'text-amber-500'
                  : 'text-emerald-500'
              }`}
            >
              {data.congestionIndex} LOAD ({data.currentAvailable} Bays Free)
            </span>
          </div>
        </div>
      </div>

      {/* AI Recommendation Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-transparent border border-purple-500/20 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0" />
          <div>
            <span className="text-xs font-extrabold text-slate-900 dark:text-white">
              AI Recommendation: Best Arrival Window is {data.bestTimeToPark}
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Confidence level {data.aiModelAccuracy} based on 10,000+ historical vehicle ingress/egress logs
            </p>
          </div>
        </div>
      </div>

      {/* Hourly Forecast Curve Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {data.forecast.map((item) => (
          <div
            key={item.time}
            className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between space-y-3 transition-transform hover:scale-105 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-slate-700 dark:text-slate-300">
                {item.time}
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  item.statusColor === 'green'
                    ? 'bg-emerald-500'
                    : item.statusColor === 'yellow'
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
              />
            </div>

            {/* Occupancy Bar */}
            <div>
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Vacancy</span>
                <span className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400">
                  {item.predictedAvailableRate}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    item.statusColor === 'green'
                      ? 'bg-emerald-500'
                      : item.statusColor === 'yellow'
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${item.predictedAvailableRate}%` }}
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/50 dark:border-slate-700/50 text-center">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">
                ~{item.estimatedFreeSlots} Free Bays
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
