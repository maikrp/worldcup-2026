const LIVE_MATCH_WINDOW_MINUTES = 135;

export function getEffectiveMatchStatus(match, now = new Date()) {
  const kickoff = new Date(match.kickoff_utc);
  if (Number.isNaN(kickoff.getTime())) {
    return match.status;
  }

  const elapsedMinutes = (now.getTime() - kickoff.getTime()) / 60000;

  if (
    match.status === "scheduled" &&
    elapsedMinutes >= 0 &&
    elapsedMinutes < LIVE_MATCH_WINDOW_MINUTES
  ) {
    return "live";
  }

  if (match.status === "live" && elapsedMinutes >= LIVE_MATCH_WINDOW_MINUTES) {
    return match.home_score !== null && match.away_score !== null ? "complete" : "scheduled";
  }

  return match.status;
}

export function normalizeMatchStatuses(matches, now = new Date()) {
  return matches.map((match) => ({
    ...match,
    status: getEffectiveMatchStatus(match, now),
  }));
}
