import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./navbar.css";

import { FaChevronDown, FaCog, FaSignOutAlt, FaUserCircle, FaBars } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import Loader from "../Common/Loader";

export default function Navbar({ title, onMenuClick }) {
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const navigate = useNavigate();
  const ref = useRef(null);

  const { logout, username, role } = useAuth();

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSignOut() {
    setOpen(false);
    setSigningOut(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await logout();
    navigate("/login");
  }

  if (signingOut) {
    return (
      <div className="fullscreen-loader">
        <Loader label="Signing you out..." />
      </div>
    );
  }

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="navbar-menu-btn" onClick={onMenuClick}>
          <FaBars />
        </button>

        <img src="/ogdcl-logo.png" alt="OGDCL" className="navbar-logo" />
        <h1>{title}</h1>
      </div>

      <div className="navbar-right" ref={ref}>
        <div className="user-profile" onClick={() => setOpen((prev) => !prev)}>
          <div className="user-avatar">
            {username ? username.substring(0, 2).toUpperCase() : "?"}
          </div>

          <div className="user-info">
            <span className="user-name">{username}</span>
            <span className="user-role">
              {role === "admin" ? "Administrator" : "Internship Coordinator"}
            </span>
          </div>

          <FaChevronDown className={`dropdown-icon ${open ? "open" : ""}`} />
        </div>

        {open && (
          <div className="profile-dropdown">
            <button onClick={() => { setOpen(false); navigate("/profile"); }}>
              <FaUserCircle /> View Profile
            </button>

            <button onClick={() => { setOpen(false); navigate("/settings"); }}>
              <FaCog /> Settings
            </button>

            <button className="dropdown-danger" onClick={handleSignOut}>
              <FaSignOutAlt /> Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}