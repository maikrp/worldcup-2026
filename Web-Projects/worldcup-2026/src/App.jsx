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

const flagUrl = (code) =>
  code ? `https://flagcdn.com/w40/${code.toLowerCase()}.png` : "";

const mockGroups = [
  {
    name: "A",
    standings: [
      { code: "mx", team_name: "México", played: 1, wins: 1, draws: 0, losses: 0, goals_for: 2, goals_against: 0, goal_difference: 2, points: 3 },
      { code: "kr", team_name: "Corea del Sur", played: 1, wins: 1, draws: 0, losses: 0, goals_for: 2, goals_against: 1, goal_difference: 1, points: 3 },
      { code: "cz", team_name: "República Checa", played: 1, wins: 0, draws: 0, losses: 1, goals_for: 1, goals_against: 2, goal_difference: -1, points: 0 },
      { code: "za", team_name: "Sudáfrica", played: 1, wins: 0, draws: 0, losses: 1, goals_for: 0, goals_against: 2, goal_difference: -2, points: 0 }
    ]
  },
  {
    name: "B",
    standings: [
      { code: "ca", team_name: "Canadá", played: 1, wins: 0, draws: 1, losses: 0, goals_for: 1, goals_against: 1, goal_difference: 0, points: 1 },
      { code: "ba", team_name: "Bosnia-Herzegovina", played: 1, wins: 0, draws: 1, losses: 0, goals_for: 1, goals_against: 1, goal_difference: 0, points: 1 },
      { code: "it", team_name: "Italia", played: 0, wins: 0, draws: 0, losses: 0, goals_for: 0, goals_against: 0, goal_difference: 0, points: 0 },
      { code: "ni", team_name: "Irlanda del Norte", played: 0, wins: 0, draws: 0, losses: 0, goals_for: 0, goals_against: 0, goal_difference: 0, points: 0 }
    ]
  },
  {
    name: "C",
    standings: [
      { code: "br", team_name: "Brasil", played: 1, wins: 0, draws: 1, losses: 0, goals_for: 1, goals_against: 1, goal_difference: 0, points: 1 },
      { code: "ma", team_name: "Marruecos", played: 1, wins: 0, draws: 1, losses: 0, goals_for: 1, goals_against: 1, goal_difference: 0, points: 1 },
      { code: "gb-sct", team_name: "Escocia", played: 1, wins: 1, draws: 0, losses: 0, goals_for: 1, goals_against: 0, goal_difference: 1, points: 3 },
      { code: "ht", team_name: "Haití", played: 1, wins: 0, draws: 0, losses: 1, goals_for: 0, goals_against: 1, goal_difference: -1, points: 0 }
    ]
  },
  {
    name: "D",
    standings: [
      { code: "us", team_name: "Estados Unidos", played: 1, wins: 1, draws: 0, losses: 0, goals_for: 4, goals_against: 1, goal_difference: 3, points: 3 },
      { code: "au", team_name: "Australia", played: 1, wins: 1, draws: 0, losses: 0, goals_for: 2, goals_against: 0, goal_difference: 2, points: 3 },
      { code: "tr", team_name: "Turquía", played: 1, wins: 0, draws: 0, losses: 1, goals_for: 0, goals_against: 2, goal_difference: -2, points: 0 },
      { code: "py", team_name: "Paraguay", played: 1, wins: 0, draws: 0, losses: 1, goals_for: 1, goals_against: 4, goal_difference: -3, points: 0 }
    ]
  },
  {
    name: "E",
    standings: [
      { code: "de", team_name: "Alemania", played: 1, wins: 1, draws: 0, losses: 0, goals_for: 7, goals_against: 1, goal_difference: 6, points: 3 },
      { code: "ci", team_name: "Costa de Marfil", played: 1, wins: 1, draws: 0, losses: 0, goals_for: 1, goals_against: 0, goal_difference: 1, points: 3 },
      { code: "ec", team_name: "Ecuador", played: 1, wins: 0, draws: 0, losses: 1, goals_for: 0, goals_against: 1, goal_difference: -1, points: 0 },
      { code: "cw", team_name: "Curazao", played: 1, wins: 0, draws: 0, losses: 1, goals_for: 1, goals_against: 7, goal_difference: -6, points: 0 }
    ]
  },
  {
    name: "F",
    standings: [
      { code: "nl", team_name: "Países Bajos", played: 1, wins: 0, draws: 1, losses: 0, goals_for: 2, goals_against: 2, goal_difference: 0, points: 1 },
      { code: "jp", team_name: "Japón", played: 1, wins: 0, draws: 1, losses: 0, goals_for: 2, goals_against: 2, goal_difference: 0, points: 1 },
      { code: "se", team_name: "Suecia", played: 1, wins: 1, draws: 0, losses: 0, goals_for: 5, goals_against: 1, goal_difference: 4, points: 3 },
      { code: "tn", team_name: "Túnez", played: 1, wins: 0, draws: 0, losses: 1, goals_for: 1, goals_against: 5, goal_difference: -4, points: 0 }
    ]
  },
  {
    name: "G",
    standings: [
      { code: "be", team_name: "Bélgica", played: 1, wins: 0, draws: 1, losses: 0, goals_for: 1, goals_against: 1, goal_difference: 0, points: 1 },
      { code: "eg", team_name: "Egipto", played: 1, wins: 0, draws: 1, losses: 0, goals_for: 1, goals_against: 1, goal_difference: 0, points: 1 },
      { code: "ir", team_name: "Irán", played: 1, wins: 0, draws: 1, losses: 0, goals_for: 2, goals_against: 2, goal_difference: 0, points: 1 },
      { code: "nz", team_name: "Nueva Zelanda", played: 1, wins: 0, draws: 1, losses: 0, goals_for: 2, goals_against: 2, goal_difference: 0, points: 1 }
    ]
  },
  {
    name: "H",
    standings: [
      { code: "es", team_name: "España", played: 1, wins: 0, draws: 1, losses: 0, goals_for: 0, goals_against: 0, goal_difference: 0, points: 1 },
      { code: "cv", team_name: "Cabo Verde", played: 1, wins: 0, draws: 1, losses: 0, goals_for: 0, goals_against: 0, goal_difference: 0, points: 1 },
      { code: "uy", team_name: "Uruguay", played: 1, wins: 0, draws: 1, losses: 0, goals_for: 1, goals_against: 1, goal_difference: 0, points: 1 },
      { code: "sa", team_name: "Arabia Saudita", played: 1, wins: 0, draws: 1, losses: 0, goals_for: 1, goals_against: 1, goal_difference: 0, points: 1 }
    ]
  },
  {
    name: "I",
    standings: [
      { code: "fr", team_name: "Francia", played: 1, wins: 1, draws: 0, losses: 0, goals_for: 3, goals_against: 1, goal_difference: 2, points: 3 },
      { code: "sn", team_name: "Senegal", played: 1, wins: 0, draws: 0, losses: 1, goals_for: 1, goals_against: 3, goal_difference: -2, points: 0 },
      { code: "no", team_name: "Noruega", played: 1, wins: 1, draws: 0, losses: 0, goals_for: 4, goals_against: 1, goal_difference: 3, points: 3 },
      { code: "iq", team_name: "Irak", played: 1, wins: 0, draws: 0, losses: 1, goals_for: 1, goals_against: 4, goal_difference: -3, points: 0 }
    ]
  },
  {
    name: "J",
    standings: [
      { code: "ar", team_name: "Argentina", played: 0, wins: 0, draws: 0, losses: 0, goals_for: 0, goals_against: 0, goal_difference: 0, points: 0 },
      { code: "dz", team_name: "Argelia", played: 0, wins: 0, draws: 0, losses: 0, goals_for: 0, goals_against: 0, goal_difference: 0, points: 0 },
      { code: "at", team_name: "Austria", played: 0, wins: 0, draws: 0, losses: 0, goals_for: 0, goals_against: 0, goal_difference: 0, points: 0 },
      { code: "jo", team_name: "Jordania", played: 0, wins: 0, draws: 0, losses: 0, goals_for: 0, goals_against: 0, goal_difference: 0, points: 0 }
    ]
  },
  {
    name: "K",
    standings: [
      { code: "pt", team_name: "Portugal", played: 0, wins: 0, draws: 0, losses: 0, goals_for: 0, goals_against: 0, goal_difference: 0, points: 0 },
      { code: "uz", team_name: "Uzbekistán", played: 1, wins: 0, draws: 0, losses: 1, goals_for: 1, goals_against: 3, goal_difference: -2, points: 0 },
      { code: "co", team_name: "Colombia", played: 1, wins: 1, draws: 0, losses: 0, goals_for: 3, goals_against: 1, goal_difference: 2, points: 3 },
      { code: "hn", team_name: "Honduras", played: 0, wins: 0, draws: 0, losses: 0, goals_for: 0, goals_against: 0, goal_difference: 0, points: 0 }
    ]
  },
  {
    name: "L",
    standings: [
      { code: "gb-eng", team_name: "Inglaterra", played: 0, wins: 0, draws: 0, losses: 0, goals_for: 0, goals_against: 0, goal_difference: 0, points: 0 },
      { code: "hr", team_name: "Croacia", played: 0, wins: 0, draws: 0, losses: 0, goals_for: 0, goals_against: 0, goal_difference: 0, points: 0 },
      { code: "gh", team_name: "Ghana", played: 0, wins: 0, draws: 0, losses: 0, goals_for: 0, goals_against: 0, goal_difference: 0, points: 0 },
      { code: "pa", team_name: "Panamá", played: 0, wins: 0, draws: 0, losses: 0, goals_for: 0, goals_against: 0, goal_difference: 0, points: 0 }
    ]
  }
];

const mockMatches = [
  { id: 1, home_team: "México", away_team: "Sudáfrica", home_score: 2, away_score: 0, kickoff_utc: "2026-06-11T16:00:00Z", status: "complete", phase: "Grupo A", stadium: "Estadio Azteca", round: "Grupo A" },
  { id: 2, home_team: "Corea del Sur", away_team: "República Checa", home_score: 2, away_score: 1, kickoff_utc: "2026-06-11T19:00:00Z", status: "complete", phase: "Grupo A", stadium: "Estadio Guadalajara", round: "Grupo A" },
  { id: 3, home_team: "Canadá", away_team: "Bosnia-Herzegovina", home_score: 1, away_score: 1, kickoff_utc: "2026-06-12T17:00:00Z", status: "complete", phase: "Grupo B", stadium: "BC Place", round: "Grupo B" },
  { id: 4, home_team: "Estados Unidos", away_team: "Paraguay", home_score: 4, away_score: 1, kickoff_utc: "2026-06-12T20:00:00Z", status: "complete", phase: "Grupo D", stadium: "SoFi Stadium", round: "Grupo D" },
  { id: 5, home_team: "Brasil", away_team: "Marruecos", home_score: 1, away_score: 1, kickoff_utc: "2026-06-13T15:00:00Z", status: "complete", phase: "Grupo C", stadium: "Gillette Stadium", round: "Grupo C" },
  { id: 6, home_team: "Escocia", away_team: "Haití", home_score: 1, away_score: 0, kickoff_utc: "2026-06-13T18:00:00Z", status: "complete", phase: "Grupo C", stadium: "MetLife Stadium", round: "Grupo C" },
  { id: 7, home_team: "Australia", away_team: "Turquía", home_score: 2, away_score: 0, kickoff_utc: "2026-06-13T21:00:00Z", status: "complete", phase: "Grupo D", stadium: "Lumen Field", round: "Grupo D" },
  { id: 8, home_team: "Alemania", away_team: "Curazao", home_score: 7, away_score: 1, kickoff_utc: "2026-06-14T15:00:00Z", status: "complete", phase: "Grupo E", stadium: "Levi's Stadium", round: "Grupo E" },
  { id: 9, home_team: "Países Bajos", away_team: "Japón", home_score: 2, away_score: 2, kickoff_utc: "2026-06-14T18:00:00Z", status: "complete", phase: "Grupo F", stadium: "Mercedes-Benz Stadium", round: "Grupo F" },
  { id: 10, home_team: "Costa de Marfil", away_team: "Ecuador", home_score: 1, away_score: 0, kickoff_utc: "2026-06-14T21:00:00Z", status: "complete", phase: "Grupo E", stadium: "Hard Rock Stadium", round: "Grupo E" },
  { id: 11, home_team: "España", away_team: "Cabo Verde", home_score: 0, away_score: 0, kickoff_utc: "2026-06-15T15:00:00Z", status: "complete", phase: "Grupo H", stadium: "Nrg Stadium", round: "Grupo H" },
  { id: 12, home_team: "Bélgica", away_team: "Egipto", home_score: 1, away_score: 1, kickoff_utc: "2026-06-15T18:00:00Z", status: "complete", phase: "Grupo G", stadium: "SoFi Stadium", round: "Grupo G" },
  { id: 13, home_team: "Saudi Arabia", away_team: "Uruguay", home_score: 1, away_score: 1, kickoff_utc: "2026-06-15T21:00:00Z", status: "complete", phase: "Grupo H", stadium: "Cotton Bowl", round: "Grupo H" },
  { id: 14, home_team: "Irán", away_team: "Nueva Zelanda", home_score: 2, away_score: 2, kickoff_utc: "2026-06-15T23:00:00Z", status: "complete", phase: "Grupo G", stadium: "Lincoln Financial Field", round: "Grupo G" },
  { id: 15, home_team: "Francia", away_team: "Senegal", home_score: 3, away_score: 1, kickoff_utc: "2026-06-16T17:00:00Z", status: "complete", phase: "Grupo I", stadium: "BMO Field", round: "Grupo I" },
  { id: 16, home_team: "Irak", away_team: "Noruega", home_score: 1, away_score: 4, kickoff_utc: "2026-06-16T20:00:00Z", status: "complete", phase: "Grupo I", stadium: "Arrowhead Stadium", round: "Grupo I" },
  { id: 17, home_team: "Uzbekistán", away_team: "Colombia", home_score: 1, away_score: 3, kickoff_utc: "2026-06-18T20:00:00Z", status: "complete", phase: "Grupo K", stadium: "SoFi Stadium", round: "Grupo K" },
  { id: 18, home_team: "Estados Unidos", away_team: "Australia", home_score: null, away_score: null, kickoff_utc: "2026-06-19T20:00:00Z", status: "scheduled", phase: "Grupo D", stadium: "Lumen Field", round: "Grupo D" },
];und: "Octavos" },
];

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
  const [matches, setMatches] = useState(mockMatches);
  const [groups, setGroups] = useState(mockGroups);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
          <span className="api-badge mock">Modo Local (Datos Internos)</span>
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
