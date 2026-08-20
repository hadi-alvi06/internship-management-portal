import { useEffect, useState } from "react";
import "../styles/settings.css";

import {
  FaPalette, FaDatabase, FaBell, FaInfoCircle, FaSave, FaFileExcel, FaServer, FaCode,
} from "react-icons/fa";

import { getSettings, updateSettings, getHealth } from "../services/api";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import Reveal from "../components/Common/Reveal";

export default function Settings() {
  const showToast = useToast();
  const { role } = useAuth();
  const isAdmin = role === "admin";

  const [theme, setTheme] = useState("Light");
  const [aboutText, setAboutText] = useState("");
  const [version, setVersion] = useState("1.0.0");

  const [excelConnected, setExcelConnected] = useState(false);
  const [apiOnline, setApiOnline] = useState(false);

  const [saving, setSaving] = useState(false);

  function applyTheme(value) {
    if (value === "Dark") {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
    localStorage.setItem("theme", value);
  }

  async function loadSettings() {
    try {
      const res = await getSettings();
      const data = res.data.data;

      const loadedTheme = data.Theme || "Light";
      setTheme(loadedTheme);
      setAboutText(data.About_Text || "");
      setVersion(data.Version || "1.0.0");
      applyTheme(loadedTheme);
    } catch (err) {
      showToast("Failed to load settings.", "error");
    }
  }

  async function loadHealth() {
    try {
      const res = await getHealth();
      setApiOnline(true);
      setExcelConnected(res.data.excel_connected);
    } catch (err) {
      setApiOnline(false);
      setExcelConnected(false);
    }
  }

  useEffect(() => {
    loadSettings();
    loadHealth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleThemeChange(e) {
    const value = e.target.value;
    setTheme(value);
    applyTheme(value);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = isAdmin
        ? { Theme: theme, About_Text: aboutText, Version: version }
        : { Theme: theme };

      await updateSettings(payload);
      showToast("Settings saved successfully.", "success");
    } catch (err) {
      showToast("Failed to save settings.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Configure your Internship Management System.</p>
      </div>

      <Reveal delay={0}>
        <div className="settings-card">
          <div className="settings-title">
            <FaPalette />
            <h2>Appearance</h2>
          </div>

          <div className="setting-row">
            <span>Theme</span>
            <select value={theme} onChange={handleThemeChange}>
              <option value="Light">Light</option>
              <option value="Dark">Dark</option>
            </select>
          </div>
        </div>
      </Reveal>

      <Reveal delay={80}>
        <div className="settings-card">
          <div className="settings-title">
            <FaDatabase />
            <h2>System</h2>
          </div>

          <div className="setting-row">
            <div><FaFileExcel className="setting-icon" /> Database</div>
            <span className={excelConnected ? "status-connected" : "status-offline"}>
              {excelConnected ? "Connected" : "Not Connected"}
            </span>
          </div>

          <div className="setting-row">
            <div><FaServer className="setting-icon" /> API Status</div>
            <span className={apiOnline ? "status-connected" : "status-offline"}>
              {apiOnline ? "Online" : "Offline"}
            </span>
          </div>

          <div className="setting-row">
            <div><FaCode className="setting-icon" /> Version</div>
            {isAdmin ? (
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                style={{ width: "100px", padding: "6px 10px", border: "1px solid var(--border)", borderRadius: "8px", textAlign: "right" }}
              />
            ) : (
              <span>{version}</span>
            )}
          </div>
        </div>
      </Reveal>

      <Reveal delay={160}>
        <div className="settings-card">
          <div className="settings-title">
            <FaBell />
            <h2>Notifications</h2>
          </div>

          <div className="toggle-row">
            <label>Attendance Alerts</label>
            <input type="checkbox" defaultChecked />
          </div>

          <div className="toggle-row">
            <label>Low Attendance Warnings</label>
            <input type="checkbox" defaultChecked />
          </div>
        </div>
      </Reveal>

      <Reveal delay={240}>
        <div className="settings-card">
          <div className="settings-title">
            <FaInfoCircle />
            <h2>About</h2>
          </div>

          <textarea
            value={aboutText}
            onChange={(e) => isAdmin && setAboutText(e.target.value)}
            readOnly={!isAdmin}
            rows="4"
            style={{
              width: "100%",
              padding: "12px 15px",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              fontFamily: "inherit",
              fontSize: "15px",
              resize: "vertical",
              background: isAdmin ? "var(--surface)" : "var(--surface-alt)",
              cursor: isAdmin ? "text" : "default",
            }}
          />

          {!isAdmin && (
            <p style={{ fontSize: "12px", color: "var(--ink-muted)", marginTop: "8px" }}>
              Only administrators can edit this section.
            </p>
          )}
        </div>
      </Reveal>

      <button className="save-settings" onClick={handleSave} disabled={saving}>
        <FaSave />
        {saving ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
}