import React from "react";

export default function StatCard({ icon, title, value, sub, valueContent, onClick, ariaLabel }) {
  const CardElement = onClick ? "button" : "div";

  return (
    <CardElement
      className={`stat-card ${onClick ? "stat-card-action" : ""}`}
      type={onClick ? "button" : undefined}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {icon && <div className="stat-icon-wrapper">{icon}</div>}
      <div className="stat-details">
        <span>{title}</span>
        {valueContent || <strong>{value}</strong>}
        <small>{sub}</small>
      </div>
    </CardElement>
  );
}
