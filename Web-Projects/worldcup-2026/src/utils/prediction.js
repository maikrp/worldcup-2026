import { RATING_METADATA, teamStrengthSeeds } from "../constants/teamRatings.js";

const AVERAGE_GOALS_PER_TEAM = 1.35;
const MAX_GOALS = 8;
const HOST_TEAMS = new Set(["Canadá", "Estados Unidos", "México"]);

function factorial(value) {
  let result = 1;
  for (let index = 2; index <= value; index += 1) result *= index;
  return result;
}

function poissonProbability(goals, expectedGoals) {
  return (Math.exp(-expectedGoals) * expectedGoals ** goals) / factorial(goals);
}

function eloFromFifaRank(teamName) {
  const rank = teamStrengthSeeds[teamName] || 50;
  return 2050 - (rank - 1) * 12;
}

export function eloStrength(teamName) {
  return 10 ** ((eloFromFifaRank(teamName) - 1800) / 400);
}

function tournamentStrength(stats) {
  const played = stats?.played || 0;
  if (!played) return { attack: 1, defense: 1, sampleWeight: 0 };

  const goalsForPerMatch = (stats.goals_for || 0) / played;
  const goalsAgainstPerMatch = (stats.goals_against || 0) / played;
  const sampleWeight = Math.min(played / 5, 0.6);

  return {
    attack: 1 - sampleWeight + sampleWeight * (goalsForPerMatch / AVERAGE_GOALS_PER_TEAM),
    defense: 1 - sampleWeight + sampleWeight * (goalsAgainstPerMatch / AVERAGE_GOALS_PER_TEAM),
    sampleWeight,
  };
}

function expectedGoalsFor(team, opponent) {
  const teamRating = eloStrength(team?.team_name);
  const opponentRating = eloStrength(opponent?.team_name);
  const teamForm = tournamentStrength(team);
  const opponentForm = tournamentStrength(opponent);
  const venueBoost = HOST_TEAMS.has(team?.team_name) ? 1.08 : 1;

  const ratingFactor = Math.sqrt(teamRating / opponentRating);
  const formFactor = Math.sqrt(teamForm.attack * opponentForm.defense);
  const expectedGoals = AVERAGE_GOALS_PER_TEAM * ratingFactor * formFactor * venueBoost;

  return Math.min(Math.max(expectedGoals, 0.35), 3.5);
}

function normalizePercentages(home, draw, away) {
  const raw = [home, draw, away].map((value) => value * 100);
  const rounded = raw.map(Math.round);
  const difference = 100 - rounded.reduce((sum, value) => sum + value, 0);
  const largestIndex = raw.indexOf(Math.max(...raw));
  rounded[largestIndex] += difference;
  return rounded;
}

export function predictMatch(home, away) {
  const homeExpectedGoals = expectedGoalsFor(home, away);
  const awayExpectedGoals = expectedGoalsFor(away, home);
  let homeWin = 0;
  let draw = 0;
  let awayWin = 0;

  for (let homeGoals = 0; homeGoals <= MAX_GOALS; homeGoals += 1) {
    for (let awayGoals = 0; awayGoals <= MAX_GOALS; awayGoals += 1) {
      const probability =
        poissonProbability(homeGoals, homeExpectedGoals) *
        poissonProbability(awayGoals, awayExpectedGoals);

      if (homeGoals > awayGoals) homeWin += probability;
      else if (homeGoals < awayGoals) awayWin += probability;
      else draw += probability;
    }
  }

  const coveredProbability = homeWin + draw + awayWin;
  const [homePercent, drawPercent, awayPercent] = normalizePercentages(
    homeWin / coveredProbability,
    draw / coveredProbability,
    awayWin / coveredProbability
  );
  const averagePlayed = ((home?.played || 0) + (away?.played || 0)) / 2;
  const confidenceScore = Math.min(45 + averagePlayed * 10, 75);

  return {
    home: homePercent,
    draw: drawPercent,
    away: awayPercent,
    expectedGoals: {
      home: Number(homeExpectedGoals.toFixed(2)),
      away: Number(awayExpectedGoals.toFixed(2)),
    },
    confidence: {
      score: confidenceScore,
      level: confidenceScore >= 70 ? "Alta" : confidenceScore >= 55 ? "Media" : "Baja",
    },
    metadata: RATING_METADATA,
  };
}

function samplePoisson(expectedGoals, random) {
  const limit = Math.exp(-expectedGoals);
  let probability = 1;
  let goals = 0;

  do {
    goals += 1;
    probability *= random();
  } while (probability > limit);

  return goals - 1;
}

export function simulateMatchScore(
  home,
  away,
  random,
  { baseHomeScore = 0, baseAwayScore = 0, remainingShare = 1, knockout = false } = {}
) {
  const homeExpectedGoals = expectedGoalsFor(home, away) * remainingShare;
  const awayExpectedGoals = expectedGoalsFor(away, home) * remainingShare;
  let homeScore = baseHomeScore + samplePoisson(homeExpectedGoals, random);
  let awayScore = baseAwayScore + samplePoisson(awayExpectedGoals, random);

  if (knockout && homeScore === awayScore) {
    homeScore += samplePoisson(expectedGoalsFor(home, away) / 3, random);
    awayScore += samplePoisson(expectedGoalsFor(away, home) / 3, random);
  }

  if (knockout && homeScore === awayScore) {
    const homeStrength = eloStrength(home?.team_name);
    const awayStrength = eloStrength(away?.team_name);
    const homePenaltyChance = homeStrength / (homeStrength + awayStrength);
    if (random() < homePenaltyChance) homeScore += 1;
    else awayScore += 1;
  }

  return { homeScore, awayScore };
}
