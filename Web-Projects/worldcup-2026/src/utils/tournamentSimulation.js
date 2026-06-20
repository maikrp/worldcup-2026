import { simulateMatchScore } from "./prediction.js";

const THIRD_PLACE_SLOTS = [
  { id: "M74", allowedGroups: ["A", "B", "C", "D", "F"] },
  { id: "M77", allowedGroups: ["C", "D", "F", "G", "H"] },
  { id: "M79", allowedGroups: ["C", "E", "F", "H", "I"] },
  { id: "M80", allowedGroups: ["E", "H", "I", "J", "K"] },
  { id: "M81", allowedGroups: ["B", "E", "F", "I", "J"] },
  { id: "M82", allowedGroups: ["A", "E", "H", "I", "J"] },
  { id: "M85", allowedGroups: ["E", "F", "G", "I", "J"] },
  { id: "M87", allowedGroups: ["D", "E", "I", "J", "L"] },
];

const ROUND_OF_16 = [
  ["M89", "M73", "M75"],
  ["M90", "M74", "M77"],
  ["M91", "M76", "M78"],
  ["M92", "M79", "M80"],
  ["M93", "M83", "M84"],
  ["M94", "M81", "M82"],
  ["M95", "M86", "M88"],
  ["M96", "M85", "M87"],
];

const QUARTERFINALS = [
  ["M97", "M89", "M90"],
  ["M98", "M93", "M94"],
  ["M99", "M91", "M92"],
  ["M100", "M95", "M96"],
];

const SEMIFINALS = [
  ["M101", "M97", "M98"],
  ["M102", "M99", "M100"],
];

function hashString(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function createTeam(team) {
  return {
    code: team.code,
    team_name: team.team_name,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goals_for: 0,
    goals_against: 0,
    goal_difference: 0,
    points: 0,
  };
}

function cloneGroups(groupsTemplate) {
  return groupsTemplate.map((group) => ({
    name: group.name,
    standings: group.standings.map(createTeam),
  }));
}

function compareTeams(a, b) {
  if (b.points !== a.points) return b.points - a.points;
  if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference;
  if (b.goals_for !== a.goals_for) return b.goals_for - a.goals_for;
  return a.tieBreaker - b.tieBreaker;
}

function applyResult(home, away, homeScore, awayScore) {
  home.played += 1;
  away.played += 1;
  home.goals_for += homeScore;
  home.goals_against += awayScore;
  away.goals_for += awayScore;
  away.goals_against += homeScore;

  if (homeScore > awayScore) {
    home.wins += 1;
    home.points += 3;
    away.losses += 1;
  } else if (homeScore < awayScore) {
    away.wins += 1;
    away.points += 3;
    home.losses += 1;
  } else {
    home.draws += 1;
    away.draws += 1;
    home.points += 1;
    away.points += 1;
  }

  home.goal_difference = home.goals_for - home.goals_against;
  away.goal_difference = away.goals_for - away.goals_against;
}

function getLiveRemainingShare(match) {
  const minute = Number.parseInt(String(match.time_elapsed).match(/\d{1,3}/)?.[0], 10);
  if (!Number.isFinite(minute)) return 0.5;
  return Math.max(0.05, Math.min((95 - minute) / 95, 1));
}

function getGroupName(match) {
  return String(match.phase || match.round || "").replace("Grupo ", "");
}

function assignThirdPlacedTeams(thirdTeams, random) {
  const slots = [...THIRD_PLACE_SLOTS].sort(
    (a, b) =>
      a.allowedGroups.filter((group) => thirdTeams.some((team) => team.group === group)).length -
      b.allowedGroups.filter((group) => thirdTeams.some((team) => team.group === group)).length
  );
  const assignments = new Map();

  function search(index, availableTeams) {
    if (index === slots.length) return true;
    const slot = slots[index];
    const candidates = availableTeams
      .filter((team) => slot.allowedGroups.includes(team.group))
      .map((team) => ({ team, order: random() }))
      .sort((a, b) => a.order - b.order)
      .map(({ team }) => team);

    for (const team of candidates) {
      assignments.set(slot.id, team);
      if (
        search(
          index + 1,
          availableTeams.filter((candidate) => candidate !== team)
        )
      )
        return true;
      assignments.delete(slot.id);
    }
    return false;
  }

  return search(0, thirdTeams) ? assignments : null;
}

function playKnockoutMatch(home, away, random) {
  const { homeScore, awayScore } = simulateMatchScore(home, away, random, { knockout: true });
  return homeScore > awayScore ? home : away;
}

function runKnockout(groupResults, thirdAssignments, random) {
  const byGroup = new Map(groupResults.map((group) => [group.name, group.standings]));
  const winners = new Map();
  const team = (group, position) => byGroup.get(group)[position - 1];

  const roundOf32 = [
    ["M73", team("A", 2), team("B", 2)],
    ["M74", team("E", 1), thirdAssignments.get("M74")],
    ["M75", team("F", 1), team("C", 2)],
    ["M76", team("C", 1), team("F", 2)],
    ["M77", team("I", 1), thirdAssignments.get("M77")],
    ["M78", team("E", 2), team("I", 2)],
    ["M79", team("A", 1), thirdAssignments.get("M79")],
    ["M80", team("L", 1), thirdAssignments.get("M80")],
    ["M81", team("D", 1), thirdAssignments.get("M81")],
    ["M82", team("G", 1), thirdAssignments.get("M82")],
    ["M83", team("K", 2), team("L", 2)],
    ["M84", team("H", 1), team("J", 2)],
    ["M85", team("B", 1), thirdAssignments.get("M85")],
    ["M86", team("J", 1), team("H", 2)],
    ["M87", team("K", 1), thirdAssignments.get("M87")],
    ["M88", team("D", 2), team("G", 2)],
  ];

  roundOf32.forEach(([id, home, away]) => winners.set(id, playKnockoutMatch(home, away, random)));

  [ROUND_OF_16, QUARTERFINALS, SEMIFINALS].forEach((round) => {
    round.forEach(([id, homeId, awayId]) => {
      winners.set(id, playKnockoutMatch(winners.get(homeId), winners.get(awayId), random));
    });
  });

  return playKnockoutMatch(winners.get("M101"), winners.get("M102"), random).team_name;
}

function runTournament(groupsTemplate, matches, random) {
  const groups = cloneGroups(groupsTemplate);
  const groupsByName = new Map(groups.map((group) => [group.name, group]));
  const teams = new Map(
    groups.flatMap((group) => group.standings.map((team) => [team.team_name, team]))
  );
  const groupMatches = matches
    .filter((match) => /^Grupo [A-L]$/.test(match.phase || match.round || ""))
    .sort((a, b) => new Date(a.kickoff_utc) - new Date(b.kickoff_utc));

  groupMatches.forEach((match) => {
    const home = teams.get(match.home_team);
    const away = teams.get(match.away_team);
    if (!home || !away || !groupsByName.has(getGroupName(match))) return;

    if (match.status === "complete") {
      applyResult(home, away, match.home_score ?? 0, match.away_score ?? 0);
      return;
    }

    const live = match.status === "live";
    const result = simulateMatchScore(home, away, random, {
      baseHomeScore: live ? (match.home_score ?? 0) : 0,
      baseAwayScore: live ? (match.away_score ?? 0) : 0,
      remainingShare: live ? getLiveRemainingShare(match) : 1,
    });
    applyResult(home, away, result.homeScore, result.awayScore);
  });

  groups.forEach((group) => {
    group.standings.forEach((team) => {
      team.tieBreaker = random();
    });
    group.standings.sort(compareTeams);
  });
  const bestThirds = groups
    .map((group) => ({ ...group.standings[2], group: group.name }))
    .sort(compareTeams)
    .slice(0, 8);
  const thirdAssignments = assignThirdPlacedTeams(bestThirds, random);

  return thirdAssignments ? runKnockout(groups, thirdAssignments, random) : null;
}

export function simulateWorldCup(groupsTemplate, matches, iterations = 5000) {
  const stateKey = matches
    .map(
      (match) =>
        `${match.id}:${match.status}:${match.home_score ?? ""}:${match.away_score ?? ""}:${match.time_elapsed ?? ""}`
    )
    .join("|");
  const random = createRandom(hashString(stateKey));
  const titles = new Map();
  let completedSimulations = 0;

  for (let iteration = 0; iteration < iterations; iteration += 1) {
    const champion = runTournament(groupsTemplate, matches, random);
    if (!champion) continue;
    titles.set(champion, (titles.get(champion) || 0) + 1);
    completedSimulations += 1;
  }

  const probabilities = [...titles.entries()]
    .map(([team, titlesWon]) => ({
      team,
      titlesWon,
      probability: (titlesWon / completedSimulations) * 100,
    }))
    .sort((a, b) => b.titlesWon - a.titlesWon);

  return {
    iterations: completedSimulations,
    probabilities,
    totalProbability: probabilities.reduce((sum, item) => sum + item.probability, 0),
  };
}
