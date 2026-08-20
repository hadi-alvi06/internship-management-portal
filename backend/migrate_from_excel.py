import os
import pandas as pd
import db_handler as db

# Adjust this if your old Excel project lives somewhere else
OLD_EXCEL_PATH = os.path.join(
    os.path.dirname(__file__), "..", "..", "InternshipDashboard", "excel", "Interns.xlsx"
)

print(f"Reading from: {os.path.abspath(OLD_EXCEL_PATH)}")

interns_df = pd.read_excel(OLD_EXCEL_PATH, sheet_name="Interns", engine="openpyxl")
attendance_df = pd.read_excel(OLD_EXCEL_PATH, sheet_name="Attendance", engine="openpyxl")

print(f"Found {len(interns_df)} interns, {len(attendance_df)} attendance records.\n")

migrated = 0
skipped = 0

for _, row in interns_df.iterrows():
    try:
        intern_row = {
            "Employee_ID": str(row.get("Employee_ID", "")),
            "Full_Name": str(row.get("Full_Name", "")),
            "Gender": str(row.get("Gender", "") or ""),
            "Date_of_Birth": str(row.get("Date_of_Birth", "") or "") or None,
            "University": str(row.get("University", "") or ""),
            "Degree": str(row.get("Degree", "") or ""),
            "Semester": int(row.get("Semester")) if pd.notna(row.get("Semester")) else None,
            "CGPA": float(row.get("CGPA")) if pd.notna(row.get("CGPA")) else None,
            "Department": str(row.get("Department", "") or ""),
            "Supervisor": str(row.get("Supervisor", "") or ""),
            "Floor": str(row.get("Floor", "") or ""),
            "StartDate": str(row.get("StartDate", "")),
            "EndDate": str(row.get("EndDate", "")),
            "Email": str(row.get("Email", "")),
            "Phone": str(row.get("Phone", "") or ""),
            "Address": str(row.get("Address", "") or ""),
            "Status": str(row.get("Status", "Active") or "Active"),
            "Tasks": [],
        }

        if not intern_row["Employee_ID"] or not intern_row["Email"]:
            print(f"  Skipping row — missing Employee_ID or Email")
            skipped += 1
            continue

        db.add_intern_row(intern_row)
        migrated += 1
        print(f"  Migrated {intern_row['Employee_ID']} — {intern_row['Full_Name']}")

    except Exception as e:
        print(f"  Failed on row: {e}")
        skipped += 1

print(f"\nInterns: {migrated} migrated, {skipped} skipped.\n")

att_migrated = 0
for _, row in attendance_df.iterrows():
    try:
        date_val = row.get("Date")
        date_str = str(date_val)[:10] if pd.notna(date_val) else None

        employee_id = str(row.get("Employee_ID", ""))
        status = str(row.get("Status", ""))

        if not date_str or not employee_id or not status:
            continue

        db.upsert_attendance_record(date_str, employee_id, "", "", status)
        att_migrated += 1

    except Exception as e:
        print(f"  Attendance row failed: {e}")

print(f"Attendance: {att_migrated} records migrated.")
print("\n✅ Migration complete.")