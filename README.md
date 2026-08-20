# Internship Management Portal

![Dashboard Light Mode](screenshots/dashboard-light.png)
![Dashboard Dark Mode](screenshots/dashboard-dark.png)

A full-stack internship management system built with React, Flask, and MySQL — developed during my internship at OGDCL.

## 📸 Screenshots

| Interns Page | Attendance |
|---|---|
| ![Interns](screenshots/interns.png) | ![Attendance](screenshots/attendance.png) |

| login-dark | login-default |
|---|---|
| ![Mobile](screenshots/login-dark.png) | ![Report](screenshots/login-light.png) |

## Tech Stack
Frontend: React, Vite, JavaScript (ES6+), React Router, Axios, Recharts, Custom CSS (Variables-based dark/light mode)
Backend: Python, Flask, PyJWT, bcrypt, pandas, openpyxl, ReportLab
Database: MySQL
Deployment & Networking: Local Network Deployment (LAN), Cross-browser responsive UI

## Key Technical Features
### JWT Authentication & Automatic Role Detection: 
Secure login mechanism utilizing JWT tokens and bcrypt password hashing. Automatically identifies user permissions upon login (Admin vs. Supervisor) and issues role-appropriate access privileges.

### Role-Based Access Control (RBAC):
Strict security boundaries enforced directly at the API level. Backend controllers validate JWT payloads to prevent unauthorized endpoint access, regardless of frontend UI routing.

### Real-Time Dashboard Analytics:
Live metrics tracking overall intern counts, active statuses, department distributions (via Recharts), and attendance trends without requiring manual database re-indexing. Smart attendance engine handling daily tracking, backfilling logic, and statistical aggregations exclusively on working days

### Dynamic PDF & Excel Operations:
Features direct database-to-Excel migrations using pandas and openpyxl, alongside dynamic PDF report generation powered by ReportLab

## Design Notes

**Attendance & Weekends**
Weekends are excluded by design — attendance is only meaningful on working days, so Saturday/Sunday are never shown, saved, or counted toward percentages, even if data exists for them.

**Auto-Completing Status**
An intern's status flips from "Active" to "Completed" automatically once their end date passes. This isn't manual by design — it keeps dashboard stats accurate without anyone remembering to update it.

**Role-Based Access**
Every permission check happens on the backend, not just hidden in the UI. A Supervisor account can't reach Admin-only data even by guessing a URL — the frontend hiding a button is a convenience, not the actual security boundary.

**Concurrent Edits**
If two people edit the same intern record at once, the second save is rejected with a "refresh and try again" message rather than silently overwriting the first person's changes.

**Excel Export**
Export always pulls a live snapshot from the database at the moment you click — not a cached or static file — so it's always accurate, useful for backups or sharing data with someone who doesn't have direct system access.

**Rate-Limited Login**
Login attempts are capped at 5 per 15 minutes per device. This is a deliberate tradeoff for an internal tool — strict enough to blunt brute-force attempts, loose enough not to lock out a real user who mistyped their password twice.
