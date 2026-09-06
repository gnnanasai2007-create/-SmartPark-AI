const mongoose = require('mongoose');

const PlateLogSchema = new mongoose.Schema({
  logId: { type: String, required: true, unique: true },
  plateNumber: { type: String, required: true },
  eventType: { type: String, enum: ['entry', 'exit', 'cctv_scan'], default: 'entry' },
  slotNumber: { type: String, default: null },
  confidence: { type: Number, default: 96.5 },
  gate: { type: String, default: 'North Gate Camera-01' },
  vehicleType: { type: String, default: 'Sedan' },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PlateLog', PlateLogSchema);
