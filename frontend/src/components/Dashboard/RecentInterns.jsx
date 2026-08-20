import "../../styles/dashboard.css";
import { getInitials } from "../../utils/attendanceCalculator";
import { formatRelativeDays } from "../../utils/dateFormatter";

export default function RecentInterns({ interns }) {
  return (
    <div className="dashboard-panel">
      <div className="panel-header">
        <h3>Recent Interns</h3>
      </div>

      <div className="recent-list">
        {interns.length === 0 ? (
          <p style={{ color: "var(--ink-muted)" }}>No interns added yet.</p>
        ) : (
          interns.map((intern, index) => (
            <div
              className="recent-item"
              key={intern.id}
              style={{ animationDelay: `${index * 0.06}s` }}
            >
              <div className="recent-avatar">{getInitials(intern.name)}</div>

              <div className="recent-content">
                <div className="recent-name-row">
                  <h4>{intern.name}</h4>
                  <span className="recent-time">{formatRelativeDays(intern.createdAt)}</span>
                </div>
                <span className="department-badge">{intern.department}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}