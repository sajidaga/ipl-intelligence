const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const matchesCsvPath = path.join(__dirname, 'data', 'matches.csv');
const deliveriesCsvPath = path.join(__dirname, 'data', 'deliveries.csv');

const TEAM_DETAILS = {
  'Rajasthan Royals': { shortName: 'RR', city: 'Jaipur' },
  'Royal Challengers Bangalore': { shortName: 'RCB', city: 'Bangalore' },
  'Sunrisers Hyderabad': { shortName: 'SRH', city: 'Hyderabad' },
  'Delhi Capitals': { shortName: 'DC', city: 'Delhi' },
  'Chennai Super Kings': { shortName: 'CSK', city: 'Chennai' },
  'Gujarat Titans': { shortName: 'GT', city: 'Ahmedabad' },
  'Lucknow Super Giants': { shortName: 'LSG', city: 'Lucknow' },
  'Kolkata Knight Riders': { shortName: 'KKR', city: 'Kolkata' },
  'Punjab Kings': { shortName: 'PBKS', city: 'Mohali' },
  'Mumbai Indians': { shortName: 'MI', city: 'Mumbai' },
  'Kings XI Punjab': { shortName: 'KXIP', city: 'Mohali' },
  'Delhi Daredevils': { shortName: 'DD', city: 'Delhi' },
  'Rising Pune Supergiant': { shortName: 'RPS', city: 'Pune' },
  'Rising Pune Supergiants': { shortName: 'RPS', city: 'Pune' },
  'Gujarat Lions': { shortName: 'GL', city: 'Rajkot' },
  'Pune Warriors': { shortName: 'PW', city: 'Pune' },
  'Deccan Chargers': { shortName: 'DEC', city: 'Hyderabad' },
  'Kochi Tuskers Kerala': { shortName: 'KTK', city: 'Kochi' }
};

function parseSeason(seasonStr) {
  if (!seasonStr) return 2008;
  return parseInt(seasonStr.toString().split('/')[0]) || 2008;
}

async function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
}

function parsePlayersList(str) {
  try {
    return JSON.parse(str.replace(/'/g, '"'));
  } catch (e) {
    return [];
  }
}

async function main() {
  console.log('Clearing database...');
  await prisma.playerStats.deleteMany({});
  await prisma.match.deleteMany({});
  await prisma.player.deleteMany({});
  await prisma.team.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Reading CSV files...');
  const matchesData = await readCSV(matchesCsvPath);
  const deliveriesData = await readCSV(deliveriesCsvPath);

  console.log(`Parsed ${matchesData.length} matches and ${deliveriesData.length} deliveries.`);

  // 1. Create Teams
  const uniqueTeamNames = new Set();
  matchesData.forEach(row => {
    if (row.Team1) uniqueTeamNames.add(row.Team1);
    if (row.Team2) uniqueTeamNames.add(row.Team2);
  });

  const teamsToCreate = Array.from(uniqueTeamNames).filter(Boolean).map(name => {
    const detail = TEAM_DETAILS[name] || { shortName: name.substring(0, 3).toUpperCase(), city: 'Unknown' };
    return {
      name,
      shortName: detail.shortName,
      city: detail.city
    };
  });

  await prisma.team.createMany({ data: teamsToCreate, skipDuplicates: true });
  const teams = await prisma.team.findMany();
  const teamIdMap = {};
  teams.forEach(t => teamIdMap[t.name] = t.id);

  console.log(`Inserted ${teams.length} teams.`);

  // 2. Identify Players and their last known Team
  const playersMap = {}; // name -> teamName
  // Let matches define the player teams as they appear latest
  matchesData.forEach(row => {
    const team1players = parsePlayersList(row.Team1Players);
    team1players.forEach(p => { playersMap[p] = row.Team1; });

    const team2players = parsePlayersList(row.Team2Players);
    team2players.forEach(p => { playersMap[p] = row.Team2; });
  });

  const playersToCreate = Object.keys(playersMap).map(pName => {
    return {
      name: pName,
      role: 'Batsman', // Default,
      teamId: teamIdMap[playersMap[pName]] || null
    };
  });

  console.log(`Inserting ${playersToCreate.length} players...`);
  // createMany for players
  await prisma.player.createMany({ data: playersToCreate, skipDuplicates: true });
  const allPlayers = await prisma.player.findMany();
  const playerIdMap = {};
  allPlayers.forEach(p => playerIdMap[p.name] = p.id);

  console.log(`Inserted ${allPlayers.length} players.`);

  // 3. Create Matches
  console.log('Inserting Matches...');
  const matchesToCreate = matchesData.map(row => {
    if (!row.Team1 || !row.Team2) return null;
    return {
       season: parseSeason(row.Season),
       date: new Date(row.Date || '2008-01-01'),
       venue: row.Venue || 'Unknown',
       homeTeamId: teamIdMap[row.Team1],
       awayTeamId: teamIdMap[row.Team2],
       result: row.WonBy || null,
       winner: row.WinningTeam && teamIdMap[row.WinningTeam] ? teamIdMap[row.WinningTeam] : null
    };
  }).filter(m => m && m.homeTeamId && m.awayTeamId);

  await prisma.match.createMany({ data: matchesToCreate, skipDuplicates: true });
  console.log(`Inserted Matches.`);

  // 4. Calculate PlayerStats per Season from Deliveries
  // To get season for each delivery, we map Match ID -> Season
  const matchSeasonMap = {};
  matchesData.forEach(row => {
    if(row.ID) {
      matchSeasonMap[row.ID] = parseSeason(row.Season);
    }
  });

  // map: playerName_season -> statObject
  const statsAggr = {};
  const initStat = () => ({ runs: 0, wickets: 0, catches: 0, ballsFaced: 0, matches: new Set() });

  console.log('Aggregating Player Stats...');
  deliveriesData.forEach(row => {
    const season = matchSeasonMap[row.ID] || 2008;
    const batter = row.batter;
    const bowler = row.bowler;
    const fielder = row.player_out && row.kind === 'caught' && row.fielders_involved && row.fielders_involved !== 'NA' ? row.fielders_involved : null;
    
    // Batter stats
    if (batter) {
      const bKey = `${batter}_${season}`;
      if (!statsAggr[bKey]) statsAggr[bKey] = initStat();
      statsAggr[bKey].runs += parseInt(row.batsman_run) || 0;
      statsAggr[bKey].ballsFaced += 1;
      statsAggr[bKey].matches.add(row.ID);
    }
    
    // Bowler stats
    if (bowler && row.isWicketDelivery == '1' && row.kind !== 'run out') {
      const boKey = `${bowler}_${season}`;
      if (!statsAggr[boKey]) statsAggr[boKey] = initStat();
      statsAggr[boKey].wickets += 1;
      statsAggr[boKey].matches.add(row.ID);
    } else if (bowler) {
      const boKey = `${bowler}_${season}`;
      if (!statsAggr[boKey]) statsAggr[boKey] = initStat();
      statsAggr[boKey].matches.add(row.ID);
    }

    // Fielder catches
    if (fielder) {
      // Split fielders if multiple, usually just one
      const fielders = fielder.split(',');
      fielders.forEach(f => {
        const trF = f.trim();
        const fKey = `${trF}_${season}`;
        if (!statsAggr[fKey]) statsAggr[fKey] = initStat();
        statsAggr[fKey].catches += 1;
        statsAggr[fKey].matches.add(row.ID);
      });
    }
  });

  console.log('Formatting stats for db insertion...');
  const statsToCreate = [];
  for (const [key, stat] of Object.entries(statsAggr)) {
    const [pName, seasonStr] = key.split('_');
    const season = parseInt(seasonStr);
    const pId = playerIdMap[pName];
    if (!pId) continue; // Skip if player not found in map (e.g., obscure substitute)

    const strikeRate = stat.ballsFaced > 0 ? (stat.runs / stat.ballsFaced) * 100 : 0;
    // For average, we don't have total outs easily tracked unless we parse it. We'll simplify.
    const average = stat.runs > 0 ? stat.runs / (Math.max(1, Math.floor(stat.ballsFaced / 10))) : 0; // naive average

    statsToCreate.push({
      playerId: pId,
      season: season,
      matches: stat.matches.size,
      runs: stat.runs,
      wickets: stat.wickets,
      catches: stat.catches,
      strikeRate: parseFloat(strikeRate.toFixed(2)),
      average: parseFloat(average.toFixed(2))
    });
  }

  // Insert in chunks of 5000 to avoid limits
  console.log(`Inserting ${statsToCreate.length} PlayerStat records...`);
  const chunkSize = 5000;
  for (let i = 0; i < statsToCreate.length; i += chunkSize) {
    const chunk = statsToCreate.slice(i, i + chunkSize);
    await prisma.playerStats.createMany({ data: chunk, skipDuplicates: true });
    console.log(`Inserted stats chunk ${i/chunkSize + 1}`);
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
