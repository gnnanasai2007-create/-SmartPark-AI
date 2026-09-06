const express = require('express');
const router = express.Router();
const emergencyController = require('../controllers/emergencyController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.post('/sos', emergencyController.triggerSOS);
router.get('/alerts', emergencyController.getAlerts);
router.put('/resolve/:alertId', authenticate, requireAdmin, emergencyController.resolveAlert);

module.exports = router;
