import { RATING_METADATA, teamRatingPoints } from "../constants/teamRatings.js";

const AVERAGE_GOALS_PER_TEAM = 1.35;
const MAX_GOALS = 8;
const HOST_TEAMS = new Set(["Canadá", "Estados Unidos", "México"]);
const DEFAULT_FIFA_POINTS = 1450;

function factorial(value) {
  let result = 1;
  for (let index = 2; index <= value; index += 1) result *= index;
  return result;
}

function poissonProbability(goals, expectedGoals) {
  return (Math.exp(-expectedGoals) * expectedGoals ** goals) / factorial(goals);
}

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

export function eloStrength(teamName) {
  const fifaPoints = teamRatingPoints[teamName] || DEFAULT_FIFA_POINTS;
  return 10 ** ((fifaPoints - 1500) / 400);
}

function tournamentStrength(stats) {
  const played = stats?.played || 0;
  if (!played) return { attack: 1, defense: 1, sampleWeight: 0 };

  const goalsForPerMatch = (stats.goals_for || 0) / played;
  const goalsAgainstPerMatch = (stats.goals_against || 0) / played;
  const pointsPerMatch = (stats.points || 0) / played;
  const goalDifferencePerMatch =
    (stats.goal_difference ?? (stats.goals_for || 0) - (stats.goals_against || 0)) / played;
  const sampleWeight = Math.min(played / 3, 0.72);
  const resultFactor = clamp(
    0.72 + (pointsPerMatch / 3) * 0.56 + goalDifferencePerMatch * 0.08,
    0.65,
    1.45
  );
  const attackSignal = clamp(
    (goalsForPerMatch / AVERAGE_GOALS_PER_TEAM) * Math.sqrt(resultFactor),
    0.45,
    2.2
  );
  const defenseSignal = clamp(
    goalsAgainstPerMatch / AVERAGE_GOALS_PER_TEAM / Math.sqrt(resultFactor),
    0.45,
    2.2
  );

  return {
    attack: 1 - sampleWeight + sampleWeight * attackSignal,
    defense: 1 - sampleWeight + sampleWeight * defenseSignal,
    sampleWeight,
  };
}

function expectedGoalsFor(team, opponent) {
  const teamRating = eloStrength(team?.team_name);
  const opponentRating = eloStrength(opponent?.team_name);
  const teamForm = tournamentStrength(team);
  const opponentForm = tournamentStrength(opponent);
  const venueBoost = HOST_TEAMS.has(team?.team_name) ? 1.08 : 1;
  const averagePlayed = ((team?.played || 0) + (opponent?.played || 0)) / 2;
  const ratingExponent = Math.max(0.22, 0.42 - averagePlayed * 0.08);

  const ratingFactor = (teamRating / opponentRating) ** ratingExponent;
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
