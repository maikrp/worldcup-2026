import React from "react";
import { Database, Sparkles, TrendingUp } from "lucide-react";
import { globalTeamCodes as teamCodes, flagUrl } from "../constants/teamCodes";
import { predictMatch } from "../utils/prediction";

export default function PredictionList({ matches, groups }) {
  const pendingMatches = matches.filter((m) => m.status !== "complete").slice(0, 10);

  function findTeamStats(name) {
    for (const group of groups) {
      const standings = group.standings || [];
      const found = standings.find((t) => t.team_name === name);
      if (found) return found;
    }
    return {};
  }

  if (pendingMatches.length === 0) {
    return <p className="no-data">No hay partidos próximos programados para predecir.</p>;
  }

  return (
    <div className="prediction-grid">
      {pendingMatches.map((m) => {
        const homeStats = findTeamStats(m.home_team);
        const awayStats = findTeamStats(m.away_team);
        const prediction = predictMatch(homeStats, awayStats);

        return (
          <div className="prediction-card" key={m.id}>
            <div className="prediction-header">
              <span>{m.phase || m.round}</span>
              <span className="prediction-badge">
                <Sparkles size={12} /> Probabilidad
              </span>
            </div>

            <div className="prediction-matchup">
              <div className="predict-team">
                <img
                  src={flagUrl(teamCodes[m.home_team] || "un")}
                  alt={m.home_team}
                  className="predict-flag"
                  onError={(e) => {
                    e.target.src = "https://flagcdn.com/w40/un.png";
                  }}
                />
                <strong>{m.home_team}</strong>
              </div>
              <span className="vs">VS</span>
              <div className="predict-team">
                <img
                  src={flagUrl(teamCodes[m.away_team] || "un")}
                  alt={m.away_team}
                  className="predict-flag"
                  onError={(e) => {
                    e.target.src = "https://flagcdn.com/w40/un.png";
                  }}
                />
                <strong>{m.away_team}</strong>
              </div>
            </div>

            <div className="probability-bar-container">
              <div className="probability-label">
                <span>Local: {prediction.home}%</span>
                <span>Empate: {prediction.draw}%</span>
                <span>Visitante: {prediction.away}%</span>
              </div>
              <div className="bar-wrapper">
                <div className="bar local" style={{ width: `${prediction.home}%` }}></div>
                <div className="bar draw" style={{ width: `${prediction.draw}%` }}></div>
                <div className="bar away" style={{ width: `${prediction.away}%` }}></div>
              </div>
            </div>

            <div className="prediction-verdict">
              <TrendingUp size={14} className="verdict-icon" />
              <span>
                Pronóstico:{" "}
                <strong>
                  {prediction.home > prediction.away
                    ? m.home_team
                    : prediction.away > prediction.home
                      ? m.away_team
                      : "Empate"}
                </strong>{" "}
                tiene mayor ventaja
              </span>
            </div>

            <div className="prediction-model-info">
              <span>
                xG estimado: {prediction.expectedGoals.home} – {prediction.expectedGoals.away}
              </span>
              <span
                className={`confidence confidence-${prediction.confidence.level.toLowerCase()}`}
              >
                Confianza {prediction.confidence.level} · {prediction.confidence.score}%
              </span>
            </div>
            <div className="prediction-source">
              <Database size={13} />
              <span>
                {prediction.metadata.methodology} · FIFA actualizada{" "}
                {new Date(`${prediction.metadata.updatedAt}T00:00:00`).toLocaleDateString("es-CR")}
              </span>
            </div>
            <small className="prediction-disclaimer">{prediction.metadata.disclaimer}</small>
          </div>
        );
      })}
    </div>
  );
}
