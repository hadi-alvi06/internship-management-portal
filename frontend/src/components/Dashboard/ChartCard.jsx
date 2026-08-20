import useTilt from "../../hooks/useTilt";

export default function ChartCard({ title, headerRight, children }) {
  const { ref, handleMouseMove, handleMouseLeave } = useTilt({ max: 3, scale: 1.005, glare: false });

  return (
    <div ref={ref} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} className="chart-card tilt-wrap">
      <div className="chart-header">
        <h3>{title}</h3>
        {headerRight}
      </div>
      <div className="chart-divider"></div>
      <div className="chart-body">{children}</div>
    </div>
  );
}