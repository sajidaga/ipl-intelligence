const prisma = require('../config/prisma');

const getAllPlayers = async (req, res, next) => {
  try {
    const players = await prisma.player.findMany();
    res.json(players);
  } catch (error) {
    next(error);
  }
};

const getPlayerById = async (req, res, next) => {
  try {
    const player = await prisma.player.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!player) return res.status(404).json({ message: 'Player not found' });
    res.json(player);
  } catch (error) {
    next(error);
  }
};

const getPlayerStats = async (req, res, next) => {
  try {
    const stats = await prisma.playerStats.findMany({
      where: { playerId: parseInt(req.params.id) },
    });
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllPlayers, getPlayerById, getPlayerStats };
