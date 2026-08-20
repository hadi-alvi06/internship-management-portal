from datetime import datetime

import db_handler as db
import utils


REQUIRED_FIELDS = [
    "fullName", "gender", "university", "degree",
    "semester", "department", "supervisor",
    "startDate", "endDate", "email", "phone",
]

FRONTEND_TO_DB = {
    "fullName": "Full_Name",
    "gender": "Gender",
    "dob": "Date_of_Birth",
    "university": "University",
    "degree": "Degree",
    "semester": "Semester",
    "cgpa": "CGPA",
    "department": "Department",
    "supervisor": "Supervisor",
    "floor": "Floor",
    "startDate": "StartDate",
    "endDate": "EndDate",
    "email": "Email",
    "phone": "Phone",
    "address": "Address",
}


def validate_intern_data(data, existing_emails=None):
    missing = [f for f in REQUIRED_FIELDS if not data.get(f)]
    if missing:
        return False, f"Missing required fields: {', '.join(missing)}"

    if not utils.is_valid_date(data.get("startDate", "")):
        return False, "Start date is invalid or missing (expected YYYY-MM-DD)."

    if not utils.is_valid_date(data.get("endDate", "")):
        return False, "End date is invalid or missing (expected YYYY-MM-DD)."

    start = datetime.strptime(data["startDate"], "%Y-%m-%d")
    end = datetime.strptime(data["endDate"], "%Y-%m-%d")

    if end <= start:
        return False, "End date must be after the start date."

    if existing_emails is not None:
        email = str(data.get("email", "")).strip().lower()
        if email in existing_emails:
            return False, "An intern with this email already exists."

    return True, None


def create_intern(data):
    existing_interns = db.get_all_interns()
    existing_emails = {
        str(i.get("Email", "")).strip().lower() for i in existing_interns
    }

    is_valid, error = validate_intern_data(data, existing_emails)
    if not is_valid:
        return {"success": False, "message": error}, 400

    employee_id = db.generate_employee_id()

    intern_row = {
        "Employee_ID": employee_id,
        "Status": "Active",
        "Tasks": [],
    }

    for frontend_key, db_key in FRONTEND_TO_DB.items():
        intern_row[db_key] = data.get(frontend_key, "")

    intern_row["Phone"] = str(intern_row.get("Phone", ""))

    db.add_intern_row(intern_row)

    db.backfill_absent_days(
        employee_id, data["fullName"], data["department"], data["startDate"]
    )

    return {
        "success": True,
        "message": "Intern added successfully",
        "data": db.get_intern_by_id(employee_id),
    }, 201


def list_interns():
    interns = db.get_all_interns()

    for intern in interns:
        intern["Attendance_Percentage"] = db.get_attendance_percentage(intern["Employee_ID"])
        intern["Progress"] = utils.calculate_progress(intern.get("StartDate", ""), intern.get("EndDate", ""))
        intern["Days_Remaining"] = utils.calculate_days_remaining(intern.get("EndDate", ""))

    return {"success": True, "data": interns}, 200


def get_single_intern(employee_id):
    intern = db.get_intern_by_id(employee_id)

    if intern is None:
        return {"success": False, "message": "Intern not found"}, 404

    intern["Attendance_Percentage"] = db.get_attendance_percentage(employee_id)
    intern["Progress"] = utils.calculate_progress(intern.get("StartDate", ""), intern.get("EndDate", ""))
    intern["Days_Remaining"] = utils.calculate_days_remaining(intern.get("EndDate", ""))

    return {"success": True, "data": intern}, 200


def edit_intern(employee_id, data):
    current = db.get_intern_by_id(employee_id)
    if current is None:
        return {"success": False, "message": "Intern not found"}, 404

    data = dict(data)
    expected_last_modified = data.pop("expectedLastModified", None)

    if (
        expected_last_modified
        and current.get("Last_Modified")
        and str(expected_last_modified) != str(current.get("Last_Modified"))
    ):
        return {
            "success": False,
            "message": "This intern was edited by someone else since you loaded this page. Please refresh and try again.",
        }, 409

    mapped_fields = {}
    for key, value in data.items():
        if key == "tasks":
            mapped_fields["Tasks"] = value if isinstance(value, list) else []
        elif key == "phone":
            mapped_fields["Phone"] = str(value)
        elif key in FRONTEND_TO_DB:
            mapped_fields[FRONTEND_TO_DB[key]] = value
        else:
            mapped_fields[key] = value

    new_start = mapped_fields.get("StartDate", current.get("StartDate", ""))
    new_end = mapped_fields.get("EndDate", current.get("EndDate", ""))

    if new_start and new_end:
        if not utils.is_valid_date(str(new_start)) or not utils.is_valid_date(str(new_end)):
            return {"success": False, "message": "Dates must be in YYYY-MM-DD format."}, 400

        if datetime.strptime(str(new_end), "%Y-%m-%d") <= datetime.strptime(str(new_start), "%Y-%m-%d"):
            return {"success": False, "message": "End date must be after the start date."}, 400

    new_email = mapped_fields.get("Email")
    if new_email:
        all_interns = db.get_all_interns()
        for i in all_interns:
            if (
                i["Employee_ID"] != employee_id
                and str(i.get("Email", "")).strip().lower() == str(new_email).strip().lower()
            ):
                return {"success": False, "message": "Another intern already uses this email."}, 400

    updated = db.update_intern_row(employee_id, mapped_fields)

    if updated is None:
        return {"success": False, "message": "Intern not found"}, 404

    return {
        "success": True,
        "message": "Intern updated successfully",
        "data": updated,
    }, 200


def remove_intern(employee_id):
    deleted = db.delete_intern_row(employee_id)
    if not deleted:
        return {"success": False, "message": "Intern not found"}, 404
    return {"success": True, "message": "Intern deleted successfully"}, 200


def remove_multiple_interns(employee_ids):
    db.delete_multiple_interns(employee_ids)
    return {
        "success": True,
        "message": f"{len(employee_ids)} interns deleted successfully",
    }, 200