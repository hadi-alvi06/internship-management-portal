import { useEffect, useRef, useState } from "react";
import "./../../styles/sidebar.css";

import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import {
  FaHome,
  FaUserGraduate,
  FaClipboardCheck,
  FaUserPlus,
  FaEdit,
  FaCog,
  FaUsersCog,
  FaTimes,
} from "react-icons/fa";

export default function Sidebar({ mobileOpen, onClose }) {
  const { role } = useAuth();
  const location = useLocation();
  const menuRef = useRef(null);
  const [pillStyle, setPillStyle] = useState({ opacity: 0 });

  useEffect(() => {
    function updatePill() {
      const menu = menuRef.current;
      if (!menu) return;

      const activeLink = menu.querySelector("a.active");
      if (!activeLink) {
        setPillStyle({ opacity: 0 });
        return;
      }

      setPillStyle({
        top: activeLink.offsetTop,
        height: activeLink.offsetHeight,
        opacity: 1,
      });
    }

    // slight delay so NavLink has applied .active before we measure
    const timeout = setTimeout(updatePill, 20);
    window.addEventListener("resize", updatePill);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", updatePill);
    };
  }, [location.pathname, role]);

  return (
    <div className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}>
      <div className="sidebar-top-row">
        <div className="logo">Internship Portal</div>
        <button className="sidebar-close-btn" onClick={onClose}>
          <FaTimes />
        </button>
      </div>

      <div className="menu" ref={menuRef} onClick={onClose}>
        <div className="sidebar-pill" style={pillStyle} />

        <NavLink to="/" end>
          <FaHome /> Dashboard
        </NavLink>

        <NavLink to="/interns">
          <FaUserGraduate /> Interns
        </NavLink>

        <NavLink to="/attendance">
          <FaClipboardCheck /> Attendance
        </NavLink>

        <NavLink to="/add">
          <FaUserPlus /> Add Intern
        </NavLink>

        <NavLink to="/manage">
          <FaEdit /> Manage Interns
        </NavLink>

        {role === "admin" && (
          <NavLink to="/accounts">
            <FaUsersCog /> Manage Accounts
          </NavLink>
        )}
      </div>

      <div className="bottom">
        <NavLink to="/settings" onClick={onClose}>
          <FaCog /> Settings
        </NavLink>
      </div>
    </div>
  );
}