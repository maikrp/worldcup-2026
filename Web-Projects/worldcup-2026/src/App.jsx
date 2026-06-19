import React, { useEffect, useState } from "react";
import { 
  Trophy, 
  Calendar, 
  BarChart3, 
  GitBranch, 
  Percent, 
  MapPin, 
  Clock, 
  Flame, 
  TrendingUp,
  RefreshCw,
  Search,
  Sparkles,
  Award
} from "lucide-react";
import "./App.css";

const API_URL = import.meta.env.VITE_WC_API_URL || "https://worldcup26.ir/api";

const flagUrl = (code) =>
  code ? `https://flagcdn.com/w40/${code.toLowerCase()}.png` : "";

const mockTeams = [
  { code: "US", name: "Estados Unidos", points: 6, wins: 2, goal_difference: 4, goals_for: 5, played: 2 },
  { code: "MX", name: "México", points: 4, wins: 1, goal_difference: 1, goals_for: 3, played: 2 },
  { code: "CA", name: "Canadá", points: 1, wins: 0, goal_difference: -2, goals_for: 1, played: 2 },
  { code: "AR", name: "Argentina", points: 6, wins: 2, goal_difference: 5, goals_for: 6, played: 2 },
  { code: "BR", name: "Brasil", points: 6, wins: 2, goal_difference: 3, goals_for: 4, played: 2 },
  { code: "FR", name: "Francia", points: 4, wins: 1, goal_difference: 2, goals_for: 3, played: 2 },
  { code: "ES", name: "España", points: 6, wins: 2, goal_difference: 4, goals_for: 5, played: 2 },
  { code: "DE", name: "Alemania", points: 3, wins: 1, goal_difference: 0, goals_for: 2, played: 2 },
  { code: "IT", name: "Italia", points: 3, wins: 1, goal_difference: -1, goals_for: 2, played: 2 },
  { code: "GB-ENG", name: "Inglaterra", points: 4, wins: 1, goal_difference: 1, goals_for: 2, played: 2 },
  { code: "UY", name: "Uruguay", points: 4, wins: 1, goal_difference: 2, goals_for: 4, played: 2 },
  { code: "CO", name: "Colombia", points: 3, wins: 1, goal_difference: 0, goals_for: 2, played: 2 },
];

const mockGroups = [
  {
    name: "A",
    standings: [
      { code: "us", team_name: "Estados Unidos", played: 3, wins: 2, draws: 1, losses: 0, goals_for: 6, goals_against: 2, goal_difference: 4, points: 7 },
      { code: "mx", team_name: "México", played: 3, wins: 1, draws: 2, losses: 0, goals_for: 4, goals_against: 3, goal_difference: 1, points: 5 },
      { code: "ca", team_name: "Canadá", played: 3, wins: 0, draws: 2, losses: 1, goals_for: 2, goals_against: 4, goal_difference: -2, points: 2 },
      { code: "co", team_name: "Colombia", played: 3, wins: 0, draws: 1, losses: 2, goals_for: 1, goals_against: 4, goal_difference: -3, points: 1 }
    ]
  },
  {
    name: "B",
    standings: [
      { code: "ar", team_name: "Argentina", played: 3, wins: 3, draws: 0, losses: 0, goals_for: 8, goals_against: 1, goal_difference: 7, points: 9 },
      { code: "fr", team_name: "Francia", played: 3, wins: 2, draws: 0, losses: 1, goals_for: 5, goals_against: 3, goal_difference: 2, points: 6 },
      { code: "uy", team_name: "Uruguay", played: 3, wins: 1, draws: 0, losses: 2, goals_for: 3, goals_against: 5, goal_difference: -2, points: 3 },
      { code: "de", team_name: "Alemania", played: 3, wins: 0, draws: 0, losses: 3, goals_for: 1, goals_against: 8, goal_difference: -7, points: 0 }
    ]
  },
  {
    name: "C",
    standings: [
      { code: "es", team_name: "España", played: 3, wins: 2, draws: 1, losses: 0, goals_for: 6, goals_against: 2, goal_difference: 4, points: 7 },
      { code: "br", team_name: "Brasil", played: 3, wins: 2, draws: 0, losses: 1, goals_for: 5, goals_against: 3, goal_difference: 2, points: 6 },
      { code: "gb-eng", team_name: "Inglaterra", played: 3, wins: 1, draws: 1, losses: 1, goals_for: 3, goals_against: 3, goal_difference: 0, points: 4 },
      { code: "it", team_name: "Italia", played: 3, wins: 0, draws: 0, losses: 3, goals_for: 1, goals_against: 7, goal_difference: -6, points: 0 }
    ]
  }
];

const mockMatches = [
  { id: 1, home_team: "Estados Unidos", away_team: "México", home_score: 2, away_score: 1, kickoff_utc: "2026-06-11T20:00:00Z", status: "complete", phase: "Grupo A", stadium: "Estadio Azteca", round: "Grupo A" },
  { id: 2, home_team: "Canadá", away_team: "Colombia", home_score: 1, away_score: 1, kickoff_utc: "2026-06-12T18:00:00Z", status: "complete", phase: "Grupo A", stadium: "BC Place", round: "Grupo A" },
  { id: 3, home_team: "Argentina", away_team: "Francia", home_score: 3, away_score: 2, kickoff_utc: "2026-06-13T21:00:00Z", status: "complete", phase: "Grupo B", stadium: "MetLife Stadium", round: "Grupo B" },
  { id: 4, home_team: "Alemania", away_team: "Uruguay", home_score: 0, away_score: 2, kickoff_utc: "2026-06-14T15:00:00Z", status: "complete", phase: "Grupo B", stadium: "SoFi Stadium", round: "Grupo B" },
  { id: 5, home_team: "España", away_team: "Brasil", home_score: null, away_score: null, kickoff_utc: "2026-06-20T19:00:00Z", status: "scheduled", phase: "Grupo C", stadium: "AT&T Stadium", round: "Grupo C" },
  { id: 6, home_team: "Inglaterra", away_team: "Italia", home_score: null, away_score: null, kickoff_utc: "2026-06-21T17:00:00Z", status: "scheduled", phase: "Grupo C", stadium: "Hard Rock Stadium", round: "Grupo C" },
  { id: 7, home_team: "Estados Unidos", away_team: "Argentina", home_score: null, away_score: null, kickoff_utc: "2026-06-25T20:00:00Z", status: "scheduled", phase: "Octavos de Final", stadium: "MetLife Stadium", round: "Octavos" },
  { id: 8, home_team: "Francia", away_team: "España", home_score: null, away_score: null, kickoff_utc: "2026-06-26T18:00:00Z", status: "scheduled", phase: "Octavos de Final", stadium: "SoFi Stadium", round: "Octavos" },
];

async function apiGet(path) {
  // Support both custom standard endpoints and API mappings
  try {
    const res = await fetch(`${API_URL}${path}`);
    if (!res.ok) throw new Error("Error fetching API");
    const data = await res.json();
    return data;
  } catch (error) {
    console.warn("API direct request failed, using mock data:", error);
    // Graceful offline mock fallback
    if (path === "/matches") return mockMatches;
    if (path === "/groups") return mockGroups;
    if (path === "/teams") return mockTeams;
    throw error;
  }
}

function predictMatch(home, away) {
  const homePower =
    (home?.points || 0) * 3 +
    (home?.wins || 0) * 2 +
    (home?.goal_difference || 0) +
    (home?.goals_for || 0);

  const awayPower =
    (away?.points || 0) * 3 +
    (away?.wins || 0) * 2 +
    (away?.goal_difference || 0) +
    (away?.goals_for || 0);

  const baseHome = homePower === 0 ? 15 : homePower;
  const baseAway = awayPower === 0 ? 15 : awayPower;

  const total = baseHome + baseAway + 10;

  const homeChance = Math.round(((baseHome + 5) / total) * 100);
  const awayChance = Math.round(((baseAway + 5) / total) * 100);
  const drawChance = Math.max(100 - homeChance - awayChance, 10);

  return {
    home: Math.max(homeChance - 5, 20),
    draw: drawChance,
    away: Math.max(awayChance - 5, 20),
  };
}

export default function App() {
  const [matches, setMatches] = useState([]);
  const [groups, setGroups] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      // worldcup26.ir matches/groups fetch logic
      const [matchesData, groupsData] = await Promise.all([
        apiGet("/matches"),
        apiGet("/groups"),
      ]);

      setMatches(matchesData || mockMatches);
      setGroups(groupsData || mockGroups);
      setUsingMock(false);
    } catch (error) {
      console.warn("Falling back to demo mode:", error);
      setMatches(mockMatches);
      setGroups(mockGroups);
      setUsingMock(true);
    } finally {
      setLoading(false);
    }
  }

  const nextMatches = matches
    .filter((m) => m.status === "scheduled" || m.phase?.toLowerCase().includes("grupo") || m.status === "PRE")
    .slice(0, 6);

  const filteredMatches = matches.filter((m) => {
    const q = searchQuery.toLowerCase();
    return (
      m.home_team.toLowerCase().includes(q) ||
      m.away_team.toLowerCase().includes(q) ||
      (m.stadium && m.stadium.toLowerCase().includes(q)) ||
      (m.phase && m.phase.toLowerCase().includes(q))
    );
  });

  return (
    <div className="app">
      <header className="header">
        <div className="header-brand">
          <div className="logo-container">
            <Trophy className="trophy-logo animate-pulse" size={38} />
          </div>
          <div>
            <h1>Mundial 2026</h1>
            <p>Dashboard de Predicciones, Grupos y Partidos</p>
          </div>
        </div>
        
        <div className="api-badge-container">
          {usingMock ? (
            <span className="api-badge mock">Modo Offline (Demostración)</span>
          ) : (
            <span className="api-badge live">API worldcup26.ir Conectada</span>
          )}
          <button className="refresh-btn" onClick={loadData} title="Recargar datos">
            <RefreshCw size={16} />
          </button>
        </div>
      </header>

      <nav className="tabs">
        <button className={activeTab === "dashboard" ? "active" : ""} onClick={() => setActiveTab("dashboard")}>
          <Sparkles size={18} /> Inicio
        </button>
        <button className={activeTab === "matches" ? "active" : ""} onClick={() => setActiveTab("matches")}>
          <Calendar size={18} /> Partidos
        </button>
        <button className={activeTab === "groups" ? "active" : ""} onClick={() => setActiveTab("groups")}>
          <BarChart3 size={18} /> Grupos
        </button>
        <button className={activeTab === "bracket" ? "active" : ""} onClick={() => setActiveTab("bracket")}>
          <GitBranch size={18} /> Llaves (Bracket)
        </button>
        <button className={activeTab === "predictions" ? "active" : ""} onClick={() => setActiveTab("predictions")}>
          <Percent size={18} /> Predicciones
        </button>
      </nav>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando información del mundial...</p>
        </div>
      ) : (
        <main className="content-area">
          {activeTab === "dashboard" && (
            <div className="fade-in">
              <div className="cards">
                <StatCard 
                  icon={<Calendar className="text-primary" />} 
                  title="Partidos Totales" 
                  value={matches.length} 
                  sub="Programados / Jugados"
                />
                <StatCard 
                  icon={<BarChart3 className="text-secondary" />} 
                  title="Grupos" 
                  value={groups.length || 12} 
                  sub="Fase inicial A - L"
                />
                <StatCard 
                  icon={<Flame className="text-accent" />} 
                  title="Favorito Actual" 
                  value="Argentina" 
                  sub="Según predicciones"
                />
              </div>

              <div className="dashboard-grid">
                <div className="dashboard-section">
                  <h2>Próximos Partidos Relevantes</h2>
                  <MatchGrid matches={nextMatches} />
                </div>
                
                <div className="dashboard-section">
                  <h2>Simulación de Favoritos</h2>
                  <div className="favorites-list">
                    <div className="favorite-item">
                      <div className="fav-rank">1</div>
                      <img src={flagUrl("ar")} alt="AR" className="fav-flag" />
                      <div className="fav-info">
                        <strong>Argentina</strong>
                        <span>Probabilidad de Título: 18.5%</span>
                      </div>
                      <Award className="fav-award golden" />
                    </div>
                    <div className="favorite-item">
                      <div className="fav-rank">2</div>
                      <img src={flagUrl("fr")} alt="FR" className="fav-flag" />
                      <div className="fav-info">
                        <strong>Francia</strong>
                        <span>Probabilidad de Título: 15.2%</span>
                      </div>
                      <Award className="fav-award silver" />
                    </div>
                    <div className="favorite-item">
                      <div className="fav-rank">3</div>
                      <img src={flagUrl("br")} alt="BR" className="fav-flag" />
                      <div className="fav-info">
                        <strong>Brasil</strong>
                        <span>Probabilidad de Título: 14.0%</span>
                      </div>
                      <Award className="fav-award bronze" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "matches" && (
            <div className="fade-in">
              <div className="section-header">
                <h2>Todos los Partidos</h2>
                <div className="search-box">
                  <Search size={18} />
                  <input 
                    type="text" 
                    placeholder="Buscar por equipo, estadio o fase..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <MatchGrid matches={filteredMatches} />
            </div>
          )}

          {activeTab === "groups" && (
            <div className="fade-in">
              <h2>Tabla de Posiciones por Grupo</h2>
              <GroupTables groups={groups} />
            </div>
          )}

          {activeTab === "bracket" && (
            <div className="fade-in">
              <h2>Bracket de Avance Mundial 2026</h2>
              <Bracket />
            </div>
          )}

          {activeTab === "predictions" && (
            <div className="fade-in">
              <h2>Predicciones de Probabilidad de Victoria</h2>
              <PredictionList matches={matches.filter(m => m.status !== "complete")} groups={groups} />
            </div>
          )}
        </main>
      )}

      <footer className="footer">
        <p>© 2026 WorldCup Dashboard. Creado para el Mundial 2026 (EE.UU., México y Canadá).</p>
      </footer>
    </div>
  );
}

function StatCard({ icon, title, value, sub }) {
  return (
    <div className="stat-card">
      <div className="stat-icon-wrapper">
        {icon}
      </div>
      <div className="stat-details">
        <span>{title}</span>
        <strong>{value}</strong>
        <small>{sub}</small>
      </div>
    </div>
  );
}

function MatchGrid({ matches }) {
  if (matches.length === 0) {
    return <p className="no-data">No hay partidos coincidentes.</p>;
  }

  const teamCodes = {
    "Estados Unidos": "us",
    "México": "mx",
    "Canadá": "ca",
    "Argentina": "ar",
    "Brasil": "br",
    "Francia": "fr",
    "España": "es",
    "Alemania": "de",
    "Italia": "it",
    "Inglaterra": "gb-eng",
    "Uruguay": "uy",
    "Colombia": "co"
  };

  return (
    <div className="match-grid">
      {matches.map((m) => (
        <div className="match-card" key={m.id}>
          <div className="match-header">
            <span className="phase-badge">{m.phase || m.round}</span>
            {m.status === "complete" ? (
              <span className="status-badge complete">Finalizado</span>
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
                  onError={(e) => { e.target.src = "https://flagcdn.com/w40/un.png"; }}
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
                  onError={(e) => { e.target.src = "https://flagcdn.com/w40/un.png"; }}
                />
                <span>{m.away_team}</span>
              </div>
              <strong className="score">{m.away_score !== null ? m.away_score : "-"}</strong>
            </div>
          </div>

          <div className="match-footer">
            <div className="info-item">
              <MapPin size={12} />
              <span>{m.stadium || "Estadio Mundialista"}</span>
            </div>
            <div className="info-item">
              <Clock size={12} />
              <span>{new Date(m.kickoff_utc).toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" })}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function GroupTables({ groups }) {
  return (
    <div className="groups">
      {groups.map((group) => (
        <div className="group-card" key={group.name}>
          <h3>Grupo {group.name}</h3>

          <table>
            <thead>
              <tr>
                <th>Equipo</th>
                <th className="txt-center">PJ</th>
                <th className="txt-center">DG</th>
                <th className="txt-center">Pts</th>
              </tr>
            </thead>
            <tbody>
              {(group.standings || []).map((team, index) => (
                <tr key={team.team_name} className={index < 2 ? "qualify" : index === 2 ? "third-place" : ""}>
                  <td>
                    <div className="table-team-cell">
                      <span className="rank-num">{index + 1}</span>
                      <img 
                        src={flagUrl(team.code)} 
                        alt={team.code} 
                        className="flag-img-small"
                        onError={(e) => { e.target.src = "https://flagcdn.com/w40/un.png"; }}
                      />
                      <span className="team-name-table">{team.team_name}</span>
                    </div>
                  </td>
                  <td className="txt-center">{team.played || 0}</td>
                  <td className={`txt-center ${team.goal_difference > 0 ? "text-pos" : team.goal_difference < 0 ? "text-neg" : ""}`}>
                    {team.goal_difference > 0 ? `+${team.goal_difference}` : team.goal_difference}
                  </td>
                  <td className="txt-center font-bold">
                    <span>{team.points || 0}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

function Bracket() {
  const bracketData = {
    "Dieciseisavos": [
      { id: 1, t1: "Estados Unidos", t2: "Ecuador", s1: null, s2: null },
      { id: 2, t1: "Argentina", t2: "Dinamarca", s1: null, s2: null },
      { id: 3, t1: "Francia", t2: "Ucrania", s1: null, s2: null },
      { id: 4, t1: "Brasil", t2: "Japón", s1: null, s2: null }
    ],
    "Octavos": [
      { id: 5, t1: "Ganador D1", t2: "Ganador D2", s1: null, s2: null },
      { id: 6, t1: "Ganador D3", t2: "Ganador D4", s1: null, s2: null }
    ],
    "Cuartos": [
      { id: 7, t1: "Ganador O1", t2: "Ganador O2", s1: null, s2: null }
    ],
    "Semifinal": [
      { id: 8, t1: "Ganador C1", t2: "Ganador C2", s1: null, s2: null }
    ],
    "Final": [
      { id: 9, t1: "Ganador S1", t2: "Ganador S2", s1: null, s2: null }
    ]
  };

  const rounds = ["Dieciseisavos", "Octavos", "Cuartos", "Semifinal", "Final"];

  return (
    <div className="bracket-wrapper">
      <div className="bracket">
        {rounds.map((round) => (
          <div className="round" key={round}>
            <div className="round-title">{round}</div>
            <div className="bracket-matches">
              {bracketData[round].map((match) => (
                <div className="bracket-match-box" key={match.id}>
                  <div className="bracket-team">
                    <span>{match.t1}</span>
                    <strong>{match.s1 !== null ? match.s1 : "-"}</strong>
                  </div>
                  <div className="bracket-team separator">
                    <span>{match.t2}</span>
                    <strong>{match.s2 !== null ? match.s2 : "-"}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PredictionList({ matches, groups }) {
  const pendingMatches = matches.slice(0, 10);

  function findTeamStats(name) {
    for (const group of groups) {
      const standings = group.standings || [];
      const found = standings.find((t) => t.team_name === name);
      if (found) return found;
    }
    return {};
  }

  const teamCodes = {
    "Estados Unidos": "us",
    "México": "mx",
    "Canadá": "ca",
    "Argentina": "ar",
    "Brasil": "br",
    "Francia": "fr",
    "España": "es",
    "Alemania": "de",
    "Italia": "it",
    "Inglaterra": "gb-eng",
    "Uruguay": "uy",
    "Colombia": "co"
  };

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
              <span className="prediction-badge"><Sparkles size={12} /> Probabilidad</span>
            </div>

            <div className="prediction-matchup">
              <div className="predict-team">
                <img 
                  src={flagUrl(teamCodes[m.home_team] || "un")} 
                  alt={m.home_team} 
                  className="predict-flag"
                  onError={(e) => { e.target.src = "https://flagcdn.com/w40/un.png"; }}
                />
                <strong>{m.home_team}</strong>
              </div>
              <span className="vs">VS</span>
              <div className="predict-team">
                <img 
                  src={flagUrl(teamCodes[m.away_team] || "un")} 
                  alt={m.away_team} 
                  className="predict-flag"
                  onError={(e) => { e.target.src = "https://flagcdn.com/w40/un.png"; }}
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
                Pronóstico: <strong>{prediction.home > prediction.away ? m.home_team : prediction.away > prediction.home ? m.away_team : "Empate"}</strong> tiene mayor ventaja
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
