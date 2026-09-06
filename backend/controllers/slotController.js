const store = require('../data/store');

exports.getAllSlots = async (req, res) => {
  try {
    const { floor, type, status } = req.query;
    let slots = await store.getSlots();

    if (floor && floor !== 'all') {
      slots = slots.filter(s => s.floor.toLowerCase() === floor.toLowerCase());
    }
    if (type && type !== 'all') {
      slots = slots.filter(s => s.type.toLowerCase() === type.toLowerCase());
    }
    if (status && status !== 'all') {
      slots = slots.filter(s => s.status.toLowerCase() === status.toLowerCase());
    }

    res.json({ success: true, count: slots.length, slots });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getNearestSlot = async (req, res) => {
  try {
    const { type, preference, floor } = req.query;
    let slots = await store.getSlots();

    // Only look for available slots
    let availableSlots = slots.filter(s => s.status === 'available');

    if (floor && floor !== 'all') {
      availableSlots = availableSlots.filter(s => s.floor.toLowerCase() === floor.toLowerCase());
    }

    if (type && type !== 'all') {
      availableSlots = availableSlots.filter(s => s.type.toLowerCase() === type.toLowerCase());
    }

    if (availableSlots.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No available slots found for your criteria at this moment.'
      });
    }

    // Sort by proximity
    if (preference === 'elevator') {
      availableSlots.sort((a, b) => (a.distanceToElevator || 99) - (b.distanceToElevator || 99));
    } else {
      // Default: entrance
      availableSlots.sort((a, b) => (a.distanceToEntrance || 99) - (b.distanceToEntrance || 99));
    }

    const nearest = availableSlots[0];
    res.json({
      success: true,
      slot: nearest,
      message: `Nearest available slot is ${nearest.slotNumber} (${nearest.type}) located on ${nearest.floor}.`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createSlot = async (req, res) => {
  try {
    const { slotNumber, floor, type, hourlyRate, coordinates, distanceToEntrance, distanceToElevator } = req.body;

    if (!slotNumber) {
      return res.status(400).json({ success: false, message: 'Slot number is required.' });
    }

    const existing = await store.getSlotByNumber(slotNumber);
    if (existing) {
      return res.status(400).json({ success: false, message: `Slot ${slotNumber} already exists.` });
    }

    const newSlot = await store.createSlot({
      slotNumber: slotNumber.toUpperCase(),
      floor: floor || 'Floor 1',
      type: type || 'regular',
      status: 'available',
      currentVehicle: null,
      hourlyRate: Number(hourlyRate) || 40,
      coordinates: coordinates || { x: 50, y: 50, lat: 12.9716, lng: 77.5946 },
      distanceToEntrance: Number(distanceToEntrance) || 20,
      distanceToElevator: Number(distanceToElevator) || 15
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('slot_created', newSlot);
    }

    res.status(201).json({ success: true, slot: newSlot, message: `Slot ${newSlot.slotNumber} created.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updated = await store.updateSlot(id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Slot not found.' });
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('slot_updated', updated);
    }

    res.json({ success: true, slot: updated, message: `Slot ${updated.slotNumber} updated.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const removed = await store.deleteSlot(id);
    if (!removed) {
      return res.status(404).json({ success: false, message: 'Slot not found.' });
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('slot_deleted', { id, slotNumber: removed.slotNumber });
    }

    res.json({ success: true, message: `Slot ${removed.slotNumber} deleted.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const slot = await store.getSlotById(id);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Slot not found.' });
    }

    const newStatus = slot.status === 'available' ? 'occupied' : 'available';
    const currentVehicle = newStatus === 'occupied' ? (req.body.vehicleNumber || 'KA-01-AI-7788') : null;

    const updated = await store.updateSlot(id, {
      status: newStatus,
      currentVehicle,
      isEvActiveCharging: slot.type === 'ev' && newStatus === 'occupied',
      chargingLevel: slot.type === 'ev' && newStatus === 'occupied' ? 25 : 0
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('slot_updated', updated);
    }

    res.json({ success: true, slot: updated, message: `Slot ${updated.slotNumber} is now ${newStatus}.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
