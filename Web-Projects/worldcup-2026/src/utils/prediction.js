export function predictMatch(home, away) {
  const homePower =
    (home?.points || 0) * 3 +
    (home?.wins || 0) * 2 +
    (home?.goal_difference || 0) +
    (home?.goals_for || 0);

  const awayPower =
    (away?.points || 0) * 3 +
    (away?.wins || 0) * 2 +
    (away?.goal_difference || 0) +
    (away?.goals_for || 0);

  const baseHome = homePower === 0 ? 15 : homePower;
  const baseAway = awayPower === 0 ? 15 : awayPower;

  const total = baseHome + baseAway + 10;

  const homeChance = Math.round(((baseHome + 5) / total) * 100);
  const awayChance = Math.round(((baseAway + 5) / total) * 100);
  const drawChance = Math.max(100 - homeChance - awayChance, 10);

  return {
    home: Math.max(homeChance - 5, 20),
    draw: drawChance,
    away: Math.max(awayChance - 5, 20),
  };
}
