export function formatDate(dateStr) {
  if (!dateStr) return "-";
  const date = new Date(dateStr + "T00:00:00");
  if (isNaN(date)) return dateStr;
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function todayISO() {
  return new Date().toISOString().split("T")[0];
}

export function isWeekend(dateStr) {
  const day = new Date(dateStr + "T00:00:00").getDay();
  return day === 0 || day === 6;
}

export function formatRelativeDays(dateStr) {
  if (!dateStr) return "";
  const created = new Date(dateStr);
  if (isNaN(created)) return "";

  const diffDays = Math.floor((new Date() - created) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 30) return `${diffDays} days ago`;
  const months = Math.floor(diffDays / 30);
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
  return `${Math.floor(months / 12)}y ago`;
}