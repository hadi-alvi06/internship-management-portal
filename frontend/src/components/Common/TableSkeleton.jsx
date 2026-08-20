export default function TableSkeleton({ rows = 6 }) {
  return (
    <div>
      <div className="skeleton skeleton-toolbar" />
      <div className="skeleton skeleton-toolbar-sm" />
      <div className="skeleton-table">
        {Array.from({ length: rows }).map((_, i) => (
          <div className="skeleton skeleton-row" key={i} style={{ animationDelay: `${i * 0.05}s` }} />
        ))}
      </div>
    </div>
  );
}