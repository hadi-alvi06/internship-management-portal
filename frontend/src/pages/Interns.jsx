import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import "../styles/interns.css";
import CardGridSkeleton from "../components/Common/CardGridSkeleton";

import InternCard from "../components/InternCard/InternCard";
import InternDetailsModal from "../components/InternCard/InternDetailsModal";
import EditInternModal from "../components/ManageInterns/EditInternModal";
import Reveal from "../components/Common/Reveal";

import { getInterns, updateIntern } from "../services/api";
import { adaptIntern } from "../utils/internAdapter";
import { useToast } from "../context/ToastContext";

export default function Interns() {
  const showToast = useToast();

  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [searchParams] = useSearchParams();
  const [department, setDepartment] = useState(searchParams.get("department") || "All");
  const [gender, setGender] = useState("All");
  const [semester, setSemester] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedIntern, setSelectedIntern] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editIntern, setEditIntern] = useState(null);

  const cardsPerPage = 6;

  async function loadInterns() {
    setLoading(true);
    try {
      const res = await getInterns();
      setInterns(res.data.data.map(adaptIntern));
    } catch (err) {
      console.error("Failed to load interns:", err);
      showToast("Failed to load interns.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInterns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") setModalOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const filteredInterns = useMemo(() => {
    return interns.filter((intern) => {
      const matchesSearch =
        intern.name?.toLowerCase().includes(search.toLowerCase()) ||
        intern.id?.toLowerCase().includes(search.toLowerCase()) ||
        intern.department?.toLowerCase().includes(search.toLowerCase()) ||
        intern.supervisor?.toLowerCase().includes(search.toLowerCase());

      const matchesDepartment =
        department === "All" || intern.department === department;

      const matchesGender = gender === "All" || intern.gender === gender;

      const matchesSemester =
        semester === "All" || String(intern.semester) === String(semester);

      return matchesSearch && matchesDepartment && matchesGender && matchesSemester;
    });
  }, [interns, search, department, gender, semester]);

  const totalPages = Math.max(1, Math.ceil(filteredInterns.length / cardsPerPage));
  const startIndex = (currentPage - 1) * cardsPerPage;
  const currentInterns = filteredInterns.slice(startIndex, startIndex + cardsPerPage);

  async function handleEditSave(employeeId, formData) {
    try {
      await updateIntern(employeeId, formData);
      setEditIntern(null);
      await loadInterns();
      showToast("Intern updated successfully.", "success");
    } catch (err) {
      console.error("Update failed:", err);
      showToast(err.response?.data?.message || "Failed to update intern.", "error");
    }
  }

  if (loading) {
    return (
      <div className="intern-page">
        <h1>Interns</h1>
        <CardGridSkeleton count={6} />
      </div>
    );
  }

  return (
    <div className="intern-page">
      <div className="page-header">
        <div>
          <h1>Interns</h1>
          <p>Manage and monitor all internship records</p>
        </div>
      </div>

      <div className="search-container">
        <input
          className="search"
          type="text"
          placeholder="Search by Name, Employee ID, Department or Supervisor..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      <div className="filters">
        <select
          value={department}
          onChange={(e) => {
            setDepartment(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="All">All Departments</option>
          <option value="IT">IT</option>
          <option value="HR">HR</option>
          <option value="Finance">Finance</option>
          <option value="Admin">Admin</option>
          <option value="Marketing">Marketing</option>
          <option value="Systems">Systems</option>
          <option value="Networking">Networking</option>
        </select>

        <select
          value={gender}
          onChange={(e) => {
            setGender(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="All">All Genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>

        <select
          value={semester}
          onChange={(e) => {
            setSemester(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="All">All Semesters</option>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
            <option key={sem} value={sem}>
              Semester {sem}
            </option>
          ))}
        </select>
      </div>

      <div className="intern-grid">
        {currentInterns.map((intern, index) => (
          <Reveal key={intern.id} delay={index * 60}>
            <InternCard
              intern={intern}
              onView={(intern) => { setSelectedIntern(intern); setModalOpen(true); }}
              onEdit={(intern) => setEditIntern(intern)}
            />
          </Reveal>
        ))}
      </div>

      {filteredInterns.length === 0 && (
        <div className="no-results">No interns found.</div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </button>

          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              className={currentPage === index + 1 ? "active-page" : ""}
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}

      <InternDetailsModal
        intern={selectedIntern}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />

      <EditInternModal
        intern={editIntern}
        onClose={() => setEditIntern(null)}
        onSave={handleEditSave}
      />
    </div>
  );
}