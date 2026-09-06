import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useSocket } from '../context/SocketContext';
import {
  Car,
  Zap,
  Shield,
  Clock,
  Compass,
  QrCode,
  Camera,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ShieldAlert,
  Radio
} from 'lucide-react';

export const Home = ({ onNavigate, onOpenSOS }) => {
  const { lastSlotUpdate } = useSocket();
  const [stats, setStats] = useState({
    total: 20,
    available: 13,
    occupied: 6,
    occupancyRate: 30,
    evSlots: 4,
    womenSafetyAvailable: 3
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.getOccupancyStats();
        if (res.success) setStats(res.stats);
      } catch (e) {}
    }
    loadStats();
  }, [lastSlotUpdate]);

  return (
    <div className="space-y-12 py-4 animate-fadeIn">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden glass-panel p-8 sm:p-12 border border-slate-200/80 dark:border-slate-800">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-blue-500/10 dark:bg-blue-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300/40">
            <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span>Autonomous AI-Powered Smart Parking v2.0</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
            Next-Gen Parking with{' '}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400 bg-clip-text text-transparent">
              Vision AI & OCR
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
            Real-time vehicle detection using YOLO and OpenCV, dynamic QR-code barrier passes,
            machine learning occupancy forecasts, EV fast charging, and priority Women’s Safety Zones.
          </p>

          {/* Quick CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('slots')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-xl shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-all"
            >
              <Car className="w-4 h-4" />
              <span>View Live Slots</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('cctv')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-all shadow-sm"
            >
              <Camera className="w-4 h-4 text-emerald-500" />
              <span>AI CCTV Surveillance</span>
            </button>

            <button
              onClick={onOpenSOS}
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-lg shadow-rose-600/30 transition-all hover:scale-105 active:scale-95 animate-pulse-slow"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Women's Safety SOS</span>
            </button>
          </div>
        </div>

        {/* Live Facility Ticker Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10 pt-8 border-t border-slate-200/60 dark:border-slate-800/80">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase block">Available Right Now</span>
            <span className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              {stats.available} / {stats.total}
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase block">Occupancy Load</span>
            <span className="text-3xl font-black font-mono text-slate-900 dark:text-white">
              {stats.occupancyRate}%
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase block">EV Fast Chargers</span>
            <span className="text-3xl font-black font-mono text-blue-600 dark:text-blue-400">
              {stats.evSlots} Superchargers
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase block">Women Safety Bays</span>
            <span className="text-3xl font-black font-mono text-pink-600 dark:text-pink-400">
              {stats.womenSafetyAvailable} Open
            </span>
          </div>
        </div>
      </section>

      {/* Feature Grid Highlights */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Comprehensive Smart Parking Ecosystem
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Engineered for high-traffic facilities, commercial hubs, airports, and smart city infrastructure
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl glass-panel space-y-3 hover:border-emerald-500/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Computer Vision & YOLO Detection
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              OpenCV polygon ROI mapping automatically classifies parking slot states with 98%+ precision
              and instantly syncs status to drivers via WebSockets.
            </p>
          </div>

          <div className="p-6 rounded-3xl glass-panel space-y-3 hover:border-emerald-500/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Dynamic QR Barrier Passes
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Contactless digital entry and exit passes with auto-calculated duration timers and instant
              receipt generation for frictionless access.
            </p>
          </div>

          <div className="p-6 rounded-3xl glass-panel space-y-3 hover:border-emerald-500/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-400 flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Women's Safety SOS Zones
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Dedicated well-lit parking bays adjacent to elevators equipped with one-touch SOS panic
              dispatch and live CCTV surveillance beacons.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
