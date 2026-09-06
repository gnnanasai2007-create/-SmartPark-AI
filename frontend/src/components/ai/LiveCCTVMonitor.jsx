import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import {
  Camera,
  Radio,
  Eye,
  Scan,
  Sparkles,
  ArrowRight,
  Shield,
  Activity,
  Cpu,
  RefreshCw
} from 'lucide-react';

export const LiveCCTVMonitor = () => {
  const { lastOcrEvent, lastSlotUpdate } = useSocket();
  const [logs, setLogs] = useState([]);
  const [streamOnline, setStreamOnline] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [simMessage, setSimMessage] = useState('');

  // Check if Python MJPEG stream on port 5050 is active
  useEffect(() => {
    const img = new Image();
    img.onload = () => setStreamOnline(true);
    img.onerror = () => setStreamOnline(false);
    img.src = 'http://localhost:5050/snapshot?' + Date.now();
  }, []);

  // Fetch initial plate logs
  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await api.getPlateLogs(10);
        if (res.success) setLogs(res.logs);
      } catch (e) {}
    }
    fetchLogs();
  }, []);

  // Append real-time OCR events from socket
  useEffect(() => {
    if (lastOcrEvent) {
      setLogs(prev => [lastOcrEvent, ...prev.slice(0, 9)]);
    }
  }, [lastOcrEvent]);

  const handleSimulate = async (action) => {
    setSimulating(true);
    setSimMessage('');
    try {
      const res = await api.simulateAIEvent(action);
      if (res.success) {
        setSimMessage(res.message);
      }
    } catch (e) {
      setSimMessage('Simulation request failed.');
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl glass-panel">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                AI Vision Surveillance & CCTV Analytics
              </h2>
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40">
                <Radio className="w-2.5 h-2.5 text-emerald-500 animate-pulse" />
                YOLOv8 + OpenCV
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Autonomous occupancy classification & automatic license plate OCR logging
            </p>
          </div>
        </div>

        {/* AI Performance Metrics */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Model Precision</span>
            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">98.4%</span>
          </div>
          <div className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Inference Speed</span>
            <span className="text-xs font-black text-blue-600 dark:text-blue-400 font-mono">24ms / frame</span>
          </div>
        </div>
      </div>

      {/* Main Screen Layout: Camera View + Live OCR Readouts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CCTV Camera Stream Feed */}
        <div className="lg:col-span-2 rounded-2xl glass-panel p-4 overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                CAM-01 • NORTH DECK PARKING BAYS
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-500">
              1080p • 30 FPS • H.264
            </span>
          </div>

          {/* Video Container */}
          <div className="relative my-3 rounded-xl overflow-hidden bg-slate-950 aspect-video flex items-center justify-center border border-slate-800 shadow-inner group">
            {streamOnline ? (
              <img
                src="http://localhost:5050/video_feed"
                alt="SmartPark AI CCTV Stream"
                className="w-full h-full object-cover"
              />
            ) : (
              /* High-fidelity simulated vision canvas */
              <div className="relative w-full h-full p-4 flex flex-col justify-between bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
                {/* OSD Header */}
                <div className="flex items-center justify-between text-xs font-mono text-emerald-400">
                  <span>[LIVE FEED] SMARTPARK AI SURVEILLANCE • WING-A</span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    REC 24x7
                  </span>
                </div>

                {/* Simulated 2D Parking Bays with YOLO Bounding Boxes */}
                <div className="grid grid-cols-4 gap-2 my-auto">
                  {[
                    { id: 'A-01', occ: false, type: 'emergency', plate: null },
                    { id: 'A-02', occ: false, type: 'women_safety', plate: null },
                    { id: 'A-03', occ: true, type: 'women_safety', plate: 'KA-04-MB-2210' },
                    { id: 'A-04', occ: false, type: 'ev', plate: null },
                    { id: 'A-05', occ: true, type: 'ev', plate: 'TS-09-EV-8890' },
                    { id: 'A-06', occ: true, type: 'regular', plate: 'DL-01-AB-1234' },
                    { id: 'A-07', occ: false, type: 'regular', plate: null },
                    { id: 'A-08', occ: true, type: 'regular', plate: 'MH-12-PQ-9009' }
                  ].map((s) => (
                    <div
                      key={s.id}
                      className={`relative h-28 rounded-lg border-2 p-1.5 flex flex-col justify-between font-mono text-[10px] ${
                        s.occ
                          ? 'border-rose-500 bg-rose-950/20 text-rose-300'
                          : s.type === 'ev'
                          ? 'border-blue-500 bg-blue-950/20 text-blue-300'
                          : s.type === 'women_safety'
                          ? 'border-pink-500 bg-pink-950/20 text-pink-300'
                          : 'border-emerald-500 bg-emerald-950/20 text-emerald-300'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold">{s.id}</span>
                        <span>{s.occ ? 'CAR 98%' : 'VACANT'}</span>
                      </div>

                      {s.occ ? (
                        <div className="p-1 rounded bg-slate-900/80 border border-slate-700 text-center">
                          <span className="text-[9px] text-amber-300 font-bold block">
                            PLATE OCR
                          </span>
                          <span className="text-[10px] text-white font-mono font-black">
                            {s.plate}
                          </span>
                        </div>
                      ) : (
                        <div className="text-center text-emerald-400 font-bold opacity-60 text-xs my-auto">
                          AVAILABLE
                        </div>
                      )}

                      <div className="text-[9px] text-right opacity-70">
                        IoU: {s.occ ? '0.94' : '0.00'}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer OSD */}
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-slate-800/80 pt-2">
                  <span>YOLO Bounding Box • OCR Active</span>
                  <span>Click controls below to trigger live detection events</span>
                </div>
              </div>
            )}
          </div>

          {/* AI Simulation Controls */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Interactive AI Detection Simulator:
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={simulating}
                  onClick={() => handleSimulate('random_arrival')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  <Scan className="w-3.5 h-3.5" />
                  <span>Simulate Vehicle Arrival (AI OCR)</span>
                </button>

                <button
                  type="button"
                  disabled={simulating}
                  onClick={() => handleSimulate('random_departure')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Simulate Vehicle Departure</span>
                </button>
              </div>
            </div>

            {simMessage && (
              <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300 animate-fadeIn">
                ⚡ {simMessage}
              </div>
            )}
          </div>
        </div>

        {/* Live Plate OCR Recognition Ticker */}
        <div className="rounded-2xl glass-panel p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Scan className="w-4 h-4 text-emerald-500" />
                <span>Real-Time Plate OCR Logs</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                Live Feed
              </span>
            </div>

            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {logs.map((log) => (
                <div
                  key={log._id || log.logId}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-2 hover:border-emerald-500/40 transition-colors"
                >
                  <div>
                    <span className="font-mono text-sm font-extrabold text-slate-900 dark:text-white">
                      {log.plateNumber}
                    </span>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <span className="capitalize">{log.vehicleType || 'Sedan'}</span>
                      <span>•</span>
                      <span>{log.gate || 'North Gate'}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-md ${
                        log.eventType === 'entry'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {log.eventType}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                      {log.confidence ? `${Math.round(log.confidence)}% conf` : '98% conf'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[11px] text-slate-400">
              CCTV License plate recognition runs continuously via OpenCV & OCR pipeline
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
