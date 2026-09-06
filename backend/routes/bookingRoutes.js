const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.post('/reserve', bookingController.createBooking); // Allows authenticated or guest reservations
router.get('/my-bookings', authenticate, bookingController.getMyBookings);
router.get('/all', authenticate, requireAdmin, bookingController.getAllBookings);
router.post('/verify-qr', bookingController.verifyQrPass);

module.exports = router;
