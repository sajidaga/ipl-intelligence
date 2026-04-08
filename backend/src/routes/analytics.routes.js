const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.get('/season/:year', authMiddleware, analyticsController.getSeasonSummary);
router.get('/topscorers', authMiddleware, analyticsController.getTopScorers);
router.get('/topwickets', authMiddleware, analyticsController.getTopWicketTakers);

module.exports = router;
