const express = require('express');
const router = express.Router();
const matchController = require('../controllers/match.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.get('/', authMiddleware, matchController.getAllMatches);
router.get('/:id', authMiddleware, matchController.getMatchById);

module.exports = router;
