import React from "react";
import { flagUrl } from "../constants/teamCodes";

export default function GroupTables({ groups }) {
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
                <tr
                  key={team.team_name}
                  className={index < 2 ? "qualify" : index === 2 ? "third-place" : ""}
                >
                  <td>
                    <div className="table-team-cell">
                      <span className="rank-num">{index + 1}</span>
                      <img
                        src={flagUrl(team.code)}
                        alt={team.code}
                        className="flag-img-small"
                        onError={(e) => {
                          e.target.src = "https://flagcdn.com/w40/un.png";
                        }}
                      />
                      <span className="team-name-table">{team.team_name}</span>
                    </div>
                  </td>
                  <td className="txt-center">{team.played || 0}</td>
                  <td
                    className={`txt-center ${team.goal_difference > 0 ? "text-pos" : team.goal_difference < 0 ? "text-neg" : ""}`}
                  >
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
