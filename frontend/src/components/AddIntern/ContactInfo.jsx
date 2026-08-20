import { FaPhoneAlt } from "react-icons/fa";

export default function ContactInfo({
  formData,
  handleChange,
}) {
  return (
    <div className="form-section">

      <div className="section-title">

        <FaPhoneAlt />

        <h2>Contact Information</h2>

      </div>

      <div className="form-grid">

        {/* Email */}

        <div className="form-group">

          <label>

            Email Address <span>*</span>

          </label>

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="intern@example.com"
            required
          />

        </div>

        {/* Phone */}

        <div className="form-group">

          <label>

            Phone Number <span>*</span>

          </label>

          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+92 300 1234567"
            required
          />

        </div>

        {/* Address */}

        <div className="form-group full-width">

          <label>

            Address

          </label>

          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows="4"
            placeholder="Enter complete residential address..."
          />

        </div>

      </div>

    </div>
  );
}