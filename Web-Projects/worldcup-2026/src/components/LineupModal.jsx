import React, { useEffect, useRef } from "react";
import { X, Users } from "lucide-react";
import { flagUrl, globalTeamCodes } from "../constants/teamCodes";
import "./LineupModal.css";

const getMockFormation = (teamName) => {
  // Simulación de formación 4-3-3 genérica
  return [
    [{ number: 1, name: "Portero" }],
    [
      { number: 2, name: "Lat. Der" },
      { number: 4, name: "Central 1" },
      { number: 5, name: "Central 2" },
      { number: 3, name: "Lat. Izq" }
    ],
    [
      { number: 8, name: "Int. Der" },
      { number: 6, name: "Pivote" },
      { number: 10, name: "Int. Izq" }
    ],
    [
      { number: 7, name: "Ext. Der" },
      { number: 9, name: "Delantero" },
      { number: 11, name: "Ext. Izq" }
    ]
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

  const formation = getMockFormation(teamName);
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
          <span className="live-modal-status">Formación Confirmada</span>
          <h2>Alineación del Partido</h2>
        </header>

        <div className="live-modal-scoreboard">
          <div className="live-modal-team">
            <img src={flagUrl(teamCode)} alt={teamName} />
            <strong>{teamName}</strong>
          </div>
        </div>

        <div className="live-modal-section">
          <div className="pitch-container">
            <div className="penalty-area-top"></div>
            <div className="goal-area-top"></div>
            
            {formation.map((row, rowIndex) => (
              <div className="formation-row" key={rowIndex}>
                {row.map((player) => (
                  <div className="player-node" key={player.number}>
                    <div className="player-number">{player.number}</div>
                    <div className="player-name">{player.name}</div>
                  </div>
                ))}
              </div>
            ))}

            <div className="penalty-area-bottom"></div>
            <div className="goal-area-bottom"></div>
          </div>
        </div>
      </section>
    </div>
  );
}
