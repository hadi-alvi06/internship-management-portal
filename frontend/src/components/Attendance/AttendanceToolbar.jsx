import {
  FaSearch,
  FaCalendarAlt,
  FaCheckCircle,
  FaSave,
  FaUserCheck,
  FaUserClock,
  FaUserTimes,
} from "react-icons/fa";

export default function AttendanceToolbar({
  search,
  setSearch,

  department,
  setDepartment,

  onPresentAll,
  onSave,

  selectedCount,

  onBulkPresent,
  onBulkLate,
  onBulkAbsent,
}) {
  return (
    <>

      {/* ===========================
          TOP TOOLBAR
      =========================== */}

      <div className="attendance-toolbar">

        {/* Search */}

        <div className="toolbar-search">

          <FaSearch className="toolbar-icon" />

          <input
            type="text"
            placeholder="Search by Name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>

        {/* Department */}

        <select
          className="toolbar-select"
          value={department}
          onChange={(e) =>
            setDepartment(e.target.value)
          }
        >
          <option>All</option>
          <option>IT</option>
          <option>HR</option>
          <option>Finance</option>
          <option>Admin</option>
          <option>Marketing</option>
        </select>

        {/* Date */}

        <div className="toolbar-date">

          <FaCalendarAlt />

          <input type="date" />

        </div>

      </div>

      {/* ===========================
          BULK ACTION BAR
      =========================== */}

      <div className="bulk-toolbar">

        <div className="selected-count">

          <strong>{selectedCount}</strong>

          selected

        </div>

        <div className="bulk-buttons">

          <button
            className="bulk-present"
            onClick={onBulkPresent}
          >
            <FaUserCheck />

            Mark Present
          </button>

          <button
            className="bulk-late"
            onClick={onBulkLate}
          >
            <FaUserClock />

            Mark Late
          </button>

          <button
            className="bulk-absent"
            onClick={onBulkAbsent}
          >
            <FaUserTimes />

            Mark Absent
          </button>

          <button
            className="present-btn"
            onClick={onPresentAll}
          >
            <FaCheckCircle />

            Present All
          </button>

          <button
            className="save-btn"
            onClick={onSave}
          >
            <FaSave />

            Save Attendance
          </button>

        </div>

      </div>

    </>
  );
}