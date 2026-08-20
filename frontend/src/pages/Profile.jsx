import { useEffect, useState } from "react";
import { FaUserCircle, FaShieldAlt, FaCalendarAlt, FaClock, FaKey } from "react-icons/fa";

import { getProfile, changePassword } from "../services/api";
import { useToast } from "../context/ToastContext";
import Loader from "../components/Common/Loader";
import Reveal from "../components/Common/Reveal";

import "../styles/profile.css";

export default function Profile() {
  const showToast = useToast();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadProfile() {
    setLoading(true);
    try {
      const res = await getProfile();
      setProfile(res.data.data);
    } catch (err) {
      showToast("Failed to load profile.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleChangePassword(e) {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      showToast("New passwords don't match.", "error");
      return;
    }

    setSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      showToast("Password updated successfully.", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update password.", "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !profile) {
    return (
      <div className="profile-page">
        <h1>My Profile</h1>
        <Loader label="Loading profile..." />
      </div>
    );
  }

  const initials = profile.username.substring(0, 2).toUpperCase();

  return (
    <div className="profile-page">
      <h1>My Profile</h1>

      <div className="profile-hero">
        <div className="profile-avatar">{initials}</div>

        <div className="profile-hero-text">
          <h2>{profile.username}</h2>
          <span className={`role-badge role-${profile.role}`}>{profile.role}</span>
        </div>
      </div>

      <div className="profile-grid">
        <Reveal delay={0}>
          <div className="profile-info-card">
            <div className="profile-info-row">
              <FaShieldAlt className="profile-info-icon" />
              <div>
                <label>Role</label>
                <p style={{ textTransform: "capitalize" }}>{profile.role}</p>
              </div>
            </div>

            <div className="profile-info-row">
              <FaCalendarAlt className="profile-info-icon" />
              <div>
                <label>Account Created</label>
                <p>{profile.created_at ? String(profile.created_at).split("T")[0] : "-"}</p>
              </div>
            </div>

            <div className="profile-info-row">
              <FaClock className="profile-info-icon" />
              <div>
                <label>Last Login</label>
                <p>{profile.last_login ? String(profile.last_login).split("T")[0] : "This is your first login"}</p>
              </div>
            </div>

            <div className="profile-info-row">
              <FaUserCircle className="profile-info-icon" />
              <div>
                <label>Status</label>
                <p>
                  <span className={`status-dot ${profile.is_online ? "status-online" : "status-offline"}`} />
                  {profile.is_online ? "Online" : "Offline"}
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="profile-password-card">
            <h3><FaKey /> Change Password</h3>

            <form onSubmit={handleChangePassword}>
              <div className="profile-field">
                <label>Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <div className="profile-field">
                <label>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="profile-field">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="profile-save-btn" disabled={saving}>
                {saving ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        </Reveal>
      </div>
    </div>
  );
}