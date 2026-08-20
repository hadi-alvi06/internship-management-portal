import { FaBuilding } from "react-icons/fa";

const DEPARTMENTS = ["IT", "HR", "Finance", "Admin", "Marketing", "Systems", "Networking"];

function ordinal(n) {
  const suffixes = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
}

const FLOORS = [
  "Ground Floor",
  ...Array.from({ length: 14 }, (_, i) => `${ordinal(i + 1)} Floor`),
];

export default function InternshipInfo({ formData, handleChange }) {
  return (
    <div className="form-section">
      <div className="section-title">
        <FaBuilding />
        <h2>Internship Information</h2>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label>Department <span>*</span></label>
          <select name="department" value={formData.department} onChange={handleChange} required>
            <option value="">Select Department</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Supervisor <span>*</span></label>
          <input
            type="text"
            name="supervisor"
            value={formData.supervisor}
            onChange={handleChange}
            placeholder="Enter supervisor name"
            required
          />
        </div>

        <div className="form-group">
          <label>Floor</label>
          <select name="floor" value={formData.floor} onChange={handleChange}>
            <option value="">Select Floor</option>
            {FLOORS.map((floor) => (
              <option key={floor} value={floor}>{floor}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Start Date <span>*</span></label>
          <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>End Date <span>*</span></label>
          <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Internship Duration</label>
          <input
            type="text"
            value={formData.startDate && formData.endDate ? "Calculated Automatically" : ""}
            placeholder="Calculated automatically"
            disabled
          />
        </div>
      </div>
    </div>
  );
}