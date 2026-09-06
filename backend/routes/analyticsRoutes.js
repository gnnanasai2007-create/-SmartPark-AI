const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

router.get('/occupancy', analyticsController.getOccupancyStats);
router.get('/peak-hours', analyticsController.getPeakHourData);
router.get('/predict', analyticsController.getPredictiveAvailability);

module.exports = router;
