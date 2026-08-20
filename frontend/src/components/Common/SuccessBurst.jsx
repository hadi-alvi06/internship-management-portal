export default function SuccessBurst({ show }) {
  if (!show) return null;

  return (
    <div className="success-burst-overlay">
      <div className="success-burst-circle">
        <svg viewBox="0 0 52 52" className="success-burst-check">
          <circle cx="26" cy="26" r="24" fill="none" />
          <path fill="none" d="M14 27l7 7 16-16" />
        </svg>
      </div>
    </div>
  );
}