import { useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import Navbar from "../components/Navbar/Navbar";

export default function MainLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="app-shell">
      <Sidebar mobileOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {mobileMenuOpen && (
        <div className="sidebar-backdrop" onClick={() => setMobileMenuOpen(false)} />
      )}

      <div className="main-content-area">
        <Navbar onMenuClick={() => setMobileMenuOpen((prev) => !prev)} />
        <div className="page-content-wrap page-fade" key={location.pathname}>
          {children}
        </div>
      </div>
    </div>
  );
}