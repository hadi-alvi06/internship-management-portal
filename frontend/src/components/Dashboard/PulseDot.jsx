export default function PulseDot({ color = "#22C55E" }) {
  return (
    <span className="pulse-dot-wrap">
      <span className="pulse-dot-ping" style={{ background: color }} />
      <span className="pulse-dot-core" style={{ background: color }} />
    </span>
  );
}