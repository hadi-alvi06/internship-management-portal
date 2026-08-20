export function getInitials(name) {
  if (!name) return "";

  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

export function attendanceClass(percentage) {
  if (percentage >= 90) return "excellent";
  if (percentage >= 75) return "good";
  return "poor";
}