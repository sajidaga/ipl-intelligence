const prisma = require('../config/prisma');

const getAllTeams = async (req, res, next) => {
  try {
    const teams = await prisma.team.findMany();
    res.json(teams);
  } catch (error) {
    next(error);
  }
};

const getTeamById = async (req, res, next) => {
  try {
    const team = await prisma.team.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!team) return res.status(404).json({ message: 'Team not found' });
    res.json(team);
  } catch (error) {
    next(error);
  }
};

const getTeamPlayers = async (req, res, next) => {
  try {
    const players = await prisma.player.findMany({
      where: { teamId: parseInt(req.params.id) },
    });
    res.json(players);
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllTeams, getTeamById, getTeamPlayers };
