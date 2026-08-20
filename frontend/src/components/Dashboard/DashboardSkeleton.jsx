export default function DashboardSkeleton() {
  return (
    <div className="dashboard-page">
      <div className="dashboard-title-row">
        <div className="skeleton skeleton-title" />
      </div>

      <div className="dashboard-grid">
        {[1, 2, 3, 4].map((i) => (
          <div className="skeleton skeleton-card" key={i} />
        ))}
      </div>

      <div className="bottom-grid">
        <div className="skeleton skeleton-chart" />
        <div className="skeleton skeleton-chart" />
      </div>

      <div className="bottom-grid">
        <div className="skeleton skeleton-panel" />
        <div className="skeleton skeleton-panel" />
      </div>
    </div>
  );
}