const API_BASE = 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('smartpark_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const api = {
  // Auth
  async register(userData) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return res.json();
  },

  async login(credentials) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return res.json();
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders()
    });
    return res.json();
  },

  // Slots
  async getSlots(filters = {}) {
    const query = new URLSearchParams(filters).toString();
    const res = await fetch(`${API_BASE}/slots?${query}`);
    return res.json();
  },

  async getNearestSlot(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/slots/nearest?${query}`);
    return res.json();
  },

  async createSlot(slotData) {
    const res = await fetch(`${API_BASE}/slots`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(slotData)
    });
    return res.json();
  },

  async updateSlot(id, updates) {
    const res = await fetch(`${API_BASE}/slots/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  async deleteSlot(id) {
    const res = await fetch(`${API_BASE}/slots/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.json();
  },

  async toggleSlot(id, vehicleNumber) {
    const res = await fetch(`${API_BASE}/slots/${id}/toggle`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ vehicleNumber })
    });
    return res.json();
  },

  // Bookings
  async createBooking(bookingData) {
    const res = await fetch(`${API_BASE}/bookings/reserve`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(bookingData)
    });
    return res.json();
  },

  async getMyBookings() {
    const res = await fetch(`${API_BASE}/bookings/my-bookings`, {
      headers: getHeaders()
    });
    return res.json();
  },

  async getAllBookings() {
    const res = await fetch(`${API_BASE}/bookings/all`, {
      headers: getHeaders()
    });
    return res.json();
  },

  async verifyQrPass(qrData, action = 'entry') {
    const res = await fetch(`${API_BASE}/bookings/verify-qr`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ qrData, action })
    });
    return res.json();
  },

  // Emergency SOS
  async triggerSOS(data) {
    const res = await fetch(`${API_BASE}/emergency/sos`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async getEmergencyAlerts() {
    const res = await fetch(`${API_BASE}/emergency/alerts`);
    return res.json();
  },

  async resolveAlert(alertId, data = {}) {
    const res = await fetch(`${API_BASE}/emergency/resolve/${alertId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // AI & Analytics
  async getPlateLogs(limit = 50) {
    const res = await fetch(`${API_BASE}/ai/plate-logs?limit=${limit}`);
    return res.json();
  },

  async simulateAIEvent(action = 'random_arrival') {
    const res = await fetch(`${API_BASE}/ai/simulate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ action })
    });
    return res.json();
  },

  async getOccupancyStats() {
    const res = await fetch(`${API_BASE}/analytics/occupancy`);
    return res.json();
  },

  async getPeakHourData() {
    const res = await fetch(`${API_BASE}/analytics/peak-hours`);
    return res.json();
  },

  async getPredictiveAvailability() {
    const res = await fetch(`${API_BASE}/analytics/predict`);
    return res.json();
  }
};
