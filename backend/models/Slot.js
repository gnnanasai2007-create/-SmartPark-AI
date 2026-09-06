const mongoose = require('mongoose');

const SlotSchema = new mongoose.Schema({
  slotNumber: { type: String, required: true, unique: true },
  floor: { type: String, default: 'Floor 1' },
  type: {
    type: String,
    enum: ['regular', 'ev', 'women_safety', 'emergency', 'handicap'],
    default: 'regular'
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'reserved', 'maintenance'],
    default: 'available'
  },
  currentVehicle: { type: String, default: null },
  hourlyRate: { type: Number, default: 40 },
  coordinates: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    lat: { type: Number, default: 12.9716 },
    lng: { type: Number, default: 77.5946 }
  },
  cctvRoi: {
    type: [[Number]],
    default: []
  },
  lastStatusUpdate: { type: Date, default: Date.now },
  isEvActiveCharging: { type: Boolean, default: false },
  chargingLevel: { type: Number, default: 0 },
  sensorConfidence: { type: Number, default: 98 },
  distanceToElevator: { type: Number, default: 15 }, // in meters, for nearest search
  distanceToEntrance: { type: Number, default: 20 }
});

module.exports = mongoose.model('Slot', SlotSchema);
