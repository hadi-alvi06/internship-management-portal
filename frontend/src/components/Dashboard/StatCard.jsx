import "../../styles/statcard.css";
import useCountUp from "../../hooks/useCountUp";
import useTilt from "../../hooks/useTilt";
import Sparkline from "./Sparkline";
import RadialGauge from "./RadialGauge";

export default function StatCard({ title, value, subtitle, subtitleColor, color, icon, sparklineData, gauge }) {
  const { ref, glareRef, handleMouseMove, handleMouseLeave } = useTilt({ max: 6, scale: 1.015, glare: true });

  const isPercent = typeof value === "string" && value.trim().endsWith("%");
  const numericPart = isPercent ? value.replace("%", "") : value;
  const animatedValue = useCountUp(numericPart, 700);

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="stat-card tilt-wrap"
    >
      <div className="tilt-glare" ref={glareRef} />
      <div className="stat-card-accent" style={{ background: color }} />

      <div className="stat-card-top">
        {gauge ? (
          <div className="stat-gauge-wrap">
            <RadialGauge value={gauge} color={color} size={64} />
            <span className="stat-gauge-center">{Math.round(gauge)}%</span>
          </div>
        ) : (
          <div className="stat-icon stat-icon-float" style={{ backgroundColor: color }}>{icon}</div>
        )}

        <div className="stat-content">
          <div className="stat-title">{title}</div>
          <div className="stat-value">{animatedValue}{isPercent ? "%" : ""}</div>
          {subtitle && <div className="stat-subtitle" style={{ color: subtitleColor }}>{subtitle}</div>}
        </div>
      </div>

      {sparklineData && sparklineData.length > 1 && <Sparkline data={sparklineData} color={color} />}
    </div>
  );
}