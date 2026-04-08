const prisma = require('../config/prisma');

const getSeasonSummary = async (req, res, next) => {
  try {
    const season = parseInt(req.params.year);
    if (!season) return res.status(400).json({ message: 'Invalid season year' });

    const matches = await prisma.match.findMany({
      where: { season },
      select: { result: true, winner: true, homeTeamId: true, awayTeamId: true },
    });

    const totalMatches = matches.length;

    // A small aggregation of stats for the year
    const topScorer = await prisma.playerStats.findFirst({
      where: { season },
      orderBy: { runs: 'desc' },
      include: { player: { select: { name: true } } }
    });

    const topWicketTaker = await prisma.playerStats.findFirst({
      where: { season },
      orderBy: { wickets: 'desc' },
      include: { player: { select: { name: true } } }
    });

    res.json({
      season,
      totalMatches,
      topScorer: topScorer ? { name: topScorer.player.name, runs: topScorer.runs } : null,
      topWicketTaker: topWicketTaker ? { name: topWicketTaker.player.name, wickets: topWicketTaker.wickets } : null
    });
  } catch (error) {
    next(error);
  }
};

const getTopScorers = async (req, res, next) => {
  try {
    const { season } = req.query;
    const whereClause = season ? { season: parseInt(season) } : {};

    const stats = await prisma.playerStats.groupBy({
      by: ['playerId'],
      _sum: {
        runs: true,
      },
      orderBy: {
        _sum: {
          runs: 'desc',
        },
      },
      take: 10,
    });

    const topScorers = await Promise.all(stats.map(async (stat) => {
      const player = await prisma.player.findUnique({ where: { id: stat.playerId }, select: { name: true }});
      return {
        playerId: stat.playerId,
        name: player ? player.name : 'Unknown',
        totalRuns: stat._sum.runs,
      };
    }));

    res.json(topScorers);
  } catch (error) {
    next(error);
  }
};

const getTopWicketTakers = async (req, res, next) => {
  try {
    const { season } = req.query;
    const whereClause = season ? { season: parseInt(season) } : {};

    const stats = await prisma.playerStats.groupBy({
      by: ['playerId'],
      _sum: {
        wickets: true,
      },
      orderBy: {
        _sum: {
          wickets: 'desc',
        },
      },
      take: 10,
    });

    const topWicketTakers = await Promise.all(stats.map(async (stat) => {
      const player = await prisma.player.findUnique({ where: { id: stat.playerId }, select: { name: true }});
      return {
        playerId: stat.playerId,
        name: player ? player.name : 'Unknown',
        totalWickets: stat._sum.wickets,
      };
    }));

    res.json(topWicketTakers);
  } catch (error) {
    next(error);
  }
};

module.exports = { getSeasonSummary, getTopScorers, getTopWicketTakers };
