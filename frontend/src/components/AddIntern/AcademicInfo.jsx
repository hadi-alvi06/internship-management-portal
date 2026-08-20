import { FaGraduationCap } from "react-icons/fa";

export default function AcademicInfo({
  formData,
  handleChange,
}) {
  return (
    <div className="form-section">

      <div className="section-title">

        <FaGraduationCap />

        <h2>Academic Information</h2>

      </div>

      <div className="form-grid">

        {/* University */}

        <div className="form-group">

          <label>

            University <span>*</span>

          </label>

          <input
            type="text"
            name="university"
            value={formData.university}
            onChange={handleChange}
            placeholder="COMSATS University Islamabad"
            required
          />

        </div>

        {/* Degree */}

        <div className="form-group">

          <label>

            Degree <span>*</span>

          </label>

          <select
            name="degree"
            value={formData.degree}
            onChange={handleChange}
            required
          >

            <option value="">
              Select Degree
            </option>

            <option value="BS Computer Engineering">
              BS Computer Engineering
            </option>

            <option value="BS Computer Science">
              BS Computer Science
            </option>

            <option value="BS Software Engineering">
              BS Software Engineering
            </option>

            <option value="BS Information Technology">
              BS Information Technology
            </option>

            <option value="Other">
              Other
            </option>

          </select>

        </div>

        {/* Semester */}

        <div className="form-group">

          <label>

            Semester <span>*</span>

          </label>

          <select
            name="semester"
            value={formData.semester}
            onChange={handleChange}
            required
          >

            <option value="">
              Select Semester
            </option>

            <option value="1">1st Semester</option>
            <option value="2">2nd Semester</option>
            <option value="3">3rd Semester</option>
            <option value="4">4th Semester</option>
            <option value="5">5th Semester</option>
            <option value="6">6th Semester</option>
            <option value="7">7th Semester</option>
            <option value="8">8th Semester</option>

          </select>

        </div>

        {/* CGPA */}

        <div className="form-group">

          <label>

            CGPA

          </label>

          <input
            type="number"
            name="cgpa"
            value={formData.cgpa}
            onChange={handleChange}
            min="0"
            max="4"
            step="0.01"
            placeholder="0.00 - 4.00"
          />

        </div>

      </div>

    </div>
  );
}