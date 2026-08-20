import os
import json
from datetime import datetime, date, timedelta

import mysql.connector
from dotenv import load_dotenv

load_dotenv()

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", ""),
    "database": os.getenv("DB_NAME", "internship_management"),
}


def get_connection():
    return mysql.connector.connect(**DB_CONFIG)


def run_query(query, params=None, fetch=False, fetch_one=False):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute(query, params or ())

        if fetch_one:
            result = cursor.fetchone()
        elif fetch:
            result = cursor.fetchall()
        else:
            result = None

        conn.commit()
        return result

    finally:
        cursor.close()
        conn.close()


# ---------------------------------------------------------
# Column name mapping — MySQL uses snake_case, but the rest
# of the app (frontend adapter, intern_manager.py) already
# expects the same PascalCase keys the Excel version used.
# This mapping keeps that contract intact so nothing else
# in the app has to change.
# ---------------------------------------------------------

COLUMN_MAP = {
    "Employee_ID": "employee_id",
    "Full_Name": "full_name",
    "Gender": "gender",
    "Date_of_Birth": "date_of_birth",
    "University": "university",
    "Degree": "degree",
    "Semester": "semester",
    "CGPA": "cgpa",
    "Department": "department",
    "Supervisor": "supervisor",
    "Floor": "floor",
    "StartDate": "start_date",
    "EndDate": "end_date",
    "Email": "email",
    "Phone": "phone",
    "Address": "address",
    "Status": "status",
    "Last_Modified": "last_modified",
    "Tasks": "tasks",
}

REVERSE_COLUMN_MAP = {v: k for k, v in COLUMN_MAP.items()}


def _serialize_row(row):
    """Converts a raw MySQL row (snake_case, date objects, JSON string)
    into the PascalCase dict shape the rest of the app expects."""
    if row is None:
        return None

    serialized = {}
    for db_key, value in row.items():
        app_key = REVERSE_COLUMN_MAP.get(db_key, db_key)

        if isinstance(value, (date, datetime)):
            value = value.strftime("%Y-%m-%d") if isinstance(value, date) and not isinstance(value, datetime) else value.isoformat()
        elif db_key == "tasks":
            try:
                value = json.loads(value) if value else []
            except (json.JSONDecodeError, TypeError):
                value = []

        serialized[app_key] = value

    return serialized


def _apply_computed_status(intern):
    try:
        end_date = datetime.strptime(str(intern.get("EndDate", "")), "%Y-%m-%d")
        if intern.get("Status") == "Active" and datetime.now().date() > end_date.date():
            intern["Status"] = "Completed"
    except (ValueError, TypeError):
        pass
    return intern


# ---------------------------------------------------------
# EMPLOYEE ID GENERATION
# ---------------------------------------------------------

def generate_employee_id():
    result = run_query(
        "SELECT employee_id FROM interns ORDER BY id DESC LIMIT 1",
        fetch_one=True,
    )

    if not result:
        return "INT-0001"

    last_number = int(result["employee_id"].split("-")[1])
    return f"INT-{last_number + 1:04d}"


# ---------------------------------------------------------
# INTERNS CRUD
# ---------------------------------------------------------

def get_all_interns():
    rows = run_query("SELECT * FROM interns ORDER BY id ASC", fetch=True)
    interns = [_serialize_row(row) for row in rows]
    return [_apply_computed_status(i) for i in interns]


def get_intern_by_id(employee_id):
    row = run_query(
        "SELECT * FROM interns WHERE employee_id = %s",
        (employee_id,),
        fetch_one=True,
    )

    if row is None:
        return None

    return _apply_computed_status(_serialize_row(row))


def add_intern_row(intern_dict):
    columns = []
    placeholders = []
    values = []

    for app_key, value in intern_dict.items():
        db_col = COLUMN_MAP.get(app_key)
        if db_col is None:
            continue  # skip any key that isn't a real column

        if db_col == "tasks":
            value = json.dumps(value if isinstance(value, list) else [])

        columns.append(db_col)
        placeholders.append("%s")
        values.append(value)

    query = f"INSERT INTO interns ({', '.join(columns)}) VALUES ({', '.join(placeholders)})"
    run_query(query, tuple(values))

    return intern_dict


def update_intern_row(employee_id, updated_fields):
    set_clauses = []
    values = []

    for app_key, value in updated_fields.items():
        db_col = COLUMN_MAP.get(app_key)
        if db_col is None:
            continue

        if db_col == "tasks":
            value = json.dumps(value if isinstance(value, list) else [])

        set_clauses.append(f"{db_col} = %s")
        values.append(value)

    if not set_clauses:
        return get_intern_by_id(employee_id)

    values.append(employee_id)
    query = f"UPDATE interns SET {', '.join(set_clauses)} WHERE employee_id = %s"
    run_query(query, tuple(values))

    return get_intern_by_id(employee_id)


def delete_intern_row(employee_id):
    existing = get_intern_by_id(employee_id)
    if existing is None:
        return False

    run_query("DELETE FROM interns WHERE employee_id = %s", (employee_id,))
    return True


def delete_multiple_interns(employee_ids):
    if not employee_ids:
        return

    placeholders = ", ".join(["%s"] * len(employee_ids))
    run_query(
        f"DELETE FROM interns WHERE employee_id IN ({placeholders})",
        tuple(employee_ids),
    )


# ---------------------------------------------------------
# ATTENDANCE
# ---------------------------------------------------------

def get_attendance_by_date(date_str):
    rows = run_query(
        "SELECT employee_id AS Employee_ID, status AS Status FROM attendance WHERE date = %s",
        (date_str,),
        fetch=True,
    )
    return rows


def upsert_attendance_record(date_str, employee_id, full_name, department, status):
    run_query(
        """
        INSERT INTO attendance (employee_id, date, status)
        VALUES (%s, %s, %s)
        ON DUPLICATE KEY UPDATE status = VALUES(status)
        """,
        (employee_id, date_str, status),
    )


def save_attendance_bulk(date_str, records):
    saved = []

    for record in records:
        intern = get_intern_by_id(record["Employee_ID"])
        full_name = intern["Full_Name"] if intern else ""
        department = intern["Department"] if intern else ""

        upsert_attendance_record(
            date_str, record["Employee_ID"], full_name, department, record["Status"]
        )

        saved.append({
            "Date": date_str,
            "Employee_ID": record["Employee_ID"],
            "Full_Name": full_name,
            "Department": department,
            "Status": record["Status"],
        })

    return saved


def backfill_absent_days(employee_id, full_name, department, start_date_str):
    try:
        start = datetime.strptime(start_date_str, "%Y-%m-%d").date()
    except (ValueError, TypeError):
        return

    today = datetime.now().date()
    if start >= today:
        return

    backfill_end = today - timedelta(days=1)
    current = start

    while current <= backfill_end:
        if current.weekday() < 5:
            upsert_attendance_record(
                current.strftime("%Y-%m-%d"), employee_id, full_name, department, "Absent"
            )
        current += timedelta(days=1)


def get_attendance_percentage(employee_id):
    result = run_query(
        """
        SELECT
            COUNT(*) AS total,
            SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) AS present
        FROM attendance WHERE employee_id = %s
        """,
        (employee_id,),
        fetch_one=True,
    )

    total = result["total"] or 0
    present = result["present"] or 0

    if total == 0:
        return 0

    return round((present / total) * 100, 1)

# ---------------------------------------------------------
# SETTINGS
# ---------------------------------------------------------

def get_settings():
    row = run_query("SELECT * FROM settings LIMIT 1", fetch_one=True)
    if row is None:
        return {}
    return {
        "Theme": row.get("theme", "Light"),
        "About_Text": row.get("about_text", ""),
        "Version": row.get("version", "1.0.0"),
    }


def update_settings(fields):
    set_clauses = []
    values = []

    field_map = {"Theme": "theme", "About_Text": "about_text", "Version": "version"}

    for app_key, value in fields.items():
        db_col = field_map.get(app_key)
        if db_col:
            set_clauses.append(f"{db_col} = %s")
            values.append(value)

    if set_clauses:
        query = f"UPDATE settings SET {', '.join(set_clauses)} WHERE id = 1"
        run_query(query, tuple(values))

    return get_settings()


# ---------------------------------------------------------
# WEEKLY ATTENDANCE SUMMARY (for dashboard chart)
# ---------------------------------------------------------

def get_weekly_attendance_summary(limit=60):
    return run_query(
        f"""
        SELECT date,
               COUNT(*) AS total,
               SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) AS present
        FROM attendance
        GROUP BY date
        ORDER BY date DESC
        LIMIT {int(limit)}
        """,
        fetch=True,
    )


def get_attendance_change_vs_last_week():
    from datetime import datetime, timedelta

    today = datetime.now().date()
    this_week_start = today - timedelta(days=7)
    last_week_start = today - timedelta(days=14)
    last_week_end = today - timedelta(days=7)

    def avg_for_range(start, end):
        row = run_query(
            """
            SELECT COUNT(*) AS total,
                   SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) AS present
            FROM attendance
            WHERE date >= %s AND date < %s
            """,
            (start, end),
            fetch_one=True,
        )
        total = row["total"] or 0
        present = row["present"] or 0
        return (present / total) * 100 if total else None

    this_week_avg = avg_for_range(this_week_start, today)
    last_week_avg = avg_for_range(last_week_start, last_week_end)

    if this_week_avg is None or last_week_avg is None:
        return 0

    return round(this_week_avg - last_week_avg, 1)
# ---------------------------------------------------------
# USERS (authentication)
# ---------------------------------------------------------

def get_user_by_username(username):
    return run_query(
        "SELECT * FROM users WHERE username = %s", (username,), fetch_one=True
    )


def create_user(username, password_hash, role="supervisor"):
    run_query(
        "INSERT INTO users (username, password_hash, role) VALUES (%s, %s, %s)",
        (username, password_hash, role),
    )


def update_last_login(username):
    run_query(
        "UPDATE users SET last_login = NOW() WHERE username = %s", (username,)
    )


def get_all_users():
    return run_query(
        "SELECT id, username, role, created_at, last_login, is_online FROM users ORDER BY id ASC",
        fetch=True,
    )


def get_user_by_id(user_id):
    return run_query("SELECT * FROM users WHERE id = %s", (user_id,), fetch_one=True)


def set_user_online_status(user_id, is_online):
    run_query("UPDATE users SET is_online = %s WHERE id = %s", (1 if is_online else 0, user_id))


def log_activity(user_id, username, action):
    run_query(
        "INSERT INTO activity_log (user_id, username, action) VALUES (%s, %s, %s)",
        (user_id, username, action),
    )


def get_activity_log(limit=50):
    return run_query(
        "SELECT username, action, event_time FROM activity_log ORDER BY event_time DESC LIMIT %s",
        (limit,),
        fetch=True,
    )


def delete_user(user_id):
    run_query("DELETE FROM users WHERE id = %s", (user_id,))


def update_user_password(user_id, password_hash):
    run_query(
        "UPDATE users SET password_hash = %s WHERE id = %s", (password_hash, user_id)
    )
def get_dashboard_sparklines(days=7):
    from datetime import datetime, timedelta

    today = datetime.now().date()
    date_list = [(today - timedelta(days=i)) for i in range(days - 1, -1, -1)]

    interns = get_all_interns()

    total_trend = []
    active_trend = []
    dept_trend = []
    seen_depts = set()

    for d in date_list:
        count_created_by_d = 0
        active_count = 0
        for intern in interns:
            created_raw = intern.get("created_at", "")
            try:
                created_date = datetime.fromisoformat(str(created_raw)).date()
            except (ValueError, TypeError):
                created_date = today
            if created_date <= d:
                count_created_by_d += 1
                if intern.get("Status") == "Active":
                    active_count += 1
                dept = intern.get("Department")
                if dept:
                    seen_depts.add(dept)
        total_trend.append(count_created_by_d)
        active_trend.append(active_count)
        dept_trend.append(len(seen_depts))

    attendance_rows = get_weekly_attendance_summary(limit=60)
    attendance_by_date = {}
    for row in attendance_rows:
        date_str = str(row["date"])
        total = row["total"] or 0
        present = row["present"] or 0
        attendance_by_date[date_str] = round((present / total) * 100, 1) if total else 0

    attendance_trend = [
        attendance_by_date.get(d.strftime("%Y-%m-%d"), 0) for d in date_list
    ]

    return {
        "total_interns": total_trend,
        "active_interns": active_trend,
        "departments": dept_trend,
        "attendance": attendance_trend,
    }
