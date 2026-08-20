import "./loader.css";

export default function Loader({ label = "Loading dashboard..." }) {
  return (
    <div className="loader-wrap">
      <div className="loader-spinner" />
      <p className="loader-label">{label}</p>
    </div>
  );
}