const prisma = require('../config/prisma');

const getAllMatches = async (req, res, next) => {
  try {
    const matches = await prisma.match.findMany({
      orderBy: { date: 'desc' },
    });
    res.json(matches);
  } catch (error) {
    next(error);
  }
};

const getMatchById = async (req, res, next) => {
  try {
    const match = await prisma.match.findUnique({
      where: { id: req.params.id },
    });
    if (!match) return res.status(404).json({ message: 'Match not found' });
    res.json(match);
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllMatches, getMatchById };
