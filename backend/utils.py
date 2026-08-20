from datetime import datetime


def is_valid_date(date_str):
    try:
        datetime.strptime(date_str, "%Y-%m-%d")
        return True
    except (ValueError, TypeError):
        return False


def calculate_days_remaining(end_date_str):
    try:
        end_date = datetime.strptime(end_date_str, "%Y-%m-%d")
        remaining = (end_date - datetime.now()).days
        return max(0, remaining)
    except (ValueError, TypeError):
        return 0


def calculate_progress(start_date_str, end_date_str):
    try:
        start = datetime.strptime(start_date_str, "%Y-%m-%d")
        end = datetime.strptime(end_date_str, "%Y-%m-%d")
        today = datetime.now()

        total_days = max(1, (end - start).days)
        completed_days = max(0, (today - start).days)

        return min(100, round((completed_days / total_days) * 100))
    except (ValueError, TypeError):
        return 0


def is_weekend(date_str):
    try:
        date_obj = datetime.strptime(date_str, "%Y-%m-%d")
        return date_obj.weekday() >= 5  # Saturday=5, Sunday=6
    except (ValueError, TypeError):
        return False