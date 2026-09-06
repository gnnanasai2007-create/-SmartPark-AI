const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  userName: { type: String, default: 'Driver' },
  userEmail: { type: String, default: '' },
  slotId: { type: String, required: true },
  slotNumber: { type: String, required: true },
  vehicleNumber: { type: String, required: true },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date, required: true },
  entryTime: { type: Date, default: null },
  exitTime: { type: Date, default: null },
  hourlyRate: { type: Number, default: 40 },
  totalAmount: { type: Number, default: 40 },
  durationHours: { type: Number, default: 1 },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'pending'],
    default: 'paid'
  },
  paymentMethod: { type: String, default: 'UPI / Card' },
  entryQrCode: { type: String, required: true },
  exitQrCode: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', BookingSchema);
