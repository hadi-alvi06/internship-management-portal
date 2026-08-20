export default function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="custom-tooltip">
      <p className="custom-tooltip-label">{label}</p>
      <p className="custom-tooltip-value">{payload[0].value}% attendance</p>
    </div>
  );
}