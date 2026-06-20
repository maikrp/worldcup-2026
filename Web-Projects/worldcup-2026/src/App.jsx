import React, { useEffect, useState } from "react";
import {
  Calendar,
  BarChart3,
  Search,
  Sparkles,
  Award,
  GitBranch,
  Percent,
  Goal,
} from "lucide-react";
import "./App.css";

// Components
import StatCard from "./components/StatCard";
import MatchGrid from "./components/MatchGrid";
import GroupTables from "./components/GroupTables";
import Bracket from "./components/Bracket";
import PredictionList from "./components/PredictionList";
import DailyMatchSection from "./components/DailyMatchSection";
import TopScorers from "./components/TopScorers";

// Constants & Data
import { mockGroups, mockMatches } from "./constants/mockData";
import { flagUrl, globalTeamCodes } from "./constants/teamCodes";
import { buildTopScorers, fallbackTopScorers } from "./constants/topScorers";
import { fetchLiveMatches, mergeLiveMatches } from "./services/liveMatches";
import { COSTA_RICA_TIME_ZONE, getCostaRicaDateString, shiftCalendarDate } from "./utils/dateTime";
import { normalizeMatchStatuses } from "./utils/matchStatus";
import { calculateStandings } from "./utils/standings";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => getCostaRicaDateString());
  const [sortOrder, setSortOrder] = useState("asc");
  const [matchDateFilter, setMatchDateFilter] = useState("");
  const [currentTime] = useState(() => Date.now());
  const [statusClock, setStatusClock] = useState(() => Date.now());
  const [remoteMatches, setRemoteMatches] = useState([]);
  const [lastLiveSync, setLastLiveSync] = useState(null);
  const [liveSyncStatus, setLiveSyncStatus] = useState("connecting");
  const matches = normalizeMatchStatuses(
    mergeLiveMatches(mockMatches, remoteMatches),
    new Date(statusClock)
  );
  const topScorers = remoteMatches.length ? buildTopScorers(matches) : fallbackTopScorers;
  const groups = calculateStandings(mockGroups, matches);

  useEffect(() => {
    const intervalId = window.setInterval(() => setStatusClock(Date.now()), 30000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    let activeController;

    const synchronizeLiveMatches = async () => {
      activeController?.abort();
      activeController = new AbortController();

      try {
        const liveData = await fetchLiveMatches(activeController.signal);
        setRemoteMatches(liveData.matches);
        setLastLiveSync(liveData.syncedAt || new Date().toISOString());
        setLiveSyncStatus("online");
        setStatusClock(Date.now());
      } catch (error) {
        if (error.name !== "AbortError") {
          setLiveSyncStatus((currentStatus) =>
            currentStatus === "online" || currentStatus === "stale" ? "stale" : "offline"
          );
        }
      }
    };

    synchronizeLiveMatches();
    const intervalId = window.setInterval(synchronizeLiveMatches, 60000);

    return () => {
      window.clearInterval(intervalId);
      activeController?.abort();
    };
  }, []);

  const liveMatch = matches.find((match) => match.status === "live");
  const nextMatch = matches
    .filter(
      (match) => match.status === "scheduled" && new Date(match.kickoff_utc).getTime() > currentTime
    )
    .sort((a, b) => new Date(a.kickoff_utc) - new Date(b.kickoff_utc))[0];

  const nextMatchTime = nextMatch
    ? new Intl.DateTimeFormat("es-CR", {
        timeZone: COSTA_RICA_TIME_ZONE,
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(nextMatch.kickoff_utc))
    : null;
  const featuredMatch = liveMatch || nextMatch;

  const handlePrevDay = () => {
    setSelectedDate((currentDate) => shiftCalendarDate(currentDate, -1));
  };

  const handleNextDay = () => {
    setSelectedDate((currentDate) => shiftCalendarDate(currentDate, 1));
  };

  const filteredMatches = matches.filter((m) => {
    const q = searchQuery.toLowerCase();

    let matchCRDate = "";
    try {
      matchCRDate = getCostaRicaDateString(m.kickoff_utc);
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
            <h1>FIFA WorldCup 2026</h1>
            <p>Predicciones, grupos y partidos</p>
          </div>
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
          <GitBranch size={18} /> Llaves
        </button>
        <button
          className={activeTab === "predictions" ? "active" : ""}
          onClick={() => setActiveTab("predictions")}
        >
          <Percent size={18} /> Pronósticos
        </button>
        <button
          className={activeTab === "scorers" ? "active" : ""}
          onClick={() => setActiveTab("scorers")}
        >
          <Goal size={18} /> Goleadores
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
              <div className={`live-sync-status sync-${liveSyncStatus}`}>
                <span className="live-sync-dot"></span>
                <span>
                  {liveSyncStatus === "online"
                    ? `Datos en vivo · Actualizado ${new Date(lastLiveSync).toLocaleTimeString(
                        "es-CR",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        }
                      )}`
                    : liveSyncStatus === "offline"
                      ? "Sin conexión en vivo · usando respaldo local"
                      : liveSyncStatus === "stale"
                        ? `Datos guardados · última actualización ${new Date(
                            lastLiveSync
                          ).toLocaleTimeString("es-CR", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}`
                        : "Conectando datos en vivo…"}
                </span>
              </div>
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
                  title={liveMatch ? "🔴 En Vivo Ahora" : "Próximo Partido"}
                  valueContent={
                    featuredMatch ? (
                      <div className="next-match-teams">
                        <div className="next-match-team">
                          <img
                            src={flagUrl(globalTeamCodes[featuredMatch.home_team])}
                            alt={`Bandera de ${featuredMatch.home_team}`}
                          />
                          <strong>{featuredMatch.home_team}</strong>
                        </div>
                        <span>vs</span>
                        <div className="next-match-team">
                          <img
                            src={flagUrl(globalTeamCodes[featuredMatch.away_team])}
                            alt={`Bandera de ${featuredMatch.away_team}`}
                          />
                          <strong>{featuredMatch.away_team}</strong>
                        </div>
                      </div>
                    ) : null
                  }
                  value={
                    liveMatch
                      ? `${liveMatch.home_team} vs ${liveMatch.away_team}`
                      : nextMatch
                        ? `${nextMatch.home_team} vs ${nextMatch.away_team}`
                        : "Jornada finalizada"
                  }
                  sub={
                    liveMatch
                      ? `${liveMatch.home_score ?? 0} - ${liveMatch.away_score ?? 0}`
                      : nextMatch
                        ? `${nextMatchTime} · ${nextMatch.phase || nextMatch.round}`
                        : "No hay más partidos programados"
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
              <Bracket groups={groups} matches={matches} />
            </div>
          )}

          {activeTab === "predictions" && (
            <div className="fade-in">
              <h2>Predicciones de Probabilidad de Victoria</h2>
              <PredictionList matches={matches} groups={groups} />
            </div>
          )}

          {activeTab === "scorers" && <TopScorers scorers={topScorers} />}
        </main>
      )}

      <footer className="footer">
        <p>© 2026 WorldCup Dashboard. Creado para el Mundial 2026 (EE.UU., México y Canadá).</p>
      </footer>
    </div>
  );
}
