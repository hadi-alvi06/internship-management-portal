import axios from "axios";

export const API_BASE = import.meta.env.PROD
  ? ""
  : (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000");

const API = axios.create({
  baseURL: API_BASE,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("role");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("username");
      sessionStorage.removeItem("role");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ================= INTERNS =================

export const getInterns = () => API.get("/api/interns");
export const getIntern = (employeeId) => API.get(`/api/interns/${employeeId}`);
export const addIntern = (data) => API.post("/api/interns", data);
export const updateIntern = (employeeId, data) => API.put(`/api/interns/${employeeId}`, data);
export const deleteIntern = (employeeId) => API.delete(`/api/interns/${employeeId}`);
export const bulkDeleteInterns = (employeeIds) =>
  API.post("/api/interns/bulk-delete", { employee_ids: employeeIds });

export const internReportUrl = (employeeId) => `${API_BASE}/api/interns/${employeeId}/report`;

// ================= ATTENDANCE =================

export const getAttendanceByDate = (dateStr) => API.get(`/api/attendance/${dateStr}`);
export const saveAttendance = (dateStr, records) =>
  API.post("/api/attendance", { date: dateStr, records });

// ================= DASHBOARD =================
export const getDashboardSparklines = () => API.get("/api/dashboard/sparklines");
export const getDashboardStats = () => API.get("/api/dashboard/stats");
export const getRecentInterns = () => API.get("/api/dashboard/recent-interns");
export const getDashboardAlerts = () => API.get("/api/dashboard/alerts");
export const getAttendanceOverview = (range = "week") => API.get(`/api/dashboard/attendance-overview?range=${range}`);
// ================= SETTINGS =================

export const getSettings = () => API.get("/api/settings");
export const updateSettings = (data) => API.post("/api/settings", data);
export const getHealth = () => API.get("/api/health");
export const exportExcelUrl = `${API_BASE}/api/export`;

// ================= AUTH =================

export const logoutApi = () => API.post("/api/auth/logout");
export const getProfile = () => API.get("/api/auth/profile");
export const changePassword = (currentPassword, newPassword) =>
  API.post("/api/auth/change-password", { currentPassword, newPassword });
export const getActivityLog = () => API.get("/api/activity-log");

// ================= USER MANAGEMENT =================

export const getUsers = () => API.get("/api/users");
export const createUser = (data) => API.post("/api/users", data);
export const deleteUser = (userId) => API.delete(`/api/users/${userId}`);
export const resetUserPassword = (userId, password) =>
  API.put(`/api/users/${userId}/password`, { password });

export default API;