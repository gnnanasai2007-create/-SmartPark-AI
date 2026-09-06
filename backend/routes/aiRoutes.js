const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/sync-detection', aiController.syncDetectionEvent);
router.get('/plate-logs', aiController.getPlateLogs);
router.post('/simulate', aiController.simulateAIEvent);

module.exports = router;
