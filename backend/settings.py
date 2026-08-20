import db_handler as db


def get_settings():
    return {"success": True, "data": db.get_settings()}, 200


def update_settings(data, role):
    allowed = dict(data)

    if role != "admin":
        allowed.pop("About_Text", None)
        allowed.pop("Version", None)

    updated = db.update_settings(allowed)
    return {"success": True, "message": "Settings updated successfully", "data": updated}, 200


def health_check():
    try:
        db.run_query("SELECT 1", fetch_one=True)
        db_connected = True
    except Exception:
        db_connected = False

    return {"success": True, "excel_connected": db_connected}, 200