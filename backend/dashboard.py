import db_handler as db
import utils
from collections import Counter
from datetime import datetime, timedelta


def _parse_dt(value):
    if not value:
        return None
    try:
        return datetime.fromisoformat(str(value))
    except ValueError:
        try:
            return datetime.strptime(str(value), "%Y-%m-%d")
        except ValueError:
            return None


def get_dashboard_stats():
    interns = db.get_all_interns()

    total_interns = len(interns)
    active_interns = len([i for i in interns if i.get("Status") == "Active"])

    departments = [i["Department"] for i in interns if i.get("Department")]
    department_counts = Counter(departments)
    total_departments = len(department_counts)

    if total_interns > 0:
        percentages = [db.get_attendance_percentage(i["Employee_ID"]) for i in interns]
        avg_attendance = round(sum(percentages) / len(percentages), 1)
    else:
        avg_attendance = 0

    pie_data = [{"name": dept, "value": count} for dept, count in department_counts.items()]

    week_ago = datetime.now() - timedelta(days=7)
    new_this_week = 0
    for i in interns:
        created = _parse_dt(i.get("created_at"))
        if created and created >= week_ago:
            new_this_week += 1

    attendance_change = db.get_attendance_change_vs_last_week()

    return {
        "success": True,
        "data": {
            "total_interns": total_interns,
            "active_interns": active_interns,
            "total_departments": total_departments,
            "average_attendance": avg_attendance,
            "department_distribution": pie_data,
            "new_interns_this_week": new_this_week,
            "attendance_change": attendance_change,
        },
    }, 200


def get_recent_interns(limit=5):
    interns = db.get_all_interns()
    recent = interns[-limit:][::-1]
    return {"success": True, "data": recent}, 200


def get_low_attendance_alerts(threshold=75):
    interns = db.get_all_interns()

    alerts = []
    for intern in interns:
        try:
            percentage = db.get_attendance_percentage(intern["Employee_ID"])
        except Exception:
            percentage = 0

        if percentage < threshold:
            alerts.append({
                "Employee_ID": intern["Employee_ID"],
                "Full_Name": intern["Full_Name"],
                "Attendance_Percentage": percentage,
            })

    return {"success": True, "data": alerts}, 200


def get_weekly_attendance_overview(range_param="week"):
    limit = 30 if range_param == "month" else 7

    rows = db.get_weekly_attendance_summary(limit=60)

    overview = []
    for row in rows:
        date_str = str(row["date"])

        if utils.is_weekend(date_str):
            continue

        total = row["total"] or 0
        present = row["present"] or 0
        percentage = round((present / total) * 100, 1) if total else 0

        overview.append({"day": date_str, "attendance": percentage})

    overview.reverse()
    overview = overview[-limit:]

    return {"success": True, "data": overview}, 200
def get_sparklines():
    data = db.get_dashboard_sparklines(days=7)
    return {"success": True, "data": data}, 200