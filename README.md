# SmartPark AI – Intelligent Smart Parking Detection System 🅿️🤖

SmartPark AI is a full-stack smart parking detection and management platform. It uses **OpenCV & YOLO** for real-time computer vision vehicle detection, **License Plate Recognition (OCR)** for barrier logging, **Socket.IO** for live slot occupancy telemetry, and **Leaflet Maps** for GPS and indoor facility navigation.

---

## 🌟 Key Features

### 👤 Driver & User Features
- **Live Parking Bay Availability**: Real-time 2D floor grid showing slot status across Floor 1, Floor 2, and EV wings.
- **AI Smart Nearest Slot Finder**: Automatically locates the closest available bay based on entrance or elevator proximity and vehicle type (Standard, EV, Women's Safety, Accessible).
- **One-Click Bay Reservation**: Select duration (1h, 2h, 4h, 8h) with instant dynamic rate calculation.
- **Dynamic QR Code Pass**: Digital boarding pass with QR code for entry and exit barrier gate scanners.
- **Active Parking Timer & Dynamic Fee Meter**: Real-time progressive fee counter that tracks elapsed duration down to the second.
- **Parking History & Digital Receipts**: Complete log of all past bookings with vehicle plates, timestamps, and fees.

### 🤖 AI & Computer Vision (OpenCV + YOLO + OCR)
- **Real-Time CCTV Vehicle Detection**: Monitors parking bay polygon regions of interest (ROI), detects vehicle presence, and calculates occupancy ratio (IoU).
- **Automated Slot Status Sync**: Automatically toggles slot status between **Available** and **Occupied** via REST/WebSockets without human intervention.
- **License Plate Recognition (OCR)**: Extracts and normalizes vehicle license plates upon barrier arrival and departure.
- **Live MJPEG Surveillance Stream**: Real-time camera feed with on-screen YOLO bounding boxes, confidence tags, and plate readouts.

### 🏆 Hackathon Unique Features
- **AI Predictive Availability Engine**: Machine learning heuristic forecasting slot vacancy % and congestion index for the next 6 hours, recommending the optimal arrival window.
- **Women's Safety Parking Zone**: Dedicated well-lit bays adjacent to elevators with an **Emergency SOS Panic Button** that triggers security sirens, GPS pin drop, and priority admin dispatch.
- **EV Fast Charging Bays**: Monitors active EV chargers with live battery % tracking and connection surcharges.
- **Emergency Vehicle Reserved Bays**: Dedicated bays for ambulances and fire response.
- **Interactive Leaflet Facility Map**: GPS coordinates (12.9716° N, 77.5946° E) with custom pins, entrance barrier tags, and simulated ingress navigation route.

### 🛡️ Admin Control Center
- **Bay Management (CRUD)**: Add new parking bays, edit rates, assign types (EV, Women Safety, Emergency), and delete slots.
- **Live Occupancy Analytics**: Visual metrics for occupancy rate, active bookings, and total revenue.
- **24-Hour Peak Occupancy Histogram**: Hourly load curves identifying facility rush hours.
- **Emergency SOS Incident Board**: Live incoming panic signals with 1-click acknowledge and security patrol dispatch.
- **Real-Time OCR Scan Logs**: Audit trail of every vehicle plate recognized by CCTV cameras.

---

## 🎨 UI Color Design Language

| Color | Hex | Parking Status | Description |
| :--- | :--- | :--- | :--- |
| 🟢 **Green** | `#10B981` | **Available** | Clean, vacant parking slot ready for immediate parking |
| 🔴 **Red** | `#EF4444` | **Occupied** | Vehicle currently parked (YOLO detected) |
| 🟡 **Yellow** | `#F59E0B` | **Reserved** | Reserved by driver via digital pass |
| 🔵 **Blue** | `#3B82F6` | **EV Charging** | 60kW DC Fast Charging bay for electric vehicles |
| 🌸 **Pink/Purple** | `#EC4899` | **Women's Safety** | Priority bay near elevators with 24x7 CCTV & SOS |
| 🚨 **Amber-Red** | `#DC2626` | **Emergency Only** | Reserved exclusively for ambulances and fire units |

---

## 🏗️ Architecture & Project Structure

```
car slot AI/
├── backend/                  # Node.js Express + Socket.IO + Dual MongoDB/Store
│   ├── config/db.js          # MongoDB connection with auto JSON-store fallback
│   ├── controllers/          # Auth, Slot, Booking, AI, Emergency, Analytics
│   ├── middleware/auth.js    # JWT verification & Admin guards
│   ├── models/               # User, Slot, Booking, PlateLog, EmergencyAlert
│   ├── routes/               # Express API routes
│   ├── socket/               # Socket.IO real-time event broadcaster
│   ├── data/                 # Seed dataset and persistent fallback storage
│   ├── server.js             # Express entrypoint (Port 5000)
│   └── package.json
├── frontend/                 # React 18 + Vite + Tailwind CSS + Leaflet
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/       # Navbar, AuthModal, NotificationToast
│   │   │   ├── parking/      # SlotCard, SlotGrid, NearestSlotFinder
│   │   │   ├── booking/      # ReservationModal, QRCodePass, ParkingTimer
│   │   │   ├── emergency/    # WomenSafetySOSModal
│   │   │   ├── ai/           # LiveCCTVMonitor, PredictiveAvailability
│   │   │   ├── map/          # ParkingLeafletMap
│   │   │   └── admin/        # SlotManager, AnalyticsDashboard
│   │   ├── context/          # AuthContext, SocketContext, ThemeContext
│   │   ├── pages/            # Home, LiveSlots, MyBookings, CCTVView, AdminDashboard
│   │   ├── services/         # api.js, socket.js
│   │   ├── App.jsx
│   │   └── index.css         # Glassmorphic CSS tokens & dark/light styles
│   └── package.json
├── ai_engine/                # Python OpenCV + YOLO + OCR Pipeline
│   ├── smart_detector.py     # Main AI detection service & MJPEG stream server
│   ├── plate_ocr.py          # License plate extraction and OCR
│   ├── cctv_streamer.py      # Real-time annotated CCTV video generator
│   └── requirements.txt
├── package.json              # Monorepo runner scripts
└── README.md
```

---

## 🚀 Getting Started & Setup Instructions

### Prerequisites
- **Node.js** v18+ and **npm** v9+
- **Python** 3.10+ (with `opencv-python-headless`, `numpy`, `requests`)
- *(Optional)* **MongoDB** (If MongoDB is not installed, the app automatically switches to its high-performance embedded JSON store, so it runs **100% out-of-the-box** with zero database setup!)

---

### Step 1: Install Dependencies

Run from the root directory:
```bash
# Install all dependencies across root, backend, and frontend:
npm run install:all
```

Install Python AI engine dependencies:
```bash
pip install -r ai_engine/requirements.txt
```

---

### Step 2: Start the System

#### Option A: Run Full Stack (Frontend + Backend) concurrently
```bash
npm run dev
```

#### Option B: Run Services Individually in separate terminals:

**Terminal 1: Node.js Backend Server**
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2: React Vite Frontend**
```bash
cd frontend
npm run dev
# App opens on http://localhost:5173
```

**Terminal 3: Python AI Detection & CCTV Streamer**
```bash
python ai_engine/smart_detector.py
# MJPEG live stream runs on http://localhost:5050/video_feed
```

---

## 🔑 Demo Login Accounts

| Role | Email | Password | Pre-configured Vehicle |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@smartpark.ai` | `admin123` | `KA-01-SP-0001` |
| **Demo Driver (User)** | `user@smartpark.ai` | `user123` | `KA-05-EV-2026` (EV User) |

*(You can also use the 1-click quick login buttons in the Sign In modal).*

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate user & issue JWT |
| `POST` | `/api/auth/register` | Register new driver or admin account |
| `GET` | `/api/slots` | List all parking slots (filter by floor, type, status) |
| `GET` | `/api/slots/nearest` | Find closest available slot matching preferences |
| `POST` | `/api/slots` | *[Admin]* Add new parking bay |
| `DELETE` | `/api/slots/:id` | *[Admin]* Delete parking bay |
| `POST` | `/api/slots/:id/toggle` | Quick toggle bay status (Available ↔ Occupied) |
| `POST` | `/api/bookings/reserve` | Reserve a parking bay & issue QR code pass |
| `POST` | `/api/bookings/verify-qr` | Scan pass at barrier (Entry: check-in; Exit: checkout & fee) |
| `POST` | `/api/emergency/sos` | Trigger Women's Safety SOS alarm & alert security |
| `PUT` | `/api/emergency/resolve/:id` | *[Admin]* Resolve active SOS alert |
| `POST` | `/api/ai/sync-detection` | Python OpenCV/YOLO webhook to update slot & OCR log |
| `POST` | `/api/ai/simulate` | Trigger simulated arrival / departure event |
| `GET` | `/api/analytics/occupancy` | Real-time occupancy statistics & revenue |
| `GET` | `/api/analytics/predict` | AI 6-hour machine learning parking forecast |

---

## 🔌 Socket.IO Real-Time Events

- `slot_updated`: Broadcast when a vehicle parks or departs (status change).
- `slot_freed`: Alert drivers when a reserved or occupied bay becomes available.
- `ocr_event`: Broadcast newly captured vehicle plate reading and confidence score.
- `sos_alert`: High-priority siren alert dispatched to Admin Control Center.
- `booking_created`: Live booking confirmation.
