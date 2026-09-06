const store = require('../data/store');

exports.triggerSOS = async (req, res) => {
  try {
    const { slotNumber, floor, locationDetails, phone, type } = req.body;
    const userId = req.user ? req.user._id : null;
    const userName = req.user ? req.user.name : (req.body.userName || 'Visitor in Distress');

    const alertId = 'SOS-' + Date.now().toString().slice(-6);

    const newAlert = await store.createEmergencyAlert({
      alertId,
      slotNumber: slotNumber || 'W-01',
      floor: floor || 'Floor 1',
      userId,
      userName,
      phone: phone || (req.user ? req.user.phone : ''),
      type: type || 'women_safety_sos',
      status: 'active',
      locationDetails: locationDetails || 'Women Safety Parking Zone - Emergency Bay',
      dispatchedGuard: 'Security Patrol 01 Dispatched',
      timestamp: new Date()
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('sos_alert', {
        alert: newAlert,
        siren: true,
        message: `EMERGENCY SOS TRIGGERED at ${newAlert.slotNumber} (${newAlert.floor})! Security dispatched.`
      });
    }

    res.status(201).json({
      success: true,
      alert: newAlert,
      message: 'Emergency SOS received! On-site security and rapid response team have been notified.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAlerts = async (req, res) => {
  try {
    const alerts = await store.getEmergencyAlerts();
    res.json({ success: true, count: alerts.length, alerts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.resolveAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const { dispatchedGuard, notes } = req.body;

    const updated = await store.updateEmergencyAlert(alertId, {
      status: 'resolved',
      resolvedAt: new Date(),
      dispatchedGuard: dispatchedGuard || 'Patrol Unit Alpha',
      notes: notes || 'Area secured and resolved by on-duty supervisor.'
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Alert not found.' });
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('sos_resolved', updated);
    }

    res.json({ success: true, alert: updated, message: `Alert ${alertId} marked as resolved.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
