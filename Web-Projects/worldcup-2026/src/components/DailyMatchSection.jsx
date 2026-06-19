import React from "react";
import { Clock, Calendar } from "lucide-react";
import { globalTeamCodes as teamCodes, flagUrl } from "../constants/teamCodes";
import { predictMatch } from "../utils/prediction";

function getCostaRicaDateString(kickoffUtc) {
  try {
    const date = new Date(kickoffUtc);
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Costa_Rica",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const parts = formatter.formatToParts(date);
    const year = parts.find((p) => p.type === "year").value;
    const month = parts.find((p) => p.type === "month").value;
    const day = parts.find((p) => p.type === "day").value;
    return `${year}-${month}-${day}`;
  } catch {
    return kickoffUtc.split("T")[0];
  }
}

function getLiveMinute(kickoffUtc) {
  try {
    const diffMs = new Date() - new Date(kickoffUtc);
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 0) return "1'";
    if (diffMins > 90) return "90+2'";
    if (diffMins > 45 && diffMins < 60) return "Int.";
    return `${diffMins}'`;
  } catch {
    return "15'";
  }
}

export default function DailyMatchSection({ matches, groups, selectedDate, onPrevDay, onNextDay }) {
  const dailyMatches = matches
    .filter((m) => {
      const CRDate = getCostaRicaDateString(m.kickoff_utc);
      return CRDate === selectedDate;
    })
    .sort((a, b) => new Date(a.kickoff_utc) - new Date(b.kickoff_utc));

  function formatDateSpanish(dateStr) {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("es-ES", { day: "numeric", month: "long" });
  }

  function findTeamStats(name) {
    if (!groups) return {};
    for (const group of groups) {
      const standings = group.standings || [];
      const found = standings.find((t) => t.team_name === name);
      if (found) return found;
    }
    return {};
  }

  return (
    <div className="dashboard-section matches-by-date-card">
      <div className="section-header date-header">
        <h2>📅 Partidos de la Fecha</h2>
        <div className="date-navigator">
          <button className="date-nav-btn" onClick={onPrevDay}>
            ◀
          </button>
          <span className="current-date-label">{formatDateSpanish(selectedDate)}</span>
          <button className="date-nav-btn" onClick={onNextDay}>
            ▶
          </button>
        </div>
      </div>

      <div className="daily-matches-list">
        {dailyMatches.length === 0 ? (
          <div className="no-matches-today">
            <Calendar size={32} className="text-secondary opacity-50" />
            <p>No hay partidos programados para este día.</p>
          </div>
        ) : (
          dailyMatches.map((m) => {
            const homeStats = findTeamStats(m.home_team);
            const awayStats = findTeamStats(m.away_team);
            const pred = predictMatch(homeStats, awayStats);

            return (
              <div
                className={`daily-match-row ${m.status === "live" ? "live-match-row" : ""}`}
                key={m.id}
              >
                <div className="daily-match-info-meta">
                  <span className="daily-match-phase">{m.phase || m.round}</span>
                  <span className="daily-match-stadium">{m.stadium}</span>
                </div>

                <div className="daily-match-teams-box">
                  <div className="daily-team home">
                    <span className="daily-team-name">{m.home_team}</span>
                    <img
                      src={flagUrl(teamCodes[m.home_team] || "un")}
                      alt={m.home_team}
                      className="daily-flag"
                      onError={(e) => {
                        e.target.src = "https://flagcdn.com/w40/un.png";
                      }}
                    />
                  </div>

                  <div className="daily-score-box">
                    {m.status === "complete" || m.status === "live" ? (
                      <div className="daily-score-wrapper-container">
                        <div className="daily-score-values">
                          <span className="score-val">{m.home_score ?? 0}</span>
                          <span className="score-divider">-</span>
                          <span className="score-val">{m.away_score ?? 0}</span>
                        </div>
                        {m.status === "live" && (
                          <div className="live-time-indicator">
                            <span className="live-dot-blink"></span>
                            <span className="live-time-text">{getLiveMinute(m.kickoff_utc)}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="daily-time-box">
                        <Clock size={12} />
                        <span>
                          {new Date(m.kickoff_utc).toLocaleTimeString("es-CR", {
                            timeZone: "America/Costa_Rica",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="daily-team away">
                    <img
                      src={flagUrl(teamCodes[m.away_team] || "un")}
                      alt={m.away_team}
                      className="daily-flag"
                      onError={(e) => {
                        e.target.src = "https://flagcdn.com/w40/un.png";
                      }}
                    />
                    <span className="daily-team-name">{m.away_team}</span>
                  </div>
                </div>

                <div className="match-prediction-bar-container">
                  <div className="prediction-label-compact">
                    <span>Predicción:</span>
                    <span>
                      {m.home_team} {pred.home}%
                    </span>
                    <span>Empate {pred.draw}%</span>
                    <span>
                      {m.away_team} {pred.away}%
                    </span>
                  </div>
                  <div className="bar-wrapper-compact">
                    <div className="bar local" style={{ width: `${pred.home}%` }}></div>
                    <div className="bar draw" style={{ width: `${pred.draw}%` }}></div>
                    <div className="bar away" style={{ width: `${pred.away}%` }}></div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
