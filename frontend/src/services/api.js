// Configurable API base for local dev and cloud deployments (Vercel)
const API_BASE = import.meta.env.VITE_API_URL || (
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api'
    : '/api'
);

const getHeaders = () => {
  const token = localStorage.getItem('smartpark_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

// Fallback initial slots in case backend is offline
const fallbackSlots = [
  { _id: 'slot-1', slotNumber: 'A-01', floor: 'Floor 1', type: 'emergency', status: 'available', currentVehicle: null, hourlyRate: 0, distanceToEntrance: 10, distanceToElevator: 8 },
  { _id: 'slot-2', slotNumber: 'A-02', floor: 'Floor 1', type: 'women_safety', status: 'available', currentVehicle: null, hourlyRate: 35, distanceToEntrance: 15, distanceToElevator: 12 },
  { _id: 'slot-3', slotNumber: 'A-03', floor: 'Floor 1', type: 'women_safety', status: 'occupied', currentVehicle: 'KA-04-MB-2210', hourlyRate: 35, distanceToEntrance: 18, distanceToElevator: 14 },
  { _id: 'slot-4', slotNumber: 'A-04', floor: 'Floor 1', type: 'ev', status: 'available', currentVehicle: null, hourlyRate: 60, distanceToEntrance: 25, distanceToElevator: 20 },
  { _id: 'slot-5', slotNumber: 'A-05', floor: 'Floor 1', type: 'ev', status: 'occupied', currentVehicle: 'TS-09-EV-8890', hourlyRate: 60, isEvActiveCharging: true, chargingLevel: 68, distanceToEntrance: 28, distanceToElevator: 22 },
  { _id: 'slot-6', slotNumber: 'A-06', floor: 'Floor 1', type: 'regular', status: 'reserved', currentVehicle: 'DL-01-AB-1234', hourlyRate: 40, distanceToEntrance: 32, distanceToElevator: 25 },
  { _id: 'slot-7', slotNumber: 'A-07', floor: 'Floor 1', type: 'regular', status: 'available', currentVehicle: null, hourlyRate: 40, distanceToEntrance: 38, distanceToElevator: 30 },
  { _id: 'slot-8', slotNumber: 'A-08', floor: 'Floor 1', type: 'regular', status: 'occupied', currentVehicle: 'MH-12-PQ-9009', hourlyRate: 40, distanceToEntrance: 42, distanceToElevator: 35 },
  { _id: 'slot-9', slotNumber: 'B-01', floor: 'Floor 1', type: 'handicap', status: 'available', currentVehicle: null, hourlyRate: 20, distanceToEntrance: 8, distanceToElevator: 6 },
  { _id: 'slot-10', slotNumber: 'B-02', floor: 'Floor 1', type: 'women_safety', status: 'available', currentVehicle: null, hourlyRate: 35, distanceToEntrance: 12, distanceToElevator: 10 },
  { _id: 'slot-11', slotNumber: 'B-03', floor: 'Floor 1', type: 'regular', status: 'available', currentVehicle: null, hourlyRate: 40, distanceToEntrance: 19, distanceToElevator: 16 },
  { _id: 'slot-12', slotNumber: 'B-04', floor: 'Floor 1', type: 'regular', status: 'occupied', currentVehicle: 'HR-26-DK-4422', hourlyRate: 40, distanceToEntrance: 24, distanceToElevator: 21 },
  { _id: 'slot-13', slotNumber: 'B-05', floor: 'Floor 1', type: 'regular', status: 'available', currentVehicle: null, hourlyRate: 40, distanceToEntrance: 29, distanceToElevator: 26 },
  { _id: 'slot-14', slotNumber: 'B-06', floor: 'Floor 1', type: 'ev', status: 'available', currentVehicle: null, hourlyRate: 60, distanceToEntrance: 34, distanceToElevator: 30 },
  { _id: 'slot-15', slotNumber: 'B-07', floor: 'Floor 1', type: 'regular', status: 'occupied', currentVehicle: 'KA-05-NB-7788', hourlyRate: 40, distanceToEntrance: 38, distanceToElevator: 34 },
  { _id: 'slot-16', slotNumber: 'B-08', floor: 'Floor 1', type: 'regular', status: 'available', currentVehicle: null, hourlyRate: 40, distanceToEntrance: 44, distanceToElevator: 38 },
  { _id: 'slot-17', slotNumber: 'C-01', floor: 'Floor 2', type: 'regular', status: 'available', currentVehicle: null, hourlyRate: 35, distanceToEntrance: 25, distanceToElevator: 10 },
  { _id: 'slot-18', slotNumber: 'C-02', floor: 'Floor 2', type: 'women_safety', status: 'available', currentVehicle: null, hourlyRate: 30, distanceToEntrance: 28, distanceToElevator: 12 },
  { _id: 'slot-19', slotNumber: 'C-03', floor: 'Floor 2', type: 'ev', status: 'available', currentVehicle: null, hourlyRate: 55, distanceToEntrance: 30, distanceToElevator: 15 },
  { _id: 'slot-20', slotNumber: 'C-04', floor: 'Floor 2', type: 'regular', status: 'occupied', currentVehicle: 'AP-10-CR-5544', hourlyRate: 35, distanceToEntrance: 35, distanceToElevator: 18 }
];

let localSlots = [...fallbackSlots];

export const api = {
  async register(userData) {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      return await res.json();
    } catch (e) {
      // Local fallback
      const token = 'demo_token_' + Date.now();
      const user = { _id: 'u-demo', role: 'user', ...userData };
      return { success: true, token, user, message: 'Welcome to SmartPark AI (Demo Mode)!' };
    }
  },

  async login(credentials) {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      return await res.json();
    } catch (e) {
      const isAdmin = credentials.email.includes('admin');
      const token = 'demo_token_' + Date.now();
      const user = {
        _id: isAdmin ? 'u-admin' : 'u-user',
        name: isAdmin ? 'System Admin' : 'Demo Driver',
        email: credentials.email,
        role: isAdmin ? 'admin' : 'user',
        vehicleNumber: isAdmin ? 'KA-01-SP-0001' : 'KA-05-EV-2026'
      };
      return { success: true, token, user, message: 'Logged in successfully (Demo Mode)!' };
    }
  },

  async getMe() {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, { headers: getHeaders() });
      return await res.json();
    } catch (e) {
      return { success: true, user: { name: 'Demo Driver', role: 'user', vehicleNumber: 'KA-05-EV-2026' } };
    }
  },

  async getSlots(filters = {}) {
    try {
      const query = new URLSearchParams(filters).toString();
      const res = await fetch(`${API_BASE}/slots?${query}`);
      const data = await res.json();
      if (data.success) {
        localSlots = data.slots;
        return data;
      }
    } catch (e) {}
    return { success: true, count: localSlots.length, slots: localSlots };
  },

  async getNearestSlot(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/slots/nearest?${query}`);
      const data = await res.json();
      if (data.success) return data;
    } catch (e) {}

    const freeSlots = localSlots.filter(s => s.status === 'available');
    if (freeSlots.length > 0) {
      return { success: true, slot: freeSlots[0], message: `Nearest available bay is ${freeSlots[0].slotNumber}` };
    }
    return { success: false, message: 'No available slots found.' };
  },

  async createSlot(slotData) {
    try {
      const res = await fetch(`${API_BASE}/slots`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(slotData)
      });
      return await res.json();
    } catch (e) {
      const newSlot = { _id: 's-' + Date.now(), status: 'available', ...slotData };
      localSlots.push(newSlot);
      return { success: true, slot: newSlot };
    }
  },

  async updateSlot(id, updates) {
    try {
      const res = await fetch(`${API_BASE}/slots/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updates)
      });
      return await res.json();
    } catch (e) {
      const idx = localSlots.findIndex(s => s._id === id || s.slotNumber === id);
      if (idx !== -1) localSlots[idx] = { ...localSlots[idx], ...updates };
      return { success: true, slot: localSlots[idx] };
    }
  },

  async deleteSlot(id) {
    try {
      const res = await fetch(`${API_BASE}/slots/${id}`, { method: 'DELETE', headers: getHeaders() });
      return await res.json();
    } catch (e) {
      localSlots = localSlots.filter(s => s._id !== id && s.slotNumber !== id);
      return { success: true };
    }
  },

  async toggleSlot(id, vehicleNumber) {
    try {
      const res = await fetch(`${API_BASE}/slots/${id}/toggle`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ vehicleNumber })
      });
      return await res.json();
    } catch (e) {
      const idx = localSlots.findIndex(s => s._id === id || s.slotNumber === id);
      if (idx !== -1) {
        const newStatus = localSlots[idx].status === 'available' ? 'occupied' : 'available';
        localSlots[idx] = { ...localSlots[idx], status: newStatus, currentVehicle: newStatus === 'occupied' ? (vehicleNumber || 'KA-01-AI-2026') : null };
        return { success: true, slot: localSlots[idx] };
      }
      return { success: false };
    }
  },

  async createBooking(bookingData) {
    try {
      const res = await fetch(`${API_BASE}/bookings/reserve`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(bookingData)
      });
      return await res.json();
    } catch (e) {
      const code = 'SP-' + Math.random().toString(36).substring(2, 7).toUpperCase();
      const booking = {
        _id: 'b-' + Date.now(),
        bookingId: code,
        slotNumber: bookingData.slotId,
        vehicleNumber: bookingData.vehicleNumber || 'KA-05-AI-9999',
        startTime: new Date(),
        hourlyRate: 40,
        totalAmount: (bookingData.durationHours || 1) * 40,
        durationHours: bookingData.durationHours || 1,
        status: 'active',
        paymentStatus: 'paid',
        entryQrCode: JSON.stringify({ code, slot: bookingData.slotId, vehicle: bookingData.vehicleNumber }),
        exitQrCode: JSON.stringify({ code, slot: bookingData.slotId })
      };
      return { success: true, booking, message: `Reservation confirmed for ${bookingData.slotId}!` };
    }
  },

  async getMyBookings() {
    try {
      const res = await fetch(`${API_BASE}/bookings/my-bookings`, { headers: getHeaders() });
      return await res.json();
    } catch (e) {
      return { success: true, bookings: [] };
    }
  },

  async getAllBookings() {
    try {
      const res = await fetch(`${API_BASE}/bookings/all`, { headers: getHeaders() });
      return await res.json();
    } catch (e) {
      return { success: true, bookings: [] };
    }
  },

  async verifyQrPass(qrData, action = 'entry') {
    try {
      const res = await fetch(`${API_BASE}/bookings/verify-qr`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ qrData, action })
      });
      return await res.json();
    } catch (e) {
      return {
        success: true,
        action,
        message: action === 'entry' ? 'Entry barrier opened (Validated)!' : 'Exit payment processed! Safe travels.'
      };
    }
  },

  async triggerSOS(data) {
    try {
      const res = await fetch(`${API_BASE}/emergency/sos`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (e) {
      return {
        success: true,
        alert: { alertId: 'SOS-' + Date.now().toString().slice(-5), ...data, status: 'active' },
        message: 'SOS signal broadcast to security.'
      };
    }
  },

  async getEmergencyAlerts() {
    try {
      const res = await fetch(`${API_BASE}/emergency/alerts`);
      return await res.json();
    } catch (e) {
      return { success: true, alerts: [] };
    }
  },

  async resolveAlert(alertId, data = {}) {
    try {
      const res = await fetch(`${API_BASE}/emergency/resolve/${alertId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (e) {
      return { success: true };
    }
  },

  async getPlateLogs(limit = 50) {
    try {
      const res = await fetch(`${API_BASE}/ai/plate-logs?limit=${limit}`);
      return await res.json();
    } catch (e) {
      return {
        success: true,
        logs: [
          { logId: 'l-1', plateNumber: 'KA-04-MB-2210', eventType: 'entry', gate: 'Main North Gate', vehicleType: 'Sedan', confidence: 98.4 },
          { logId: 'l-2', plateNumber: 'TS-09-EV-8890', eventType: 'entry', gate: 'EV Priority Gate', vehicleType: 'EV', confidence: 99.1 },
          { logId: 'l-3', plateNumber: 'HR-26-DK-4422', eventType: 'entry', gate: 'South Gate 2', vehicleType: 'SUV', confidence: 97.2 }
        ]
      };
    }
  },

  async simulateAIEvent(action = 'random_arrival') {
    try {
      const res = await fetch(`${API_BASE}/ai/simulate`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ action })
      });
      return await res.json();
    } catch (e) {
      return { success: true, message: 'AI simulated detection event triggered.' };
    }
  },

  async getOccupancyStats() {
    try {
      const res = await fetch(`${API_BASE}/analytics/occupancy`);
      return await res.json();
    } catch (e) {
      const total = localSlots.length;
      const occupied = localSlots.filter(s => s.status === 'occupied').length;
      const available = localSlots.filter(s => s.status === 'available').length;
      return {
        success: true,
        stats: {
          total,
          available,
          occupied,
          reserved: 1,
          occupancyRate: Math.round((occupied / total) * 100),
          evSlots: 4,
          evActive: 1,
          womenSafetySlots: 4,
          womenSafetyAvailable: 3,
          emergencySlots: 1,
          totalRevenue: 1850
        }
      };
    }
  },

  async getPeakHourData() {
    try {
      const res = await fetch(`${API_BASE}/analytics/peak-hours`);
      return await res.json();
    } catch (e) {
      return {
        success: true,
        data: [
          { hour: '00:00', occupancy: 12 },
          { hour: '02:00', occupancy: 8 },
          { hour: '04:00', occupancy: 6 },
          { hour: '06:00', occupancy: 18 },
          { hour: '08:00', occupancy: 64 },
          { hour: '09:00', occupancy: 88 },
          { hour: '10:00', occupancy: 94 },
          { hour: '12:00', occupancy: 82 },
          { hour: '14:00', occupancy: 78 },
          { hour: '16:00', occupancy: 86 },
          { hour: '18:00', occupancy: 92 },
          { hour: '20:00', occupancy: 68 },
          { hour: '22:00', occupancy: 34 }
        ]
      };
    }
  },

  async getPredictiveAvailability() {
    try {
      const res = await fetch(`${API_BASE}/analytics/predict`);
      return await res.json();
    } catch (e) {
      return {
        success: true,
        currentSlotCount: 20,
        currentAvailable: 13,
        congestionIndex: 'LOW',
        bestTimeToPark: 'Next 45 mins or after 19:30',
        aiModelAccuracy: '94.8%',
        forecast: [
          { time: '10:00', predictedOccupancyRate: 88, predictedAvailableRate: 12, estimatedFreeSlots: 3, statusColor: 'red' },
          { time: '11:00', predictedOccupancyRate: 85, predictedAvailableRate: 15, estimatedFreeSlots: 3, statusColor: 'red' },
          { time: '12:00', predictedOccupancyRate: 72, predictedAvailableRate: 28, estimatedFreeSlots: 6, statusColor: 'yellow' },
          { time: '13:00', predictedOccupancyRate: 65, predictedAvailableRate: 35, estimatedFreeSlots: 7, statusColor: 'yellow' },
          { time: '14:00', predictedOccupancyRate: 70, predictedAvailableRate: 30, estimatedFreeSlots: 6, statusColor: 'yellow' },
          { time: '15:00', predictedOccupancyRate: 74, predictedAvailableRate: 26, estimatedFreeSlots: 5, statusColor: 'yellow' }
        ]
      };
    }
  }
};
