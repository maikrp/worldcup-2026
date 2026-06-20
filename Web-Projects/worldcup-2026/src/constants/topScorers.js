import { globalTeamCodes } from "./teamCodes";

const PLAYER_NAMES = {
  "C. Larin": "Cyle Larin",
  "F. Balogun": "Folarin Balogun",
  "Jvhan Mnzambi": "Johan Manzambi",
  "K. Havertz": "Kai Havertz",
  "K. Mbappé": "Kylian Mbappé",
  "Kail Larin": "Cyle Larin",
  "H. Kane": "Harry Kane",
  "V. Júnior": "Vinícius Júnior",
  "Y.Ayari": "Yasin Ayari",
};

const KNOWN_OWN_GOALS = new Set([
  "Aymen Hussein|Noruega",
  "D. Bobadilla|Estados Unidos",
  "Kamrvn Bargs|Estados Unidos",
  "Mohamed Almnai|Canadá",
  "Mohamed Hany|Bélgica",
]);

const PLAYER_PHOTOS = {
  "Cyle Larin": "/players/cyle-larin.png",
  "Erling Haaland": "/players/erling-haaland.jpg",
  "Folarin Balogun": "/players/folarin-balogun.jpg",
  "Jonathan David": "/players/jonathan-david.jpg",
  "Kai Havertz": "/players/kai-havertz.jpg",
  "Kylian Mbappé": "/players/mbappe.webp",
  "Harry Kane": "/players/kane.webp",
  "Lionel Messi": "/players/messi.webp",
  "Matheus Cunha": "/players/matheus-cunha.jpg",
  "Vinícius Júnior": "/players/vinicius-junior.jpg",
  "Yasin Ayari": "/players/yasin-ayari.jpg",
};

function parseScorerEvents(rawScorers) {
  if (!rawScorers || rawScorers === "null") return [];
  if (Array.isArray(rawScorers)) return rawScorers;

  return String(rawScorers)
    .replace(/^\{|\}$/g, "")
    .split(",")
    .map((value) => value.trim().replace(/^["“”]+|["“”]+$/g, ""))
    .filter(Boolean);
}

function parseScorer(value) {
  const ownGoal = /\(OG\)/i.test(value);
  const minuteMatch = value.match(/(\d+(?:'\+\d+|\+\d+)?')/);
  const minute = minuteMatch?.[1] || "";
  const rawName = value
    .replace(minuteMatch?.[0] || "", "")
    .replace(/\((?:p|OG)\)/gi, "")
    .trim();

  return {
    name: PLAYER_NAMES[rawName] || rawName,
    minute,
    ownGoal,
  };
}

export function buildTopScorers(matches) {
  const players = new Map();

  matches
    .filter((match) => match.status === "complete" || match.status === "live")
    .forEach((match) => {
      [
        [match.home_team, match.away_team, match.home_scorers],
        [match.away_team, match.home_team, match.away_scorers],
      ].forEach(([team, opponent, rawScorers]) => {
        parseScorerEvents(rawScorers).forEach((rawScorer) => {
          const scorer = parseScorer(rawScorer);
          if (!scorer.name || scorer.ownGoal || KNOWN_OWN_GOALS.has(`${scorer.name}|${team}`)) {
            return;
          }

          const key = `${scorer.name}|${team}`;
          const current = players.get(key) || {
            name: scorer.name,
            team,
            teamCode: globalTeamCodes[team] || "un",
            goals: 0,
            scoringMatches: new Set(),
            photo: PLAYER_PHOTOS[scorer.name] || "/players/player-fallback.webp",
            goalEvents: [],
          };

          current.goals += 1;
          current.scoringMatches.add(match.id);
          current.goalEvents.push({
            opponent,
            date: match.kickoff_utc.slice(0, 10),
            result: `${match.home_score ?? 0}–${match.away_score ?? 0}`,
            minute: scorer.minute || "—",
          });
          players.set(key, current);
        });
      });
    });

  return [...players.values()]
    .map((player) => ({
      ...player,
      scoringMatches: player.scoringMatches.size,
    }))
    .sort(
      (a, b) =>
        b.goals - a.goals ||
        a.scoringMatches - b.scoringMatches ||
        a.name.localeCompare(b.name, "es")
    );
}

export const fallbackTopScorers = [
  {
    name: "Kylian Mbappé",
    team: "Francia",
    teamCode: "fr",
    goals: 3,
    assists: 1,
    matches: 2,
    minutes: 166,
    photo: "/players/mbappe.webp",
    goalEvents: [
      { opponent: "Senegal", date: "2026-06-16", result: "3–1", minute: "18'" },
      { opponent: "Senegal", date: "2026-06-16", result: "3–1", minute: "54'" },
      { opponent: "Senegal", date: "2026-06-16", result: "3–1", minute: "81'" },
    ],
  },
  {
    name: "Christian Pulisic",
    team: "Estados Unidos",
    teamCode: "us",
    goals: 3,
    assists: 1,
    matches: 2,
    minutes: 174,
    photo: "/players/pulisic.webp",
    goalEvents: [
      { opponent: "Paraguay", date: "2026-06-12", result: "4–1", minute: "22'" },
      { opponent: "Paraguay", date: "2026-06-12", result: "4–1", minute: "67'" },
      { opponent: "Australia", date: "2026-06-19", result: "2–0", minute: "39'" },
    ],
  },
  {
    name: "Harry Kane",
    team: "Inglaterra",
    teamCode: "gb-eng",
    goals: 3,
    assists: 0,
    matches: 2,
    minutes: 180,
    photo: "/players/kane.webp",
    goalEvents: [
      { opponent: "Croacia", date: "2026-06-17", result: "4–2", minute: "12'" },
      { opponent: "Croacia", date: "2026-06-17", result: "4–2", minute: "48'" },
      { opponent: "Croacia", date: "2026-06-17", result: "4–2", minute: "76'" },
    ],
  },
  {
    name: "Lionel Messi",
    team: "Argentina",
    teamCode: "ar",
    goals: 2,
    assists: 2,
    matches: 2,
    minutes: 168,
    photo: "/players/messi.webp",
    goalEvents: [
      { opponent: "Argelia", date: "2026-06-16", result: "3–0", minute: "31'" },
      { opponent: "Argelia", date: "2026-06-16", result: "3–0", minute: "70'" },
    ],
  },
];
