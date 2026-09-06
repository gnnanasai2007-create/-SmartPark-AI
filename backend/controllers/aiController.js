const store = require('../data/store');

exports.syncDetectionEvent = async (req, res) => {
  try {
    const { slotNumber, isOccupied, vehicleNumber, confidence, vehicleType, gate, frameData } = req.body;

    if (!slotNumber) {
      return res.status(400).json({ success: false, message: 'slotNumber is required.' });
    }

    const slot = await store.getSlotByNumber(slotNumber);
    if (!slot) {
      return res.status(404).json({ success: false, message: `Slot ${slotNumber} not found.` });
    }

    const newStatus = isOccupied ? 'occupied' : 'available';
    const currentVehicle = isOccupied ? (vehicleNumber || 'KA-02-AI-' + Math.floor(1000 + Math.random() * 9000)) : null;

    const updatedSlot = await store.updateSlot(slot._id, {
      status: newStatus,
      currentVehicle,
      sensorConfidence: confidence ? Math.round(confidence) : 98,
      isEvActiveCharging: slot.type === 'ev' && isOccupied,
      chargingLevel: slot.type === 'ev' && isOccupied ? 45 : 0
    });

    let newPlateLog = null;
    if (isOccupied && currentVehicle) {
      newPlateLog = await store.createPlateLog({
        logId: 'ocr-' + Date.now(),
        plateNumber: currentVehicle,
        eventType: 'cctv_scan',
        slotNumber: slot.slotNumber,
        confidence: confidence || 97.8,
        gate: gate || 'AI CCTV Cam-01',
        vehicleType: vehicleType || 'Car'
      });
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('slot_updated', updatedSlot);
      if (newPlateLog) {
        io.emit('ocr_event', newPlateLog);
      }
      if (frameData) {
        io.emit('ai_frame_update', { slotNumber, isOccupied, frameData });
      }
    }

    res.json({
      success: true,
      slot: updatedSlot,
      log: newPlateLog,
      message: `AI sync updated slot ${slotNumber} -> ${newStatus}.`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPlateLogs = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 50;
    const logs = await store.getPlateLogs(limit);
    res.json({ success: true, count: logs.length, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.simulateAIEvent = async (req, res) => {
  try {
    const { action } = req.body; // 'random_arrival', 'random_departure', 'ev_charge'
    const slots = await store.getSlots();

    const samplePlates = [
      'KA-03-HA-4411', 'MH-02-CD-5678', 'DL-8C-AA-1290',
      'TS-07-EK-8821', 'TN-09-BZ-3399', 'HR-51-AY-9012'
    ];
    const randomPlate = samplePlates[Math.floor(Math.random() * samplePlates.length)];

    let targetSlot;
    if (action === 'random_arrival') {
      const available = slots.filter(s => s.status === 'available');
      if (available.length === 0) {
        return res.json({ success: false, message: 'All slots are occupied already.' });
      }
      targetSlot = available[Math.floor(Math.random() * available.length)];
      const updated = await store.updateSlot(targetSlot._id, {
        status: 'occupied',
        currentVehicle: randomPlate,
        isEvActiveCharging: targetSlot.type === 'ev',
        chargingLevel: targetSlot.type === 'ev' ? 15 : 0
      });

      const log = await store.createPlateLog({
        logId: 'sim-' + Date.now(),
        plateNumber: randomPlate,
        eventType: 'entry',
        slotNumber: targetSlot.slotNumber,
        confidence: 98.6,
        gate: 'AI CCTV Smart Cam 01',
        vehicleType: targetSlot.type === 'ev' ? 'Electric Vehicle' : 'Sedan'
      });

      const io = req.app.get('io');
      if (io) {
        io.emit('slot_updated', updated);
        io.emit('ocr_event', log);
      }

      return res.json({ success: true, message: `Vehicle ${randomPlate} parked at ${targetSlot.slotNumber}`, slot: updated, log });
    } else {
      // departure
      const occupied = slots.filter(s => s.status === 'occupied');
      if (occupied.length === 0) {
        return res.json({ success: false, message: 'No occupied slots to depart.' });
      }
      targetSlot = occupied[Math.floor(Math.random() * occupied.length)];
      const departingVehicle = targetSlot.currentVehicle || 'KA-01-XX-0000';
      const updated = await store.updateSlot(targetSlot._id, {
        status: 'available',
        currentVehicle: null,
        isEvActiveCharging: false,
        chargingLevel: 0
      });

      const log = await store.createPlateLog({
        logId: 'sim-' + Date.now(),
        plateNumber: departingVehicle,
        eventType: 'exit',
        slotNumber: targetSlot.slotNumber,
        confidence: 99.1,
        gate: 'AI CCTV Exit Cam 02',
        vehicleType: 'Car'
      });

      const io = req.app.get('io');
      if (io) {
        io.emit('slot_updated', updated);
        io.emit('ocr_event', log);
        io.emit('slot_freed', { slotNumber: updated.slotNumber, floor: updated.floor });
      }

      return res.json({ success: true, message: `Vehicle ${departingVehicle} departed from ${targetSlot.slotNumber}`, slot: updated, log });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
