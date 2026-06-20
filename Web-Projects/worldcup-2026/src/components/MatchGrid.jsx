import React from "react";
import { MapPin, Clock } from "lucide-react";
import { globalTeamCodes as teamCodes, flagUrl } from "../constants/teamCodes";
import { predictMatch } from "../utils/prediction";
import { COSTA_RICA_TIME_ZONE, formatCostaRicaDateTime } from "../utils/dateTime";
import { formatLiveMatchTime } from "../utils/matchStatus";

export default function MatchGrid({ matches, groups }) {
  if (matches.length === 0) {
    return <p className="no-data">No hay partidos coincidentes.</p>;
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
    <div className="match-grid">
      {matches.map((m) => {
        const homeStats = findTeamStats(m.home_team);
        const awayStats = findTeamStats(m.away_team);
        const pred = predictMatch(homeStats, awayStats);

        return (
          <div className="match-card" key={m.id}>
            <div className="match-header">
              <span className="phase-badge">{m.phase || m.round}</span>
              {m.status === "complete" ? (
                <span className="status-badge complete">Finalizado</span>
              ) : m.status === "live" ? (
                <span className="status-badge live">{formatLiveMatchTime(m)}</span>
              ) : (
                <span className="status-badge live-blink">Programado</span>
              )}
            </div>

            <div className="teams-container">
              <div className="team-row">
                <div className="team-name-flag">
                  <img
                    src={flagUrl(teamCodes[m.home_team] || "un")}
                    alt={m.home_team}
                    className="flag-img"
                    onError={(e) => {
                      e.target.src = "https://flagcdn.com/w40/un.png";
                    }}
                  />
                  <span>{m.home_team}</span>
                </div>
                <strong className="score">{m.home_score !== null ? m.home_score : "-"}</strong>
              </div>

              <div className="team-row">
                <div className="team-name-flag">
                  <img
                    src={flagUrl(teamCodes[m.away_team] || "un")}
                    alt={m.away_team}
                    className="flag-img"
                    onError={(e) => {
                      e.target.src = "https://flagcdn.com/w40/un.png";
                    }}
                  />
                  <span>{m.away_team}</span>
                </div>
                <strong className="score">{m.away_score !== null ? m.away_score : "-"}</strong>
              </div>
            </div>

            <div className="match-prediction-bar-container grid-prediction">
              <div className="prediction-label-compact">
                <span>Predicción:</span>
                <span>{pred.home}% L</span>
                <span>{pred.draw}% E</span>
                <span>{pred.away}% V</span>
              </div>
              <div className="bar-wrapper-compact">
                <div className="bar local" style={{ width: `${pred.home}%` }}></div>
                <div className="bar draw" style={{ width: `${pred.draw}%` }}></div>
                <div className="bar away" style={{ width: `${pred.away}%` }}></div>
              </div>
            </div>

            <div className="match-footer">
              <div className="info-item">
                <MapPin size={12} />
                <span>{m.stadium || "Estadio Mundialista"}</span>
              </div>
              <div className="info-item">
                <Clock size={12} />
                <span>
                  {m.time_confirmed === false
                    ? `${new Date(m.kickoff_utc).toLocaleDateString("es-CR", {
                        timeZone: COSTA_RICA_TIME_ZONE,
                      })} · Hora por confirmar`
                    : `${formatCostaRicaDateTime(m.kickoff_utc)} CR`}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
