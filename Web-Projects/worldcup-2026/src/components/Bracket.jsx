import React, { useMemo, useState } from "react";

const R32_MATCHES = [
  { id: "M73", t1: ["group", "A", 2], t2: ["group", "B", 2] },
  { id: "M74", t1: ["group", "E", 1], t2: ["third", "A/B/C/D/F"] },
  { id: "M75", t1: ["group", "F", 1], t2: ["group", "C", 2] },
  { id: "M76", t1: ["group", "C", 1], t2: ["group", "F", 2] },
  { id: "M77", t1: ["group", "I", 1], t2: ["third", "C/D/F/G/H"] },
  { id: "M78", t1: ["group", "E", 2], t2: ["group", "I", 2] },
  { id: "M79", t1: ["group", "A", 1], t2: ["third", "C/E/F/H/I"] },
  { id: "M80", t1: ["group", "L", 1], t2: ["third", "E/H/I/J/K"] },
  { id: "M81", t1: ["group", "D", 1], t2: ["third", "B/E/F/I/J"] },
  { id: "M82", t1: ["group", "G", 1], t2: ["third", "A/E/H/I/J"] },
  { id: "M83", t1: ["group", "K", 2], t2: ["group", "L", 2] },
  { id: "M84", t1: ["group", "H", 1], t2: ["group", "J", 2] },
  { id: "M85", t1: ["group", "B", 1], t2: ["third", "E/F/G/I/J"] },
  { id: "M86", t1: ["group", "J", 1], t2: ["group", "H", 2] },
  { id: "M87", t1: ["group", "K", 1], t2: ["third", "D/E/I/J/L"] },
  { id: "M88", t1: ["group", "D", 2], t2: ["group", "G", 2] },
];

const LATER_ROUNDS = [
  {
    id: "r16",
    label: "Octavos de Final",
    matches: [
      ["M89", "Gan. M73", "Gan. M75"],
      ["M90", "Gan. M74", "Gan. M77"],
      ["M91", "Gan. M76", "Gan. M78"],
      ["M92", "Gan. M79", "Gan. M80"],
      ["M93", "Gan. M83", "Gan. M84"],
      ["M94", "Gan. M81", "Gan. M82"],
      ["M95", "Gan. M86", "Gan. M88"],
      ["M96", "Gan. M85", "Gan. M87"],
    ],
  },
  {
    id: "qf",
    label: "Cuartos de Final",
    matches: [
      ["M97", "Gan. M89", "Gan. M90"],
      ["M98", "Gan. M93", "Gan. M94"],
      ["M99", "Gan. M91", "Gan. M92"],
      ["M100", "Gan. M95", "Gan. M96"],
    ],
  },
  {
    id: "sf",
    label: "Semifinales",
    matches: [
      ["M101", "Gan. M97", "Gan. M98"],
      ["M102", "Gan. M99", "Gan. M100"],
    ],
  },
  {
    id: "medal",
    label: "Partidos por medalla",
    matches: [
      ["M103", "Perd. M101", "Perd. M102"],
      ["M104", "Gan. M101", "Gan. M102"],
    ],
  },
].map((round) => ({
  ...round,
  matches: round.matches.map(([id, t1, t2]) => ({ id, t1, t2 })),
}));

function resolveSlot(slot, groups) {
  if (slot[0] === "third") return { full: `Mejor 3.º (${slot[1]})`, base: null };

  const [, groupName, position] = slot;
  const group = groups.find((item) => item.name === groupName);
  const team = group?.standings[position - 1]?.team_name;
  return team
    ? { full: `${team} · ${position}.º ${groupName} provisional`, base: team }
    : { full: `${position}.º Grupo ${groupName}`, base: null };
}

function enumerateRemainingPoints(basePoints, remainingMatches, callback, index = 0) {
  if (index === remainingMatches.length) {
    callback(basePoints);
    return;
  }

  const match = remainingMatches[index];
  const outcomes = [
    [3, 0],
    [1, 1],
    [0, 3],
  ];

  outcomes.forEach(([homePoints, awayPoints]) => {
    const nextPoints = new Map(basePoints);
    nextPoints.set(match.home_team, (nextPoints.get(match.home_team) || 0) + homePoints);
    nextPoints.set(match.away_team, (nextPoints.get(match.away_team) || 0) + awayPoints);
    enumerateRemainingPoints(nextPoints, remainingMatches, callback, index + 1);
  });
}

function getGuaranteedQualifiers(groups, matches) {
  return groups.flatMap((group) => {
    const teamNames = new Set(group.standings.map((team) => team.team_name));
    const remainingMatches = matches.filter(
      (match) =>
        match.status !== "complete" &&
        teamNames.has(match.home_team) &&
        teamNames.has(match.away_team)
    );

    if (remainingMatches.length === 0) {
      return group.standings.slice(0, 2).map((team) => team.team_name);
    }

    const basePoints = new Map(group.standings.map((team) => [team.team_name, team.points]));

    return group.standings
      .filter((team) => {
        let guaranteed = true;
        enumerateRemainingPoints(basePoints, remainingMatches, (scenario) => {
          if (!guaranteed) return;
          const teamPoints = scenario.get(team.team_name) || 0;
          const rivalsAtOrAbove = group.standings.filter(
            (rival) =>
              rival.team_name !== team.team_name &&
              (scenario.get(rival.team_name) || 0) >= teamPoints
          ).length;
          if (rivalsAtOrAbove >= 2) guaranteed = false;
        });
        return guaranteed;
      })
      .map((team) => team.team_name);
  });
}

function MatchBox({ match, isHighlighted, realMatch }) {
  const isScheduled = realMatch?.status === "scheduled" || !realMatch?.status;
  const t1Score = !isScheduled && realMatch?.home_score != null ? realMatch.home_score : "—";
  const t2Score = !isScheduled && realMatch?.away_score != null ? realMatch.away_score : "—";
  const status = realMatch?.status;

  return (
    <div className={`bracket-match-box${isHighlighted ? " bracket-match-highlighted" : ""}${status === 'live' ? " bracket-match-live" : ""}`}>
      <div className="bracket-match-id">
        {match.id}
        {status === 'live' && <span className="live-dot-blink" style={{ marginLeft: 6, display: 'inline-block' }}></span>}
      </div>
      <div className="bracket-team">
        <span>{realMatch?.home_team || match.t1.full || match.t1}</span>
        <strong className="bracket-score">{t1Score}</strong>
      </div>
      <div className="bracket-team separator">
        <span>{realMatch?.away_team || match.t2.full || match.t2}</span>
        <strong className="bracket-score">{t2Score}</strong>
      </div>
    </div>
  );
}

export default function Bracket({ groups = [], matches = [] }) {
  const [activeRound, setActiveRound] = useState("all");
  const guaranteedQualifiers = useMemo(
    () => getGuaranteedQualifiers(groups, matches),
    [groups, matches]
  );
  const rounds = useMemo(
    () => [
      {
        id: "r32",
        label: "Ronda de 32",
        matches: R32_MATCHES.map((match) => {
          const res1 = resolveSlot(match.t1, groups);
          const res2 = resolveSlot(match.t2, groups);
          return {
            ...match,
            t1: res1,
            t2: res2,
            team1Base: res1.base,
            team2Base: res2.base,
          };
        }),
      },
      ...LATER_ROUNDS,
    ],
    [groups]
  );

  const visibleRounds = activeRound === "all" ? rounds : rounds.filter((r) => r.id === activeRound);

  return (
    <div className="bracket-container">
      <div className="bracket-round-tabs">
        <button
          className={`bracket-tab${activeRound === "all" ? " active" : ""}`}
          onClick={() => setActiveRound("all")}
        >
          Todos
        </button>
        {rounds.map((round) => (
          <button
            key={round.id}
            className={`bracket-tab${activeRound === round.id ? " active" : ""}`}
            onClick={() => setActiveRound(round.id)}
          >
            {round.label}
          </button>
        ))}
      </div>

      <div className="bracket-info-banner">
        <span>⚽ Cruces oficiales FIFA · posiciones actuales provisionales</span>
        <span className="bracket-info-pill">12 primeros + 12 segundos + 8 mejores terceros</span>
      </div>

      <p className="scorers-note">
        Clasificados matemáticamente:{" "}
        {guaranteedQualifiers.length ? guaranteedQualifiers.join(", ") : "ninguno todavía"}. Los
        mejores terceros se asignan al finalizar los grupos según la combinación oficial.
      </p>

      {activeRound === "all" && (
        <p className="bracket-scroll-hint" aria-hidden="true">
          Desliza hacia la izquierda para ver las demás rondas →
        </p>
      )}

      <div
        className="bracket-wrapper"
        role="region"
        aria-label="Llaves oficiales proyectadas con las posiciones actuales"
        tabIndex="0"
      >
        <div className={`bracket${activeRound === "all" ? " bracket-full" : " bracket-single"}`}>
          {visibleRounds.map((round) => (
            <div className="round" key={round.id}>
              <div className="round-title">
                {round.label}
                <span className="round-count">({round.matches.length} partidos)</span>
              </div>
              <div className="bracket-matches">
                {round.matches.map((match) => {
                  let realMatch = null;

                  // Primero intentamos hacer match por nombre exacto de los equipos involucrados
                  if (match.team1Base && match.team2Base) {
                    realMatch = matches.find(m => 
                      (m.home_team === match.team1Base && m.away_team === match.team2Base) ||
                      (m.home_team === match.team2Base && m.away_team === match.team1Base)
                    );
                  }

                  // Match parcial: Si solo conocemos a un equipo (ej. juega contra un Mejor 3.º) 
                  // buscamos en los partidos remotos no emparejados (id >= 10000)
                  if (!realMatch && (match.team1Base || match.team2Base)) {
                    const knownTeam = match.team1Base || match.team2Base;
                    realMatch = matches.find(m => 
                      m.id >= 10000 && (m.home_team === knownTeam || m.away_team === knownTeam)
                    );
                  }

                  // Fallback: por número de partido (si existiera en localMatches)
                  if (!realMatch) {
                    const matchNumber = parseInt(match.id.replace("M", ""), 10);
                    realMatch = matches.find((m) => m.id === matchNumber);
                  }

                  return (
                    <MatchBox 
                      key={match.id} 
                      match={match} 
                      realMatch={realMatch} 
                      isHighlighted={match.id === "M104"} 
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
