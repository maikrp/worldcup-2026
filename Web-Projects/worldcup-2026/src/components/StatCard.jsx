import React from "react";

export default function StatCard({ icon, title, value, sub }) {
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
