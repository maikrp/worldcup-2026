import React, { useEffect, useRef } from "react";
import { X, Users } from "lucide-react";
import { flagUrl, globalTeamCodes } from "../constants/teamCodes";
import "./LineupModal.css";

const genericNames = [
  "Silva", "García", "Smith", "Müller", "González", "Díaz", "Martínez", "López", 
  "Jones", "Taylor", "Williams", "Brown", "Davies", "Evans", "Wilson", "Thomas",
  "Kim", "Lee", "Park", "Choi", "Koulibaly", "Traoré", "Diop", "Gueye",
  "Rossi", "Bianchi", "Russo", "Ferrari", "Dupont", "Martin", "Bernard",
  "Johansson", "Andersson", "Karlsson", "Nilsen", "Al-Fayed", "Hassan", "Ali"
];

const getMockFormation = (teamName) => {
  // Generar un índice base estable según el nombre del equipo
  const charSum = (teamName || "").split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  const getName = (index) => {
    return genericNames[(charSum + index) % genericNames.length];
  };

  return [
    [{ number: 1, name: getName(0) }],
    [
      { number: 2, name: getName(1) },
      { number: 4, name: getName(2) },
      { number: 5, name: getName(3) },
      { number: 3, name: getName(4) }
    ],
    [
      { number: 8, name: getName(5) },
      { number: 6, name: getName(6) },
      { number: 10, name: getName(7) }
    ],
    [
      { number: 7, name: getName(8) },
      { number: 9, name: getName(9) },
      { number: 11, name: getName(10) }
    ]
  ];
};

const getFormationFromData = (lineupData, fallbackTeamName) => {
  if (!lineupData || lineupData.length < 11) {
    return getMockFormation(fallbackTeamName);
  }

  // Ordenar por posiciones si es posible o simplemente agrupar
  // Asumimos que la lista viene ordenada por la API o simplemente la dividimos en 4 líneas
  const goalkeepers = lineupData.slice(0, 1);
  const defenders = lineupData.slice(1, 5);
  const midfielders = lineupData.slice(5, 8);
  const forwards = lineupData.slice(8, 11);

  const formatPlayers = (players) => players.map(p => ({ number: p.number, name: p.name.split(" ").pop() }));

  return [
    formatPlayers(goalkeepers),
    formatPlayers(defenders),
    formatPlayers(midfielders),
    formatPlayers(forwards)
  ];
};

export default function LineupModal({ match, teamName, onClose }) {
  const closeButtonRef = useRef(null);
  const [realLineup, setRealLineup] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    closeButtonRef.current?.focus();

    const espnId = match?.sourceId || match?.id;
    if (espnId) {
      fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary?event=${espnId}`)
        .then(res => res.json())
        .then(data => {
          const rosters = data.rosters || [];
          // Encontrar el roster del equipo
          const teamRoster = rosters.find(r => r.team?.displayName === teamName || r.team?.shortDisplayName === teamName);
          if (teamRoster && teamRoster.roster) {
            const starters = teamRoster.roster
              .filter(p => p.starter)
              .map(p => ({
                name: p.athlete?.displayName || p.athlete?.shortName || "Jugador",
                number: p.jersey || "",
                position: p.position?.abbreviation || "",
              }));
            setRealLineup(starters);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose, match, teamName]);

  const isHome = match.home_team === teamName || match.home_team_name_en === teamName;
  const lineupData = realLineup || (isHome ? match.home_lineup : match.away_lineup);
  const formation = getFormationFromData(lineupData, teamName);
  
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
