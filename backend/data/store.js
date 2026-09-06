const fs = require('fs');
const path = require('path');
const { getMongoStatus } = require('../config/db');
const User = require('../models/User');
const Slot = require('../models/Slot');
const Booking = require('../models/Booking');
const PlateLog = require('../models/PlateLog');
const EmergencyAlert = require('../models/EmergencyAlert');
const { initialSlots, initialPlateLogs } = require('./seedData');

const DB_FILE = path.join(__dirname, 'db_store.json');

// In-memory cache + file sync fallback
let memStore = {
  users: [],
  slots: [],
  bookings: [],
  plateLogs: [],
  emergencyAlerts: []
};

// Initialize fallback store
function initStore() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      memStore = { ...memStore, ...data };
      if (!memStore.slots || memStore.slots.length === 0) {
        memStore.slots = [...initialSlots];
      }
      if (!memStore.plateLogs || memStore.plateLogs.length === 0) {
        memStore.plateLogs = [...initialPlateLogs];
      }
    } catch (e) {
      memStore.slots = [...initialSlots];
      memStore.plateLogs = [...initialPlateLogs];
    }
  } else {
    memStore.slots = [...initialSlots];
    memStore.plateLogs = [...initialPlateLogs];
    persistStore();
  }
}

function persistStore() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(memStore, null, 2), 'utf8');
  } catch (err) {
    console.error('[Store] Failed to write db_store.json:', err.message);
  }
}

initStore();

const store = {
  // SLOTS
  async getSlots() {
    if (getMongoStatus()) {
      return await Slot.find({}).lean();
    }
    return memStore.slots;
  },

  async getSlotById(id) {
    if (getMongoStatus()) {
      return await Slot.findById(id).lean();
    }
    return memStore.slots.find(s => s._id === id || s.slotNumber === id);
  },

  async getSlotByNumber(slotNumber) {
    if (getMongoStatus()) {
      return await Slot.findOne({ slotNumber }).lean();
    }
    return memStore.slots.find(s => s.slotNumber.toLowerCase() === slotNumber.toLowerCase());
  },

  async createSlot(slotData) {
    if (getMongoStatus()) {
      const slot = new Slot(slotData);
      return await slot.save();
    }
    const newSlot = {
      _id: 'slot-' + Date.now(),
      coordinates: { x: 100, y: 100, lat: 12.9716, lng: 77.5946 },
      cctvRoi: [],
      distanceToElevator: 20,
      distanceToEntrance: 25,
      sensorConfidence: 99,
      ...slotData
    };
    memStore.slots.push(newSlot);
    persistStore();
    return newSlot;
  },

  async updateSlot(id, updates) {
    if (getMongoStatus()) {
      return await Slot.findOneAndUpdate(
        { $or: [{ _id: id }, { slotNumber: id }] },
        { $set: { ...updates, lastStatusUpdate: new Date() } },
        { new: true }
      ).lean();
    }
    const index = memStore.slots.findIndex(s => s._id === id || s.slotNumber === id);
    if (index !== -1) {
      memStore.slots[index] = {
        ...memStore.slots[index],
        ...updates,
        lastStatusUpdate: new Date()
      };
      persistStore();
      return memStore.slots[index];
    }
    return null;
  },

  async deleteSlot(id) {
    if (getMongoStatus()) {
      return await Slot.findOneAndDelete({ $or: [{ _id: id }, { slotNumber: id }] });
    }
    const index = memStore.slots.findIndex(s => s._id === id || s.slotNumber === id);
    if (index !== -1) {
      const removed = memStore.slots.splice(index, 1);
      persistStore();
      return removed[0];
    }
    return null;
  },

  // USERS
  async getUserByEmail(email) {
    if (getMongoStatus()) {
      return await User.findOne({ email: email.toLowerCase() }).lean();
    }
    return memStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  async getUserById(id) {
    if (getMongoStatus()) {
      return await User.findById(id).lean();
    }
    return memStore.users.find(u => u._id === id);
  },

  async createUser(userData) {
    if (getMongoStatus()) {
      const user = new User({ ...userData, email: userData.email.toLowerCase() });
      return await user.save();
    }
    const newUser = {
      _id: 'user-' + Date.now(),
      createdAt: new Date(),
      ...userData,
      email: userData.email.toLowerCase()
    };
    memStore.users.push(newUser);
    persistStore();
    return newUser;
  },

  // BOOKINGS
  async getBookings(userId = null) {
    if (getMongoStatus()) {
      const filter = userId ? { userId } : {};
      return await Booking.find(filter).sort({ createdAt: -1 }).lean();
    }
    if (userId) {
      return memStore.bookings.filter(b => b.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return [...memStore.bookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async getBookingById(bookingId) {
    if (getMongoStatus()) {
      return await Booking.findOne({ bookingId }).lean();
    }
    return memStore.bookings.find(b => b.bookingId === bookingId);
  },

  async createBooking(bookingData) {
    if (getMongoStatus()) {
      const booking = new Booking(bookingData);
      return await booking.save();
    }
    const newBooking = {
      _id: 'booking-' + Date.now(),
      createdAt: new Date(),
      ...bookingData
    };
    memStore.bookings.unshift(newBooking);
    persistStore();
    return newBooking;
  },

  async updateBooking(bookingId, updates) {
    if (getMongoStatus()) {
      return await Booking.findOneAndUpdate({ bookingId }, { $set: updates }, { new: true }).lean();
    }
    const index = memStore.bookings.findIndex(b => b.bookingId === bookingId);
    if (index !== -1) {
      memStore.bookings[index] = { ...memStore.bookings[index], ...updates };
      persistStore();
      return memStore.bookings[index];
    }
    return null;
  },

  // PLATE LOGS
  async getPlateLogs(limit = 50) {
    if (getMongoStatus()) {
      return await PlateLog.find({}).sort({ timestamp: -1 }).limit(limit).lean();
    }
    return [...memStore.plateLogs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, limit);
  },

  async createPlateLog(logData) {
    if (getMongoStatus()) {
      const log = new PlateLog(logData);
      return await log.save();
    }
    const newLog = {
      _id: 'log-' + Date.now(),
      timestamp: new Date(),
      ...logData
    };
    memStore.plateLogs.unshift(newLog);
    if (memStore.plateLogs.length > 200) memStore.plateLogs.pop();
    persistStore();
    return newLog;
  },

  // EMERGENCY ALERTS
  async getEmergencyAlerts() {
    if (getMongoStatus()) {
      return await EmergencyAlert.find({}).sort({ timestamp: -1 }).lean();
    }
    return [...memStore.emergencyAlerts].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },

  async createEmergencyAlert(alertData) {
    if (getMongoStatus()) {
      const alert = new EmergencyAlert(alertData);
      return await alert.save();
    }
    const newAlert = {
      _id: 'alert-' + Date.now(),
      timestamp: new Date(),
      ...alertData
    };
    memStore.emergencyAlerts.unshift(newAlert);
    persistStore();
    return newAlert;
  },

  async updateEmergencyAlert(alertId, updates) {
    if (getMongoStatus()) {
      return await EmergencyAlert.findOneAndUpdate({ alertId }, { $set: updates }, { new: true }).lean();
    }
    const index = memStore.emergencyAlerts.findIndex(a => a.alertId === alertId);
    if (index !== -1) {
      memStore.emergencyAlerts[index] = { ...memStore.emergencyAlerts[index], ...updates };
      persistStore();
      return memStore.emergencyAlerts[index];
    }
    return null;
  }
};

module.exports = store;
