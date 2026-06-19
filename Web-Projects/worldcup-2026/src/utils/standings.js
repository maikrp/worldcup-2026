export function calculateStandings(groupsTemplate, matches) {
  // Clonado profundo simple del template para evitar mutaciones
  const calculatedGroups = groupsTemplate.map(group => ({
    name: group.name,
    standings: group.standings.map(team => ({
      code: team.code,
      team_name: team.team_name,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goals_for: 0,
      goals_against: 0,
      goal_difference: 0,
      points: 0
    }))
  }));

  // Procesar partidos completados y partidos en vivo
  matches.forEach(match => {
    if (match.status !== "complete" && match.status !== "live") return;

    const { home_team, away_team, home_score, away_score } = match;
    if (home_score === null || away_score === null) return;

    let homeTeamObj = null;
    let awayTeamObj = null;

    for (const group of calculatedGroups) {
      homeTeamObj = group.standings.find(t => t.team_name === home_team);
      if (homeTeamObj) break;
    }

    for (const group of calculatedGroups) {
      awayTeamObj = group.standings.find(t => t.team_name === away_team);
      if (awayTeamObj) break;
    }

    if (homeTeamObj && awayTeamObj) {
      homeTeamObj.played += 1;
      awayTeamObj.played += 1;
      homeTeamObj.goals_for += home_score;
      homeTeamObj.goals_against += away_score;
      awayTeamObj.goals_for += away_score;
      awayTeamObj.goals_against += home_score;

      if (home_score > away_score) {
        homeTeamObj.wins += 1;
        homeTeamObj.points += 3;
        awayTeamObj.losses += 1;
      } else if (home_score < away_score) {
        awayTeamObj.wins += 1;
        awayTeamObj.points += 3;
        homeTeamObj.losses += 1;
      } else {
        homeTeamObj.draws += 1;
        homeTeamObj.points += 1;
        awayTeamObj.draws += 1;
        awayTeamObj.points += 1;
      }

      homeTeamObj.goal_difference = homeTeamObj.goals_for - homeTeamObj.goals_against;
      awayTeamObj.goal_difference = awayTeamObj.goals_for - awayTeamObj.goals_against;
    }
  });

  // Ordenar las posiciones del grupo según las reglas de la FIFA
  calculatedGroups.forEach(group => {
    group.standings.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference;
      return b.goals_for - a.goals_for;
    });
  });

  return calculatedGroups;
}
