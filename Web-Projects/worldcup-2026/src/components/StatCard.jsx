import React from "react";

export default function StatCard({ icon, title, value, sub, valueContent }) {
  return (
    <div className="stat-card">
      {icon && <div className="stat-icon-wrapper">{icon}</div>}
      <div className="stat-details">
        <span>{title}</span>
        {valueContent || <strong>{value}</strong>}
        <small>{sub}</small>
      </div>
    </div>
  );
}
