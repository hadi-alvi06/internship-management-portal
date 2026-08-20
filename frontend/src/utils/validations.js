export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "");
}

export function isValidPhone(phone) {
  return /^[0-9+\-\s]{7,15}$/.test(phone || "");
}

export function isEndDateAfterStart(startDate, endDate) {
  if (!startDate || !endDate) return false;
  return new Date(endDate) > new Date(startDate);
}

export function validateInternForm(formData) {
  const errors = [];

  if (!formData.fullName?.trim()) errors.push("Full name is required.");
  if (!formData.gender) errors.push("Gender is required.");
  if (!formData.university?.trim()) errors.push("University is required.");
  if (!formData.degree) errors.push("Degree is required.");
  if (!formData.semester) errors.push("Semester is required.");
  if (!formData.department) errors.push("Department is required.");
  if (!formData.supervisor?.trim()) errors.push("Supervisor is required.");
  if (!formData.startDate) errors.push("Start date is required.");
  if (!formData.endDate) errors.push("End date is required.");

  if (
    formData.startDate &&
    formData.endDate &&
    !isEndDateAfterStart(formData.startDate, formData.endDate)
  ) {
    errors.push("End date must be after the start date.");
  }

  if (!formData.email?.trim() || !isValidEmail(formData.email)) {
    errors.push("A valid email address is required.");
  }

  if (!formData.phone?.trim() || !isValidPhone(formData.phone)) {
    errors.push("A valid phone number is required.");
  }

  return { valid: errors.length === 0, errors };
}