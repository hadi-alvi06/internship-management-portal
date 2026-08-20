import { useEffect, useMemo, useState } from "react";

import "../styles/manageInterns.css";

import ManageInternsToolbar from "../components/ManageInterns/ManageInternsToolbar";
import ManageInternsTable from "../components/ManageInterns/ManageInternsTable";
import DeleteModal from "../components/ManageInterns/DeleteModal";
import EditInternModal from "../components/ManageInterns/EditInternModal";

import InternDetailsModal from "../components/InternCard/InternDetailsModal";
import TableSkeleton from "../components/Common/TableSkeleton";

import {
  getInterns,
  deleteIntern,
  bulkDeleteInterns,
  updateIntern,
} from "../services/api";

import { adaptIntern } from "../utils/internAdapter";
import { useToast } from "../context/ToastContext";

const ITEMS_PER_PAGE = 10;

export default function ManageInterns() {
  const showToast = useToast();

  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All");
  const [status, setStatus] = useState("All");
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);

  const [deleteIdTarget, setDeleteIdTarget] = useState(null);
  const [viewIntern, setViewIntern] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editIntern, setEditIntern] = useState(null);

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

  const filteredInterns = useMemo(() => {
    return interns.filter((intern) => {
      const matchesSearch =
        intern.name.toLowerCase().includes(search.toLowerCase()) ||
        intern.employeeId.toLowerCase().includes(search.toLowerCase());

      const matchesDepartment =
        department === "All" || intern.department === department;

      const matchesStatus = status === "All" || intern.status === status;

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [interns, search, department, status]);

  const totalPages = Math.max(1, Math.ceil(filteredInterns.length / ITEMS_PER_PAGE));

  const paginatedInterns = filteredInterns.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

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

  async function deleteSelected() {
    try {
      await bulkDeleteInterns(selected);
      setSelected([]);
      await loadInterns();
      showToast("Selected interns deleted.", "success");
    } catch (err) {
      console.error("Bulk delete failed:", err);
      showToast("Failed to delete selected interns.", "error");
    }
  }

  function confirmDelete(id) {
    setDeleteIdTarget(id);
  }

  async function handleDelete() {
    try {
      await deleteIntern(deleteIdTarget);
      setDeleteIdTarget(null);
      await loadInterns();
      showToast("Intern deleted successfully.", "success");
    } catch (err) {
      console.error("Delete failed:", err);
      showToast("Failed to delete intern.", "error");
    }
  }

  function handleView(intern) {
    setViewIntern(intern);
    setViewModalOpen(true);
  }

  function handleEdit(intern) {
    setEditIntern(intern);
  }

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
      <div className="manage-page">
        <h1>Manage Interns</h1>
        <TableSkeleton rows={6} />
      </div>
    );
  }

  return (
    <div className="manage-page">
      <h1>Manage Interns</h1>

      <ManageInternsToolbar
        search={search}
        setSearch={setSearch}
        department={department}
        setDepartment={setDepartment}
        status={status}
        setStatus={setStatus}
        selectedCount={selected.length}
        deleteSelected={deleteSelected}
      />

      <ManageInternsTable
        interns={paginatedInterns}
        selected={selected}
        toggleSelect={toggleSelect}
        toggleSelectAll={toggleSelectAll}
        confirmDelete={confirmDelete}
        onView={handleView}
        onEdit={handleEdit}
        page={page}
        setPage={setPage}
        totalPages={totalPages}
      />

      <DeleteModal
        deleteIntern={deleteIdTarget}
        setDeleteIntern={setDeleteIdTarget}
        handleDelete={handleDelete}
      />

      <InternDetailsModal
        intern={viewIntern}
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
      />

      <EditInternModal
        intern={editIntern}
        onClose={() => setEditIntern(null)}
        onSave={handleEditSave}
      />
    </div>
  );
}