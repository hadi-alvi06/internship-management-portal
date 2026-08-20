import "../../styles/interncard.css";
import { getInitials, attendanceClass } from "../../utils/attendanceCalculator";
import useTilt from "../../hooks/useTilt";

export default function InternCard({ intern, onView, onEdit }) {
  const { ref, glareRef, handleMouseMove, handleMouseLeave } = useTilt({ max: 14, scale: 1.035, glare: true });

  const initials = getInitials(intern.name);
  const attendanceLevel = attendanceClass(intern.attendance);

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`intern-card tilt-wrap ${intern.attendance < 75 ? "warning-card" : ""}`}
    >
      <div className="tilt-glare" ref={glareRef} />

      <div className="card-top">
        <div className="avatar">{initials}</div>

        <div className="intern-name-section">
          <h2>{intern.name}</h2>
          <span className="employee-id">{intern.id}</span>
        </div>

        <div className={`status ${intern.active ? "active" : "inactive"}`}>
          {intern.active ? "Active" : "Completed"}
        </div>
      </div>

      <div className="info-grid">
        <div>
          <span className="label">Department</span>
          <p>{intern.department}</p>
        </div>
        <div>
          <span className="label">Supervisor</span>
          <p>{intern.supervisor}</p>
        </div>
      </div>

      <div className="attendance-row">
        <span className="label">Attendance</span>
        <span className={`attendance ${attendanceLevel}`}>{intern.attendance}%</span>
      </div>

      <div className="card-buttons">
        <button className="view-btn" onClick={() => onView(intern)}>View Details</button>
        <button className="edit-btn" onClick={() => onEdit(intern)}>Edit</button>
      </div>
    </div>
  );
}