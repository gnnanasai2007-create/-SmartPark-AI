import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  ShieldAlert,
  Car,
  Zap,
  Activity,
  CheckCircle2,
  Clock,
  Scan
} from 'lucide-react';

export const AnalyticsDashboard = () => {
  const { activeSosAlert, lastSlotUpdate, lastOcrEvent } = useSocket();
  const [stats, setStats] = useState(null);
  const [peakData, setPeakData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [statsRes, peakRes, alertsRes] = await Promise.all([
        api.getOccupancyStats(),
        api.getPeakHourData(),
        api.getEmergencyAlerts()
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (peakRes.success) setPeakData(peakRes.data);
      if (alertsRes.success) setAlerts(alertsRes.alerts);
    } catch (err) {
      console.error('Analytics load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [lastSlotUpdate, lastOcrEvent, activeSosAlert]);

  const handleResolveAlert = async (alertId) => {
    try {
      const res = await api.resolveAlert(alertId, {
        dispatchedGuard: 'Patrol Alpha',
        notes: 'Security verified safe on site.'
      });
      if (res.success) {
        setAlerts(prev => prev.map(a => a.alertId === alertId ? { ...a, status: 'resolved' } : a));
      }
    } catch (e) {
      alert('Failed to resolve alert: ' + e.message);
    }
  };

  if (loading || !stats) {
    return (
      <div className="p-12 text-center glass-panel rounded-2xl animate-pulse">
        <Activity className="w-8 h-8 text-emerald-500 mx-auto mb-2 animate-spin-slow" />
        <p className="text-xs text-slate-500">Loading live facility analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Active Emergency Alert Ribbon (If Active SOS) */}
      {alerts.some(a => a.status === 'active') && (
        <div className="p-4 rounded-2xl bg-rose-600 text-white shadow-xl shadow-rose-600/30 flex items-center justify-between gap-4 animate-bounce">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6" />
            <div>
              <h4 className="text-sm font-black tracking-wide">
                ACTIVE WOMEN'S SAFETY SOS ALARM DETECTED
              </h4>
              <p className="text-xs text-rose-100">
                Security response active at Bay{' '}
                {alerts.find(a => a.status === 'active')?.slotNumber}. Check incident board below.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleResolveAlert(alerts.find(a => a.status === 'active')?.alertId)}
            className="px-4 py-1.5 rounded-xl bg-white text-rose-700 font-extrabold text-xs shadow-md hover:bg-rose-50"
          >
            Acknowledge & Resolve
          </button>
        </div>
      )}

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Occupancy */}
        <div className="p-5 rounded-2xl glass-panel relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Occupancy Rate
            </span>
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-slate-900 dark:text-white">
              {stats.occupancyRate}%
            </span>
            <span className="text-xs text-slate-500">
              ({stats.occupied}/{stats.total} Bays)
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 mt-3 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${stats.occupancyRate}%` }}
            />
          </div>
        </div>

        {/* Revenue */}
        <div className="p-5 rounded-2xl glass-panel relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-slate-900 dark:text-white">
              ₹{stats.totalRevenue.toLocaleString()}
            </span>
            <span className="text-xs text-emerald-600 font-semibold">+18.4% today</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Dynamic hourly rates + EV fast charge</p>
        </div>

        {/* Available Bays */}
        <div className="p-5 rounded-2xl glass-panel relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Available Slots
            </span>
            <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              {stats.available}
            </span>
            <span className="text-xs text-slate-500">Vacant Right Now</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {stats.reserved} bays currently on reserve hold
          </p>
        </div>

        {/* EV & Special Zones */}
        <div className="p-5 rounded-2xl glass-panel relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              EV & Priority Wings
            </span>
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
              <Zap className="w-4 h-4 text-blue-500" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-blue-600 dark:text-blue-400">
              {stats.evActive}/{stats.evSlots}
            </span>
            <span className="text-xs text-slate-500">EVs Charging</span>
          </div>
          <p className="text-[11px] text-pink-600 dark:text-pink-400 font-medium mt-2">
            {stats.womenSafetyAvailable} Women Safety Bays Open
          </p>
        </div>
      </div>

      {/* Peak-Hour Occupancy Distribution Chart */}
      <div className="rounded-3xl glass-panel p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-500" />
              <span>24-Hour Peak Occupancy Curve</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Hourly parking ingress load distribution analyzed by computer vision telemetry
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            Peak Rush: 09:00 - 11:00 & 18:00 - 19:30
          </span>
        </div>

        {/* CSS-based responsive histogram bar chart */}
        <div className="pt-4">
          <div className="grid grid-cols-13 gap-1 sm:gap-2 items-end h-44 border-b border-slate-200 dark:border-slate-800 pb-2">
            {peakData && peakData.map((item) => (
              <div key={item.hour} className="flex flex-col items-center gap-1.5 group h-full justify-end">
                {/* Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px] font-mono font-bold bg-slate-900 text-white px-1 py-0.5 rounded shadow-sm mb-1">
                  {item.occupancy}%
                </div>
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-emerald-600 to-teal-400 group-hover:from-emerald-500 group-hover:to-cyan-400 transition-all cursor-pointer"
                  style={{ height: `${item.occupancy}%` }}
                />
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 rotate-45 sm:rotate-0 mt-1">
                  {item.hour.slice(0, 2)}h
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Emergency Incidents & SOS Response Table */}
      <div className="rounded-3xl glass-panel p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <span>Emergency SOS Incident Log</span>
          </h3>
          <span className="text-xs text-slate-400">Live Guard Dispatch Records</span>
        </div>

        {alerts.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">
            No emergency alerts triggered today. All zones secure.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold uppercase">
                <tr>
                  <th className="p-3">Ref ID</th>
                  <th className="p-3">Bay Location</th>
                  <th className="p-3">Triggered By</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Time</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {alerts.map((a) => (
                  <tr key={a._id || a.alertId}>
                    <td className="p-3 font-mono font-bold text-rose-600">{a.alertId}</td>
                    <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                      {a.slotNumber} ({a.floor})
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">
                      {a.userName} {a.phone ? `(${a.phone})` : ''}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          a.status === 'active'
                            ? 'bg-rose-600 text-white animate-pulse'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-500">
                      {new Date(a.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="p-3 text-right">
                      {a.status === 'active' ? (
                        <button
                          onClick={() => handleResolveAlert(a.alertId)}
                          className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
                        >
                          Resolve Alert
                        </button>
                      ) : (
                        <span className="text-emerald-500 font-semibold flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                        </span>
                      )}
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
