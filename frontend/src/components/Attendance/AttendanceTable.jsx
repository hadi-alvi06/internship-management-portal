import { getInitials } from "../../utils/attendanceCalculator";

function StatusIcon({ status }) {
  const isPresent = status === "Present";
  const isAbsent = status === "Absent";
  return (
    <span
      key={status}
      className={`status-icon-pop ${isPresent ? "status-icon-present" : isAbsent ? "status-icon-absent" : "status-icon-late"}`}
    >
      {isPresent ? "✓" : isAbsent ? "✕" : "…"}
    </span>
  );
}

export default function AttendanceTable({
  interns, selected, toggleSelect, toggleSelectAll, onStatusChange, page, setPage, totalPages,
}) {
  return (
    <>
      <div className="attendance-table-container">
        <table className="attendance-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={interns.length > 0 && selected.length === interns.length}
                  onChange={toggleSelectAll}
                />
              </th>
              <th>Intern</th>
              <th>Department</th>
              <th>Status</th>
              <th>Attendance</th>
            </tr>
          </thead>

          <tbody>
            {interns.length === 0 ? (
              <tr><td colSpan="5" className="no-data">No interns found.</td></tr>
            ) : (
              interns.map((intern, index) => {
                const initials = getInitials(intern.name);

                return (
                  <tr key={intern.id} className="row-fade-in" style={{ animationDelay: `${index * 0.04}s` }}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selected.includes(intern.id)}
                        onChange={() => toggleSelect(intern.id)}
                      />
                    </td>

                    <td>
                      <div className="intern-cell">
                        <div className="intern-avatar">{initials}</div>
                        <div>
                          <div className="intern-name">{intern.name}</div>
                          <div className="intern-id">ID #{intern.id}</div>
                        </div>
                      </div>
                    </td>

                    <td><span className="department-pill">{intern.department}</span></td>

                    <td>
                      <select
                        className={`status-select status-${intern.status.toLowerCase()}`}
                        value={intern.status}
                        onChange={(e) => onStatusChange(intern.id, e.target.value)}
                      >
                        <option>Present</option>
                        <option>Late</option>
                        <option>Absent</option>
                      </select>
                      <StatusIcon status={intern.status} />
                    </td>

                    <td>
                      <div className="attendance-progress">
                        <div className="attendance-bar">
                          <div className="attendance-fill" style={{ width: `${intern.attendance}%` }} />
                        </div>
                        <span>{intern.attendance}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
        {[...Array(totalPages)].map((_, index) => (
          <button key={index} className={page === index + 1 ? "active-page" : ""} onClick={() => setPage(index + 1)}>
            {index + 1}
          </button>
        ))}
        <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </>
  );
}