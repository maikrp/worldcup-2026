import React, { useEffect, useRef } from "react";
import { Clock, Goal, MapPin, X } from "lucide-react";
import { flagUrl, globalTeamCodes } from "../constants/teamCodes";
import { formatLiveMatchLabel } from "../utils/matchStatus";

const STAT_ROWS = [
  ["Posesión", "possessionPct", "%"],
  ["Remates", "totalShots", ""],
  ["Al arco", "shotsOnTarget", ""],
  ["Tiros de esquina", "wonCorners", ""],
  ["Faltas", "foulsCommitted", ""],
];

function displayStatistic(value, suffix) {
  return value === undefined || value === null || value === "" ? "—" : `${value}${suffix}`;
}

function translatePeriod(period) {
  const periods = {
    "First Half": "Primer tiempo",
    Halftime: "Descanso",
    "Second Half": "Segundo tiempo",
    "Extra Time": "Tiempo extra",
    Penalties: "Penales",
  };
  return periods[period] || period || "Partido en juego";
}

export default function LiveMatchModal({ match, onClose }) {
  const closeButtonRef = useRef(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  const events = match.match_events || [];
  const goals = events.filter((event) => event.type === "goal");
  const cards = events.filter((event) => event.type !== "goal");
  const yellowCards = cards.filter((event) => event.type === "yellow-card");
  const redCards = cards.filter((event) => event.type === "red-card");
  const statistics = match.statistics || {};

  return (
    <div className="live-modal-backdrop" onMouseDown={onClose}>
      <section
        className="live-match-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="live-match-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          ref={closeButtonRef}
          className="live-modal-close"
          type="button"
          onClick={onClose}
          aria-label="Cerrar estadísticas del partido"
        >
          <X size={20} />
        </button>

        <header className="live-modal-header">
          <span className="live-modal-status">{formatLiveMatchLabel(match)}</span>
          <h2 id="live-match-modal-title">Estadísticas del partido</h2>
          <div className="live-modal-meta">
            <span>
              <Clock size={14} /> {translatePeriod(match.match_period)}
            </span>
            <span>
              <MapPin size={14} /> {match.stadium}
            </span>
          </div>
        </header>

        <div className="live-modal-scoreboard">
          <div className="live-modal-team">
            <img src={flagUrl(globalTeamCodes[match.home_team])} alt="" />
            <strong>{match.home_team}</strong>
          </div>
          <div className="live-modal-score">
            {match.home_score ?? 0} <span>–</span> {match.away_score ?? 0}
          </div>
          <div className="live-modal-team">
            <img src={flagUrl(globalTeamCodes[match.away_team])} alt="" />
            <strong>{match.away_team}</strong>
          </div>
        </div>

        <div className="live-modal-section">
          <h3>
            <Goal size={17} /> Goles
          </h3>
          {goals.length ? (
            <div className="live-event-list">
              {goals.map((event) => (
                <div className="live-event-row" key={event.id}>
                  <span>{event.minute}</span>
                  <strong>{event.player}</strong>
                  <small>
                    {event.team === "home" ? match.home_team : match.away_team}
                    {event.penalty ? " · Penal" : ""}
                    {event.ownGoal ? " · Autogol" : ""}
                  </small>
                </div>
              ))}
            </div>
          ) : (
            <p className="live-modal-empty">Sin goles reportados.</p>
          )}
        </div>

        <div className="live-modal-section">
          <h3>Estadísticas</h3>
          <div className="live-stat-table">
            <div className="live-stat-heading">
              <strong>{match.home_team}</strong>
              <span></span>
              <strong>{match.away_team}</strong>
            </div>
            {STAT_ROWS.map(([label, key, suffix]) => (
              <div className="live-stat-row" key={key}>
                <strong>{displayStatistic(statistics.home?.[key], suffix)}</strong>
                <span>{label}</span>
                <strong>{displayStatistic(statistics.away?.[key], suffix)}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="live-modal-discipline">
          <div className="live-modal-section">
            <h3>
              <span className="card-symbol yellow"></span> Amarillas ({yellowCards.length})
            </h3>
            {yellowCards.length ? (
              yellowCards.map((event) => (
                <p className="discipline-event" key={event.id}>
                  <strong>{event.minute}</strong> {event.player}
                  <small> · {event.team === "home" ? match.home_team : match.away_team}</small>
                </p>
              ))
            ) : (
              <p className="live-modal-empty">Sin amarillas reportadas.</p>
            )}
          </div>
          <div className="live-modal-section">
            <h3>
              <span className="card-symbol red"></span> Expulsados ({redCards.length})
            </h3>
            {redCards.length ? (
              redCards.map((event) => (
                <p className="discipline-event" key={event.id}>
                  <strong>{event.minute}</strong> {event.player}
                  <small> · {event.team === "home" ? match.home_team : match.away_team}</small>
                </p>
              ))
            ) : (
              <p className="live-modal-empty">Sin expulsados.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
