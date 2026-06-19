import React, { useState } from "react";
import {
  Calendar,
  BarChart3,
  Flame,
  Search,
  Sparkles,
  Award,
  GitBranch,
  Percent,
} from "lucide-react";
import "./App.css";

// Components
import StatCard from "./components/StatCard";
import MatchGrid from "./components/MatchGrid";
import GroupTables from "./components/GroupTables";
import Bracket from "./components/Bracket";
import PredictionList from "./components/PredictionList";
import DailyMatchSection from "./components/DailyMatchSection";

// Constants & Data
import { mockGroups, mockMatches } from "./constants/mockData";
import { flagUrl } from "./constants/teamCodes";
import { calculateStandings } from "./utils/standings";

export default function App() {
  const matches = mockMatches;
  const groups = calculateStandings(mockGroups, matches);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("2026-06-19");
  const [sortOrder, setSortOrder] = useState("asc");
  const [matchDateFilter, setMatchDateFilter] = useState("");

  const handlePrevDay = () => {
    const current = new Date(selectedDate + "T00:00:00");
    current.setDate(current.getDate() - 1);
    setSelectedDate(current.toISOString().split("T")[0]);
  };

  const handleNextDay = () => {
    const current = new Date(selectedDate + "T00:00:00");
    current.setDate(current.getDate() + 1);
    setSelectedDate(current.toISOString().split("T")[0]);
  };

  const filteredMatches = matches.filter((m) => {
    const q = searchQuery.toLowerCase();

    let matchCRDate = "";
    try {
      const date = new Date(m.kickoff_utc);
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Costa_Rica",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      const parts = formatter.formatToParts(date);
      const year = parts.find((p) => p.type === "year").value;
      const month = parts.find((p) => p.type === "month").value;
      const day = parts.find((p) => p.type === "day").value;
      matchCRDate = `${year}-${month}-${day}`;
    } catch {
      matchCRDate = m.kickoff_utc.split("T")[0];
    }

    const matchesDate = matchDateFilter ? matchCRDate === matchDateFilter : true;

    return (
      matchesDate &&
      (m.home_team.toLowerCase().includes(q) ||
        m.away_team.toLowerCase().includes(q) ||
        (m.stadium && m.stadium.toLowerCase().includes(q)) ||
        (m.phase && m.phase.toLowerCase().includes(q)))
    );
  });

  const sortedMatches = [...filteredMatches].sort((a, b) => {
    const dateA = new Date(a.kickoff_utc);
    const dateB = new Date(b.kickoff_utc);
    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });

  return (
    <div className="app">
      <header className="header">
        <div className="header-brand">
          <div className="logo-container">
            <img src="/wc2026-logo.png" alt="Mundial 2026 Logo" className="logo-img" />
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
        <button
          className={activeTab === "dashboard" ? "active" : ""}
          onClick={() => setActiveTab("dashboard")}
        >
          <Sparkles size={18} /> Inicio
        </button>
        <button
          className={activeTab === "matches" ? "active" : ""}
          onClick={() => setActiveTab("matches")}
        >
          <Calendar size={18} /> Partidos
        </button>
        <button
          className={activeTab === "groups" ? "active" : ""}
          onClick={() => setActiveTab("groups")}
        >
          <BarChart3 size={18} /> Grupos
        </button>
        <button
          className={activeTab === "bracket" ? "active" : ""}
          onClick={() => setActiveTab("bracket")}
        >
          <GitBranch size={18} /> Llaves (Bracket)
        </button>
        <button
          className={activeTab === "predictions" ? "active" : ""}
          onClick={() => setActiveTab("predictions")}
        >
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
                  title="Partidos Jugados"
                  value={`${matches.filter((m) => m.status === "complete").length} / 104`}
                  sub={`Avance del torneo: ${((matches.filter((m) => m.status === "complete").length / 104) * 100).toFixed(1)}%`}
                />
                <StatCard
                  icon={<BarChart3 className="text-secondary" />}
                  title="Grupos"
                  value={groups.length || 12}
                  sub="Fase de grupos A - L"
                />
                <StatCard
                  icon={<Flame className="text-accent" />}
                  title={
                    matches.some((m) => m.status === "live")
                      ? "🔴 En Vivo Ahora"
                      : "Próximo Partido"
                  }
                  value={
                    matches.find((m) => m.status === "live")?.home_team?.split(" ")[0] +
                      " vs " +
                      matches.find((m) => m.status === "live")?.away_team?.split(" ")[0] ||
                    "Programado"
                  }
                  sub={
                    matches.some((m) => m.status === "live")
                      ? `${matches.find((m) => m.status === "live")?.home_score} - ${matches.find((m) => m.status === "live")?.away_score}`
                      : "Ver calendario"
                  }
                />
              </div>

              <div className="dashboard-grid">
                <DailyMatchSection
                  matches={matches}
                  groups={groups}
                  selectedDate={selectedDate}
                  onPrevDay={handlePrevDay}
                  onNextDay={handleNextDay}
                />

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
                <div className="filter-controls">
                  <div className="search-box">
                    <Search size={18} />
                    <input
                      type="text"
                      placeholder="Buscar por equipo o estadio..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="date-filter-box">
                    <input
                      type="date"
                      value={matchDateFilter}
                      onChange={(e) => setMatchDateFilter(e.target.value)}
                      className="date-select"
                      min="2026-06-11"
                      max="2026-07-19"
                    />
                    {matchDateFilter && (
                      <button
                        onClick={() => setMatchDateFilter("")}
                        className="clear-date-btn"
                        title="Limpiar fecha"
                      >
                        Limpiar
                      </button>
                    )}
                  </div>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="sort-select"
                  >
                    <option value="asc">Orden: Ascendente</option>
                    <option value="desc">Orden: Descendente</option>
                  </select>
                </div>
              </div>
              <MatchGrid matches={sortedMatches} groups={groups} />
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
              <PredictionList matches={matches} groups={groups} />
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
