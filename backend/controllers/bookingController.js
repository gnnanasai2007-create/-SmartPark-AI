const { v4: uuidv4 } = require('uuid');
const store = require('../data/store');

exports.createBooking = async (req, res) => {
  try {
    const { slotId, durationHours, vehicleNumber, paymentMethod } = req.body;
    const userId = req.user ? req.user._id : 'guest-' + Date.now();
    const userName = req.user ? req.user.name : (req.body.userName || 'Guest Driver');
    const userEmail = req.user ? req.user.email : (req.body.userEmail || '');

    if (!slotId) {
      return res.status(400).json({ success: false, message: 'Slot ID is required.' });
    }

    const slot = await store.getSlotById(slotId);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Slot not found.' });
    }

    if (slot.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: `Slot ${slot.slotNumber} is currently ${slot.status}. Please choose another slot.`
      });
    }

    const hours = Math.max(1, Number(durationHours) || 1);
    const hourlyRate = slot.hourlyRate || 40;
    const totalAmount = hourlyRate * hours;

    const bookingCode = 'SP-' + Math.random().toString(36).substring(2, 7).toUpperCase();
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + hours * 60 * 60 * 1000);

    const qrPayload = JSON.stringify({
      code: bookingCode,
      slot: slot.slotNumber,
      floor: slot.floor,
      vehicle: vehicleNumber || req.user?.vehicleNumber || 'KA-01-XX-9999',
      validUntil: endTime.toISOString()
    });

    const booking = await store.createBooking({
      bookingId: bookingCode,
      userId,
      userName,
      userEmail,
      slotId: slot._id,
      slotNumber: slot.slotNumber,
      vehicleNumber: vehicleNumber || req.user?.vehicleNumber || 'KA-01-XX-9999',
      startTime,
      endTime,
      hourlyRate,
      totalAmount,
      durationHours: hours,
      status: 'active',
      paymentStatus: 'paid',
      paymentMethod: paymentMethod || 'UPI / Instant Pay',
      entryQrCode: qrPayload,
      exitQrCode: qrPayload
    });

    // Mark slot as reserved
    const updatedSlot = await store.updateSlot(slot._id, {
      status: 'reserved',
      currentVehicle: booking.vehicleNumber
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('slot_updated', updatedSlot);
      io.emit('booking_created', booking);
    }

    res.status(201).json({
      success: true,
      booking,
      message: `Reservation confirmed for slot ${slot.slotNumber}!`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const userId = req.user._id;
    const bookings = await store.getBookings(userId);
    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await store.getBookings();
    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.verifyQrPass = async (req, res) => {
  try {
    const { qrData, action } = req.body; // action: 'entry' or 'exit'

    let bookingCode = qrData;
    try {
      const parsed = JSON.parse(qrData);
      if (parsed.code) bookingCode = parsed.code;
    } catch (e) {
      // qrData was already plain string code
    }

    const booking = await store.getBookingById(bookingCode);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Invalid or unrecognized QR Pass code.' });
    }

    const io = req.app.get('io');

    if (action === 'entry') {
      const updatedBooking = await store.updateBooking(booking.bookingId, {
        entryTime: new Date()
      });

      // Slot transitions to occupied
      const updatedSlot = await store.updateSlot(booking.slotId, {
        status: 'occupied',
        currentVehicle: booking.vehicleNumber
      });

      // Log plate entry
      await store.createPlateLog({
        logId: 'log-' + Date.now(),
        plateNumber: booking.vehicleNumber,
        eventType: 'entry',
        slotNumber: booking.slotNumber,
        confidence: 99.0,
        gate: 'QR Scanner Gate A',
        vehicleType: 'Car'
      });

      if (io) {
        io.emit('slot_updated', updatedSlot);
        io.emit('qr_scanned', { type: 'entry', booking: updatedBooking });
      }

      return res.json({
        success: true,
        action: 'entry',
        booking: updatedBooking,
        message: `Welcome! Entry validated for ${booking.vehicleNumber} at Slot ${booking.slotNumber}. Barrier opened.`
      });
    } else {
      // Exit gate
      const now = new Date();
      const entryTime = booking.entryTime ? new Date(booking.entryTime) : new Date(booking.startTime);
      const diffMs = Math.max(0, now.getTime() - entryTime.getTime());
      const parkedHours = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)));
      const finalAmount = parkedHours * booking.hourlyRate;

      const updatedBooking = await store.updateBooking(booking.bookingId, {
        exitTime: now,
        status: 'completed',
        totalAmount: finalAmount,
        durationHours: parkedHours
      });

      // Slot returns to available
      const updatedSlot = await store.updateSlot(booking.slotId, {
        status: 'available',
        currentVehicle: null,
        isEvActiveCharging: false,
        chargingLevel: 0
      });

      // Log plate exit
      await store.createPlateLog({
        logId: 'log-' + Date.now(),
        plateNumber: booking.vehicleNumber,
        eventType: 'exit',
        slotNumber: booking.slotNumber,
        confidence: 99.4,
        gate: 'QR Scanner Exit B',
        vehicleType: 'Car'
      });

      if (io) {
        io.emit('slot_updated', updatedSlot);
        io.emit('slot_freed', { slotNumber: updatedSlot.slotNumber, floor: updatedSlot.floor });
        io.emit('qr_scanned', { type: 'exit', booking: updatedBooking });
      }

      return res.json({
        success: true,
        action: 'exit',
        booking: updatedBooking,
        finalAmount,
        parkedHours,
        message: `Exit validated for ${booking.vehicleNumber}. Thank you for parking with SmartPark AI!`
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
