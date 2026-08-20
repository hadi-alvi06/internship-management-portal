import db_handler as db
import utils


def get_attendance_for_date(date_str):
    if utils.is_weekend(date_str):
        return {"success": True, "is_weekend": True, "data": []}, 200

    interns = db.get_all_interns()
    attendance_records = db.get_attendance_by_date(date_str)

    status_lookup = {r["Employee_ID"]: r["Status"] for r in attendance_records}

    result = []
    for intern in interns:
        start = str(intern.get("StartDate", ""))
        end = str(intern.get("EndDate", ""))

        if start and end and not (start <= date_str <= end):
            continue

        result.append({
            "Employee_ID": intern["Employee_ID"],
            "Full_Name": intern["Full_Name"],
            "Department": intern["Department"],
            "Status": status_lookup.get(intern["Employee_ID"], "Present"),
            "Attendance_Percentage": db.get_attendance_percentage(intern["Employee_ID"]),
        })

    return {"success": True, "is_weekend": False, "data": result}, 200


def save_attendance(date_str, records):
    if not date_str:
        return {"success": False, "message": "Date is required"}, 400

    if utils.is_weekend(date_str):
        return {
            "success": False,
            "message": "Attendance cannot be marked on weekends (Saturday/Sunday).",
        }, 400

    if not records or not isinstance(records, list):
        return {"success": False, "message": "Attendance records are required"}, 400

    saved = db.save_attendance_bulk(date_str, records)

    return {"success": True, "message": "Attendance saved successfully", "data": saved}, 200