import { useEffect, useState } from "react";

import PersonalInfo from "../AddIntern/PersonalInfo";
import AcademicInfo from "../AddIntern/AcademicInfo";
import InternshipInfo from "../AddIntern/InternshipInfo";
import ContactInfo from "../AddIntern/ContactInfo";

import { internToFormData } from "../../utils/internAdapter";

export default function EditInternModal({ intern, onClose, onSave }) {
  const [formData, setFormData] = useState(null);
  const [newTask, setNewTask] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (intern) {
      setFormData(internToFormData(intern));
    }
  }, [intern]);

  if (!intern || !formData) return null;

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function addTask() {
    if (!newTask.trim()) return;

    setFormData((prev) => ({
      ...prev,
      tasks: [...(prev.tasks || []), newTask.trim()],
    }));

    setNewTask("");
  }

  function removeTask(index) {
    setFormData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    await onSave(intern.employeeId, formData);
    setSaving(false);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="intern-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Edit Intern</h2>
            <p>{intern.employeeId}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <PersonalInfo formData={formData} handleChange={handleChange} />
          <AcademicInfo formData={formData} handleChange={handleChange} />
          <InternshipInfo formData={formData} handleChange={handleChange} />
          <ContactInfo formData={formData} handleChange={handleChange} />

          {/* ===================== TASKS ASSIGNED ===================== */}

          <div className="modal-section">
            <h3>Tasks Assigned</h3>

            <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Enter a task and click Add"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTask();
                  }
                }}
                style={{
                  flex: 1,
                  padding: "12px 15px",
                  border: "1px solid #CBD5E1",
                  borderRadius: "10px",
                  outline: "none",
                }}
              />

              <button
                type="button"
                onClick={addTask}
                style={{
                  border: "none",
                  background: "#2563EB",
                  color: "white",
                  padding: "0 20px",
                  borderRadius: "10px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Add
              </button>
            </div>

            {(!formData.tasks || formData.tasks.length === 0) ? (
              <p style={{ color: "#64748B" }}>No tasks assigned yet.</p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {formData.tasks.map((task, index) => (
                  <li
                    key={index}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      background: "white",
                      border: "1px solid #E2E8F0",
                      borderRadius: "10px",
                      padding: "12px 16px",
                      marginBottom: "10px",
                    }}
                  >
                    <span>{task}</span>

                    <button
                      type="button"
                      onClick={() => removeTask(index)}
                      style={{
                        border: "none",
                        background: "#FEE2E2",
                        color: "#DC2626",
                        borderRadius: "8px",
                        padding: "6px 12px",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              style={{ marginRight: "12px" }}
            >
              Cancel
            </button>

            <button type="submit" className="close-btn" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}