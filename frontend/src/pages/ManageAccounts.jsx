import { useEffect, useState } from "react";
import { FaTrash, FaKey, FaUserPlus, FaHistory } from "react-icons/fa";

import { getUsers, createUser, deleteUser, resetUserPassword, getActivityLog } from "../services/api";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import TableSkeleton from "../components/Common/TableSkeleton";
import Reveal from "../components/Common/Reveal";

import "../styles/manageAccounts.css";

export default function ManageAccounts() {
  const showToast = useToast();
  const { username: currentUsername } = useAuth();

  const [users, setUsers] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("supervisor");
  const [creating, setCreating] = useState(false);

  const [resetTarget, setResetTarget] = useState(null);
  const [resetPassword, setResetPassword] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  async function loadData() {
    setLoading(true);
    try {
      const [usersRes, logRes] = await Promise.all([getUsers(), getActivityLog()]);
      setUsers(usersRes.data.data);
      setActivityLog(logRes.data.data);
    } catch (err) {
      showToast("Failed to load accounts.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreate(e) {
    e.preventDefault();

    if (!newUsername.trim() || !newPassword.trim()) {
      showToast("Username and password are required.", "error");
      return;
    }

    setCreating(true);
    try {
      await createUser({ username: newUsername.trim(), password: newPassword, role: newRole });
      showToast(`Account "${newUsername}" created successfully.`, "success");
      setNewUsername("");
      setNewPassword("");
      setNewRole("supervisor");
      await loadData();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to create account.", "error");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete() {
    try {
      await deleteUser(deleteTarget.id);
      showToast(`Account "${deleteTarget.username}" deleted.`, "success");
      setDeleteTarget(null);
      await loadData();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete account.", "error");
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();

    if (!resetPassword.trim()) {
      showToast("Enter a new password.", "error");
      return;
    }

    try {
      await resetUserPassword(resetTarget.id, resetPassword);
      showToast(`Password reset for "${resetTarget.username}".`, "success");
      setResetTarget(null);
      setResetPassword("");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to reset password.", "error");
    }
  }

  if (loading) {
    return (
      <div className="accounts-page">
        <h1>Manage Accounts</h1>
        <TableSkeleton rows={5} />
      </div>
    );
  }

  return (
    <div className="accounts-page">
      <h1>Manage Accounts</h1>
      <p className="accounts-subtitle">
        Create and manage supervisor accounts. Only administrators can access this page.
      </p>

      <Reveal delay={0}>
        <div className="accounts-card">
          <h2><FaUserPlus /> Create New Account</h2>

          <form className="accounts-form" onSubmit={handleCreate}>
            <div className="accounts-field">
              <label>Username</label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="e.g. jsupervisor"
                required
              />
            </div>

            <div className="accounts-field">
              <label>Password</label>
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Set an initial password"
                required
              />
            </div>

            <div className="accounts-field">
              <label>Role</label>
              <select value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                <option value="supervisor">Supervisor</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button type="submit" className="accounts-submit-btn" disabled={creating}>
              {creating ? "Creating..." : "Create Account"}
            </button>
          </form>
        </div>
      </Reveal>

      <Reveal delay={100}>
        <div className="accounts-card">
          <h2>Existing Accounts</h2>

          <div className="accounts-table-wrap">
            <table className="accounts-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th>Last Login</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={user.id} className="row-fade-in" style={{ animationDelay: `${index * 0.04}s` }}>
                    <td>
                      <div className="account-user-cell">
                        <div className={`account-avatar ${user.is_online ? "avatar-online" : ""}`}>
                          {user.username.substring(0, 2).toUpperCase()}
                        </div>
                        <span>{user.username}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`role-badge role-${user.role}`}>{user.role}</span>
                    </td>
                    <td>{user.created_at ? String(user.created_at).split("T")[0] : "-"}</td>
                    <td>{user.last_login ? String(user.last_login).split("T")[0] : "Never"}</td>
                    <td>
                      <span
                        className={`status-dot ${user.is_online ? "status-online" : "status-offline"}`}
                        title={user.is_online ? "Online" : "Offline"}
                      />
                      {user.is_online ? "Online" : "Offline"}
                    </td>
                    <td>
                      <div className="accounts-actions">
                        <button
                          className="accounts-action-btn reset-btn"
                          title="Reset Password"
                          onClick={() => setResetTarget(user)}
                        >
                          <FaKey />
                        </button>

                        <button
                          className="accounts-action-btn delete-btn"
                          title="Delete Account"
                          disabled={user.username === currentUsername}
                          onClick={() => setDeleteTarget(user)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Reveal>

      <Reveal delay={200}>
        <div className="accounts-card">
          <h2><FaHistory /> Recent Login Activity</h2>

          <div className="accounts-table-wrap">
            <table className="accounts-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Action</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {activityLog.length === 0 ? (
                  <tr><td colSpan="3">No activity recorded yet.</td></tr>
                ) : (
                  activityLog.map((log, index) => (
                    <tr key={index}>
                      <td>{log.username}</td>
                      <td>
                        <span className={`activity-badge activity-${log.action}`}>{log.action}</span>
                      </td>
                      <td>{String(log.event_time).replace("T", " ").split(".")[0]}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Reveal>

      {resetTarget && (
        <div className="modal-overlay" onClick={() => setResetTarget(null)}>
          <div className="accounts-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Reset Password for {resetTarget.username}</h3>

            <form onSubmit={handleResetPassword}>
              <input
                type="text"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                placeholder="New password"
                autoFocus
                required
              />

              <div className="accounts-modal-buttons">
                <button type="button" className="cancel-btn" onClick={() => setResetTarget(null)}>
                  Cancel
                </button>
                <button type="submit" className="accounts-submit-btn">
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Delete Account?</h2>
            <p>
              This will permanently remove <strong>{deleteTarget.username}</strong>'s access to the portal.
            </p>

            <div className="delete-buttons">
              <button className="cancel-btn" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button className="confirm-delete-btn" onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}