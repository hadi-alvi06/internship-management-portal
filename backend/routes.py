from flask import Blueprint, request, jsonify, send_file, g

import intern_manager
import attendance as attendance_service
import dashboard as dashboard_service
import settings as settings_service
import report_generator
import auth
import db_handler as db
from extensions import limiter

api = Blueprint("api", __name__)


# ================= AUTH =================

@api.route("/api/auth/login", methods=["POST"])
@limiter.limit("5 per 15 minutes")
def login_route():
    data = request.get_json()
    response, status = auth.login(data.get("username"), data.get("password"))
    return jsonify(response), status


@api.route("/api/auth/logout", methods=["POST"])
@auth.require_auth()
def logout_route():
    response, status = auth.logout(g.current_user["user_id"], g.current_user["username"])
    return jsonify(response), status


@api.route("/api/auth/me", methods=["GET"])
@auth.require_auth()
def me_route():
    return jsonify({"success": True, "data": g.current_user}), 200


@api.route("/api/auth/profile", methods=["GET"])
@auth.require_auth()
def profile_route():
    user = db.get_user_by_id(g.current_user["user_id"])
    if user is None:
        return jsonify({"success": False, "message": "Account not found."}), 404
    user.pop("password_hash", None)
    return jsonify({"success": True, "data": user}), 200


@api.route("/api/auth/change-password", methods=["POST"])
@auth.require_auth()
def change_password_route():
    data = request.get_json()
    response, status = auth.change_own_password(
        g.current_user["user_id"],
        data.get("currentPassword", ""),
        data.get("newPassword", ""),
    )
    return jsonify(response), status


# ================= INTERNS =================

@api.route("/api/interns", methods=["GET"])
@auth.require_auth()
def get_interns():
    response, status = intern_manager.list_interns()
    return jsonify(response), status


@api.route("/api/interns/<employee_id>", methods=["GET"])
@auth.require_auth()
def get_intern(employee_id):
    response, status = intern_manager.get_single_intern(employee_id)
    return jsonify(response), status


@api.route("/api/interns", methods=["POST"])
@auth.require_auth()
def add_intern():
    data = request.get_json()
    response, status = intern_manager.create_intern(data)
    return jsonify(response), status


@api.route("/api/interns/<employee_id>", methods=["PUT"])
@auth.require_auth()
def update_intern(employee_id):
    data = request.get_json()
    response, status = intern_manager.edit_intern(employee_id, data)
    return jsonify(response), status


@api.route("/api/interns/<employee_id>", methods=["DELETE"])
@auth.require_auth()
def delete_intern(employee_id):
    response, status = intern_manager.remove_intern(employee_id)
    return jsonify(response), status


@api.route("/api/interns/bulk-delete", methods=["POST"])
@auth.require_auth()
def bulk_delete_interns():
    data = request.get_json()
    employee_ids = data.get("employee_ids", [])
    response, status = intern_manager.remove_multiple_interns(employee_ids)
    return jsonify(response), status


@api.route("/api/interns/<employee_id>/report", methods=["GET"])
@auth.require_auth()
def download_intern_report(employee_id):
    response, status = intern_manager.get_single_intern(employee_id)

    if status != 200:
        return jsonify(response), status

    pdf_buffer = report_generator.build_intern_report(response["data"])

    return send_file(
        pdf_buffer,
        mimetype="application/pdf",
        as_attachment=True,
        download_name=f"{employee_id}_Report.pdf",
    )


# ================= ATTENDANCE =================

@api.route("/api/attendance/<date_str>", methods=["GET"])
@auth.require_auth()
def get_attendance(date_str):
    response, status = attendance_service.get_attendance_for_date(date_str)
    return jsonify(response), status


@api.route("/api/attendance", methods=["POST"])
@auth.require_auth()
def save_attendance():
    data = request.get_json()
    date_str = data.get("date")
    records = data.get("records")
    response, status = attendance_service.save_attendance(date_str, records)
    return jsonify(response), status


# ================= DASHBOARD =================

@api.route("/api/dashboard/stats", methods=["GET"])
@auth.require_auth()
def dashboard_stats():
    response, status = dashboard_service.get_dashboard_stats()
    return jsonify(response), status


@api.route("/api/dashboard/recent-interns", methods=["GET"])
@auth.require_auth()
def dashboard_recent_interns():
    response, status = dashboard_service.get_recent_interns()
    return jsonify(response), status


@api.route("/api/dashboard/alerts", methods=["GET"])
@auth.require_auth()
def dashboard_alerts():
    response, status = dashboard_service.get_low_attendance_alerts()
    return jsonify(response), status


@api.route("/api/dashboard/attendance-overview", methods=["GET"])
@auth.require_auth()
def dashboard_attendance_overview():
    range_param = request.args.get("range", "week")
    response, status = dashboard_service.get_weekly_attendance_overview(range_param)
    return jsonify(response), status


# ================= SETTINGS / HEALTH =================

@api.route("/api/settings", methods=["GET"])
@auth.require_auth()
def get_settings_route():
    response, status = settings_service.get_settings()
    return jsonify(response), status


@api.route("/api/settings", methods=["POST"])
@auth.require_auth()
def update_settings_route():
    data = request.get_json()
    response, status = settings_service.update_settings(data, g.current_user["role"])
    return jsonify(response), status


@api.route("/api/health", methods=["GET"])
def health_check_route():
    response, status = settings_service.health_check()
    return jsonify(response), status


@api.route("/api/export", methods=["GET"])
@auth.require_auth()
def export_excel_route():
    import io
    import pandas as pd

    interns = db.get_all_interns()
    attendance_rows = db.run_query("SELECT * FROM attendance ORDER BY date", fetch=True)

    interns_df = pd.DataFrame(interns)
    attendance_df = pd.DataFrame(attendance_rows)

    buffer = io.BytesIO()
    with pd.ExcelWriter(buffer, engine="openpyxl") as writer:
        interns_df.to_excel(writer, sheet_name="Interns", index=False)
        attendance_df.to_excel(writer, sheet_name="Attendance", index=False)

    buffer.seek(0)

    return send_file(
        buffer,
        as_attachment=True,
        download_name="InternshipData_Export.xlsx",
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )


# ================= USER MANAGEMENT (Admin only) =================

@api.route("/api/users", methods=["GET"])
@auth.require_auth(roles=["admin"])
def list_users_route():
    users = db.get_all_users()
    return jsonify({"success": True, "data": users}), 200


@api.route("/api/users", methods=["POST"])
@auth.require_auth(roles=["admin"])
def create_user_route():
    data = request.get_json()
    username = data.get("username", "").strip()
    password = data.get("password", "")
    role = data.get("role", "supervisor")

    if not username or not password:
        return jsonify({"success": False, "message": "Username and password are required."}), 400

    if db.get_user_by_username(username):
        return jsonify({"success": False, "message": "That username is already taken."}), 400

    db.create_user(username, auth.hash_password(password), role)
    return jsonify({"success": True, "message": "Account created successfully."}), 201


@api.route("/api/users/<int:user_id>", methods=["DELETE"])
@auth.require_auth(roles=["admin"])
def delete_user_route(user_id):
    if user_id == g.current_user["user_id"]:
        return jsonify({"success": False, "message": "You can't delete your own account."}), 400

    db.delete_user(user_id)
    return jsonify({"success": True, "message": "Account deleted."}), 200


@api.route("/api/users/<int:user_id>/password", methods=["PUT"])
@auth.require_auth(roles=["admin"])
def reset_password_route(user_id):
    data = request.get_json()
    new_password = data.get("password", "")

    if not new_password:
        return jsonify({"success": False, "message": "New password is required."}), 400

    db.update_user_password(user_id, auth.hash_password(new_password))
    return jsonify({"success": True, "message": "Password updated."}), 200


@api.route("/api/activity-log", methods=["GET"])
@auth.require_auth(roles=["admin"])
def activity_log_route():
    logs = db.get_activity_log(50)
    return jsonify({"success": True, "data": logs}), 200

@api.route("/api/dashboard/sparklines", methods=["GET"])
@auth.require_auth()
def dashboard_sparklines():
    response, status = dashboard_service.get_sparklines()
    return jsonify(response), status