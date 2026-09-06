const mongoose = require('mongoose');

const EmergencyAlertSchema = new mongoose.Schema({
  alertId: { type: String, required: true, unique: true },
  slotNumber: { type: String, required: true },
  floor: { type: String, default: 'Floor 1' },
  userId: { type: String, default: null },
  userName: { type: String, default: 'Anonymous Visitor' },
  phone: { type: String, default: '' },
  type: { type: String, enum: ['women_safety_sos', 'medical', 'security'], default: 'women_safety_sos' },
  status: { type: String, enum: ['active', 'acknowledged', 'resolved'], default: 'active' },
  locationDetails: { type: String, default: 'Women Safety Parking Zone - Pillar W2' },
  dispatchedGuard: { type: String, default: null },
  timestamp: { type: Date, default: Date.now },
  resolvedAt: { type: Date, default: null }
});

module.exports = mongoose.model('EmergencyAlert', EmergencyAlertSchema);
