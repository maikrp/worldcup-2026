const SOURCE_URL = "https://worldcup26.ir/get/games";
const ESPN_URL = "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard";
const SOURCE_HEADERS = {
  Accept: "application/json",
  "Accept-Language": "en-US,en;q=0.9",
  "User-Agent": "Mozilla/5.0 (compatible; WorldCup2026Dashboard/1.0)",
};

async function fetchLivePayload() {
  let lastError;

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const sourceResponse = await fetch(SOURCE_URL, {
        headers: SOURCE_HEADERS,
        signal: AbortSignal.timeout(8000),
        cache: "no-store",
      });

      if (!sourceResponse.ok) {
        lastError = new Error(`Live source responded ${sourceResponse.status}`);
        continue;
      }

      return await sourceResponse.json();
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Live source unavailable");
}

function getCostaRicaDateKey() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Costa_Rica",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}${values.month}${values.day}`;
}

function scorerEvents(competition, teamId) {
  return (competition.details || [])
    .filter((detail) => detail.scoringPlay && String(detail.team?.id) === String(teamId))
    .map((detail) => {
      const player = detail.athletesInvolved?.[0]?.displayName || "Jugador";
      const minute = detail.clock?.displayValue || "";
      return `${player} ${minute}${detail.ownGoal ? " (OG)" : ""}`.trim();
    });
}

function matchEvents(competition, homeId, awayId) {
  return (competition.details || [])
    .map((detail) => {
      const eventName = String(detail.type?.text || "").toLowerCase();
      const yellowCard = detail.yellowCard || eventName.includes("yellow");
      const redCard = detail.redCard || eventName.includes("red");

      return {
        id: `${detail.type?.id || "event"}-${detail.clock?.value || 0}-${detail.team?.id || ""}`,
        type: detail.scoringPlay
          ? "goal"
          : redCard
            ? "red-card"
            : yellowCard
              ? "yellow-card"
              : null,
        minute: detail.clock?.displayValue || "",
        team:
          String(detail.team?.id) === String(homeId)
            ? "home"
            : String(detail.team?.id) === String(awayId)
              ? "away"
              : null,
        player:
          detail.athletesInvolved?.[0]?.displayName ||
          detail.athletesInvolved?.[0]?.shortName ||
          "Jugador no informado",
        headshot: detail.athletesInvolved?.[0]?.headshot || null,
        penalty: Boolean(detail.penaltyKick),
        ownGoal: Boolean(detail.ownGoal),
      };
    })
    .filter((event) => event.type);
}

function teamStatistics(competitor) {
  return Object.fromEntries(
    (competitor?.statistics || []).map((statistic) => [statistic.name, statistic.displayValue])
  );
}

function teamLineup(competitor) {
  if (!competitor?.roster) return null;
  // Extraemos la información del roster (alineación titular) asumiendo la estructura típica de ESPN
  return competitor.roster
    .filter(player => player.starter)
    .map(player => ({
      name: player.athlete?.displayName || player.athlete?.shortName || "Desconocido",
      number: player.athlete?.jersey || "",
      position: player.position?.abbreviation || "",
    }));
}

async function fetchEspnGames() {
  const dateRange = `20260611-${getCostaRicaDateKey()}`;
  const response = await fetch(`${ESPN_URL}?dates=${dateRange}`, {
    headers: SOURCE_HEADERS,
    signal: AbortSignal.timeout(8000),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`ESPN responded ${response.status}`);

  const payload = await response.json();
  return (payload.events || []).flatMap((event) =>
    (event.competitions || []).map((competition) => {
      const home = competition.competitors?.find((team) => team.homeAway === "home");
      const away = competition.competitors?.find((team) => team.homeAway === "away");
      const status = competition.status || event.status;
      const state = status?.type?.state;
      const completed = Boolean(status?.type?.completed);

      return {
        id: event.id,
        home_team_name_en: home?.team?.displayName,
        away_team_name_en: away?.team?.displayName,
        home_score: home?.score ?? null,
        away_score: away?.score ?? null,
        home_scorers: scorerEvents(competition, home?.id),
        away_scorers: scorerEvents(competition, away?.id),
        match_events: matchEvents(competition, home?.id, away?.id),
        home_lineup: teamLineup(home),
        away_lineup: teamLineup(away),
        statistics: {
          home: teamStatistics(home),
          away: teamStatistics(away),
        },
        venue: competition.venue?.fullName || event.venue?.displayName || null,
        match_period: status?.type?.description || null,
        local_date: event.date,
        finished: completed ? "TRUE" : "FALSE",
        time_elapsed: completed
          ? "finished"
          : state === "in"
            ? status?.displayClock || status?.type?.shortDetail || "live"
            : "notstarted",
      };
    })
  );
}

function mergeProviderGames(primaryGames, espnGames) {
  const key = (game) => `${game.home_team_name_en}|${game.away_team_name_en}`;
  const merged = new Map((primaryGames || []).map((game) => [key(game), game]));

  espnGames.forEach((game) => {
    const current = merged.get(key(game));
    merged.set(key(game), {
      ...current,
      ...game,
      home_scorers: current?.home_scorers || game.home_scorers,
      away_scorers: current?.away_scorers || game.away_scorers,
      home_lineup: current?.home_lineup || game.home_lineup,
      away_lineup: current?.away_lineup || game.away_lineup,
    });
  });

  return [...merged.values()];
}

export default async function handler(_request, response) {
  try {
    const [primaryResult, espnResult] = await Promise.allSettled([
      fetchLivePayload(),
      fetchEspnGames(),
    ]);
    const primaryGames =
      primaryResult.status === "fulfilled" ? primaryResult.value.games || [] : [];
    const espnGames = espnResult.status === "fulfilled" ? espnResult.value : [];

    if (!primaryGames.length && !espnGames.length) {
      throw new Error("All live providers failed");
    }

    response.setHeader("Cache-Control", "no-store, max-age=0");
    response.setHeader("CDN-Cache-Control", "no-store");
    return response.status(200).json({
      games: mergeProviderGames(primaryGames, espnGames),
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Live synchronization failed", error);
    return response.status(502).json({ error: "Unable to synchronize live matches" });
  }
}
