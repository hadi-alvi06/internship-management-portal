import { useEffect, useMemo, useState } from "react";
import "../styles/attendance.css";

import AttendanceToolbar from "../components/Attendance/AttendanceToolbar";
import AttendanceTable from "../components/Attendance/AttendanceTable";
import TableSkeleton from "../components/Common/TableSkeleton";

import { getAttendanceByDate, saveAttendance } from "../services/api";
import { useToast } from "../context/ToastContext";
import { todayISO, isWeekend } from "../utils/dateFormatter";

const ITEMS_PER_PAGE = 10;

export default function Attendance() {
  const showToast = useToast();

  const [date, setDate] = useState(todayISO());
  const [interns, setInterns] = useState([]);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All");
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const weekend = isWeekend(date);

  async function loadAttendance(dateValue) {
    if (isWeekend(dateValue)) {
      setInterns([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await getAttendanceByDate(dateValue);

      const mapped = res.data.data.map((row) => ({
        id: row.Employee_ID,
        name: row.Full_Name,
        department: row.Department,
        status: row.Status,
        attendance: row.Attendance_Percentage || 0,
      }));

      setInterns(mapped);
    } catch (err) {
      console.error("Failed to load attendance:", err);
      showToast("Failed to load attendance data.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAttendance(date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const filteredInterns = useMemo(() => {
    return interns.filter((intern) => {
      const matchesSearch =
        intern.name.toLowerCase().includes(search.toLowerCase()) ||
        String(intern.id).toLowerCase().includes(search.toLowerCase());

      const matchesDepartment =
        department === "All" || intern.department === department;

      return matchesSearch && matchesDepartment;
    });
  }, [interns, search, department]);

  const totalPages = Math.max(1, Math.ceil(filteredInterns.length / ITEMS_PER_PAGE));

  const paginatedInterns = filteredInterns.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  function handleStatusChange(id, status) {
    setInterns((prev) =>
      prev.map((intern) => (intern.id === id ? { ...intern, status } : intern))
    );
  }

  function toggleSelect(id) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  function toggleSelectAll() {
    if (selected.length === paginatedInterns.length) {
      setSelected([]);
    } else {
      setSelected(paginatedInterns.map((intern) => intern.id));
    }
  }

  function bulkUpdate(status) {
    setInterns((prev) =>
      prev.map((intern) =>
        selected.includes(intern.id) ? { ...intern, status } : intern
      )
    );
  }

  function handlePresentAll() {
    setInterns((prev) => prev.map((intern) => ({ ...intern, status: "Present" })));
  }

async function handleSaveAttendance() {
  if (weekend) return;

  setSaving(true);
  try {
    const records = interns.map((intern) => ({
      Employee_ID: intern.id,
      Status: intern.status,
    }));

    await saveAttendance(date, records);
    showToast("Attendance saved successfully.", "success");

    await loadAttendance(date);
  } catch (err) {
    console.error("Failed to save attendance:", err);
    showToast(err.response?.data?.message || "Failed to save attendance.", "error");
  } finally {
    setSaving(false);
  }
}

  return (
    <div className="attendance-page">
      <h1>Attendance</h1>

      <div style={{ marginBottom: "20px" }}>
        <label style={{ fontWeight: 600, marginRight: "10px" }}>
          Select Date:
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{
            padding: "10px 14px",
            borderRadius: "10px",
            border: "1px solid #CBD5E1",
          }}
        />
      </div>

      {weekend ? (
        <div
          style={{
            background: "#FEF3C7",
            color: "#92400E",
            padding: "20px 24px",
            borderRadius: "14px",
            fontWeight: 600,
          }}
        >
          No attendance is tracked on weekends (Saturday/Sunday). Please
          select a weekday to mark attendance.
        </div>
      ) : loading ? (
        <TableSkeleton rows={5} />
      ) : (
        <>
          <AttendanceToolbar
            search={search}
            setSearch={setSearch}
            department={department}
            setDepartment={setDepartment}
            onPresentAll={handlePresentAll}
            onSave={handleSaveAttendance}
            selectedCount={selected.length}
            onBulkPresent={() => bulkUpdate("Present")}
            onBulkLate={() => bulkUpdate("Late")}
            onBulkAbsent={() => bulkUpdate("Absent")}
          />

          {saving && <p>Saving attendance...</p>}

          <AttendanceTable
            interns={paginatedInterns}
            selected={selected}
            toggleSelect={toggleSelect}
            toggleSelectAll={toggleSelectAll}
            onStatusChange={handleStatusChange}
            page={page}
            setPage={setPage}
            totalPages={totalPages}
          />
        </>
      )}
    </div>
  );
}