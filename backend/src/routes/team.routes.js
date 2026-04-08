const express = require('express');
const router = express.Router();
const teamController = require('../controllers/team.controller');

router.get('/', teamController.getAllTeams);
router.get('/:id', teamController.getTeamById);
router.get('/:id/players', teamController.getTeamPlayers);

module.exports = router;
