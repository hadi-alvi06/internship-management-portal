import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css";

import StatCard from "../components/Dashboard/StatCard";
import ChartCard from "../components/Dashboard/ChartCard";
import RecentInterns from "../components/Dashboard/RecentInterns";
import Alerts from "../components/Dashboard/Alerts";
import DashboardSkeleton from "../components/Dashboard/DashboardSkeleton";
import PulseDot from "../components/Dashboard/PulseDot";
import CustomTooltip from "../components/Dashboard/CustomTooltip";
import GreetingHeader from "../components/Dashboard/GreetingHeader";

import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Rectangle,
} from "recharts";

import { FaUsers, FaBuilding, FaClipboardCheck, FaChartPie, FaSync } from "react-icons/fa";

import {
  getDashboardStats, getRecentInterns, getDashboardAlerts,
  getAttendanceOverview, getDashboardSparklines,
} from "../services/api";

import { adaptIntern } from "../utils/internAdapter";
import useCountUp from "../hooks/useCountUp";
import useCursorGlow from "../hooks/useCursorGlow";

const COLORS = ["#2563EB", "#22C55E", "#F59E0B", "#EF4444", "#8B5CF6", "#0EA5E9"];

function LegendValue({ value }) {
  const animated = useCountUp(value, 600);
  return <strong>{animated}</strong>;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { blob1Ref, blob2Ref } = useCursorGlow();

  const [stats, setStats] = useState(null);
  const [recentInterns, setRecentInterns] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [attendanceOverview, setAttendanceOverview] = useState([]);
  const [sparklines, setSparklines] = useState({});
  const [loading, setLoading] = useState(true);
  const [attendanceRange, setAttendanceRange] = useState("week");
  const [lastUpdated, setLastUpdated] = useState(null);

  async function loadDashboard(rangeOverride) {
    setLoading(true);
    const range = rangeOverride || attendanceRange;

    try {
      const [statsRes, recentRes, alertsRes, overviewRes, sparkRes] = await Promise.all([
        getDashboardStats(),
        getRecentInterns(),
        getDashboardAlerts(),
        getAttendanceOverview(range),
        getDashboardSparklines(),
      ]);

      setStats(statsRes.data.data);
      setRecentInterns(recentRes.data.data.map(adaptIntern));
      setAlerts(alertsRes.data.data);
      setAttendanceOverview(overviewRes.data.data);
      setSparklines(sparkRes.data.data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Failed to load dashboard:", err);
      console.error("Details:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleRangeChange(range) {
    setAttendanceRange(range);
    loadDashboard(range);
  }

  function handleDepartmentClick(deptName) {
    navigate(`/interns?department=${encodeURIComponent(deptName)}`);
  }

  if (loading && !stats) return <DashboardSkeleton />;

  if (!stats) {
    return (
      <div className="dashboard-page">
        <h1>Dashboard</h1>
        <p>Failed to load dashboard. Please refresh.</p>
      </div>
    );
  }

  const activePercent = stats.total_interns > 0
    ? Math.round((stats.active_interns / stats.total_interns) * 100)
    : 0;

  const newThisWeek = stats.new_interns_this_week || 0;
  const attendanceChange = stats.attendance_change || 0;

  return (
    <div className="dashboard-page dashboard-ambient">
      <div className="dashboard-blob dashboard-blob-1" ref={blob1Ref} />
      <div className="dashboard-blob dashboard-blob-2" ref={blob2Ref} />

      <div className="dashboard-content">
        <div className="dashboard-title-row">
          <GreetingHeader stats={stats} />

          <div className="dashboard-refresh-row">
            {lastUpdated && (
              <span className="last-updated">
                <PulseDot /> Updated {lastUpdated}
              </span>
            )}
            <button className="refresh-btn" onClick={() => loadDashboard()} disabled={loading}>
              <FaSync className={loading ? "spinning" : ""} /> Refresh
            </button>
          </div>
        </div>

        <div className="dashboard-grid">
          <StatCard
            title="Total Interns"
            value={stats.total_interns}
            subtitle={newThisWeek > 0 ? `▲ ${newThisWeek} new this week` : "No new interns this week"}
            subtitleColor={newThisWeek > 0 ? "#22C55E" : undefined}
            color="#2563EB"
            icon={<FaUsers />}
            sparklineData={sparklines.total_interns}
          />

          <StatCard
            title="Departments"
            value={stats.total_departments}
            subtitle="● All Active"
            subtitleColor="#22C55E"
            color="#22C55E"
            icon={<FaBuilding />}
            sparklineData={sparklines.departments}
          />

          <StatCard
            title="Active Interns"
            value={stats.active_interns}
            subtitle={`${activePercent}% of total`}
            subtitleColor="#22C55E"
            color="#F59E0B"
            icon={<FaClipboardCheck />}
            sparklineData={sparklines.active_interns}
          />

          <StatCard
            title="Average Attendance"
            value={`${stats.average_attendance}%`}
            subtitle={
              attendanceChange > 0 ? `▲ ${attendanceChange}% from last week`
              : attendanceChange < 0 ? `▼ ${Math.abs(attendanceChange)}% from last week`
              : "No change from last week"
            }
            subtitleColor={attendanceChange > 0 ? "#22C55E" : attendanceChange < 0 ? "#EF4444" : undefined}
            color="#EF4444"
            gauge={stats.average_attendance}
            sparklineData={sparklines.attendance}
          />
        </div>

        <div className="bottom-grid">
          <ChartCard title="Department Distribution">
            {stats.department_distribution.length === 0 ? (
              <p className="empty-chart-msg">No interns added yet.</p>
            ) : (
              <div className="pie-layout">
                <div className="pie-chart">
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={stats.department_distribution}
                        dataKey="value"
                        outerRadius={100}
                        label
                        onClick={(data) => handleDepartmentClick(data.name)}
                      >
                        {stats.department_distribution.map((item, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="pie-legend">
                  {stats.department_distribution.map((item, index) => (
                    <div
                      key={index}
                      className="legend-item clickable"
                      onClick={() => handleDepartmentClick(item.name)}
                      title={`View ${item.name} interns`}
                    >
                      <div className="legend-left">
                        <span className="legend-color" style={{ background: COLORS[index % COLORS.length] }} />
                        <span>{item.name}</span>
                      </div>
                      <LegendValue value={item.value} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </ChartCard>

          <ChartCard
            title="Attendance Overview"
            headerRight={
              <div className="range-toggle">
                <button className={attendanceRange === "week" ? "active" : ""} onClick={() => handleRangeChange("week")}>
                  This Week
                </button>
                <button className={attendanceRange === "month" ? "active" : ""} onClick={() => handleRangeChange("month")}>
                  This Month
                </button>
              </div>
            }
          >
            {attendanceOverview.length === 0 ? (
              <p className="empty-chart-msg">No attendance recorded yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={attendanceOverview}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(139,92,246,0.08)" }} />
                  <Bar
                    dataKey="attendance"
                    fill="#2563EB"
                    radius={[8, 8, 0, 0]}
                    activeBar={<Rectangle fill="#7C3AED" stroke="#7C3AED" />}
                    isAnimationActive
                    animationDuration={800}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        <div className="bottom-grid">
          <RecentInterns interns={recentInterns} />
          <Alerts alerts={alerts} />
        </div>
      </div>
    </div>
  );
}