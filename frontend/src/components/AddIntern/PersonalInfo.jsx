import { FaUser } from "react-icons/fa";

export default function PersonalInfo({
  formData,
  handleChange,
}) {
  return (
    <div className="form-section">

      <div className="section-title">

        <FaUser />

        <h2>Personal Information</h2>

      </div>

      <div className="form-grid">

        {/* Full Name */}

        <div className="form-group">

          <label>

            Full Name <span>*</span>

          </label>

          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Enter full name"
            required
          />

        </div>

        {/* Employee ID */}

        <div className="form-group">

          <label>

            Employee ID <span>*</span>

          </label>

          <input
            type="text"
            name="employeeId"
            value={formData.employeeId}
            onChange={handleChange}
            placeholder="EMP001"
            required
          />

        </div>

        {/* Gender */}

        <div className="form-group">

          <label>

            Gender <span>*</span>

          </label>

          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
          >
            <option value="">Select Gender</option>

            <option value="Male">
              Male
            </option>

            <option value="Female">
              Female
            </option>

            <option value="Other">
              Other
            </option>

          </select>

        </div>

        {/* Date of Birth */}

        <div className="form-group">

          <label>

            Date of Birth

          </label>

          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
          />

        </div>

      </div>

    </div>
  );
}