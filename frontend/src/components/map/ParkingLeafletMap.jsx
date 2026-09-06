import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Compass, Zap, Shield, Car } from 'lucide-react';

// Custom SVG Icons for Leaflet markers
const createCustomIcon = (color, label) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 800;
        font-size: 11px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.35);
        border: 2px solid white;
      ">
        ${label}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

const entranceIcon = createCustomIcon('#10B981', 'IN');
const evIcon = createCustomIcon('#3B82F6', '⚡');
const womenIcon = createCustomIcon('#EC4899', '🌸');
const emergencyIcon = createCustomIcon('#DC2626', '🚨');

export const ParkingLeafletMap = ({ onSelectSlot }) => {
  const facilityCenter = [12.9716, 77.5946];

  // Route simulation coordinates from entrance to slot A-04 (EV)
  const routePath = [
    [12.9710, 77.5940], // Approach road
    [12.9714, 77.5944], // Security Gate
    [12.9716, 77.5946], // Main Entrance
    [12.9718, 77.5948], // Floor 1 Aisle
    [12.9719, 77.5949]  // Bay A-04
  ];

  return (
    <div className="rounded-3xl glass-panel p-5 space-y-4 animate-fadeIn overflow-hidden">
      {/* Map Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500 text-white shadow-md shadow-emerald-500/30">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Interactive Facility Map & Navigation</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                GPS + Indoor Beacon
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Turn-by-turn guidance to your reserved bay from the access barrier
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Gate In
          </span>
          <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> EV Wing
          </span>
          <span className="flex items-center gap-1 text-pink-600 dark:text-pink-400">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500" /> Women Safe
          </span>
          <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600" /> Emergency
          </span>
        </div>
      </div>

      {/* Map Container */}
      <div className="w-full h-[450px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner z-0">
        <MapContainer
          center={facilityCenter}
          zoom={17}
          scrollWheelZoom={false}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Facility Geofence Circle */}
          <Circle
            center={facilityCenter}
            radius={85}
            pathOptions={{ color: '#10B981', fillColor: '#10B981', fillOpacity: 0.15 }}
          />

          {/* Simulated Ingress Navigation Line */}
          <Polyline
            positions={routePath}
            pathOptions={{ color: '#3B82F6', weight: 4, dashArray: '6, 8' }}
          />

          {/* Main Entrance Marker */}
          <Marker position={[12.9716, 77.5946]} icon={entranceIcon}>
            <Popup>
              <div className="text-xs p-1 font-sans">
                <p className="font-extrabold text-emerald-600 text-sm">SmartPark North Barrier</p>
                <p className="text-slate-600 mt-1">Automatic Fastag / QR Code Gate Scanner</p>
                <p className="font-bold mt-1 text-slate-800">Clearance Height: 2.8m</p>
              </div>
            </Popup>
          </Marker>

          {/* Women Safety Bay Marker */}
          <Marker position={[12.9718, 77.5947]} icon={womenIcon}>
            <Popup>
              <div className="text-xs p-1 font-sans">
                <p className="font-extrabold text-pink-600 text-sm">Women Safety Zone (Bay A-02/03)</p>
                <p className="text-slate-600 mt-1">24x7 High-Lux CCTV Monitored + SOS Panic Pillar</p>
                <p className="font-bold text-slate-800">Distance to Elevator: 12m</p>
              </div>
            </Popup>
          </Marker>

          {/* EV Charging Station Marker */}
          <Marker position={[12.9719, 77.5949]} icon={evIcon}>
            <Popup>
              <div className="text-xs p-1 font-sans">
                <p className="font-extrabold text-blue-600 text-sm">EV Fast Charging Wing (Bay A-04/05)</p>
                <p className="text-slate-600 mt-1">60kW CCS2 DC Fast Chargers</p>
                <p className="font-bold text-emerald-600">Status: Bay A-04 VACANT</p>
              </div>
            </Popup>
          </Marker>

          {/* Emergency Bay Marker */}
          <Marker position={[12.9715, 77.5945]} icon={emergencyIcon}>
            <Popup>
              <div className="text-xs p-1 font-sans">
                <p className="font-extrabold text-red-600 text-sm">Emergency Vehicle Bay (Bay A-01)</p>
                <p className="text-slate-600 mt-1">Reserved exclusively for Ambulance & Fire Response</p>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* Navigation Banner */}
      <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <Navigation className="w-4 h-4 text-blue-500 flex-shrink-0 animate-bounce" />
          <span>Active GPS Path: Follow blue route from North Gate to Parking Wing A</span>
        </div>
        <span className="font-mono font-bold text-slate-500">12.9716° N, 77.5946° E</span>
      </div>
    </div>
  );
};
