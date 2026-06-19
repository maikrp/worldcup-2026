const LIVE_MATCH_WINDOW_MINUTES = 135;

export function getEffectiveMatchStatus(match, now = new Date()) {
  if (match.status !== "live") {
    return match.status;
  }

  const kickoff = new Date(match.kickoff_utc);
  if (Number.isNaN(kickoff.getTime())) {
    return match.status;
  }

  const elapsedMinutes = (now.getTime() - kickoff.getTime()) / 60000;
  return elapsedMinutes >= LIVE_MATCH_WINDOW_MINUTES ? "complete" : "live";
}

export function normalizeMatchStatuses(matches, now = new Date()) {
  return matches.map((match) => ({
    ...match,
    status: getEffectiveMatchStatus(match, now),
  }));
}
