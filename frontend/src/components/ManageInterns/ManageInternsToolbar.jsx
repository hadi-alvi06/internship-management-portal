import {
  FaSearch,
  FaTrash,
  FaPlus,
  FaFileExport,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";

export default function ManageInternsToolbar({
  search,
  setSearch,
  department,
  setDepartment,
  status,
  setStatus,
  selectedCount,
  deleteSelected,
}) {
  const navigate = useNavigate();

  async function handleExportExcel() {
    try {
      const response = await API.get("/api/export", { responseType: "blob" });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "InternshipData_Export.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export Excel:", err);
      alert("Failed to export Excel.");
    }
  }

  return (
    <>
      {/* ===========================
          TOP TOOLBAR
      =========================== */}
      <div className="manage-toolbar">
        {/* Search */}
        <div className="toolbar-search">
          <FaSearch className="toolbar-icon" />
          <input
            type="text"
            placeholder="Search by Name or Employee ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Department */}
        <select
          className="toolbar-select"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        >
          <option>All</option>
          <option>IT</option>
          <option>HR</option>
          <option>Finance</option>
          <option>Admin</option>
          <option>Marketing</option>
          <option>Systems</option>
          <option>Networking</option>
        </select>

        {/* Status */}
        <select
          className="toolbar-select"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option>All</option>
          <option>Active</option>
          <option>Completed</option>
          <option>On Leave</option>
        </select>
      </div>

      {/* ===========================
          ACTION BAR
      =========================== */}
      <div className="bulk-toolbar">
        <div className="selected-count">
          <strong>{selectedCount}</strong> selected
        </div>

        <div className="bulk-buttons">
          <button
            className="bulk-delete"
            disabled={selectedCount === 0}
            onClick={deleteSelected}
          >
            <FaTrash />
            Delete Selected
          </button>

          <button className="add-btn" onClick={() => navigate("/add")}>
            <FaPlus />
            Add Intern
          </button>

          <button className="export-btn" onClick={handleExportExcel}>
            <FaFileExport />
            Export Excel
          </button>
        </div>
      </div>
    </>
  );
}