import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { Navbar } from './components/common/Navbar';
import { AuthModal } from './components/common/AuthModal';
import { NotificationToast } from './components/common/NotificationToast';
import { WomenSafetySOSModal } from './components/emergency/WomenSafetySOSModal';
import { LiveSlots } from './pages/LiveSlots';
import { CCTVView } from './pages/CCTVView';
import { MyBookings } from './pages/MyBookings';
import { AdminDashboard } from './pages/AdminDashboard';
import { ParkingLeafletMap } from './components/map/ParkingLeafletMap';
import { Car, ShieldCheck, Heart, Sparkles } from 'lucide-react';

function AppContent() {
  const [activeTab, setActiveTab] = useState('slots');
  const [authOpen, setAuthOpen] = useState(false);
  const [sosOpen, setSosOpen] = useState(false);
  const [activePass, setActivePass] = useState(null);

  const handleBookingCreated = (booking) => {
    setActivePass(booking);
    setActiveTab('bookings');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setAuthOpen(true)}
        onOpenSOS={() => setSosOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'slots' && (
          <LiveSlots onBookingCreated={handleBookingCreated} />
        )}

        {activeTab === 'cctv' && (
          <CCTVView />
        )}

        {activeTab === 'map' && (
          <ParkingLeafletMap onSelectSlot={(slot) => setActiveTab('slots')} />
        )}

        {activeTab === 'bookings' && (
          <MyBookings
            activePass={activePass}
            onNavigateSlots={() => setActiveTab('slots')}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard />
        )}
      </main>

      {/* Footer */}
      <footer className="glass-panel border-t border-slate-200/80 dark:border-slate-800/80 py-6 mt-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
              SmartPark AI
            </span>
            <span>•</span>
            <span>Computer Vision & Intelligent Slot Detection System</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              24x7 Safety Guard Network
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              YOLOv8 + OpenCV + OCR
            </span>
          </div>
        </div>
      </footer>

      {/* Modals & Real-Time Toasts */}
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      <WomenSafetySOSModal isOpen={sosOpen} onClose={() => setSosOpen(false)} />
      <NotificationToast />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <AppContent />
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
