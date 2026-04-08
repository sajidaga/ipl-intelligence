const express = require('express');
const router = express.Router();
const teamController = require('../controllers/team.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.get('/', authMiddleware, teamController.getAllTeams);
router.get('/:id', authMiddleware, teamController.getTeamById);
router.get('/:id/players', authMiddleware, teamController.getTeamPlayers);

module.exports = router;
