const express = require('express');
const router = express.Router();
const slotController = require('../controllers/slotController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/', slotController.getAllSlots);
router.get('/nearest', slotController.getNearestSlot);
router.post('/', authenticate, requireAdmin, slotController.createSlot);
router.put('/:id', authenticate, requireAdmin, slotController.updateSlot);
router.delete('/:id', authenticate, requireAdmin, slotController.deleteSlot);
router.post('/:id/toggle', slotController.toggleStatus); // open for simulation

module.exports = router;
