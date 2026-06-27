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

const LIVE_MATCHES_CACHE_KEY = "worldcup-2026:live-matches:v2";
const CACHE_MAX_AGE = 30 * 24 * 60 * 60 * 1000;

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

export function loadCachedLiveMatches() {
  if (typeof window === "undefined") return null;

  try {
    const cached = JSON.parse(window.localStorage.getItem(LIVE_MATCHES_CACHE_KEY));
    const savedAt = new Date(cached?.savedAt).getTime();
    if (!Array.isArray(cached?.matches) || !Number.isFinite(savedAt)) return null;
    if (Date.now() - savedAt > CACHE_MAX_AGE) {
      window.localStorage.removeItem(LIVE_MATCHES_CACHE_KEY);
      return null;
    }

    return {
      matches: cached.matches.map((match) => ({
        ...match,
        cachedAt: cached.savedAt,
      })),
      syncedAt: cached.syncedAt || cached.savedAt,
      savedAt: cached.savedAt,
    };
  } catch {
    return null;
  }
}

export function saveCachedLiveMatches(liveData) {
  if (typeof window === "undefined" || !liveData?.matches?.length) return;

  try {
    const savedAt = new Date().toISOString();
    window.localStorage.setItem(
      LIVE_MATCHES_CACHE_KEY,
      JSON.stringify({
        savedAt,
        syncedAt: liveData.syncedAt || savedAt,
        matches: liveData.matches,
      })
    );
  } catch {
    // La aplicación continúa en memoria si el navegador bloquea el almacenamiento.
  }
}

export async function fetchLiveMatches(signal) {
  const sources = ["/api/live"];
  let payload;

  for (const source of sources) {
    const timeoutController = new AbortController();
    const timeoutId = window.setTimeout(() => timeoutController.abort(), 28000);
    const abortRequest = () => timeoutController.abort();
    signal?.addEventListener("abort", abortRequest, { once: true });

    try {
      const response = await fetch(source, {
        signal: timeoutController.signal,
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      if (!response.ok) continue;
      payload = await response.json();
      break;
    } catch (error) {
      if (signal?.aborted) throw error;
    } finally {
      window.clearTimeout(timeoutId);
      signal?.removeEventListener("abort", abortRequest);
    }
  }

  if (!payload) throw new Error("Live synchronization failed");

  return {
    syncedAt: payload.syncedAt || new Date().toISOString(),
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
      match_events: game.match_events || [],
      statistics: game.statistics || null,
      match_period: game.match_period || null,
      remoteVenue: game.venue || null,
      remoteLocalDate: game.local_date,
    })),
  };
}

function getUtcOffsetForStadium(stadiumName) {
  if (!stadiumName) return -6;
  const name = stadiumName.toLowerCase();

  // UTC-4 (EDT)
  if (
    name.includes("boston") ||
    name.includes("gillette") ||
    name.includes("new york") ||
    name.includes("metlife") ||
    name.includes("miami") ||
    name.includes("hard rock") ||
    name.includes("atlanta") ||
    name.includes("mercedes") ||
    name.includes("philadelphia") ||
    name.includes("lincoln") ||
    name.includes("toronto") ||
    name.includes("bmo")
  ) {
    return -4;
  }

  // UTC-5 (CDT)
  if (
    name.includes("dallas") ||
    name.includes("at&t") ||
    name.includes("houston") ||
    name.includes("nrg") ||
    name.includes("kansas") ||
    name.includes("arrowhead")
  ) {
    return -5;
  }

  // UTC-6 (CST / México)
  if (
    name.includes("mexico") ||
    name.includes("azteca") ||
    name.includes("monterrey") ||
    name.includes("guadalajara")
  ) {
    return -6;
  }

  // UTC-7 (PDT)
  if (
    name.includes("vancouver") ||
    name.includes("bc place") ||
    name.includes("los angeles") ||
    name.includes("sofi") ||
    name.includes("seattle") ||
    name.includes("lumen") ||
    name.includes("san francisco") ||
    name.includes("levi")
  ) {
    return -7;
  }

  return -6;
}

function parseRemoteLocalDate(dateStr, stadiumName) {
  if (!dateStr) return null;
  if (dateStr.includes("T") || dateStr.includes("Z")) {
    return dateStr;
  }

  const match = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/);
  if (match) {
    const [, month, day, year, hour, minute] = match;
    const offset = getUtcOffsetForStadium(stadiumName);
    const absOffset = Math.abs(offset);
    const sign = offset >= 0 ? "+" : "-";
    const formattedOffset = `${sign}${String(absOffset).padStart(2, "0")}:00`;
    const isoString = `${year}-${month}-${day}T${hour}:${minute}:00${formattedOffset}`;
    try {
      const d = new Date(isoString);
      if (!isNaN(d.getTime())) {
        return d.toISOString();
      }
    } catch {
      // ignore parsing failure and return original string
    }
  }
  return dateStr;
}

export function mergeLiveMatches(localMatches, remoteMatches) {
  const remoteByTeams = new Map(
    remoteMatches.map((match) => [`${match.home_team}|${match.away_team}`, match])
  );

  const mergedMatches = localMatches.map((match) => {
    const remote = remoteByTeams.get(`${match.home_team}|${match.away_team}`);
    if (!remote) return match;

    const merged = {
      ...match,
      home_score: remote.home_score,
      away_score: remote.away_score,
      status: remote.status,
      time_elapsed: remote.time_elapsed,
      home_scorers: remote.home_scorers,
      away_scorers: remote.away_scorers,
      match_events: remote.match_events,
      statistics: remote.statistics,
      match_period: remote.match_period,
      stadium: remote.remoteVenue || match.stadium,
      liveDataCachedAt: remote.cachedAt,
      hasLiveData: true,
    };

    if (remote.remoteLocalDate) {
      const parsedUtc = parseRemoteLocalDate(remote.remoteLocalDate, merged.stadium);
      if (parsedUtc) {
        merged.kickoff_utc = parsedUtc;
        merged.time_confirmed = true;
      }
    }

    return merged;
  });

  const localKeys = new Set(localMatches.map(m => `${m.home_team}|${m.away_team}`));
  const unmatchedRemotes = remoteMatches
    .filter(m => !localKeys.has(`${m.home_team}|${m.away_team}`))
    .map((m, idx) => {
      const stadium = m.remoteVenue || "Por definir";
      const parsedUtc = parseRemoteLocalDate(m.remoteLocalDate, stadium) || m.remoteLocalDate || new Date().toISOString();
      return { 
        ...m, 
        id: 10000 + idx,
        stadium,
        kickoff_utc: parsedUtc,
        time_confirmed: true,
        hasLiveData: true 
      };
    });

  return [...mergedMatches, ...unmatchedRemotes];
}
