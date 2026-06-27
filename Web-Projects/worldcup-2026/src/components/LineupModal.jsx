import React, { useEffect, useRef } from "react";
import { X, Users } from "lucide-react";
import { flagUrl, globalTeamCodes } from "../constants/teamCodes";

const getMockLineup = (teamName) => {
  return [
    { number: 1, name: "Portero Titular", position: "POR" },
    { number: 2, name: "Lateral Derecho", position: "DEF" },
    { number: 4, name: "Defensa Central 1", position: "DEF" },
    { number: 5, name: "Defensa Central 2", position: "DEF" },
    { number: 3, name: "Lateral Izquierdo", position: "DEF" },
    { number: 6, name: "Medio Centro", position: "MED" },
    { number: 8, name: "Interior Derecho", position: "MED" },
    { number: 10, name: "Interior Izquierdo", position: "MED" },
    { number: 7, name: "Extremo Derecho", position: "DEL" },
    { number: 9, name: "Delantero Centro", position: "DEL" },
    { number: 11, name: "Extremo Izquierdo", position: "DEL" },
  ];
};

export default function LineupModal({ match, teamName, onClose }) {
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

  const lineup = getMockLineup(teamName);
  const teamCode = globalTeamCodes[teamName] || "un";

  return (
    <div className="live-modal-backdrop" onMouseDown={onClose}>
      <section
        className="live-match-modal"
        role="dialog"
        aria-modal="true"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          ref={closeButtonRef}
          className="live-modal-close"
          type="button"
          onClick={onClose}
          aria-label="Cerrar alineación"
        >
          <X size={20} />
        </button>

        <header className="live-modal-header">
          <span className="live-modal-status">Alineación Confirmada</span>
          <h2>Alineación del Partido</h2>
        </header>

        <div className="live-modal-scoreboard">
          <div className="live-modal-team">
            <img src={flagUrl(teamCode)} alt={teamName} />
            <strong>{teamName}</strong>
          </div>
        </div>

        <div className="live-modal-section">
          <h3>
            <Users size={17} /> Titulares (Simulado)
          </h3>
          <div className="live-event-list">
            {lineup.map((player) => (
              <div className="live-event-row" key={player.number}>
                <span style={{ minWidth: '30px', textAlign: 'center', backgroundColor: '#333', color: 'white', borderRadius: '4px', padding: '2px 5px' }}>
                  {player.number}
                </span>
                <strong style={{ flex: 1, marginLeft: '10px' }}>{player.name}</strong>
                <small>{player.position}</small>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
