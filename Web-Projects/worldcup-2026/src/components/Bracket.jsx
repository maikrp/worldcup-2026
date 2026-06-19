import React, { useState } from "react";

// FIFA World Cup 2026 Bracket
// 48 teams, 12 groups → Round of 32 (16 matches) → Round of 16 → QF → SF → Final

const BRACKET_STRUCTURE = {
  // Based on FIFA's official bracket path for World Cup 2026
  // Groups A-L, top 2 + 8 best 3rd-place teams advance → Round of 32
  rounds: [
    {
      id: "r32",
      label: "Ronda de 32",
      matchCount: 16,
      matches: [
        { id: "R32-1", t1: "1° Grupo A", t2: "3° Mejor", s1: null, s2: null },
        { id: "R32-2", t1: "1° Grupo B", t2: "3° Mejor", s1: null, s2: null },
        { id: "R32-3", t1: "1° Grupo C", t2: "3° Mejor", s1: null, s2: null },
        { id: "R32-4", t1: "1° Grupo D", t2: "3° Mejor", s1: null, s2: null },
        { id: "R32-5", t1: "1° Grupo E", t2: "2° Grupo J", s1: null, s2: null },
        { id: "R32-6", t1: "1° Grupo F", t2: "2° Grupo K", s1: null, s2: null },
        { id: "R32-7", t1: "1° Grupo G", t2: "2° Grupo L", s1: null, s2: null },
        { id: "R32-8", t1: "1° Grupo H", t2: "2° Grupo I", s1: null, s2: null },
        { id: "R32-9", t1: "1° Grupo I", t2: "2° Grupo H", s1: null, s2: null },
        { id: "R32-10", t1: "1° Grupo J", t2: "2° Grupo G", s1: null, s2: null },
        { id: "R32-11", t1: "1° Grupo K", t2: "2° Grupo F", s1: null, s2: null },
        { id: "R32-12", t1: "1° Grupo L", t2: "2° Grupo E", s1: null, s2: null },
        { id: "R32-13", t1: "2° Grupo A", t2: "2° Grupo D", s1: null, s2: null },
        { id: "R32-14", t1: "2° Grupo B", t2: "2° Grupo C", s1: null, s2: null },
        { id: "R32-15", t1: "3° Mejor", t2: "3° Mejor", s1: null, s2: null },
        { id: "R32-16", t1: "3° Mejor", t2: "3° Mejor", s1: null, s2: null },
      ],
    },
    {
      id: "r16",
      label: "Octavos de Final",
      matchCount: 8,
      matches: [
        { id: "R16-1", t1: "Gan. R32-1", t2: "Gan. R32-2", s1: null, s2: null },
        { id: "R16-2", t1: "Gan. R32-3", t2: "Gan. R32-4", s1: null, s2: null },
        { id: "R16-3", t1: "Gan. R32-5", t2: "Gan. R32-6", s1: null, s2: null },
        { id: "R16-4", t1: "Gan. R32-7", t2: "Gan. R32-8", s1: null, s2: null },
        { id: "R16-5", t1: "Gan. R32-9", t2: "Gan. R32-10", s1: null, s2: null },
        { id: "R16-6", t1: "Gan. R32-11", t2: "Gan. R32-12", s1: null, s2: null },
        { id: "R16-7", t1: "Gan. R32-13", t2: "Gan. R32-14", s1: null, s2: null },
        { id: "R16-8", t1: "Gan. R32-15", t2: "Gan. R32-16", s1: null, s2: null },
      ],
    },
    {
      id: "qf",
      label: "Cuartos de Final",
      matchCount: 4,
      matches: [
        { id: "QF-1", t1: "Gan. R16-1", t2: "Gan. R16-2", s1: null, s2: null },
        { id: "QF-2", t1: "Gan. R16-3", t2: "Gan. R16-4", s1: null, s2: null },
        { id: "QF-3", t1: "Gan. R16-5", t2: "Gan. R16-6", s1: null, s2: null },
        { id: "QF-4", t1: "Gan. R16-7", t2: "Gan. R16-8", s1: null, s2: null },
      ],
    },
    {
      id: "sf",
      label: "Semifinales",
      matchCount: 2,
      matches: [
        { id: "SF-1", t1: "Gan. QF-1", t2: "Gan. QF-2", s1: null, s2: null },
        { id: "SF-2", t1: "Gan. QF-3", t2: "Gan. QF-4", s1: null, s2: null },
      ],
    },
    {
      id: "final",
      label: "Final",
      matchCount: 1,
      matches: [{ id: "FINAL", t1: "Gan. SF-1", t2: "Gan. SF-2", s1: null, s2: null }],
    },
  ],
};

function MatchBox({ match, isHighlighted }) {
  return (
    <div className={`bracket-match-box${isHighlighted ? " bracket-match-highlighted" : ""}`}>
      <div className="bracket-match-id">{match.id}</div>
      <div className="bracket-team">
        <span>{match.t1}</span>
        <strong className="bracket-score">{match.s1 !== null ? match.s1 : "—"}</strong>
      </div>
      <div className="bracket-team separator">
        <span>{match.t2}</span>
        <strong className="bracket-score">{match.s2 !== null ? match.s2 : "—"}</strong>
      </div>
    </div>
  );
}

export default function Bracket() {
  const [activeRound, setActiveRound] = useState("all");
  const rounds = BRACKET_STRUCTURE.rounds;

  const visibleRounds = activeRound === "all" ? rounds : rounds.filter((r) => r.id === activeRound);

  return (
    <div className="bracket-container">
      {/* Round filter tabs */}
      <div className="bracket-round-tabs">
        <button
          className={`bracket-tab${activeRound === "all" ? " active" : ""}`}
          onClick={() => setActiveRound("all")}
        >
          Todos
        </button>
        {rounds.map((r) => (
          <button
            key={r.id}
            className={`bracket-tab${activeRound === r.id ? " active" : ""}`}
            onClick={() => setActiveRound(r.id)}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="bracket-info-banner">
        <span>⚽ Mundial 2026 — 48 equipos / 12 grupos</span>
        <span className="bracket-info-pill">Ronda de 32 → Octavos → Cuartos → Semis → Final</span>
      </div>

      <div className="bracket-wrapper">
        <div className={`bracket${activeRound === "all" ? " bracket-full" : " bracket-single"}`}>
          {visibleRounds.map((round) => (
            <div className="round" key={round.id}>
              <div className="round-title">
                {round.label}
                <span className="round-count">({round.matchCount} partidos)</span>
              </div>
              <div className="bracket-matches">
                {round.matches.map((match) => (
                  <MatchBox key={match.id} match={match} isHighlighted={round.id === "final"} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
