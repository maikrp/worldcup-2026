const TEAM_NAMES = {
  Algeria: "Argelia",
  Argentina: "Argentina",
  Australia: "Australia",
  Austria: "Austria",
  Belgium: "Bélgica",
  "Bosnia and Herzegovina": "Bosnia-Herzegovina",
  Brazil: "Brasil",
  Canada: "Canadá",
  "Cape Verde": "Cabo Verde",
  Colombia: "Colombia",
  Croatia: "Croacia",
  Curacao: "Curazao",
  Curaçao: "Curazao",
  "Czech Republic": "República Checa",
  Czechia: "República Checa",
  "Democratic Republic of the Congo": "Congo RD",
  Ecuador: "Ecuador",
  Egypt: "Egipto",
  England: "Inglaterra",
  France: "Francia",
  Germany: "Alemania",
  Ghana: "Ghana",
  Haiti: "Haití",
  Iran: "Irán",
  Iraq: "Irak",
  "Ivory Coast": "Costa de Marfil",
  IvoryCoast: "Costa de Marfil",
  Japan: "Japón",
  Jordan: "Jordania",
  Mexico: "México",
  Morocco: "Marruecos",
  Netherlands: "Países Bajos",
  "New Zealand": "Nueva Zelanda",
  Norway: "Noruega",
  Panama: "Panamá",
  Paraguay: "Paraguay",
  Portugal: "Portugal",
  Qatar: "Catar",
  "Saudi Arabia": "Arabia Saudita",
  Scotland: "Escocia",
  Senegal: "Senegal",
  "South Africa": "Sudáfrica",
  "South Korea": "Corea del Sur",
  Spain: "España",
  Sweden: "Suecia",
  Switzerland: "Suiza",
  Tunisia: "Túnez",
  Turkey: "Turquía",
  "United States": "Estados Unidos",
  Uruguay: "Uruguay",
  Uzbekistan: "Uzbekistán",
  "DR Congo": "Congo RD",
};

function parseScore(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function mapStatus(game) {
  if (String(game.finished).toUpperCase() === "TRUE" || game.time_elapsed === "finished") {
    return "complete";
  }
  if (game.time_elapsed && game.time_elapsed !== "notstarted") return "live";
  return "scheduled";
}

function normalizeName(name) {
  return TEAM_NAMES[name] || name;
}

export async function fetchLiveMatches(signal) {
  const response = await fetch("/api/live", {
    signal,
    headers: { Accept: "application/json" },
  });

  if (!response.ok) throw new Error("Live synchronization failed");
  const payload = await response.json();

  return {
    syncedAt: payload.syncedAt,
    matches: (payload.games || []).map((game) => ({
      sourceId: game.id,
      home_team: normalizeName(game.home_team_name_en),
      away_team: normalizeName(game.away_team_name_en),
      home_score: parseScore(game.home_score),
      away_score: parseScore(game.away_score),
      status: mapStatus(game),
      time_elapsed: game.time_elapsed,
      home_scorers: game.home_scorers,
      away_scorers: game.away_scorers,
    })),
  };
}

export function mergeLiveMatches(localMatches, remoteMatches) {
  const remoteByTeams = new Map(
    remoteMatches.map((match) => [`${match.home_team}|${match.away_team}`, match])
  );

  return localMatches.map((match) => {
    const remote = remoteByTeams.get(`${match.home_team}|${match.away_team}`);
    if (!remote) return match;

    return {
      ...match,
      home_score: remote.home_score,
      away_score: remote.away_score,
      status: remote.status,
      time_elapsed: remote.time_elapsed,
      home_scorers: remote.home_scorers,
      away_scorers: remote.away_scorers,
    };
  });
}
