export function getEffectiveMatchStatus(match, now = new Date()) {
  if (match.hasLiveData) return match.status;

  const kickoff = new Date(match.kickoff_utc);
  if (Number.isNaN(kickoff.getTime())) {
    return match.status;
  }

  if (match.status === "live" && now.getTime() - kickoff.getTime() > 6 * 60 * 60 * 1000) {
    return match.home_score !== null && match.away_score !== null ? "complete" : "scheduled";
  }

  return match.status;
}

function estimateLiveMatchTime(match, now = new Date()) {
  const kickoff = new Date(match.kickoff_utc);
  if (Number.isNaN(kickoff.getTime())) return null;

  const elapsedMinutes = Math.floor((now.getTime() - kickoff.getTime()) / 60000);
  if (elapsedMinutes < 0 || elapsedMinutes > 130) return null;
  if (elapsedMinutes <= 55) return `~${Math.max(elapsedMinutes, 1)}'`;
  if (elapsedMinutes <= 70) return "Descanso";

  return `~${Math.min(elapsedMinutes - 15, 90)}'`;
}

export function formatLiveMatchTime(match, now = new Date()) {
  const rawValue = String(match.time_elapsed ?? "").trim();
  const normalizedValue = rawValue.toLowerCase();

  if (
    !rawValue ||
    ["live", "inprogress", "in progress", "inplay", "in play"].includes(normalizedValue)
  ) {
    return estimateLiveMatchTime(match, now) || "En vivo";
  }
  if (normalizedValue === "notstarted") return "En vivo";
  if (normalizedValue === "finished") return "Finalizado";
  if (["halftime", "half-time", "ht", "break"].includes(normalizedValue)) return "Descanso";
  if (["extra_time", "extra time", "et"].includes(normalizedValue)) return "Tiempo extra";
  if (["penalties", "penalty", "pens"].includes(normalizedValue)) return "Penales";

  const minuteMatch = rawValue.match(/\d{1,3}(?:\+\d{1,2})?/);
  return minuteMatch ? `${minuteMatch[0]}'` : "En vivo";
}

export function formatLiveMatchLabel(match, now = new Date()) {
  const matchTime = formatLiveMatchTime(match, now);
  return matchTime === "En vivo" ? "En vivo" : `En vivo · ${matchTime}`;
}

export function normalizeMatchStatuses(matches, now = new Date()) {
  return matches.map((match) => ({
    ...match,
    status: getEffectiveMatchStatus(match, now),
  }));
}
