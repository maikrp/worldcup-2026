import { useEffect, useState } from "react";
import { Award, CalendarDays, Clock3, Goal, ShieldCheck, X } from "lucide-react";
import { flagUrl } from "../constants/teamCodes";

export default function TopScorers({ scorers }) {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const rankedScorers = [...scorers].sort(
    (a, b) => b.goals - a.goals || b.assists - a.assists || a.minutes - b.minutes
  );

  useEffect(() => {
    if (!selectedPlayer) return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape") setSelectedPlayer(null);
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [selectedPlayer]);

  return (
    <section className="scorers-section fade-in">
      <div className="scorers-heading">
        <div>
          <span className="scorers-kicker">
            <Award size={16} /> Clasificación individual
          </span>
          <h2>Goleadores de la simulación</h2>
          <p>
            Ordenados por goles, asistencias y menos minutos disputados como criterios de desempate.
          </p>
        </div>
        <span className="data-source-badge">
          <ShieldCheck size={15} /> Datos internos · No oficial
        </span>
      </div>

      <div className="scorers-table-wrapper">
        <table className="scorers-table">
          <thead>
            <tr>
              <th>Pos.</th>
              <th>Jugador</th>
              <th>Selección</th>
              <th className="txt-center">PJ</th>
              <th className="txt-center">Goles</th>
              <th className="txt-center">Asist.</th>
              <th className="txt-center">Min.</th>
              <th className="txt-center">Prom.</th>
            </tr>
          </thead>
          <tbody>
            {rankedScorers.map((player, index) => (
              <tr key={player.name} className={index === 0 ? "golden-boot-row" : ""}>
                <td>
                  <span className={`scorer-position position-${index + 1}`}>{index + 1}</span>
                </td>
                <td>
                  <div className="scorer-player">
                    <img
                      src={player.photo}
                      alt={player.name}
                      className="scorer-photo"
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = "/players/player-fallback.webp";
                      }}
                    />
                    <div>
                      <strong>{player.name}</strong>
                      {index === 0 && <small>Líder de la simulación</small>}
                    </div>
                  </div>
                </td>
                <td>
                  <div className="scorer-team">
                    <img src={flagUrl(player.teamCode)} alt="" className="flag-img-small" />
                    <span>{player.team}</span>
                  </div>
                </td>
                <td className="txt-center">{player.matches}</td>
                <td className="txt-center">
                  <button
                    type="button"
                    className="goals-pill"
                    onClick={() => setSelectedPlayer(player)}
                    aria-label={`Ver goles de ${player.name}`}
                  >
                    <Goal size={15} /> {player.goals}
                  </button>
                </td>
                <td className="txt-center">{player.assists}</td>
                <td className="txt-center">
                  <span className="minutes-cell">
                    <Clock3 size={14} /> {player.minutes}
                  </span>
                </td>
                <td className="txt-center">{(player.goals / player.matches).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="scorers-note">
        Esta tabla es demostrativa y no representa la clasificación oficial de FIFA. La aplicación
        no tiene conectado un proveedor oficial de estadísticas individuales en tiempo real.
      </p>

      {selectedPlayer && (
        <div
          className="goal-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedPlayer(null);
          }}
        >
          <article
            className="goal-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="goal-modal-title"
          >
            <button
              type="button"
              className="goal-modal-close"
              onClick={() => setSelectedPlayer(null)}
              aria-label="Cerrar detalle de goles"
            >
              <X size={20} />
            </button>

            <div className="goal-modal-player">
              <img src={selectedPlayer.photo} alt={selectedPlayer.name} />
              <div>
                <span>Detalle de anotaciones</span>
                <h3 id="goal-modal-title">{selectedPlayer.name}</h3>
                <p>
                  {selectedPlayer.goals} goles · {selectedPlayer.team}
                </p>
              </div>
            </div>

            <div className="goal-events">
              {selectedPlayer.goalEvents.map((goal, index) => (
                <div className="goal-event-card" key={`${goal.opponent}-${goal.minute}`}>
                  <span className="goal-event-number">{index + 1}</span>
                  <div>
                    <strong>vs {goal.opponent}</strong>
                    <span>
                      <CalendarDays size={14} />
                      {new Date(`${goal.date}T12:00:00`).toLocaleDateString("es-CR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="goal-event-result">
                    <strong>{goal.minute}</strong>
                    <span>Resultado {goal.result}</span>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>
      )}
    </section>
  );
}
