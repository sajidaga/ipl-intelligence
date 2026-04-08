const express = require('express');
const router = express.Router();
const playerController = require('../controllers/player.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.get('/', authMiddleware, playerController.getAllPlayers);
router.get('/:id', authMiddleware, playerController.getPlayerById);
router.get('/:id/stats', authMiddleware, playerController.getPlayerStats);

module.exports = router;
