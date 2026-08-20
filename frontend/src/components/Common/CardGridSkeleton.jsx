export default function CardGridSkeleton({ count = 6 }) {
  return (
    <div>
      <div className="skeleton skeleton-toolbar" />
      <div className="skeleton skeleton-toolbar-sm" />
      <div className="card-skeleton-grid">
        {Array.from({ length: count }).map((_, i) => (
          <div className="skeleton skeleton-intern-card" key={i} style={{ animationDelay: `${i * 0.05}s` }} />
        ))}
      </div>
    </div>
  );
}