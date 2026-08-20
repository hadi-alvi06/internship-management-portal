import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { getInitials } from "../../utils/attendanceCalculator";

export default function ManageInternsTable({
  interns,
  selected,
  toggleSelect,
  toggleSelectAll,
  confirmDelete,
  onView,
  onEdit,
  page,
  setPage,
  totalPages,
}) {
  return (
    <>
      <div className="manage-table-container">
        <table className="manage-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={
                    interns.length > 0 && selected.length === interns.length
                  }
                  onChange={toggleSelectAll}
                />
              </th>
              <th>Intern</th>
              <th>Department</th>
              <th>Supervisor</th>
              <th>Progress</th>
              <th>Status</th>
              <th>Days Left</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {interns.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data">
                  No interns found.
                </td>
              </tr>
            ) : (
              interns.map((intern, index) => {
              const initials = intern.name.split(" ").map(word => word[0]).join("").substring(0,2).toUpperCase();

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
                          <div className="intern-id">{intern.employeeId}</div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="department-pill">{intern.department}</span>
                    </td>

                    <td>{intern.supervisor}</td>

                    <td>
                      <div className="attendance-progress">
                        <div className="attendance-bar">
                          <div
                            className="attendance-fill"
                            style={{ width: `${intern.progress}%` }}
                          />
                        </div>
                        <span>{intern.progress}%</span>
                      </div>
                    </td>

                    <td>
                      <span
                        className={`status-badge ${
                          intern.status === "Active"
                            ? "status-active"
                            : intern.status === "Completed"
                            ? "status-completed"
                            : "status-leave"
                        }`}
                      >
                        {intern.status}
                      </span>
                    </td>

                    <td>
                      {intern.daysRemaining === 0
                        ? "Completed"
                        : `${intern.daysRemaining} Days`}
                    </td>

                    <td>
                      <div className="action-buttons">
                        <button
                          className="view-btn"
                          title="View"
                          onClick={() => onView(intern)}
                        >
                          <FaEye />
                        </button>

                        <button
                          className="edit-btn"
                          title="Edit"
                          onClick={() => onEdit(intern)}
                        >
                          <FaEdit />
                        </button>

                        <button
                          className="delete-btn"
                          title="Delete"
                          onClick={() => confirmDelete(intern.id)}
                        >
                          <FaTrash />
                        </button>
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
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Previous
        </button>

        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            className={page === index + 1 ? "active-page" : ""}
            onClick={() => setPage(index + 1)}
          >
            {index + 1}
          </button>
        ))}

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </>
  );
}