import { useState } from "react";
import { CalendarDays, Database, Filter, Sparkles, TrendingUp } from "lucide-react";
import { globalTeamCodes as teamCodes, flagUrl } from "../constants/teamCodes";
import { formatCostaRicaTime } from "../utils/dateTime";
import { predictMatch } from "../utils/prediction";

function getCostaRicaDate(kickoffUtc) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Costa_Rica",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(kickoffUtc));
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  return `${year}-${month}-${day}`;
}

function normalizeTeamName(name) {
  return name?.normalize("NFC").toLocaleLowerCase("es") || "";
}

export default function PredictionList({ matches, groups }) {
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const upcomingMatches = matches.filter((match) => match.status !== "complete");
  const teams = [...new Set(upcomingMatches.flatMap((match) => [match.home_team, match.away_team]))]
    .sort((a, b) => a.localeCompare(b, "es"))
    .filter(Boolean);

  const pendingMatches = upcomingMatches
    .filter(
      (match) =>
        (!selectedTeam ||
          normalizeTeamName(match.home_team) === normalizeTeamName(selectedTeam) ||
          normalizeTeamName(match.away_team) === normalizeTeamName(selectedTeam)) &&
        (!selectedDate || getCostaRicaDate(match.kickoff_utc) === selectedDate)
    )
    .sort((a, b) => {
      const difference = new Date(a.kickoff_utc) - new Date(b.kickoff_utc);
      return sortOrder === "asc" ? difference : -difference;
    });

  function findTeamStats(name) {
    for (const group of groups) {
      const standings = group.standings || [];
      const found = standings.find((t) => t.team_name === name);
      if (found) return found;
    }
    return {};
  }

  return (
    <div className="prediction-section">
      <div className="prediction-filters">
        <div className="prediction-filter-heading">
          <Filter size={18} />
          <div>
            <strong>Filtrar pronósticos</strong>
            <span>
              {selectedTeam
                ? `Próximos partidos de ${selectedTeam}`
                : "Selecciona una fecha o selección"}
            </span>
          </div>
        </div>

        <div className="filter-controls">
          <select
            value={selectedTeam}
            onChange={(event) => setSelectedTeam(event.target.value)}
            className="sort-select prediction-team-select"
            aria-label="Filtrar por selección"
          >
            <option value="">Todas las selecciones</option>
            {teams.map((team) => (
              <option value={team} key={team}>
                {team}
              </option>
            ))}
          </select>

          <div className="date-filter-box">
            <CalendarDays size={17} />
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="date-select"
              min="2026-06-11"
              max="2026-07-19"
              aria-label="Filtrar pronósticos por fecha"
            />
            {selectedDate && (
              <button type="button" className="clear-date-btn" onClick={() => setSelectedDate("")}>
                Limpiar
              </button>
            )}
          </div>

          <select
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
            className="sort-select"
            aria-label="Ordenar pronósticos"
          >
            <option value="asc">Fecha: ascendente</option>
            <option value="desc">Fecha: descendente</option>
          </select>
        </div>
      </div>

      <div className="prediction-results-summary">
        <strong>{pendingMatches.length}</strong>
        <span>{pendingMatches.length === 1 ? "partido encontrado" : "partidos encontrados"}</span>
      </div>

      {pendingMatches.length === 0 ? (
        <p className="no-data">No hay próximos partidos para los filtros seleccionados.</p>
      ) : (
        <div className="prediction-grid">
          {pendingMatches.map((m) => {
            const homeStats = findTeamStats(m.home_team);
            const awayStats = findTeamStats(m.away_team);
            const prediction = predictMatch(homeStats, awayStats);

            return (
              <div className="prediction-card" key={m.id}>
                <div className="prediction-header">
                  <div>
                    <span>{m.phase || m.round}</span>
                    <small className="prediction-match-date">
                      {m.time_confirmed === false
                        ? `${new Date(m.kickoff_utc).toLocaleDateString("es-CR", {
                            timeZone: "America/Costa_Rica",
                            day: "numeric",
                            month: "short",
                          })} · Hora por confirmar`
                        : `${new Date(m.kickoff_utc).toLocaleDateString("es-CR", {
                            timeZone: "America/Costa_Rica",
                            day: "numeric",
                            month: "short",
                          })}, ${formatCostaRicaTime(m.kickoff_utc)} CR`}
                    </small>
                  </div>
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
                    {new Date(`${prediction.metadata.updatedAt}T00:00:00`).toLocaleDateString(
                      "es-CR"
                    )}
                  </span>
                </div>
                <small className="prediction-disclaimer">{prediction.metadata.disclaimer}</small>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
