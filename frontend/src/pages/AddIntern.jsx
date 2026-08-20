import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/addIntern.css";

import PersonalInfo from "../components/AddIntern/PersonalInfo";
import AcademicInfo from "../components/AddIntern/AcademicInfo";
import InternshipInfo from "../components/AddIntern/InternshipInfo";
import ContactInfo from "../components/AddIntern/ContactInfo";
import SuccessBurst from "../components/Common/SuccessBurst";

import { addIntern } from "../services/api";
import { useToast } from "../context/ToastContext";
import { validateInternForm } from "../utils/validations";

const emptyForm = {
  fullName: "", employeeId: "", gender: "", dob: "",
  university: "", degree: "", semester: "", cgpa: "",
  department: "", supervisor: "", floor: "", startDate: "", endDate: "",
  email: "", phone: "", address: "",
};

const SECTIONS = [
  { label: "Personal", fields: ["fullName", "gender"] },
  { label: "Academic", fields: ["university", "degree", "semester"] },
  { label: "Internship", fields: ["department", "supervisor", "startDate", "endDate"] },
  { label: "Contact", fields: ["email", "phone"] },
];

const TOTAL_REQUIRED = SECTIONS.reduce((sum, s) => sum + s.fields.length, 0);

export default function AddIntern() {
  const navigate = useNavigate();
  const showToast = useToast();

  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [showBurst, setShowBurst] = useState(false);

  const { percent, activeStep, sectionDone } = useMemo(() => {
    let filledCount = 0;
    const done = SECTIONS.map((section) => {
      const isSectionDone = section.fields.every((f) => String(formData[f] || "").trim() !== "");
      filledCount += section.fields.filter((f) => String(formData[f] || "").trim() !== "").length;
      return isSectionDone;
    });

    const firstIncomplete = done.findIndex((d) => !d);
    const active = firstIncomplete === -1 ? SECTIONS.length - 1 : firstIncomplete;

    return {
      percent: Math.round((filledCount / TOTAL_REQUIRED) * 100),
      activeStep: active,
      sectionDone: done,
    };
  }, [formData]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function clearForm() {
    setFormData(emptyForm);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const { valid, errors } = validateInternForm(formData);
    if (!valid) {
      showToast(errors[0], "error");
      return;
    }

    setSubmitting(true);
    try {
      const response = await addIntern(formData);
      const newEmployeeId = response.data.data.Employee_ID;
      showToast(`Intern added successfully! ID: ${newEmployeeId}`, "success");
      setShowBurst(true);
      clearForm();
      setTimeout(() => navigate("/manage"), 1300);
    } catch (err) {
      showToast(err.response?.data?.message || "Something went wrong. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="add-intern-page">
      <div className="page-header">
        <h1>Add New Intern</h1>
        <p>Fill in the intern's information below.</p>
      </div>

      <div className="form-progress-bar">
        <div className="form-progress-fill" style={{ width: `${percent}%` }} />
      </div>

      <div className="form-progress-steps">
        {SECTIONS.map((section, i) => (
          <div
            key={section.label}
            className={`form-progress-step ${activeStep === i ? "active" : ""} ${sectionDone[i] ? "done" : ""}`}
          >
            <span className="step-dot">{sectionDone[i] ? "✓" : i + 1}</span>
            <span className="step-label">{section.label}</span>
          </div>
        ))}
      </div>

      <form className="intern-form" onSubmit={handleSubmit}>
        <PersonalInfo formData={formData} handleChange={handleChange} />
        <AcademicInfo formData={formData} handleChange={handleChange} />
        <InternshipInfo formData={formData} handleChange={handleChange} />
        <ContactInfo formData={formData} handleChange={handleChange} />

        <div className="form-buttons">
          <button type="button" className="clear-btn" onClick={clearForm} disabled={submitting}>Clear</button>
          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? "Saving..." : "Add Intern"}
          </button>
        </div>
      </form>

      <SuccessBurst show={showBurst} />
    </div>
  );
}